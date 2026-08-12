import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url));db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
 ["usgs-nickel-2026","Mineral Commodity Summaries 2026 — Nickel","U.S. Geological Survey","https://pubs.usgs.gov/periodicals/mcs2026/mcs2026.pdf","2026-02-06","2025e","government","high","2026-08-08","Reports estimated global nickel mine production of 3.9 Mt in 2025."],
 ["insg-nickel-market-2025","The Market 2025-12","International Nickel Study Group","https://insg.org/index.php/about-nickel/the-market-2025-12/","2025-12-01","2025e","industry_association","high","2026-08-08","Reports Indonesia at an estimated 66% of global nickel mine output in 2025."],
 ["iea-gevo-2026","Global EV Outlook 2026","International Energy Agency","https://www.iea.org/reports/global-ev-outlook-2026","2026-06-01","2025","government_intergovernmental","high","2026-08-08","Global EV sales, production, trade, battery manufacturing and regional market shares for 2025."],
 ["iea-gevo-2026-batteries","Electric vehicle batteries — Global EV Outlook 2026","International Energy Agency","https://www.iea.org/reports/global-ev-outlook-2026/electric-vehicle-batteries","2026-06-01","2025","government_intergovernmental","high","2026-08-08","Reports more than 4 TWh global cell capacity and China above 80%."],
 ["iea-gevo-2026-manufacturing","Manufacturing and trade — Global EV Outlook 2026","International Energy Agency","https://www.iea.org/reports/global-ev-outlook-2026/manufacturing-and-trade","2026-06-01","2025","government_intergovernmental","high","2026-08-08","Reports global EV production and Chinese production/export concentration."],
];
const products=[
 ["nickel-ore","Nickel ore","Mined laterite or sulphide-bearing material","Extraction","Open-pit or underground mining",null,"Nickel processing","kt Ni"],
 ["nickel-intermediate","Nickel intermediate","Mixed hydroxide, matte or other intermediate nickel product","Intermediate processing","HPAL, smelting or concentration",null,"Refining and chemicals","kt Ni"],
 ["class1-nickel","Class 1 nickel","High-purity nickel suitable for demanding alloy and chemical uses","Refining","Electrorefining or hydrometallurgy","Typically at least 99.8% Ni","Alloys and battery chemicals","kt Ni"],
 ["nickel-sulfate","Nickel sulfate","Battery-grade nickel chemical used in precursor production","Battery material","Dissolution and purification","Battery-grade specification","NMC and NCA cathodes","kt Ni"],
 ["cathode-active-material","Cathode active material","Processed cathode powder determining much of cell chemistry and performance","Battery material","Precursor synthesis and lithiation",null,"Lithium-ion cells","kt"],
 ["battery-cell","Lithium-ion battery cell","Electrochemical storage unit assembled into modules and packs","Cell manufacturing","Electrode coating, cell assembly and formation",null,"Electric vehicles and storage","GWh"],
 ["battery-pack","EV battery pack","Integrated cells, thermal management, structure and controls","Pack assembly","Module or cell-to-pack assembly",null,"Electric vehicles","GWh"],
 ["electric-vehicle","Electric vehicle","Road vehicle propelled partly or entirely by electricity from a rechargeable battery","Final product","Vehicle and powertrain assembly","BEV or PHEV","Passenger and commercial transport","units"],
];
const transformations=[
 ["nickel-ore-intermediate","nickel-ore","nickel-intermediate","Beneficiation, smelting or HPAL",null,null,"Process route depends on ore type","Laterites can produce NPI, matte or MHP; sulphides are concentrated before refining."],
 ["intermediate-class1","nickel-intermediate","class1-nickel","Nickel refining",null,null,null,"Produces high-purity metal for alloys or chemical conversion."],
 ["class1-sulfate","class1-nickel","nickel-sulfate","Chemical conversion",null,null,null,"Nickel units are purified into battery-grade sulfate."],
 ["sulfate-cathode","nickel-sulfate","cathode-active-material","Precursor and cathode production",null,null,null,"Nickel-bearing chemistries include NMC and NCA; LFP contains no nickel."],
 ["cathode-cell","cathode-active-material","battery-cell","Cell manufacturing",null,null,null,"Cathode material is combined with anode, electrolyte, separator and current collectors."],
 ["cell-pack","battery-cell","battery-pack","Pack integration",null,null,null,"Cells become a structural and electronically managed vehicle subsystem."],
 ["pack-ev","battery-pack","electric-vehicle","Vehicle assembly",null,null,null,"Battery packs integrate with electric drive, body, chassis and software."],
 ["automotive-steel-ev","automotive-sheet","electric-vehicle","Vehicle body and component fabrication",null,null,null,"Advanced sheet steel, structural steel and electrical steel enter the vehicle alongside the battery and powertrain."],
];
const countries=[
 ["gbr","GBR","United Kingdom","Europe",55.38,-3.44,"A major European EV market with battery manufacturing investment."],
 ["pol","POL","Poland","Europe",51.92,19.15,"A major European battery manufacturing location."],
 ["hun","HUN","Hungary","Europe",47.16,19.50,"A European battery and automotive manufacturing hub."],
 ["nor","NOR","Norway","Europe",60.47,8.47,"The world's leading electric-car market by new-sales share."],
];
const companies=[
 ["vale-indonesia","PT Vale Indonesia","idn","Nickel mining and processing","Public"],
 ["nickel-asia","Nickel Asia Corporation","phl","Nickel mining","Public"],
 ["nornickel","Nornickel","rus","Nickel mining and processing","Public"],
 ["jinchuan","Jinchuan Group","chn","Nickel mining and processing","State-owned"],
 ["catl","CATL","chn","Battery manufacturing","Public"],
 ["byd","BYD","chn","EV and battery","Public"],
 ["lg-energy-solution","LG Energy Solution","kor","Battery manufacturing","Public"],
 ["panasonic-energy","Panasonic Energy","jpn","Battery manufacturing","Private subsidiary"],
 ["samsung-sdi","Samsung SDI","kor","Battery manufacturing","Public"],
 ["sk-on","SK On","kor","Battery manufacturing","Private subsidiary"],
 ["envision-aesc","Envision AESC","jpn","Battery manufacturing","Private"],
 ["volkswagen","Volkswagen Group","deu","EV manufacturing","Public"],
 ["hyundai-motor","Hyundai Motor Group","kor","EV manufacturing","Public"],
 ["vinfast","VinFast","vnm","EV manufacturing","Public"],
 ["tata-motors","Tata Motors","ind","EV manufacturing","Public"],
 ["toyota","Toyota Motor Corporation","jpn","EV manufacturing","Public"],
];
const commodities=[["ev","Electric vehicles","#63a6d8","million vehicles","Downstream electric road vehicles"]];
const assets=[
 ["sorowako","Sorowako nickel operation","mine","idn","vale-indonesia","nickel",-2.53,121.36,"operating",null,null,1968,"Representative integrated laterite mine and processing system."],
 ["rio-tuba-nickel","Rio Tuba nickel operation","mine","phl","nickel-asia","nickel",8.51,117.43,"operating",null,null,1977,"Representative Philippine laterite mining and processing system."],
 ["sudbury-nickel","Sudbury nickel operations","mine","can","vale","nickel",46.49,-81.01,"operating",null,null,null,"Representative Canadian sulphide nickel mining and processing system."],
 ["norilsk-division","Norilsk industrial division","mine","rus","nornickel","nickel",69.35,88.20,"operating",null,null,null,"Representative Russian sulphide nickel and polymetallic production system."],
 ["jinchuan-complex","Jinchuan nickel complex","mine","chn","jinchuan","nickel",38.50,102.17,"operating",null,null,null,"Representative integrated Chinese nickel mining, refining and materials complex."],
 ["nickel-west","Nickel West operations","mine","aus","bhp","nickel",-30.75,121.47,"care_and_maintenance",null,null,null,"Representative Australian sulphide nickel system; operations were placed into care and maintenance amid weak prices."],
 ["catl-ningde","CATL Ningde production base","battery_plant","chn","catl","battery",26.66,119.55,"operating",null,null,2011,"Representative CATL cell-manufacturing base; group capacity is not assigned to this marker."],
 ["byd-xian","BYD Xi'an vehicle base","ev_plant","chn","byd","ev",34.10,108.75,"operating",null,null,null,"Representative BYD vehicle-manufacturing base."],
 ["tesla-shanghai","Tesla Gigafactory Shanghai","ev_plant","chn","tesla","ev",30.88,121.77,"operating",null,null,2019,"Representative export-oriented EV assembly plant."],
 ["lges-ochang","LG Energy Solution Ochang","battery_plant","kor","lg-energy-solution","battery",36.71,127.44,"operating",null,null,null,"Representative Korean battery manufacturing and development complex."],
 ["panasonic-wakayama","Panasonic Energy Wakayama","battery_plant","jpn","panasonic-energy","battery",34.23,135.17,"operating",null,null,null,"Representative Japanese cylindrical-cell manufacturing site."],
 ["catl-erfurt","CATL Thuringia","battery_plant","deu","catl","battery",50.91,11.00,"operating",null,null,2022,"Representative Chinese-owned battery cell plant in Europe."],
 ["lges-wroclaw","LG Energy Solution Wroclaw","battery_plant","pol","lg-energy-solution","battery",51.02,16.89,"operating",null,null,null,"Representative large-scale Korean-owned European battery plant."],
 ["samsung-god","Samsung SDI God","battery_plant","hun","samsung-sdi","battery",47.59,19.36,"operating",null,null,null,"Representative Korean-owned battery cell plant serving European automakers."],
 ["skon-georgia","SK On Georgia","battery_plant","usa","sk-on","battery",34.20,-83.46,"operating",null,null,null,"Representative Korean-owned US battery manufacturing complex."],
 ["hli-karawang","HLI Green Power Karawang","battery_plant","idn","lg-energy-solution","battery",-6.35,107.30,"operating",10,"GWh",2024,"Indonesia's first EV battery-cell plant, linking local industrial policy to Korean manufacturing capability."],
 ["aesc-sunderland","AESC Sunderland","battery_plant","gbr","envision-aesc","battery",54.92,-1.44,"operating",null,null,null,"Representative UK cell-manufacturing site highlighted by the IEA as part of 2025 capacity growth outside the largest regions."],
 ["vw-zwickau","Volkswagen Zwickau","ev_plant","deu","volkswagen","ev",50.79,12.48,"operating",null,null,null,"Representative European dedicated EV manufacturing site."],
 ["hyundai-ulsan","Hyundai Ulsan","ev_plant","kor","hyundai-motor","ev",35.52,129.37,"operating",null,null,null,"Representative Korean vehicle complex with EV production."],
 ["vinfast-haiphong","VinFast Hai Phong","ev_plant","vnm","vinfast","ev",20.84,106.78,"operating",null,null,2019,"Representative Vietnamese EV manufacturing base serving a rapidly electrifying domestic market."],
 ["tata-pune","Tata Motors Pune","ev_plant","ind","tata-motors","ev",18.64,73.76,"operating",null,null,null,"Representative Indian vehicle plant linked to domestic EV production."],
 ["toyota-motomachi","Toyota Motomachi","ev_plant","jpn","toyota","ev",35.06,137.14,"operating",null,null,null,"Representative Japanese vehicle manufacturing site with electrified-model capability."],
 ["byd-rayong","BYD Rayong","ev_plant","tha","byd","ev",12.75,101.14,"operating",null,null,2024,"Representative Chinese-owned EV production site in Southeast Asia."],
 ["byd-camacari","BYD Camacari","ev_plant","bra","byd","ev",-12.70,-38.32,"operating",null,null,2025,"Representative Chinese-owned Brazilian EV manufacturing site that began operations in 2025."],
];
const observations=[
 ["world-nickel-mine-2025e","commodity","nickel","global_nickel_mine_production",3900,null,"kt Ni","2025e","usgs-nickel-2026","USGS estimated world total."],
 ["idn-nickel-share-2025e","country","idn","global_nickel_mine_production_share",66,null,"%","2025e","insg-nickel-market-2025","INSG estimated share."],
 ["idn-nickel-prod-2025e","country","idn","nickel_mine_production",2600,null,"kt Ni","2025e","usgs-nickel-2026","USGS estimated mine production."],
 ["phl-nickel-prod-2025e","country","phl","nickel_mine_production",270,null,"kt Ni","2025e","usgs-nickel-2026","USGS estimated mine production."],
 ["phl-nickel-share-2025e","country","phl","global_nickel_mine_production_share",6.9,null,"%","2025e","usgs-nickel-2026","Derived from USGS country and world estimates."],
 ["rus-nickel-prod-2025e","country","rus","nickel_mine_production",200,null,"kt Ni","2025e","usgs-nickel-2026","USGS estimated mine production."],
 ["rus-nickel-share-2025e","country","rus","global_nickel_mine_production_share",5.1,null,"%","2025e","usgs-nickel-2026","Derived from USGS country and world estimates."],
 ["can-nickel-prod-2025e","country","can","nickel_mine_production",115,null,"kt Ni","2025e","usgs-nickel-2026","USGS estimated mine production."],
 ["can-nickel-share-2025e","country","can","global_nickel_mine_production_share",2.9,null,"%","2025e","usgs-nickel-2026","Derived from USGS country and world estimates."],
 ["chn-nickel-prod-2025e","country","chn","nickel_mine_production",120,null,"kt Ni","2025e","usgs-nickel-2026","USGS estimated mine production."],
 ["chn-nickel-share-2025e","country","chn","global_nickel_mine_production_share",3.1,null,"%","2025e","usgs-nickel-2026","Derived from USGS country and world estimates."],
 ["aus-nickel-prod-2025e","country","aus","nickel_mine_production",45,null,"kt Ni","2025e","usgs-nickel-2026","USGS estimated mine production after care-and-maintenance closures."],
 ["aus-nickel-share-2025e","country","aus","global_nickel_mine_production_share",1.2,null,"%","2025e","usgs-nickel-2026","Derived from USGS country and world estimates."],
 ["bra-nickel-prod-2025e","country","bra","nickel_mine_production",70,null,"kt Ni","2025e","usgs-nickel-2026","USGS estimated mine production."],
 ["bra-nickel-share-2025e","country","bra","global_nickel_mine_production_share",1.8,null,"%","2025e","usgs-nickel-2026","Derived from USGS country and world estimates."],
 ["usa-nickel-prod-2025e","country","usa","nickel_mine_production",10,null,"kt Ni","2025e","usgs-nickel-2026","USGS estimated mine production."],
 ["usa-nickel-share-2025e","country","usa","global_nickel_mine_production_share",0.3,null,"%","2025e","usgs-nickel-2026","Derived from USGS country and world estimates."],
 ["world-ev-sales-2025","industry","ev","global_ev_sales",21,null,"million vehicles","2025","iea-gevo-2026","IEA reports sales exceeded 20 million; Global Energy Review reports 21 million."],
 ["world-ev-sales-share-2025","industry","ev","global_ev_sales_share",25,null,"%","2025","iea-gevo-2026","One quarter of new cars sold."],
 ["world-ev-production-2025","industry","ev","global_ev_production",22,null,"million vehicles","2025","iea-gevo-2026-manufacturing","IEA reports almost 22 million."],
 ["chn-ev-sales-2025","country","chn","ev_sales",13,null,"million vehicles","2025","iea-gevo-2026","IEA reports more than 13 million."],
 ["chn-ev-penetration-2025","country","chn","ev_sales_share",55,null,"%","2025","iea-gevo-2026","Nearly 55% of new car sales."],
 ["chn-ev-production-share-2025","country","chn","global_ev_production_share",70,null,"%","2025","iea-gevo-2026-manufacturing","IEA Manufacturing and Trade model result."],
 ["chn-ev-exports-2025","country","chn","ev_exports",2.5,null,"million vehicles","2025","iea-gevo-2026-manufacturing","More than 2.5 million exported."],
 ["eur-ev-sales-2025","region","eur","ev_sales",4.2,null,"million vehicles","2025","iea-gevo-2026","Europe total."],
 ["eur-ev-penetration-2025","region","eur","ev_sales_share",28,null,"%","2025","iea-gevo-2026","Europe share of new car sales."],
 ["usa-ev-sales-2025","country","usa","ev_sales",1.5,null,"million vehicles","2025","iea-gevo-2026","Around 1.5 million."],
 ["usa-ev-penetration-2025","country","usa","ev_sales_share",10,null,"%","2025","iea-gevo-2026","Just under 10%, shown approximately."],
 ["deu-ev-sales-2025","country","deu","ev_sales",0.85,null,"million vehicles","2025","iea-gevo-2026","IEA reported a record 850,000 electric cars."],
 ["gbr-ev-penetration-2025","country","gbr","ev_sales_share",33,null,"%","2025","iea-gevo-2026","Over one in three sales; shown as a lower-bound headline."],
 ["kor-ev-sales-2025","country","kor","ev_sales",0.20,null,"million vehicles","2025","iea-gevo-2026","IEA reported more than 200,000 electric cars."],
 ["kor-ev-penetration-2025","country","kor","ev_sales_share",11,null,"%","2025","iea-gevo-2026","IEA reported an 11% sales share."],
 ["jpn-ev-sales-2025","country","jpn","ev_sales",0.10,null,"million vehicles","2025","iea-gevo-2026","IEA reported sales just above 100,000."],
 ["jpn-ev-penetration-2025","country","jpn","ev_sales_share",3,null,"%","2025","iea-gevo-2026","Less than 3%, shown as an upper-bound headline."],
 ["aus-ev-penetration-2025","country","aus","ev_sales_share",15,null,"%","2025","iea-gevo-2026","IEA reported around 15% of new-car sales."],
 ["tur-ev-sales-2025","country","tur","ev_sales",0.24,null,"million vehicles","2025","iea-gevo-2026","IEA reported nearly 240,000 electric cars."],
 ["tur-ev-penetration-2025","country","tur","ev_sales_share",20,null,"%","2025","iea-gevo-2026","More than 20%, shown as a lower-bound headline."],
 ["vnm-ev-penetration-2025","country","vnm","ev_sales_share",40,null,"%","2025","iea-gevo-2026","IEA reported nearly 40%."],
 ["tha-ev-sales-2025","country","tha","ev_sales",0.14,null,"million vehicles","2025","iea-gevo-2026","IEA reported roughly 140,000 electric cars."],
 ["tha-ev-penetration-2025","country","tha","ev_sales_share",25,null,"%","2025","iea-gevo-2026","Nearly one-quarter, shown as 25%."],
 ["idn-ev-penetration-2025","country","idn","ev_sales_share",15,null,"%","2025","iea-gevo-2026","IEA reported 15% of new-car sales."],
 ["mys-ev-penetration-2025","country","mys","ev_sales_share",7,null,"%","2025","iea-gevo-2026","IEA reported about 7%."],
 ["phl-ev-penetration-2025","country","phl","ev_sales_share",10,null,"%","2025","iea-gevo-2026","IEA reported almost 10%."],
 ["ind-ev-sales-2025","country","ind","ev_sales",0.165,null,"million vehicles","2025","iea-gevo-2026","IEA reported 165,000 electric cars."],
 ["ind-ev-penetration-2025","country","ind","ev_sales_share",4,null,"%","2025","iea-gevo-2026","IEA reported nearly 4%."],
 ["bra-ev-sales-2025","country","bra","ev_sales",0.18,null,"million vehicles","2025","iea-gevo-2026","IEA reported 180,000 electric cars."],
 ["bra-ev-penetration-2025","country","bra","ev_sales_share",9,null,"%","2025","iea-gevo-2026","IEA reported 9%."],
 ["mex-ev-penetration-2025","country","mex","ev_sales_share",7,null,"%","2025","iea-gevo-2026","IEA reported more than 7%."],
 ["nor-ev-penetration-2025","country","nor","ev_sales_share",97,null,"%","2025","iea-gevo-2026","IEA reported about 97%."],
 ["world-battery-capacity-2025","industry","battery","global_battery_cell_capacity",4,null,"TWh","2025","iea-gevo-2026-batteries","More than 4 TWh nameplate capacity."],
 ["chn-cell-production-share-2025","country","chn","global_battery_cell_production_share",80,null,"%","2025","iea-gevo-2026","Over 80%, shown as a lower-bound headline."],
 ["chn-cam-production-share-2025","country","chn","global_cathode_active_material_production_share",85,null,"%","2025","iea-gevo-2026-manufacturing","About 85% of global cathode active material production."],
 ["chn-aam-production-share-2025","country","chn","global_anode_active_material_production_share",90,null,"%","2025","iea-gevo-2026-manufacturing","More than 90%, shown as a lower-bound headline."],
 ["usa-cell-capacity-share-2025","country","usa","global_battery_cell_capacity_share",6.5,null,"%","2025","iea-gevo-2026-batteries","Derived midpoint of the IEA's reported 6-7% range for mapping."],
 ["chn-cell-capacity-share-2025","country","chn","global_battery_cell_capacity_share",80,null,"%","2025","iea-gevo-2026-batteries","Over 80%, shown as a lower-bound headline."],
 ["chn-battery-assets","country","chn","representative_battery_assets",1,null,"mapped cases","2025","iea-gevo-2026-batteries","Derived atlas case count; not a national plant count."],
 ["kor-battery-assets","country","kor","representative_battery_assets",1,null,"mapped cases","2025","iea-gevo-2026-batteries","Derived atlas case count; not a national plant count."],
 ["jpn-battery-assets","country","jpn","representative_battery_assets",1,null,"mapped cases","2025","iea-gevo-2026-batteries","Derived atlas case count; not a national plant count."],
 ["usa-battery-assets","country","usa","representative_battery_assets",2,null,"mapped cases","2025","iea-gevo-2026-batteries","Derived atlas case count; not a national plant count."],
 ["deu-battery-assets","country","deu","representative_battery_assets",1,null,"mapped cases","2025","iea-gevo-2026-batteries","Derived atlas case count; not a national plant count."],
 ["pol-battery-assets","country","pol","representative_battery_assets",1,null,"mapped cases","2025","iea-gevo-2026-batteries","Derived atlas case count; not a national plant count."],
 ["hun-battery-assets","country","hun","representative_battery_assets",1,null,"mapped cases","2025","iea-gevo-2026-batteries","Derived atlas case count; not a national plant count."],
 ["gbr-battery-assets","country","gbr","representative_battery_assets",1,null,"mapped cases","2025","iea-gevo-2026-batteries","Derived atlas case count; not a national plant count."],
 ["idn-battery-assets","country","idn","representative_battery_assets",1,null,"mapped cases","2025","iea-gevo-2026-batteries","Derived atlas case count; not a national plant count."],
];

