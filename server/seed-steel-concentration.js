import { db } from "./db.js";

const source=[
  "smm-steel-annual-2025",
  "2025 Steel Industry Chain Research Report",
  "Shanghai Metals Market (SMM)",
  "https://static-metal.smm.cn/production/subscribe/email/ObAIF20251218151524.pdf",
  "2025-12-18","2024","industry_research","medium","2026-08-07",
  "Page 53 compares 2024 steelmaking capacity concentration across major countries. The reported cutoff differs by country and must be shown with the value."
];

// Published ratios from one comparative chart. These are deliberately stored as
// one generic metric with the exact CR cutoff in text_value; CR2, CR5 and CR10
// are not interchangeable measures.
const rows=[
  ["kor",88,"CR2"], ["jpn",87,"CR2"], ["usa",84,"CR5"],
  ["rus",72,"CR6"], ["tur",67,"CR4"], ["ind",59,"CR5"],
  ["bra",58,"CR3"], ["deu",56,"CR3"], ["chn",43,"CR10"],
  ["irn",32,"CR1"],
];

const seed=db.transaction(()=>{
  db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)").run(...source);
  // Retire the earlier calculated China proxy now that a published domestic value is available.
  db.prepare("DELETE FROM observation_metadata WHERE observation_id=?").run("chn-domestic-steel-cr10-proxy-2025");
  db.prepare("DELETE FROM observations WHERE id=?").run("chn-domestic-steel-cr10-proxy-2025");
  const observation=db.prepare("INSERT OR REPLACE INTO observations VALUES (?,?,?,?,?,?,?,?,?,?)");
  const metadata=db.prepare("INSERT OR REPLACE INTO observation_metadata VALUES (?,?,?,?)");
  for(const [country,value,cutoff] of rows){
    const id=`${country}-steel-capacity-concentration-2024`;
    observation.run(id,"country",country,"steel_capacity_concentration",value,cutoff,"%","2024",source[0],`Published ${cutoff}: share of national steelmaking capacity held by the largest ${cutoff.slice(2)} producer(s).`);
    metadata.run(id,"reported","2024",`Published cross-country series; cutoff is ${cutoff} and differs by country.`);
  }
});

seed();
console.log(`Published steel concentration layer: ${rows.length} countries.`);
