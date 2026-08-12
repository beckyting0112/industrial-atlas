import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url));db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));
const source=["unctad-rmt-2025-disruption","Review of Maritime Transport 2025: rerouting and chokepoints","UN Trade and Development","https://unctad.org/publication/review-maritime-transport-2025","2025-09-24","2024-2025","government_intergovernmental","high","2026-08-08","UNCTAD reports that rerouting raised global tonne-miles by 5.9% in 2024 while maritime trade volume grew 2.2%; scenario distances and sailing days in the Atlas are route-model estimates."];
db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)").run(...source);
const links=[
 ["container-asia-europe","malacca",1],["container-asia-europe","bab-el-mandeb",2],["container-asia-europe","suez",3],["container-asia-europe","gibraltar",4],
 ["container-singapore-europe","malacca",1],["container-singapore-europe","bab-el-mandeb",2],["container-singapore-europe","suez",3],["container-singapore-europe","gibraltar",4],
 ["lng-qatar-china","hormuz",1],["lng-qatar-china","malacca",2],
 ["crude-saudi-china","hormuz",1],["crude-saudi-china","malacca",2],
 ["crude-gulf-japan","hormuz",1],["crude-gulf-japan","malacca",2],
 ["product-us-chile","panama",1],
];
const pl=db.prepare("INSERT OR REPLACE INTO route_chokepoints VALUES (?,?,?)");links.forEach(x=>pl.run(...x));
const capeShanghai=[[31.23,121.49,"Shanghai"],[15,115,"South China Sea"],[1.5,103.5,"Malacca"],[-10,90,"Indian Ocean"],[-25,55,"Indian Ocean"],[-35,18,"Cape of Good Hope"],[-20,-5,"South Atlantic"],[10,-20,"Atlantic"],[36,-5.5,"Gibraltar"],[49.5,-6,"English Channel"],[51.95,4.14,"Rotterdam"]];
const capeSingapore=[[1.26,103.84,"Singapore"],[-10,90,"Indian Ocean"],[-25,55,"Indian Ocean"],[-35,18,"Cape of Good Hope"],[-20,-5,"South Atlantic"],[10,-20,"Atlantic"],[36,-5.5,"Gibraltar"],[49.5,-6,"English Channel"],[51.95,4.14,"Rotterdam"]];
const scenarios=[
 ["suez-shanghai-cape","suez","container-asia-europe","Suez closure","Cape of Good Hope diversion",13700,3200,8.9,15,JSON.stringify(capeShanghai),"Indicative sailing-only difference; excludes congestion, weather, port windows, insurance and equipment repositioning.","estimated","unctad-rmt-2025-disruption"],
 ["suez-singapore-cape","suez","container-singapore-europe","Suez closure","Cape of Good Hope diversion",11700,3400,9.4,15,JSON.stringify(capeSingapore),"Indicative sailing-only difference; excludes congestion, weather, port windows, insurance and equipment repositioning.","estimated","unctad-rmt-2025-disruption"],
];
const ps=db.prepare("INSERT OR REPLACE INTO route_disruption_scenarios VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");scenarios.forEach(x=>ps.run(...x));
console.log(`Seeded ${links.length} route-chokepoint links and ${scenarios.length} Suez scenarios.`);
