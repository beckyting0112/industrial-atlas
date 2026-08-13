import { readFileSync } from "node:fs";
import { dirname,resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here=dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));
const [action,id]=process.argv.slice(2);
if(!action){
  const rows=db.prepare("SELECT id,materiality_score,severity,headline,publisher,location_label,review_status FROM news_events WHERE active=1 ORDER BY materiality_score DESC,published_at DESC LIMIT 20").all();
  console.table(rows);process.exit(0);
}
if(!id||!["publish","review","reject"].includes(action)){console.error("Usage: npm run news:review -- [publish|review|reject] NEWS_ID");process.exit(1)}
const status=action==="publish"?"published":action==="review"?"reviewed":"rejected";
const result=db.prepare("UPDATE news_events SET review_status=?,last_verified_at=? WHERE id=?").run(status,new Date().toISOString(),id);
if(!result.changes){console.error(`News event not found: ${id}`);process.exit(1)}
console.log(`${id} marked ${status}.`);
