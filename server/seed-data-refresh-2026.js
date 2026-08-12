import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here=dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
  ["usgs-mcs-2026-iron-ore","Mineral Commodity Summaries 2026 — Iron Ore","U.S. Geological Survey","https://pubs.usgs.gov/periodicals/mcs2026/mcs2026.pdf","2026-02-06","2025e","government","high","2026-08-08","Comparable 2025 estimated world mine production; values are usable ore."],
  ["oecd-shipbuilding-headline-2025","Shipbuilding: global production and orderbook headline","OECD","https://www.oecd.org/en/topics/shipbuilding.html","2026-06-01","2025","government_intergovernmental","high","2026-08-08","Reports a 169 million CGT global orderbook in 2025 and China's share at nearly 60%."],
  ["unctad-shipbuilding-2025","UNCTAD Data Insights: merchant fleet, shipbuilding and recycling","UN Trade and Development","https://unctadstat.unctad.org/insights/theme/243","2026-07-01","2025","government_intergovernmental","high","2026-08-08","Reports that China, Korea and Japan built 91% of ships completed in 2025 by gross tonnage."],
  ["comtrade-2025-coverage-audit","UN Comtrade annual API coverage audit — China steel products","UN Statistics Division","https://comtradeplus.un.org/","2026-08-08","2025","government","high","2026-08-08","Annual China HS 7208 export query returned no 2025 record at audit time; 2024 bilateral flows are retained."]
];
const production={usa:38,aus:980,bra:420,can:69,chl:19,chn:290,ind:310,irn:93,kaz:35,mrt:15,mex:7.7,per:21,rus:86,zaf:66,swe:26,tur:18,ukr:52};
const world=2600;
const observations=[
  ["world-io-prod-usgs-2025e","commodity","iron-ore","global_production",world,null,"Mt","2025e","usgs-mcs-2026-iron-ore","USGS rounded world total of usable ore."],
  ...Object.entries(production).flatMap(([country,value])=>[
    [`${country}-io-prod-usgs-2025e`,"country",country,"iron_ore_production",value,null,"Mt","2025e","usgs-mcs-2026-iron-ore","USGS estimate of usable ore; comparable world table."],
    [`${country}-io-share-usgs-2025e`,"country",country,"global_iron_ore_production_share",100*value/world,null,"%","2025e","usgs-mcs-2026-iron-ore",`Derived: ${value} / ${world} Mt.`]
  ]),
  ["world-ship-orderbook-2025","industry","shipbuilding","global_shipbuilding_orderbook",169,null,"m CGT","2025","oecd-shipbuilding-headline-2025","OECD reported headline."],
  ["chn-ship-orderbook-share-2025","country","chn","global_shipbuilding_orderbook_share",60,null,"%","2025","oecd-shipbuilding-headline-2025","OECD describes China's share as nearly 60%; displayed as approximate."],
  ["chn-ship-orderbook-cgt-2025e","country","chn","shipbuilding_orderbook_cgt",101.4,null,"m CGT","2025e","oecd-shipbuilding-headline-2025","Indicative: 169 million CGT × approximately 60%."],
  ["shipbuilding-completion-cr3-2025","industry","shipbuilding","shipbuilding_completion_cr3",91,null,"%","2025","unctad-shipbuilding-2025","China, Republic of Korea and Japan combined share of completions by gross tonnage."],
  ["china-hs7208-comtrade-audit-2025","trade_coverage","chn-7208-export","annual_comtrade_record_available",0,"Not available at audit","binary","2025","comtrade-2025-coverage-audit","Official annual API checked 2026-08-08; retain 2024 bilateral records."]
];
const run=db.transaction(()=>{
  const putSource=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)"); sources.forEach(row=>putSource.run(...row));
  const putObservation=db.prepare("INSERT OR REPLACE INTO observations VALUES (?,?,?,?,?,?,?,?,?,?)");
  const putMetadata=db.prepare("INSERT OR REPLACE INTO observation_metadata VALUES (?,?,?,?)");
  observations.forEach(row=>{putObservation.run(...row);const derived=row[3].includes("share")||row[0]==="chn-ship-orderbook-cgt-2025e";const estimated=row[7].includes("e")||row[0]==="chn-ship-orderbook-share-2025";putMetadata.run(row[0],derived?"derived":estimated?"estimated":"reported",row[7],null)});
});
run();
console.log(`Refreshed ${Object.keys(production).length} iron-ore countries, 4 shipbuilding observations and 1 trade audit.`);
