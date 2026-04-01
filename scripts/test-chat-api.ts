import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const log: string[] = [];
function L(msg: string) { log.push(msg); }

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const embResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: "Explain the four pillars of OOP",
  });
  const queryVec = embResponse.data[0].embedding;
  const vecString = "[" + queryVec.join(",") + "]";

  // Test 1: Direct REST API call
  const resp = await fetch(
    process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/rpc/match_syllabus",
    {
      method: "POST",
      headers: {
        "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query_embedding: vecString,
        match_threshold: 0.0,
        match_count: 5,
      }),
    }
  );
  const body = await resp.text();
  L("REST test: status=" + resp.status);
  L("REST body (first 500): " + body.substring(0, 500));

  // Test 2: Supabase client with string
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase.rpc("match_syllabus", {
    query_embedding: vecString,
    match_threshold: 0.0,
    match_count: 5,
  });
  L("Supabase client: " + (error ? "ERROR: " + error.message + " | " + error.hint : "matches: " + data?.length));

  // Test 3: Try passing as array (how Supabase client might serialize it)
  const { data: d2, error: e2 } = await supabase.rpc("match_syllabus", {
    query_embedding: queryVec,
    match_threshold: 0.0,
    match_count: 5,
  });
  L("Array param: " + (e2 ? "ERROR: " + e2.message : "matches: " + d2?.length));

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
