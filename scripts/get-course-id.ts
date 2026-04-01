import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await supabase
    .from("courses")
    .select("id")
    .eq("course_code", "PBCST304");

  if (data && data.length > 0) {
    fs.writeFileSync(
      path.resolve(process.cwd(), "scripts", "course-uuid.txt"),
      data[0].id,
      "utf-8"
    );
    process.exit(0);
  }

  // Insert if not found
  const { data: inserted, error } = await supabase
    .from("courses")
    .insert({
      course_code: "PBCST304",
      course_name: "Object Oriented Programming",
      semester: 3,
      credits: 4,
      department: "CSE",
      module_count: 4,
    })
    .select("id")
    .single();

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  fs.writeFileSync(
    path.resolve(process.cwd(), "scripts", "course-uuid.txt"),
    inserted.id,
    "utf-8"
  );
}

main().catch(err => { console.error(err.message); process.exit(1); });
