import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url)); db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
 ["aus-req-jun-2025-coal","Resources and Energy Quarterly: June 2025","Australian Department of Industry, Science and Resources","https://www.industry.gov.au/publications/resources-and-energy-quarterly-june-2025","2025-06-01","2024-25","government","high","2026-08-08","Reports Australian metallurgical coal exports of 147 Mt in 2024-25; destination routes shown in the Atlas are representative corridors, not allocated bilateral tonnages."],
 ["usda-brazil-soy-transport-2024","Soybean Transportation Guide: Brazil 2024","USDA Agricultural Marketing Service","https://www.ams.usda.gov/sites/default/files/media/BrazilSoybeanTransportationGuide2024.pdf","2025-10-01","2024","government","high","2026-08-08","Reports 72.5 Mt of Brazilian soybeans exported to China in 2024. Santos-Qingdao is a gateway representation of the bilateral flow, not a measured port pair."],
 ["eia-australia-energy-2024","Australia country energy analysis","U.S. Energy Information Administration","https://www.eia.gov/international/analysis/country/AUS","2025-12-01","2024","government","high","2026-08-08","Australia exported about 10.2-10.7 Bcf/d of LNG; Japan received 32%. Atlas estimate uses 10.45 Bcf/d midpoint multiplied by 32%."],
 ["eia-us-lng-2024","The United States remained the world's largest LNG exporter in 2024","U.S. Energy Information Administration","https://www.eia.gov/todayinenergy/detail.php?id=64844","2025-03-27","2024","government","high","2026-08-08","Reports U.S. LNG exports of 11.9 Bcf/d and 6.3 Bcf/d to Europe. Sabine-Rotterdam is a representative gateway corridor, not a measured terminal pair."],
 ["eia-hormuz-lng-2024","About one-fifth of global LNG trade flows through the Strait of Hormuz","U.S. Energy Information Administration","https://www.eia.gov/todayinenergy/detail.php?id=65584","2025-06-24","2024","government","high","2026-08-08","Reports Qatar exported about 9.3 Bcf/d through Hormuz; China, India and Korea were leading destinations. Qatar-China route is representative with no bilateral volume assigned."],
 ["unctad-rmt-2025-routes","Review of Maritime Transport 2025","UN Trade and Development","https://unctad.org/publication/review-maritime-transport-2025","2025-09-24","2024-2025","government_intergovernmental","high","2026-08-08","Supports the strategic importance of main container corridors and the distinction between trade volume and tonne-mile growth; representative liner corridors carry no invented port-pair volume."],
];
const putSource=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)");sources.forEach(x=>putSource.run(...x));
const commodities=[
 ["coking-coal","Coking coal","#8a6b4c","Mt","Metallurgical coal used to make coke for blast-furnace steelmaking"],
 ["grain","Grain and oilseeds","#d5ad55","Mt","Agricultural dry-bulk cargo"],
 ["lng","LNG","#55b9c6","Bcf/d","Liquefied natural gas shipped in cryogenic carriers"],
 ["containers","Containerized goods","#8d72cc","TEU","Manufactured and intermediate goods transported in containers"],
];
const putCommodity=db.prepare("INSERT OR REPLACE INTO commodities VALUES (?,?,?,?,?)");commodities.forEach(x=>putCommodity.run(...x));
const countries=[
 ["qat","QAT","Qatar","Middle East",25.35,51.18,"A leading LNG exporter centered on the North Field and Ras Laffan."],
 ["nld","NLD","Netherlands","Europe",52.13,5.29,"A major European maritime and energy gateway."],
 ["sgp","SGP","Singapore","Southeast Asia",1.35,103.82,"A leading container transshipment and maritime-services hub."],
];
const putCountry=db.prepare("INSERT OR IGNORE INTO countries VALUES (?,?,?,?,?,?,?)");countries.forEach(x=>putCountry.run(...x));
const ports=[
 ["hay-point","Hay Point","port","aus",null,"coking-coal",-21.27,149.30,"operating",null,null,null,"Major Queensland metallurgical-coal export gateway."],
 ["paradip","Paradip Port","port","ind",null,"coking-coal",20.27,86.67,"operating",null,null,null,"Indian east-coast bulk import gateway."],
 ["santos","Port of Santos","port","bra",null,"grain",-23.96,-46.30,"operating",null,null,null,"Major Brazilian agricultural and container export gateway."],
 ["dampier-lng","Dampier LNG gateway","port","aus",null,"lng",-20.66,116.71,"operating",null,null,null,"Representative Western Australian LNG export gateway."],
 ["ras-laffan","Ras Laffan","port","qat",null,"lng",25.91,51.55,"operating",null,null,null,"Qatar's principal LNG export complex."],
 ["yokohama","Port of Yokohama","port","jpn",null,"lng",35.45,139.64,"operating",null,null,null,"Representative Japanese LNG and container gateway."],
 ["sabine-pass","Sabine Pass LNG","port","usa",null,"lng",29.73,-93.87,"operating",null,null,null,"Representative U.S. Gulf LNG export terminal."],
 ["rotterdam","Port of Rotterdam","port","nld",null,"containers",51.95,4.14,"operating",null,null,null,"Major European container and energy gateway."],
 ["shanghai-port","Port of Shanghai","port","chn",null,"containers",31.23,121.49,"operating",null,null,null,"Major global container gateway."],
 ["los-angeles-port","Port of Los Angeles","port","usa",null,"containers",33.74,-118.27,"operating",null,null,null,"Major trans-Pacific container gateway."],
 ["singapore-port","Port of Singapore","port","sgp",null,"containers",1.26,103.84,"operating",null,null,null,"Major Asia-Europe transshipment hub."],
];
const putAsset=db.prepare("INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");ports.forEach(x=>putAsset.run(...x));

