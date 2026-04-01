import { createClient } from "@supabase/supabase-js";
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

  // Direct REST call to check embedding column type
  const resp = await fetch(
    process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/rpc/check_embedding_type",
    {
      method: "POST",
      headers: {
        "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Content-Type": "application/json",
      },
      body: "{}",
    }
  );
  L("Check embedding type: status=" + resp.status + " body=" + await resp.text());

  // Alternative: use raw SQL select to see embedding length
  const { data, error } = await supabase
    .from("syllabus_embeddings")
    .select("id, embedding")
    .limit(1);

  if (error) {
    L("Select error: " + error.message);
  } else if (data && data.length > 0) {
    const emb = data[0].embedding;
    L("Embedding raw type: " + typeof emb);
    if (typeof emb === "string") {
      L("Embedding string length: " + emb.length);
      L("Starts with: " + emb.substring(0, 30));
      // Check if it's a pgvector string format like "[0.1,0.2,...]"
      if (emb.startsWith("[")) {
        const parsed = JSON.parse(emb);
        L("Parsed array length: " + parsed.length);
      }
    } else if (Array.isArray(emb)) {
      L("Embedding array length: " + emb.length);
    } else {
      L("Embedding value: " + JSON.stringify(emb).substring(0, 100));
    }
  }

  // Check if we can do a simple cosine similarity manually
  // by re-selecting with the <=> operator via a raw RPC
  const testResp = await fetch(
    process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/syllabus_embeddings?select=id,content&limit=1",
    {
      headers: {
        "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
    }
  );
  const testData = await testResp.json();
  L("Direct select count: " + testData.length);
  if (testData.length > 0) {
    L("First row content: " + testData[0].content?.substring(0, 50));
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
