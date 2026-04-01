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

  // Check how many embeddings exist
  const { data: embCount, error: embErr } = await supabase
    .from("syllabus_embeddings")
    .select("id, course_id", { count: "exact" });

  L("Embeddings count: " + (embCount?.length ?? "error: " + embErr?.message));

  if (embCount && embCount.length > 0) {
    L("First embedding course_id: " + embCount[0].course_id);
  }

  // Check if embeddings have actual vector data
  const { data: sampleEmb, error: sampleErr } = await supabase
    .from("syllabus_embeddings")
    .select("id, content, metadata, embedding")
    .limit(1);

  if (sampleErr) {
    L("Sample embedding error: " + sampleErr.message);
  } else if (sampleEmb && sampleEmb.length > 0) {
    const emb = sampleEmb[0];
    L("Sample content (first 100 chars): " + emb.content?.substring(0, 100));
    L("Sample metadata: " + JSON.stringify(emb.metadata));
    L("Has embedding: " + (emb.embedding ? "yes" : "no"));
    if (emb.embedding) {
      L("Embedding type: " + typeof emb.embedding);
      L("Embedding preview: " + JSON.stringify(emb.embedding).substring(0, 100));
    }
  }

  // Try a direct SQL-like query instead of RPC
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const embResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: "Explain the four pillars of OOP",
  });
  const queryVec = embResponse.data[0].embedding;

  // Try RPC with very low threshold
  const { data: rpcLow, error: rpcLowErr } = await supabase.rpc("match_syllabus", {
    query_embedding: queryVec,
    match_threshold: 0.0,
    match_count: 5,
    filter_course_id: null,
  });

  if (rpcLowErr) {
    L("RPC (threshold=0.0) error: " + rpcLowErr.message);
    L("RPC error details: " + JSON.stringify(rpcLowErr));
  } else {
    L("RPC (threshold=0.0) returned: " + (rpcLow?.length ?? 0) + " matches");
    if (rpcLow && rpcLow.length > 0) {
      for (const m of rpcLow) {
        L("  - similarity=" + m.similarity + " topic=" + (m.metadata?.topic ?? "?"));
      }
    }
  }

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