const routes=[
 ["coal-haypoint-paradip","Queensland to India metallurgical coal","hay-point","paradip","coking-coal",5700,17.6,null,null,"Capesize / Panamax",null,"Mt",null],
 ["coal-haypoint-yokohama","Queensland to Japan metallurgical coal","hay-point","yokohama","coking-coal",3900,12.0,null,null,"Panamax / Capesize",null,"Mt",null],
 ["soy-santos-qingdao","Brazil-China soybean corridor","santos","qingdao","grain",11100,34.3,null,null,"Panamax / Kamsarmax",72.5,"Mt",null],
 ["lng-aus-japan","Australia-Japan LNG corridor","dampier-lng","yokohama","lng",3900,11.6,null,null,"LNG carrier",3.34,"Bcf/d",null],
 ["lng-qatar-china","Qatar-China LNG corridor","ras-laffan","qingdao","lng",6300,18.8,null,null,"LNG carrier",null,"Bcf/d",null],
 ["lng-us-europe","U.S. Gulf-Europe LNG corridor","sabine-pass","rotterdam","lng",5000,14.9,null,null,"LNG carrier",6.3,"Bcf/d",null],
 ["container-transpacific","Trans-Pacific container corridor","shanghai-port","los-angeles-port","containers",5700,15.8,null,null,"Container ship",null,"TEU",null],
 ["container-asia-europe","Asia-Europe container corridor","shanghai-port","rotterdam","containers",10500,29.2,null,null,"Container ship",null,"TEU",null],
 ["container-singapore-europe","Singapore-Europe container corridor","singapore-port","rotterdam","containers",8300,23.1,null,null,"Container ship",null,"TEU",null],
];
const putRoute=db.prepare("INSERT OR REPLACE INTO shipping_routes VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");routes.forEach(x=>putRoute.run(...x));
const profiles=[
 ["coal-haypoint-paradip","Coking coal","representative maritime corridor","not allocated","Australian 147 Mt export total is not assigned to this specific corridor.","aus-req-jun-2025-coal","#8a6b4c"],
 ["coal-haypoint-yokohama","Coking coal","representative maritime corridor","not allocated","Japan is a major Australian coal destination; no coking-coal port-pair volume is assigned.","aus-req-jun-2025-coal","#8a6b4c"],
 ["soy-santos-qingdao","Grain / oilseeds","bilateral flow via representative gateways","country-flow proxy","72.5 Mt is all Brazil-China soybean trade, not Santos-Qingdao port-pair throughput.","usda-brazil-soy-transport-2024","#d5ad55"],
 ["lng-aus-japan","LNG","bilateral flow via representative gateways","derived country-flow proxy","10.45 Bcf/d midpoint for Australian exports multiplied by Japan's 32% destination share.","eia-australia-energy-2024","#55b9c6"],
 ["lng-qatar-china","LNG","representative strategic corridor","not allocated","Qatar export scale and Asian destinations are reported; no Qatar-China bilateral volume assigned.","eia-hormuz-lng-2024","#55b9c6"],
 ["lng-us-europe","LNG","regional flow via representative gateways","regional-flow proxy","6.3 Bcf/d is total U.S.-Europe LNG, not Sabine Pass-Rotterdam throughput.","eia-us-lng-2024","#55b9c6"],
 ["container-transpacific","Containerized goods","representative liner corridor","not collected","Strategic corridor only; line width must not be read as TEU volume.","unctad-rmt-2025-routes","#8d72cc"],
 ["container-asia-europe","Containerized goods","representative liner corridor","not collected","Strategic corridor only; line width must not be read as TEU volume.","unctad-rmt-2025-routes","#8d72cc"],
 ["container-singapore-europe","Containerized goods","representative liner corridor","not collected","Strategic corridor only; Singapore represents a transshipment gateway.","unctad-rmt-2025-routes","#8d72cc"],
];
const putProfile=db.prepare("INSERT OR REPLACE INTO shipping_route_profiles VALUES (?,?,?,?,?,?,?)");profiles.forEach(x=>putProfile.run(...x));

