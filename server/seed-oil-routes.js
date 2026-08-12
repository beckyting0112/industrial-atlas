import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url));db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));
const sources=[
 ["eia-oil-chokepoints-2026","World Oil Transit Chokepoints","U.S. Energy Information Administration","https://www.eia.gov/international/content/analysis/special_topics/World_Oil_Transit_Chokepoints/","2026-03-01","2024-1H25","government","high","2026-08-08","Reports crude and petroleum-product transit through major straits, canals and the Cape route."],
 ["eia-china-oil-2024","China country energy analysis","U.S. Energy Information Administration","https://www.eia.gov/international/analysis/country/CHN","2025-01-01","2024","government","high","2026-08-08","China imported 11.1 million b/d of crude in 2024; Saudi Arabia supplied 14%."],
 ["eia-us-crude-exports-2024","U.S. crude oil exports reached a new record in 2024","U.S. Energy Information Administration","https://www.eia.gov/todayinenergy/detail.php?id=64964","2025-04-15","2024","government","high","2026-08-08","Netherlands received 825,000 b/d of U.S. crude in 2024; Corpus-Rotterdam is a representative gateway path."],
 ["eia-us-products-2024","Distillate and jet fuel contribute to record U.S. petroleum product exports in 2024","U.S. Energy Information Administration","https://www.eia.gov/Todayinenergy/detail.php?id=65084","2025-05-01","2024","government","high","2026-08-08","Reports U.S. distillate exports to Mexico 272,000 b/d, Chile 110,000 b/d and Netherlands 103,000 b/d."],
];
const ps=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)");sources.forEach(x=>ps.run(...x));
const commodities=[["crude-oil","Crude oil","#d95c5c","Mb/d","Unrefined petroleum transported mainly by large tankers"],["refined-products","Refined petroleum products","#e19a4b","Mb/d","Diesel, gasoline, jet fuel and other refinery products"]];
const pc=db.prepare("INSERT OR REPLACE INTO commodities VALUES (?,?,?,?,?)");commodities.forEach(x=>pc.run(...x));
const countries=[["sau","SAU","Saudi Arabia","Middle East",23.89,45.08,"A leading crude-oil exporter with Gulf and Red Sea terminals."],["mex","MEX","Mexico","North America",23.63,-102.55,"A major U.S. refined-product destination."],["are","ARE","United Arab Emirates","Middle East",23.42,53.85,"A major crude and refined-product exporter and logistics hub."]];
const pco=db.prepare("INSERT OR IGNORE INTO countries VALUES (?,?,?,?,?,?,?)");countries.forEach(x=>pco.run(...x));
const ports=[
 ["ras-tanura","Ras Tanura","port","sau",null,"crude-oil",26.64,50.16,"operating",null,null,null,"Major Saudi Gulf crude export terminal."],
 ["ningbo","Ningbo-Zhoushan","port","chn",null,"crude-oil",29.87,122.10,"operating",null,null,null,"Major Chinese crude import and refining gateway."],
 ["corpus-christi","Port of Corpus Christi","port","usa",null,"crude-oil",27.80,-97.40,"operating",null,null,null,"Leading U.S. crude-oil export gateway."],
 ["houston-port","Port of Houston","port","usa",null,"refined-products",29.73,-95.27,"operating",null,null,null,"Major U.S. Gulf refining and product-export gateway."],
 ["veracruz","Port of Veracruz","port","mex",null,"refined-products",19.20,-96.13,"operating",null,null,null,"Representative Mexican refined-product gateway."],
 ["san-antonio-chile","Port of San Antonio","port","chl",null,"refined-products",-33.58,-71.62,"operating",null,null,null,"Representative Chilean refined-product gateway."],
 ["fujairah","Port of Fujairah","port","are",null,"refined-products",25.12,56.36,"operating",null,null,null,"Major oil-products storage, bunkering and export hub outside Hormuz."],
 ["mombasa","Port of Mombasa","port","ken",null,"refined-products",-4.04,39.67,"operating",null,null,null,"East African refined-product gateway."],
];
db.prepare("INSERT OR IGNORE INTO countries VALUES (?,?,?,?,?,?,?)").run("ken","KEN","Kenya","East Africa",0.02,37.91,"Regional refined-product import and distribution gateway.");
const pa=db.prepare("INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");ports.forEach(x=>pa.run(...x));
const routes=[
 ["crude-saudi-china","Saudi Arabia-China crude corridor","ras-tanura","ningbo","crude-oil",6500,19.3,null,null,"VLCC",1.55,"Mb/d",null],
 ["crude-us-rotterdam","U.S. Gulf-Rotterdam crude corridor","corpus-christi","rotterdam","crude-oil",5100,15.2,null,null,"Aframax / Suezmax / VLCC",0.825,"Mb/d",null],
 ["crude-gulf-japan","Persian Gulf-Japan crude corridor","ras-tanura","yokohama","crude-oil",6500,19.3,null,null,"VLCC",null,"Mb/d",null],
 ["product-us-mexico","U.S. Gulf-Mexico distillate corridor","houston-port","veracruz","refined-products",650,2.0,null,null,"MR product tanker",0.272,"Mb/d",null],
 ["product-us-rotterdam","U.S. Gulf-Rotterdam distillate corridor","houston-port","rotterdam","refined-products",5000,15.5,null,null,"MR / LR1 product tanker",0.103,"Mb/d",null],
 ["product-us-chile","U.S. Gulf-Chile distillate corridor","houston-port","san-antonio-chile","refined-products",4500,14.0,null,null,"MR product tanker",0.110,"Mb/d",null],
 ["product-fujairah-mombasa","Fujairah-East Africa product corridor","fujairah","mombasa","refined-products",2200,7.0,null,null,"MR / LR1 product tanker",null,"Mb/d",null],
];
const pr=db.prepare("INSERT OR REPLACE INTO shipping_routes VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");routes.forEach(x=>pr.run(...x));
const profiles=routes.map(r=>[r[0],r[4]==="crude-oil"?"Crude oil":"Refined products",r[0].includes("us-")||r[0]==="crude-saudi-china"?"bilateral flow via representative gateways":"representative strategic corridor",r[10]!=null?"country-flow proxy":"not allocated",r[10]!=null?"Reported bilateral or supplier-share flow represented through selected gateways.":"Strategic corridor with no bilateral volume assigned.",r[0].startsWith("product-us")?"eia-us-products-2024":r[0]==="crude-us-rotterdam"?"eia-us-crude-exports-2024":r[0]==="crude-saudi-china"?"eia-china-oil-2024":"eia-oil-chokepoints-2026",r[4]==="crude-oil"?"#d95c5c":"#e19a4b"]);
const pp=db.prepare("INSERT OR REPLACE INTO shipping_route_profiles VALUES (?,?,?,?,?,?,?)");profiles.forEach(x=>pp.run(...x));
const mtCrude=49.9,mtProduct=48.8;
const estimates=[
 ["crude-saudi-china",1.55*mtCrude,null,null,"derived country-flow proxy","China's 11.1 Mb/d imports × Saudi 14% share, converted at about 49.9 Mtpa per Mb/d.","eia-china-oil-2024"],
 ["crude-us-rotterdam",.825*mtCrude,null,null,"country-flow proxy","Reported U.S.-Netherlands crude flow converted at about 49.9 Mtpa per Mb/d.","eia-us-crude-exports-2024"],
 ["crude-gulf-japan",null,null,null,"not defensibly allocated","Major strategic route; bilateral tonnage not collected.","eia-oil-chokepoints-2026"],
 ["product-us-mexico",.272*mtProduct,null,null,"country-flow proxy","Reported U.S.-Mexico distillate flow converted at about 48.8 Mtpa per Mb/d.","eia-us-products-2024"],
 ["product-us-rotterdam",.103*mtProduct,null,null,"country-flow proxy","Reported U.S.-Netherlands distillate flow converted at about 48.8 Mtpa per Mb/d.","eia-us-products-2024"],
 ["product-us-chile",.110*mtProduct,null,null,"country-flow proxy","Reported U.S.-Chile distillate flow converted at about 48.8 Mtpa per Mb/d.","eia-us-products-2024"],
 ["product-fujairah-mombasa",null,null,null,"not defensibly allocated","Representative product corridor; bilateral tonnage not collected.","eia-oil-chokepoints-2026"],
];
const pe=db.prepare("INSERT OR REPLACE INTO shipping_route_volume_estimates VALUES (?,?,?,?,?,?,?)");estimates.forEach(x=>pe.run(...x));
const waypointSets={
 "crude-saudi-china":[[26.64,50.16,"Ras Tanura"],[26.2,56.3,"Hormuz"],[15,65,"Arabian Sea"],[5.8,95,"Indian Ocean"],[1.5,103.5,"Malacca"],[10,110,"South China Sea"],[22,119,"Taiwan Strait"],[29.87,122.1,"Ningbo"]],
 "crude-us-rotterdam":[[27.8,-97.4,"Corpus Christi"],[24.5,-82,"Florida Straits"],[31,-65,"North Atlantic"],[43,-35,"North Atlantic"],[49.5,-6,"English Channel"],[51.95,4.14,"Rotterdam"]],
 "crude-gulf-japan":[[26.64,50.16,"Ras Tanura"],[26.2,56.3,"Hormuz"],[15,65,"Arabian Sea"],[1.5,103.5,"Malacca"],[10,110,"South China Sea"],[23,125,"Philippine Sea"],[35.45,139.64,"Yokohama"]],
 "product-us-mexico":[[29.73,-95.27,"Houston"],[27,-95,"Gulf of Mexico"],[19.2,-96.13,"Veracruz"]],
 "product-us-rotterdam":[[29.73,-95.27,"Houston"],[24.5,-82,"Florida Straits"],[31,-65,"North Atlantic"],[43,-35,"North Atlantic"],[49.5,-6,"English Channel"],[51.95,4.14,"Rotterdam"]],
 "product-us-chile":[[29.73,-95.27,"Houston"],[20,-86,"Caribbean"],[9,-79.6,"Panama Canal"],[-5,-82,"Eastern Pacific"],[-20,-77,"Eastern Pacific"],[-33.58,-71.62,"San Antonio"]],
 "product-fujairah-mombasa":[[25.12,56.36,"Fujairah"],[15,55,"Arabian Sea"],[5,48,"Somali Basin"],[-4.04,39.67,"Mombasa"]],
};
const del=db.prepare("DELETE FROM shipping_route_waypoints WHERE route_id=?"),pw=db.prepare("INSERT INTO shipping_route_waypoints VALUES (?,?,?,?,?)");for(const [id,pts] of Object.entries(waypointSets)){del.run(id);pts.forEach(([lat,lng,label],i)=>pw.run(id,i+1,lat,lng,label));}
const cps=[
 ["malacca","Strait of Malacca",2.5,101.5,"strait",22.5,"Mb/d oil",null,null,"World's largest oil chokepoint by transit volume in 2024."],
 ["hormuz","Strait of Hormuz",26.2,56.3,"strait",20.7,"Mb/d oil",null,null,"Persian Gulf outlet with limited practical alternatives."],
 ["suez","Suez Canal",30.5,32.3,"canal",4.8,"Mb/d oil",null,null,"Connects the Red Sea and Mediterranean; figure includes SUMED pipeline."],
 ["bab-el-mandeb","Bab el-Mandeb",12.6,43.4,"strait",4.1,"Mb/d oil",null,null,"Southern entrance to the Red Sea."],
 ["panama","Panama Canal",9.1,-79.7,"canal",2.0,"Mb/d oil",null,null,"Connects Atlantic and Pacific shipping systems."],
 ["turkish-straits","Turkish Straits",40.7,29.0,"strait",3.6,"Mb/d oil",null,null,"Bosporus and Dardanelles connection between Black Sea and Mediterranean."],
 ["danish-straits","Danish Straits",56.0,11.0,"strait",4.9,"Mb/d oil",null,null,"Baltic Sea outlet."],
 ["cape-good-hope","Cape of Good Hope",-34.4,18.5,"cape route",9.3,"Mb/d oil",null,null,"Major diversion and long-haul route rather than a narrow chokepoint."],
 ["gibraltar","Strait of Gibraltar",35.95,-5.6,"strait",null,null,null,null,"Atlantic-Mediterranean gateway."],
 ["lombok","Lombok Strait",-8.5,115.7,"strait",null,null,null,null,"Deep-water alternative to Malacca and Sunda."],
];
const pcp=db.prepare("INSERT OR REPLACE INTO chokepoints VALUES (?,?,?,?,?,?,?,?,?,?)");cps.forEach(x=>pcp.run(...x));
console.log(`Seeded ${routes.length} oil/product routes and ${cps.length} chokepoints.`);
