import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url)); db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const source=["gem-gist-plants-2026","Global Iron and Steel Tracker: plant profiles","Global Energy Monitor","https://globalenergymonitor.org/projects/global-iron-steel-tracker/","2026-06-01","June 2026","research_database","high","2026-08-07","Plant-level operating capacity, production technology, products and selected input links. Actual production is 2024 where available."];
const companies=[
 ["nucor","Nucor Corporation","usa","Steel","Public"],
 ["baosteel","Baoshan Iron & Steel Co Ltd","chn","Steel","Public; China Baowu controlled"]
];
// id, name, country, company, lat, lon, start, description, capacity, production, BOF, EAF, DRI, coke, sinter, products, route, ore, coal/scrap, sectors, transition
const plants=[
 ["baoshan-works","Baoshan Works","chn","baosteel",31.405,121.489,1985,"Large coastal integrated and electric steel complex in Shanghai.",19.800,null,16.200,3.600,null,null,null,"Structural steel, plate, hot-rolled products","BF–BOF + EAF","Seaborne and domestic iron ore","Coking coal plus scrap for EAF","Automotive; construction; machinery","Mixed-route site; transition project detail pending"],
 ["gwangyang-works","POSCO Gwangyang Works","kor","posco",34.920086,127.748650,1987,"Very large coastal integrated steelworks with direct access to imported raw materials.",22.999,19.295,22.999,0,null,2.850,8.826,"Galvanized, wire rod, plate, cold-rolled and hot-rolled steel","BF–BOF","Imported seaborne iron ore","Imported coking coal","Automotive; construction; energy; packaging; machinery; transport","2.5 Mtpa EAF under construction"],
 ["pohang","POSCO Pohang Works","kor","posco",36.030,129.380,1973,"Coastal integrated works linking Australian Pilbara ore to advanced steel products.",18.758,15.752,17.401,1.357,.009,1.500,null,"Galvanized, wire rod, plate, cold-rolled and hot-rolled steel","BF–BOF + EAF; pilot DRI","Australia, especially Pilbara","Tanoma coal mine; scrap for EAF","Automotive; construction; energy; packaging; machinery; transport","HyREX hydrogen-DRI pilot and announced 2.5 Mtpa electric smelting route"],
 ["vijayanagar","JSW Steel Vijayanagar Works","ind","jsw",15.180423,76.663134,1994,"Ore-belt integrated works combining BF, BOF, EAF, DRI and COREX routes.",11.899,11.764,10.399,1.500,1.200,6.500,12.950,"Galvanized, wire rod, bar, cold-rolled, special and hot-rolled steel","BF/COREX–BOF + DRI–EAF","Captive mines in Karnataka and Odisha","Domestic/imported coal; metallic feed for EAF","Building and infrastructure; manufacturing","Green hydrogen pilot and carbon-capture projects"],
 ["kalinganagar-works","Tata Steel Kalinganagar","ind","tata-steel",20.970411,86.015211,2016,"Rapidly expanding integrated works tied to captive eastern Indian ore mines.",8.000,4.390,8.000,0,null,null,null,"Hot-rolled, cold-rolled, bar and wire rod","BF–BOF","Noamundi, Joda East and Khondbond captive mines","West Bokaro coal; imports via Dhamra or Paradip","Automotive and manufacturing","Phase II expansion commissioned; site solar capacity expanded"],
 ["kimitsu-works","Nippon East Japan Works — Kimitsu","jpn","nippon-steel",35.360912,139.881953,1965,"Mature coastal BF–BOF complex dependent on imported ore and coal.",10.001,6.600,10.001,0,null,1.800,13.200,"Pipe, bar, profile and plate","BF–BOF","Australia, Brazil and India","Australia and Canada","Construction; energy; machinery; transport","COURSE50 hydrogen injection demonstration"],
 ["nucor-crawfordsville","Nucor Steel Crawfordsville","usa","nucor",40.045,-86.900,1989,"Scrap-based mini-mill and early commercial thin-slab and strip-casting site.",2.304,1.751,0,2.304,null,null,null,"Flat-rolled sheet","Scrap–EAF","Not applicable","Primarily domestic ferrous scrap","Automotive; construction; energy; packaging; machinery; transport","Castrip thin-strip route reduces processing energy"]
];

const run=db.transaction(()=>{
 db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)").run(...source);
 const co=db.prepare("INSERT OR REPLACE INTO companies VALUES (?,?,?,?,?)"); companies.forEach(x=>co.run(...x));
 const a=db.prepare("INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
 const d=db.prepare("INSERT OR REPLACE INTO steel_plant_details VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
 const p=db.prepare("INSERT OR REPLACE INTO steel_plant_profiles VALUES (?,?,?,?,?,?,?)");
 for(const x of plants){
  const [id,name,country,company,lat,lon,start,description,capacity,production,bof,eaf,dri,coke,sinter,products,route,ore,feed,sectors,transition]=x;
  a.run(id,name,"steel_plant",country,company,"steel",lat,lon,"operating",capacity,"Mtpa",start,description);
  d.run(id,capacity,production,bof,eaf,dri,coke,sinter,products,null,null,"Rail and marine links; detailed corridor pending");
  p.run(id,route,ore,feed,sectors,transition,source[0]);
 }
}); run();
console.log(`Steel plants: ${plants.length} strategic profiles seeded.`);