const run=db.transaction(()=>{
 const s=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)");sources.forEach(x=>s.run(...x));
 const n=db.prepare("INSERT OR REPLACE INTO countries VALUES (?,?,?,?,?,?,?)");countries.forEach(x=>n.run(...x));
 const m=db.prepare("INSERT OR REPLACE INTO commodities VALUES (?,?,?,?,?)");commodities.forEach(x=>m.run(...x));
 const c=db.prepare("INSERT OR REPLACE INTO companies VALUES (?,?,?,?,?)");companies.forEach(x=>c.run(...x));
 const p=db.prepare("INSERT OR REPLACE INTO products VALUES (?,?,?,?,?,?,?,?)");products.forEach(x=>p.run(...x));
 const t=db.prepare("INSERT OR REPLACE INTO transformations VALUES (?,?,?,?,?,?,?,?)");transformations.forEach(x=>t.run(...x));
 const a=db.prepare("INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");assets.forEach(x=>a.run(...x));
 const o=db.prepare("INSERT OR REPLACE INTO observations VALUES (?,?,?,?,?,?,?,?,?,?)");const md=db.prepare("INSERT OR REPLACE INTO observation_metadata VALUES (?,?,?,?)");observations.forEach(x=>{o.run(...x);md.run(x[0],x[7].includes('e')?'estimated':x[9]?.startsWith('Derived')?'derived':'reported',x[7],null)});
});run();
console.log(`Seeded nickel-to-EV chain: ${products.length} products, ${assets.length} representative assets and ${observations.length} observations.`);
