import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here=dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const source=["un-comtrade-china-steel-2024","UN Comtrade: China steel-product exports by partner and HS group, 2024","United Nations Statistics Division","https://comtradeplus.un.org/","2025-01-01","2024","intergovernmental_customs","high","2026-08-07","China-reported annual exports; HS original classification. Net weights and primary values from the public API preview endpoint."];
const countries=[
 ["are","ARE","United Arab Emirates","Middle East",23.42,53.85,"Steel import market."],
 ["sau","SAU","Saudi Arabia","Middle East",23.89,45.08,"Steel import market."],
 ["pak","PAK","Pakistan","South Asia",30.38,69.35,"Steel import market."],
 ["tha","THA","Thailand","Southeast Asia",15.87,100.99,"Steel-consuming manufacturing economy."],
 ["phl","PHL","Philippines","Southeast Asia",12.88,121.77,"Steel import market."],
 ["hkg","HKG","Hong Kong SAR, China","East Asia",22.32,114.17,"Trade and logistics hub."],
 ["sgp","SGP","Singapore","Southeast Asia",1.35,103.82,"Trade and logistics hub."],
 ["mng","MNG","Mongolia","East Asia",46.86,103.85,"Land-linked steel market."],
 ["per","PER","Peru","Latin America",-9.19,-75.02,"Steel import market."],
 ["gha","GHA","Ghana","West Africa",7.95,-1.02,"Steel import market."],
 ["col","COL","Colombia","Latin America",4.57,-74.30,"Steel import market."],
];

const products={
 "7208":["Hot-rolled flat steel","#e8743b"],
 "7210":["Coated flat steel","#d8a04e"],
 "7207":["Semi-finished steel","#8d72cc"],
 "7214":["Bars and rods","#4fb6a8"],
 "7213":["Wire rod","#5f8fd3"],
};
// Top five sovereign/customs destinations by net weight for each selected HS group.
const rows=[
 ["7208","vnm",9.0173,4730.29,false],["7208","are",3.0261,1734.23,false],["7208","kor",2.8475,1645.51,false],["7208","sau",2.4067,1488.46,false],["7208","tur",1.8665,1021.09,false],
 ["7210","tha",2.1291,1421.93,false],["7210","kor",1.8448,1270.87,false],["7210","bra",1.5841,1091.70,false],["7210","phl",1.4471,891.54,false],["7210","idn",0.9457,694.25,false],
 ["7207","idn",1.1788,546.89,false],["7207","tur",0.6417,298.49,false],["7207","ita",0.6125,339.42,false],["7207","phl",0.5277,249.90,false],["7207","sau",0.4050,182.39,false],
 ["7214","hkg",0.7382,371.49,false],["7214","kor",0.3742,226.17,false],["7214","sgp",0.2804,138.77,false],["7214","mng",0.2417,120.12,false],["7214","vnm",0.1756,103.72,false],
 ["7213","kor",0.6877,361.81,false],["7213","phl",0.3233,161.28,false],["7213","vnm",0.3159,167.95,true],["7213","per",0.2366,123.87,false],["7213","tha",0.2302,125.39,false],
];

const run=db.transaction(()=>{
 db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)").run(...source);
 const country=db.prepare("INSERT OR IGNORE INTO countries VALUES (?,?,?,?,?,?,?)");countries.forEach(row=>country.run(...row));
 const insert=db.prepare("INSERT OR REPLACE INTO steel_product_trade_flows VALUES (?,?,?,?,?,?,?,?,?,?,?)");
 for(const [hs,destination,volume,value,estimated] of rows){
   const name=products[hs][0];
   insert.run(`chn-${destination}-${hs}-2024`,`chn`,destination,hs,name,2024,volume,value,estimated?"estimated":"reported",source[0],`China-reported exports under HS ${hs}; net weight converted from kg to Mt. This HS group is broader than the Atlas display label.`);
 }
});
run();
console.log(`Steel bilateral trade: ${rows.length} product flows across ${Object.keys(products).length} HS groups.`);
