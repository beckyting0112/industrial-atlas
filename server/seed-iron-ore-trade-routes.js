import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here=dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
  ["un-comtrade-hs2601-2024","UN Comtrade: China imports of HS 2601 by partner, 2024","United Nations Statistics Division","https://comtradeplus.un.org/","2025-01-01","2024","intergovernmental_customs","high","2026-08-07","Reported net weight and trade value. HS 2601 covers iron ores and concentrates, including roasted iron pyrites."],
  ["csn-c3-freight-1q25","CSN 1Q25 results: C3 Tubarao-Qingdao freight","Companhia Siderurgica Nacional","https://www.sec.gov/Archives/edgar/data/1049659/000129281425001959/sidpr1q25_6k.htm","2025-05-01","1Q2025","company_filing","high","2026-08-07","Quarterly average C3 freight rate reported as USD 19.10/t."],
  ["csn-c3-freight-3q25","CSN 3Q25 results: C3 Tubarao-Qingdao freight","Companhia Siderurgica Nacional","https://www.sec.gov/Archives/edgar/data/1049659/000129281425003879/sidpr3q25_6k.htm","2025-11-01","2Q-3Q2025","company_filing","high","2026-08-07","Quarterly C3 rates: USD 20.85/t in 2Q25 and USD 23.36/t in 3Q25."],
  ["csn-c3-freight-4q25","CSN 4Q25 results: C3 Tubarao-Qingdao freight","Companhia Siderurgica Nacional","https://www.sec.gov/Archives/edgar/data/1049659/000129281426000805/sidpr4q25_6k.htm","2026-03-01","4Q2025","company_filing","high","2026-08-07","Quarterly average C3 freight rate reported as USD 23.88/t."],
];

const countries=[
 ["zaf","ZAF","South Africa","Africa",-30.56,22.94,"Major seaborne iron ore exporter."],
 ["per","PER","Peru","South America",-9.19,-75.02,"Iron ore and metals producer."],
 ["can","CAN","Canada","North America",56.13,-106.35,"High-grade iron ore concentrate and pellet exporter."],
 ["ukr","UKR","Ukraine","Europe",48.38,31.17,"Iron ore producer and exporter."],
 ["mrt","MRT","Mauritania","Africa",21.01,-10.94,"Seaborne iron ore exporter."],
 ["sle","SLE","Sierra Leone","Africa",8.46,-11.78,"Iron ore producer and exporter."],
 ["rus","RUS","Russia","Europe / Asia",61.52,105.32,"Iron ore producer."],
 ["chl","CHL","Chile","South America",-35.68,-71.54,"Iron ore and copper producer."],
 ["gin","GIN","Guinea","Africa",9.95,-9.70,"Emerging high-grade iron ore exporter."],
 ["irn","IRN","Iran","Middle East",32.43,53.69,"Iron ore and steel producer."],
 ["kaz","KAZ","Kazakhstan","Central Asia",48.02,66.92,"Iron ore producer."],
 ["mys","MYS","Malaysia","Southeast Asia",4.21,101.98,"Regional processing and transshipment location."],
 ["mng","MNG","Mongolia","East Asia",46.86,103.85,"Land-border iron ore supplier to China."],
 ["omn","OMN","Oman","Middle East",21.47,55.98,"Pelletizing and transshipment hub."],
 ["swe","SWE","Sweden","Europe",60.13,18.64,"High-grade iron ore producer."],
];

const partnerFlows=[
 ["aus-chn-hs2601-2024","aus",742.5101499,79638087811],
 ["bra-chn-hs2601-2024","bra",273.0135601,28742350325],
 ["zaf-chn-hs2601-2024","zaf",38.221712,4353424533],
 ["per-chn-hs2601-2024","per",22.38738841,2825631787],
 ["can-chn-hs2601-2024","can",16.3649202,1996307929],
 ["ukr-chn-hs2601-2024","ukr",12.7491693,1582809193],
 ["chl-chn-hs2601-2024","chl",12.070144253,1536749474],
 ["mrt-chn-hs2601-2024","mrt",9.472452894,993199119],
 ["sle-chn-hs2601-2024","sle",9.280638029,829026281],
 ["irn-chn-hs2601-2024","irn",9.301201794,1132263078],
 ["rus-chn-hs2601-2024","rus",9.07367651,930787581],
 ["omn-chn-hs2601-2024","omn",8.7373074,1080248453],
 ["mng-chn-hs2601-2024","mng",7.42215715,508481069],
 ["kaz-chn-hs2601-2024","kaz",5.54146917,526922518],
 ["mys-chn-hs2601-2024","mys",3.127933429,277618158],
 ["swe-chn-hs2601-2024","swe",1.6008881,218415736],
 ["gin-chn-hs2601-2024","gin",0.15798273,20774748],
];