const waypointSets={
 "c5-port-hedland-qingdao":[[-20.31,118.58,"Port Hedland"],[-12.0,116.0,"Indian Ocean"],[-8.6,115.7,"Lombok Strait"],[-3.0,119.0,"Makassar Strait"],[5.0,115.0,"South China Sea"],[18.0,115.0,"South China Sea"],[30.0,122.0,"East China Sea"],[36.08,120.28,"Qingdao"]],
 "c3-tubarao-qingdao":[[-20.29,-40.24,"Tubarao"],[-32.0,-20.0,"South Atlantic"],[-35.0,18.0,"Cape of Good Hope"],[-25.0,55.0,"Indian Ocean"],[-12.0,90.0,"Indian Ocean"],[-6.0,105.5,"Sunda Strait"],[5.0,110.0,"South China Sea"],[20.0,116.0,"South China Sea"],[36.08,120.28,"Qingdao"]],
 "pdm-qingdao":[[-2.57,-44.38,"Ponta da Madeira"],[-18.0,-25.0,"South Atlantic"],[-35.0,18.0,"Cape of Good Hope"],[-25.0,55.0,"Indian Ocean"],[-10.0,92.0,"Indian Ocean"],[-6.0,105.5,"Sunda Strait"],[5.0,110.0,"South China Sea"],[20.0,116.0,"South China Sea"],[36.08,120.28,"Qingdao"]],
 "saldanha-qingdao":[[-33.02,17.96,"Saldanha Bay"],[-35.0,22.0,"Cape of Good Hope"],[-25.0,55.0,"Indian Ocean"],[-10.0,92.0,"Indian Ocean"],[-6.0,105.5,"Sunda Strait"],[5.0,110.0,"South China Sea"],[20.0,116.0,"South China Sea"],[36.08,120.28,"Qingdao"]],
 "coal-haypoint-paradip":[[-21.27,149.30,"Hay Point"],[-11.0,145.0,"Torres Strait"],[-8.0,130.0,"Arafura Sea"],[-8.0,110.0,"Java Sea"],[-6.0,105.5,"Sunda Strait"],[-2.0,90.0,"Indian Ocean"],[12.0,82.0,"Bay of Bengal"],[20.27,86.67,"Paradip"]],
 "coal-haypoint-yokohama":[[-21.27,149.30,"Hay Point"],[-10.0,150.0,"Coral Sea"],[5.0,145.0,"Philippine Sea"],[20.0,140.0,"Philippine Sea"],[31.0,138.0,"Pacific approach"],[35.45,139.64,"Yokohama"]],
 "soy-santos-qingdao":[[-23.96,-46.30,"Santos"],[-33.0,-20.0,"South Atlantic"],[-35.0,18.0,"Cape of Good Hope"],[-25.0,55.0,"Indian Ocean"],[-10.0,92.0,"Indian Ocean"],[-6.0,105.5,"Sunda Strait"],[5.0,110.0,"South China Sea"],[20.0,116.0,"South China Sea"],[36.08,120.28,"Qingdao"]],
 "lng-aus-japan":[[-20.66,116.71,"Dampier"],[-12.0,116.0,"Indian Ocean"],[-8.6,115.7,"Lombok Strait"],[-3.0,119.0,"Makassar Strait"],[8.0,125.0,"Philippine Sea"],[25.0,135.0,"Philippine Sea"],[35.45,139.64,"Yokohama"]],
 "lng-qatar-china":[[25.91,51.55,"Ras Laffan"],[26.2,56.3,"Strait of Hormuz"],[15.0,65.0,"Arabian Sea"],[5.8,95.0,"Indian Ocean"],[1.5,103.5,"Strait of Malacca"],[8.0,109.0,"South China Sea"],[20.0,116.0,"South China Sea"],[36.08,120.28,"Qingdao"]],
 "lng-us-europe":[[29.73,-93.87,"Sabine Pass"],[24.5,-82.0,"Florida Straits"],[30.0,-65.0,"North Atlantic"],[42.0,-35.0,"North Atlantic"],[49.5,-6.0,"English Channel"],[51.95,4.14,"Rotterdam"]],
 "container-transpacific":[[31.23,121.49,"Shanghai"],[28.0,135.0,"East China Sea"],[32.0,160.0,"North Pacific"],[35.0,-170.0,"North Pacific"],[34.0,-140.0,"North Pacific"],[33.74,-118.27,"Los Angeles"]],
 "container-asia-europe":[[31.23,121.49,"Shanghai"],[15.0,115.0,"South China Sea"],[1.5,103.5,"Strait of Malacca"],[5.0,80.0,"Indian Ocean"],[12.5,45.0,"Bab el-Mandeb"],[29.8,32.5,"Suez Canal"],[35.8,14.0,"Mediterranean"],[36.0,-5.5,"Gibraltar"],[49.5,-6.0,"English Channel"],[51.95,4.14,"Rotterdam"]],
 "container-singapore-europe":[[1.26,103.84,"Singapore"],[5.0,80.0,"Indian Ocean"],[12.5,45.0,"Bab el-Mandeb"],[29.8,32.5,"Suez Canal"],[35.8,14.0,"Mediterranean"],[36.0,-5.5,"Gibraltar"],[49.5,-6.0,"English Channel"],[51.95,4.14,"Rotterdam"]],
};
const clearWp=db.prepare("DELETE FROM shipping_route_waypoints WHERE route_id=?"),putWp=db.prepare("INSERT INTO shipping_route_waypoints VALUES (?,?,?,?,?)");
for(const [routeId,points] of Object.entries(waypointSets)){clearWp.run(routeId);points.forEach(([lat,lng,label],i)=>putWp.run(routeId,i+1,lat,lng,label));}

