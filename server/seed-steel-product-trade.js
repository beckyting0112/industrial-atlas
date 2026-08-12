import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here=dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

// SMM's 2025E product shares sum to 99% because the chart is rounded.
// Volumes use Worldsteel's subsequently reported 133.6 Mt total exports.
const totalExports=133.6;
const mix=[
  ["Coated & plated",23], ["Hot-rolled",18], ["Steel billet",11],
  ["Steel pipe",10], ["Coiled rebar",7], ["Rebar",7], ["Other",5],
  ["Section steel",5], ["Medium-thickness plate",4], ["Cold-rolled",4],
  ["Stainless steel",3], ["Steel wire",2],
];

const run=db.transaction(()=>{
  const insert=db.prepare("INSERT OR REPLACE INTO steel_product_trade_mix VALUES (?,?,?,?,?,?,?,?,?,?)");
  for(const [product,share] of mix){
    const slug=product.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
    insert.run(`chn-export-${slug}-2025`,`chn`,`export`,product,2025,share,totalExports*share/100,"derived","smm-steel-annual-2025","Product share is SMM 2025E; volume is share multiplied by Worldsteel's reported 2025 China steel-product exports. Shares are rounded and sum to 99%.");
  }
});

run();
console.log(`Steel product trade mix: ${mix.length} China export categories.`);
