import { existsSync } from "node:fs";
import { resolve } from "node:path";
import Database from "better-sqlite3";

const required=["dist/index.html","data/atlas.sqlite"];
for(const file of required){
  if(!existsSync(resolve(file)))throw new Error(`Deployment artifact missing: ${file}`);
}
const db=new Database(resolve("data/atlas.sqlite"),{readonly:true});
const tables=db.prepare("SELECT COUNT(*) count FROM sqlite_master WHERE type='table'").get().count;
const countries=db.prepare("SELECT COUNT(*) count FROM countries").get().count;
db.close();
if(tables<1||countries<1)throw new Error("Deployment database is empty");
console.log(`Deployment check passed: ${tables} tables, ${countries} countries.`);
