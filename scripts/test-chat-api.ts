import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const log: string[] = [];
function L(msg: string) { log.push(msg); }

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const embResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: "Explain the four pillars of OOP",
  });
  const queryVec = embResponse.data[0].embedding;
  L("Embedding length: " + queryVec.length);
  L("First 5 values: " + queryVec.slice(0, 5).join(", "));

  // Test with threshold 0 to get everything
  const { data, error } = await supabase.rpc("match_syllabus", {
    query_embedding: queryVec,
    match_threshold: 0.0,
    match_count: 5,
    filter_course_id: null,
  });

  if (error) {
    L("ERROR: " + error.message);
    L("Code: " + error.code);
    L("Hint: " + error.hint);
    L("Details: " + error.details);
  } else {
    L("Matches: " + (data?.length ?? 0));
    if (data) {
      for (const m of data) {
        L("  sim=" + m.similarity + " | " + JSON.stringify(m.metadata?.topic));
      }
    }
  }

  // Also test: does a simple select with count work?
  const { count } = await supabase
    .from("syllabus_embeddings")
    .select("*", { count: "exact", head: true });
  L("Total embeddings in table: " + count);

  // Test directly via REST with explicit content-type
  const resp = await fetch(
    process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/rpc/match_syllabus",
    {
      method: "POST",
      headers: {
        "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        query_embedding: queryVec,
        match_threshold: 0.0,
        match_count: 5,
      }),
    }
  );
  const respText = await resp.text();
  L("REST status: " + resp.status);
  L("REST response (first 500): " + respText.substring(0, 500));

  fs.writeFileSync(
    path.resolve(process.cwd(), "scripts", "test-results.txt"),
    log.join("\n"),
    "utf-8"
  );
}

main().catch(err => {
  log.push("FATAL: " + err.message);
  fs.writeFileSync(
    path.resolve(process.cwd(), "scripts", "test-results.txt"),
    log.join("\n"),
    "utf-8"
  );
  process.exit(1);
});