const ports=[
 ["tubarao","Port of Tubarao","port","bra","vale","iron-ore",-20.29,-40.24,"operating",null,null,1966,"Brazilian iron ore export terminal and C3 freight-route origin."],
 ["saldanha","Port of Saldanha","port","zaf",null,"iron-ore",-33.02,17.96,"operating",null,null,1976,"South Africa's principal iron ore export port."],
];
const routes=[
 ["c5-port-hedland-qingdao","C5 Port Hedland to Qingdao","port-hedland","qingdao","iron-ore",4300,13.3,null,null,"Capesize",null,null,null],
 ["c3-tubarao-qingdao","C3 Tubarao to Qingdao","tubarao","qingdao","iron-ore",10600,32.7,21.7975,"USD/t","Capesize",null,null,null],
 ["pdm-qingdao","Ponta da Madeira to Qingdao","ponta-madeira","qingdao","iron-ore",11500,35.5,null,null,"Capesize / Valemax",null,null,null],
 ["saldanha-qingdao","Saldanha Bay to Qingdao","saldanha","qingdao","iron-ore",9700,29.9,null,null,"Capesize",null,null,null],
];
const routeMetrics=[
 ["c3-freight-2025","c3-tubarao-qingdao","freight_cost",2025,21.7975,"USD/t","derived","csn-c3-freight-4q25","Arithmetic mean of four reported quarterly C3 rates: 19.10, 20.85, 23.36 and 23.88 USD/t."],
 ["c3-transit-2025","c3-tubarao-qingdao","estimated_transit_time",2025,32.7,"days","estimated",null,"Calculated route length divided by an assumed 13.5-knot average sailing speed; excludes port waiting and loading."],
 ["c5-transit-2025","c5-port-hedland-qingdao","estimated_transit_time",2025,13.3,"days","estimated",null,"Calculated route length divided by an assumed 13.5-knot average sailing speed; excludes port waiting and loading."],
 ["pdm-transit-2025","pdm-qingdao","estimated_transit_time",2025,35.5,"days","estimated",null,"Calculated route length divided by an assumed 13.5-knot average sailing speed; excludes port waiting and loading."],
 ["saldanha-transit-2025","saldanha-qingdao","estimated_transit_time",2025,29.9,"days","estimated",null,"Calculated route length divided by an assumed 13.5-knot average sailing speed; excludes port waiting and loading."],
 ["bra-customs-unit-value-2024","c3-tubarao-qingdao","china_import_unit_value",2024,105.28,"USD/t","derived","un-comtrade-hs2601-2024","China customs value divided by net weight for all HS2601 imports from Brazil; country-level, not route-specific."],
 ["bra-shipping-intensity-2025","c3-tubarao-qingdao","shipping_intensity",2025,20.70,"%","derived","csn-c3-freight-4q25","2025 C3 quarterly-average freight divided by 2024 Brazil-China customs unit value. Indicative only: vintages differ and import value may include freight."],
 ["aus-customs-unit-value-2024","c5-port-hedland-qingdao","china_import_unit_value",2024,107.26,"USD/t","derived","un-comtrade-hs2601-2024","China customs value divided by net weight for all HS2601 imports from Australia; country-level, not route-specific."],
];

const run=db.transaction(()=>{
 const s=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)"); sources.forEach(x=>s.run(...x));
 const c=db.prepare("INSERT OR REPLACE INTO countries VALUES (?,?,?,?,?,?,?)"); countries.forEach(x=>c.run(...x));
 const a=db.prepare("INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"); ports.forEach(x=>a.run(...x));
 const f=db.prepare("INSERT OR REPLACE INTO trade_flows VALUES (?,?,?,?,?,?,?,?,?,?)"); partnerFlows.forEach(([id,origin,volume,value])=>f.run(id,origin,"chn","iron-ore",2024,volume,"Mt",value,"2601","un-comtrade-hs2601-2024"));
 const r=db.prepare("INSERT OR REPLACE INTO shipping_routes VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"); routes.forEach(x=>r.run(...x));
 const rm=db.prepare("INSERT OR REPLACE INTO shipping_route_metrics VALUES (?,?,?,?,?,?,?,?,?)"); routeMetrics.forEach(x=>rm.run(...x));
}); run();

const covered=partnerFlows.reduce((sum,x)=>sum+x[2],0);
console.log(`Iron ore customs/routes: ${partnerFlows.length} bilateral flows (${covered.toFixed(1)} Mt covered), ${routes.length} routes, ${routeMetrics.length} route metrics.`);
