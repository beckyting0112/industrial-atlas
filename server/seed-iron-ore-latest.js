import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url)); db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
 ["worldsteel-figures-2026","World Steel in Figures 2026","World Steel Association","https://worldsteel.org/wp-content/uploads/World-Steel-in-Figures-2026.pdf","2026-06-01","2025","industry_association","high","2026-08-07","Iron ore balance is 2024; regional trade and steel/iron output are 2025."],
 ["china-customs-dec-2025","China's Major Imports by Quantity and Value, December 2025","General Administration of Customs of China","https://english.customs.gov.cn/Statics/83fb6750-e095-47c6-9890-14979f5a22e8.html","2026-01-01","2025","government","high","2026-08-07","Calendar-year customs total for iron ore and concentrates."],
 ["rio-q4-2025","Rio Tinto Fourth Quarter Operations Review 2025","Rio Tinto","https://www.riotinto.com/en/news/releases/2026/rio-tinto-releases-fourth-quarter-2025-production-results","2026-01-21","2025","company_disclosure","high","2026-08-07","100% basis for Pilbara production and shipments."],
 ["bhp-fy2025","BHP Results for the year ended 30 June 2025","BHP","https://www.bhp.com/news/media-centre/releases/2025/08/bhp-results-for-the-full-year-ended-30-june-2025","2025-08-19","FY2025","company_disclosure","high","2026-08-07","WAIO production; fiscal year differs from calendar year."],
 ["fortescue-fy2025","Fortescue FY25 Annual Report","Fortescue","https://investors.fortescue.com/en","2025-08-26","FY2025","company_disclosure","high","2026-08-07","Company-reported iron ore shipments; fiscal year differs from calendar year."],
 ["vale-ar-2025","Vale Annual Report 2025","Vale","https://www.vale.com/documents/d/guest/2025_annual-report_14042026","2026-04-14","2025","company_disclosure","high","2026-08-07","Calendar-year production, sales, costs and integrated logistics."],
 ["rio-wa-network","Rio Tinto Western Australia operations","Rio Tinto","https://www.riotinto.com/en/operations/anz/western-australia","2026-01-01","current","company_disclosure","high","2026-08-07","Mine, rail and port network description."],
 ["vale-logistics","Vale Logistics","Vale","https://vale.com/en/logistics",null,"current","company_disclosure","high","2026-08-07","Carajás and Vitória-Minas railway connections."],
];
const companies=[
 ["bhp","BHP","aus","Mining","Public"],["fortescue","Fortescue","aus","Mining","Public"]
];
const assets=[
 ["waio","Western Australia Iron Ore","mine","aus","bhp","iron-ore",-22.3,119.0,"operating",305,"Mtpa",1969,"BHP integrated Pilbara mine, rail and port system"],
 ["fortescue-pilbara","Fortescue Pilbara Operations","mine","aus","fortescue","iron-ore",-22.2,119.8,"operating",198.4,"Mt shipped FY2025",2008,"Integrated Chichester, Solomon, Western and Iron Bridge operations"],
 ["s11d","S11D / Serra Sul","mine","bra","vale","iron-ore",-6.45,-50.28,"operating",90,"Mtpa",2016,"High-grade Northern System operation within the Carajás complex"],
 ["cape-lambert","Cape Lambert Port","port","aus","rio","iron-ore",-20.59,117.2,"operating",200,"Mtpa",1972,"Rio Tinto export terminals A and B"],
 ["dampier","Dampier Port","port","aus","rio","iron-ore",-20.66,116.71,"operating",150,"Mtpa",1966,"Rio Tinto Parker Point and East Intercourse Island terminals"],
];
const observations=[
 ["chn-io-prod-2024","country","chn","iron_ore_production",300.1,null,"Mt","2024","worldsteel-figures-2026","Production adjusted so Fe content is similar to world average."],
 ["chn-io-exp-2024","country","chn","iron_ore_exports",24.6,null,"Mt","2024","worldsteel-figures-2026",null],
 ["chn-io-imp-2024","country","chn","iron_ore_imports",1238.2,null,"Mt","2024","worldsteel-figures-2026",null],
 ["chn-io-cons-2024","country","chn","iron_ore_apparent_consumption",1513.7,null,"Mt","2024","worldsteel-figures-2026","Production - exports + imports."],
 ["aus-io-prod-2024","country","aus","iron_ore_production",953.9,null,"Mt","2024","worldsteel-figures-2026",null],
 ["aus-io-exp-2024","country","aus","iron_ore_exports",901.6,null,"Mt","2024","worldsteel-figures-2026",null],
 ["bra-io-prod-2024","country","bra","iron_ore_production",449.2,null,"Mt","2024","worldsteel-figures-2026",null],
 ["bra-io-exp-2024","country","bra","iron_ore_exports",389.2,null,"Mt","2024","worldsteel-figures-2026",null],
 ["world-io-prod-2024","commodity","iron-ore","global_production",2604.5,null,"Mt","2024","worldsteel-figures-2026",null],
 ["world-io-exp-2024","commodity","iron-ore","global_exports",1740.5,null,"Mt","2024","worldsteel-figures-2026",null],
 ["chn-io-import-dep-2024","country","chn","iron_ore_import_dependency",81.80,null,"%","2024","worldsteel-figures-2026","Derived: 1238.2 / 1513.7."],
 ["aus-io-export-dep-2024","country","aus","iron_ore_export_dependence",94.52,null,"%","2024","worldsteel-figures-2026","Derived: 901.6 / 953.9."],
 ["bra-io-export-dep-2024","country","bra","iron_ore_export_dependence",86.64,null,"%","2024","worldsteel-figures-2026","Derived: 389.2 / 449.2."],
 ["aus-io-share-2024","country","aus","global_iron_ore_production_share",36.62,null,"%","2024","worldsteel-figures-2026","Derived: 953.9 / 2604.5."],
 ["bra-io-share-2024","country","bra","global_iron_ore_production_share",17.25,null,"%","2024","worldsteel-figures-2026","Derived: 449.2 / 2604.5."],
 ["chn-io-share-2024","country","chn","global_iron_ore_production_share",11.52,null,"%","2024","worldsteel-figures-2026","Derived: 300.1 / 2604.5."],
 ["chn-io-imports-2025","country","chn","iron_ore_imports",1258.709,null,"Mt","2025","china-customs-dec-2025","Converted from 125,870.9 ten-thousand tonnes."],
 ["chn-pig-iron-2025","country","chn","pig_iron_production",836.0,null,"Mt","2025","worldsteel-figures-2026",null],
 ["world-pig-iron-2025","product","pig-iron","global_production",1271.2,null,"Mt","2025","worldsteel-figures-2026",null],
 ["rio-pilbara-prod-2025","asset","pilbara","iron_ore_production",327.3,null,"Mt","2025","rio-q4-2025","100% basis."],
 ["rio-pilbara-ship-2025","asset","pilbara","iron_ore_shipments",326.2,null,"Mt","2025","rio-q4-2025","100% basis."],
 ["bhp-waio-prod-fy2025","asset","waio","iron_ore_production",290.0,null,"Mt","FY2025","bhp-fy2025","100% basis; fiscal year ended 30 June 2025."],
 ["fortescue-ship-fy2025","asset","fortescue-pilbara","iron_ore_shipments",198.4,null,"Mt","FY2025","fortescue-fy2025","Fiscal year ended 30 June 2025."],
 ["vale-prod-2025","company","vale","iron_ore_production",336.0,null,"Mt","2025","vale-ar-2025",null],
 ["vale-sales-2025","company","vale","iron_ore_sales",314.0,null,"Mt","2025","vale-ar-2025",null],
 ["vale-c1-cost-2025","company","vale","iron_ore_c1_cash_cost",21.3,null,"USD/t","2025","vale-ar-2025","Excluding third-party purchases."],
];
const metadata=observations.map(o=>[o[0],o[3].includes("dependence")||o[3].includes("dependency")||o[3].includes("share")?"derived":"reported",o[7],null]);
const flows=[
 ["eu-china-io-2025","European Union (27)","China","iron-ore",2025,1.7,"Mt","reported_exports","worldsteel-figures-2026",null],
 ["cis-china-io-2025","Russia and other CIS plus Ukraine","China","iron-ore",2025,36.3,"Mt","reported_exports","worldsteel-figures-2026",null],
 ["na-china-io-2025","North America","China","iron-ore",2025,19.0,"Mt","reported_exports","worldsteel-figures-2026",null],
 ["sa-china-io-2025","South America","China","iron-ore",2025,312.0,"Mt","reported_exports","worldsteel-figures-2026",null],
 ["afme-china-io-2025","Africa and Middle East","China","iron-ore",2025,89.9,"Mt","reported_exports","worldsteel-figures-2026",null],
 ["asia-china-io-2025","Asia","China","iron-ore",2025,60.2,"Mt","reported_exports","worldsteel-figures-2026",null],
 ["oceania-china-io-2025","Oceania","China","iron-ore",2025,794.4,"Mt","reported_exports","worldsteel-figures-2026","Regional origin; predominantly Australia."],
];
const relationships=[
 ["pilbara-cape-lambert","asset","pilbara","served_by_port","asset","cape-lambert",null,null,null,"rio-wa-network","Integrated rail and port network."],
 ["pilbara-dampier","asset","pilbara","served_by_port","asset","dampier",null,null,null,"rio-wa-network","Integrated rail and port network."],
 ["carajas-ponta","asset","carajas","served_by_port","asset","ponta-madeira",null,null,null,"vale-logistics","Connected by the Carajás Railroad."],
 ["s11d-ponta","asset","s11d","served_by_port","asset","ponta-madeira",null,null,null,"vale-logistics","Connected by the Carajás Railroad."],
];
const transformations=[
 ["lump-to-pig-iron","iron-ore-lump","pig-iron","Blast furnace ironmaking",null,null,"Coke, injected coal and hot blast","Lump ore can be charged directly as part of the blast-furnace burden."],
];
const mineDetails=[
 ["pilbara",null,null,null,null,null,null,null,"cape-lambert","Nearly 2,000 km integrated AutoHaul rail network","chn"],
 ["waio",null,null,null,null,17.29,"USD/t",null,"port-hedland","Integrated WAIO rail network","chn"],
 ["fortescue-pilbara",null,null,null,null,null,null,null,"port-hedland","Fortescue Pilbara rail network","chn"],
 ["carajas",null,null,null,null,null,null,null,"ponta-madeira","972 km Carajás Railroad","chn"],
 ["s11d",66.7,"% Fe",null,null,null,null,null,"ponta-madeira","Carajás Railroad","chn"],
];
const run=db.transaction(()=>{
 db.prepare("DELETE FROM transformations WHERE id IN ('ore-to-pellet','pellet-to-steel')").run();
 const s=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)"); sources.forEach(x=>s.run(...x));
 const c=db.prepare("INSERT OR REPLACE INTO companies VALUES (?,?,?,?,?)"); companies.forEach(x=>c.run(...x));
 const a=db.prepare("INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"); assets.forEach(x=>a.run(...x));
 const o=db.prepare("INSERT OR REPLACE INTO observations VALUES (?,?,?,?,?,?,?,?,?,?)"); observations.forEach(x=>o.run(...x));
 const md=db.prepare("INSERT OR REPLACE INTO observation_metadata VALUES (?,?,?,?)"); metadata.forEach(x=>md.run(...x));
 const f=db.prepare("INSERT OR REPLACE INTO regional_trade_flows VALUES (?,?,?,?,?,?,?,?,?,?)"); flows.forEach(x=>f.run(...x));
 const er=db.prepare("INSERT OR REPLACE INTO entity_relationships VALUES (?,?,?,?,?,?,?,?,?,?,?)"); relationships.forEach(x=>er.run(...x));
 const tr=db.prepare("INSERT OR REPLACE INTO transformations VALUES (?,?,?,?,?,?,?,?)"); transformations.forEach(x=>tr.run(...x));
 const mine=db.prepare("INSERT OR REPLACE INTO mine_details VALUES (?,?,?,?,?,?,?,?,?,?,?)"); mineDetails.forEach(x=>mine.run(...x));
}); run();
console.log(`Latest iron ore layer: ${observations.length} observations, ${assets.length} assets, ${flows.length} regional flows, ${relationships.length} logistics links.`);