const estimates=[
 ["c5-port-hedland-qingdao",742.5,null,742.5,"country-flow upper proxy","All Australia-China HS2601 imports; upper proxy for this route, not Port Hedland-Qingdao tonnage.","un-comtrade-hs2601-2024"],
 ["c3-tubarao-qingdao",273.0,null,273.0,"country-flow upper proxy","All Brazil-China HS2601 imports; shared upper proxy across Brazilian gateway routes.","un-comtrade-hs2601-2024"],
 ["pdm-qingdao",273.0,null,273.0,"country-flow upper proxy","All Brazil-China HS2601 imports; shared upper proxy across Brazilian gateway routes.","un-comtrade-hs2601-2024"],
 ["saldanha-qingdao",38.2,null,38.2,"country-flow proxy","South Africa-China HS2601 imports represented through Saldanha.","un-comtrade-hs2601-2024"],
 ["coal-haypoint-paradip",null,null,null,"not defensibly allocated","Australia exported 147 Mt metallurgical coal in 2024-25, but no bilateral port-pair allocation is applied.","aus-req-jun-2025-coal"],
 ["coal-haypoint-yokohama",null,null,null,"not defensibly allocated","Australia exported 147 Mt metallurgical coal in 2024-25, but no bilateral port-pair allocation is applied.","aus-req-jun-2025-coal"],
 ["soy-santos-qingdao",72.5,72.5,72.5,"country-flow proxy","All Brazil-China soybean exports represented through Santos and Qingdao.","usda-brazil-soy-transport-2024"],
 ["lng-aus-japan",25.9,null,null,"derived country-flow proxy","3.34 Bcf/d converted at approximately 7.75 Mtpa of LNG per Bcf/d.","eia-australia-energy-2024"],
 ["lng-qatar-china",null,null,72.1,"export-system upper bound","Qatar's 9.3 Bcf/d Hormuz LNG exports converted to about 72.1 Mtpa; China receives only a subset.","eia-hormuz-lng-2024"],
 ["lng-us-europe",48.8,null,null,"regional-flow proxy","6.3 Bcf/d total U.S.-Europe LNG converted at approximately 7.75 Mtpa per Bcf/d.","eia-us-lng-2024"],
 ["container-transpacific",null,null,null,"not yet estimated","No comparable public port-pair cargo-tonnage estimate collected; TEU and tonnes should not be conflated.","unctad-rmt-2025-routes"],
 ["container-asia-europe",null,null,null,"not yet estimated","No comparable public port-pair cargo-tonnage estimate collected; TEU and tonnes should not be conflated.","unctad-rmt-2025-routes"],
 ["container-singapore-europe",null,null,null,"not yet estimated","No comparable public port-pair cargo-tonnage estimate collected; transshipment would create double-counting risk.","unctad-rmt-2025-routes"],
];
const putEstimate=db.prepare("INSERT OR REPLACE INTO shipping_route_volume_estimates VALUES (?,?,?,?,?,?,?)");estimates.forEach(x=>putEstimate.run(...x));
console.log(`Seeded ${routes.length} multi-cargo shipping routes and ${ports.length} gateways.`);
