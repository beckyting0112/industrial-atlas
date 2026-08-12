import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here=dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
  ["posco-step-hyundai-2017","POSCO STEP applied in Hyundai Samho shipbuilding","POSCO Group Newsroom","https://newsroom.posco.com/en/posco-steps-game-shipbuilding/","2017-09-14","2017","company","high","2026-08-08","Documents initial application of POSCO tapered plate in a Hyundai Samho hull and plans for further cooperation."],
  ["nippon-imabari-nsafe-2015","NSafe-Hull adoption by Imabari Shipbuilding","Nippon Steel and Imabari Shipbuilding","https://www.nipponsteel.com/en/news/20150106_100.html","2015-01-06","2015","company","high","2026-08-08","Documents adoption of Nippon Steel's highly ductile hull plate in an Imabari bulk carrier built at Saijo."],
  ["arcelormittal-shipbuilding-offer","Steel for the global shipbuilding industry","ArcelorMittal","https://industry.arcelormittal.com/market-segments/steel-for-transport/shipbuilding",null,"current","company","high","2026-08-08","Documents heavy plate and hot-rolled steel applications across ship structures, without naming a mapped shipyard customer."]
];
const putSource=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)");
sources.forEach(row=>putSource.run(...row));

const links=[
  ["posco-hyundai-step","posco","hd-hyundai-shipbuilding","kor","documented product application","STEP tapered heavy plate","Ship hull fabrication","POSCO and Hyundai Samho reported the initial hull application and discussed expanded cooperation.","2017","documented","posco-step-hyundai-2017"],
  ["nippon-imabari-nsafe","nippon-steel","imabari","jpn","documented product adoption","NSafe-Hull high-ductility plate","Collision-resistant bulk-carrier hull","Imabari selected the plate for a 206,600 dwt bulk carrier constructed at its Saijo yard.","2015","documented","nippon-imabari-nsafe-2015"],
  ["arcelormittal-global-marine","arcelormittal",null,null,"market supplier capability","Quarto heavy plate and hot-rolled steel","Hull, deck, structural and machinery applications","ArcelorMittal documents a global certified shipbuilding offer; no named mapped-yard relationship is asserted.","current","supplier_capability","arcelormittal-shipbuilding-offer"]
];
const putLink=db.prepare("INSERT OR REPLACE INTO steel_shipbuilding_links VALUES (?,?,?,?,?,?,?,?,?,?,?)");
links.forEach(row=>putLink.run(...row));

console.log(`Seeded ${links.length} evidence-coded steel-to-shipbuilding links.`);
