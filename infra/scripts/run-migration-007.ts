import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

async function main() {
  const url = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/nexora_local";
  const sql = readFileSync(join(import.meta.dir, "../migrations/007_testimonials_projects.sql"), "utf8");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(sql);
    console.log("Migration 007_testimonials_projects applied successfully");
  } catch (e) {
    if (String(e).includes("already exists")) {
      console.log("Tables already exist, skipping");
    } else {
      throw e;
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
