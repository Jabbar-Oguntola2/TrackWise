import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";

// Defaults to trackwise.db in the server folder if DB_PATH isn't set.
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.join(process.cwd(), "trackwise.db");

const db = new Database(DB_PATH);

// Lets reads and writes happen concurrently without locking each other out.
db.pragma("journal_mode = WAL");

// SQLite doesn't enforce FOREIGN KEY constraints unless this is set.
db.pragma("foreign_keys = ON");

// Safe to re-run on every startup - every statement uses IF NOT EXISTS.
const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
db.exec(schema);

export default db;
