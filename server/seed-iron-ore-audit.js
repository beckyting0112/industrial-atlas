import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url)); db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const countries=[
 ["jpn","JPN","Japan","East Asia",36.2,138.25,"Major integrated steel producer highly dependent on imported iron ore."],
 ["mex","MEX","Mexico","North America",23.63,-102.55,"Iron ore producer and steelmaking economy."],
 ["lbr","LBR","Liberia","West Africa",6.43,-9.43,"Seaborne iron ore exporter."],
];

// Worldsteel 2024 iron ore balance: production, exports, imports, apparent consumption (Mt).
const balances=[
 ["swe",24.6,20.0,0.1,4.7],["can",70.0,60.9,8.0,17.1],["mex",29.2,0.8,0.9,29.3],
 ["usa",45.1,10.2,3.1,38.0],["bra",449.2,389.2,0.0,60.0],["chl",15.1,15.3,0.3,0.0],
 ["per",15.2,21.8,0.0,-6.6],["lbr",3.8,3.4,0.0,0.4],["mrt",9.5,13.2,0.0,-3.7],
 ["zaf",65.3,61.2,0.0,4.1],["chn",300.1,24.6,1238.2,1513.7],["ind",282.4,35.9,5.2,251.7],
 ["jpn",0.0,0.0,96.4,96.4],["kor",0.5,0.4,69.5,69.6],["aus",953.9,901.6,1.0,53.2],
];
const chinaImports={aus:742.5101499,bra:273.0135601,zaf:38.221712,can:16.3649202,chl:12.070144253,mrt:9.472452894,swe:1.6008881,usa:0};
const steel2025={chn:960.8,ind:164.9,usa:81.9,jpn:80.7,rus:67.9,kor:62.2,bra:33.4,irn:32.0,idn:19.0,can:11.5,mys:7.7,ukr:7.4,aus:5.2,zaf:4.5,kaz:4.3,swe:4.0,omn:3.0,per:1.6};
const worldOre=2604.5, worldSteel=1848.9;
const observations=[];
for(const [id,prod,exp,imp,cons] of balances){
 const rows=[["iron_ore_production",prod,"Mt"],["iron_ore_exports",exp,"Mt"],["iron_ore_imports",imp,"Mt"],["iron_ore_apparent_consumption",cons,"Mt"],["global_iron_ore_production_share",100*prod/worldOre,"%"]];
 if(prod>0) rows.push(["iron_ore_export_dependence",100*exp/prod,"%"]);
 if(cons>0) rows.push(["iron_ore_import_dependency",100*imp/cons,"%"]);
 if(chinaImports[id]!=null&&exp>0) rows.push(["china_trade_exposure",100*chinaImports[id]/exp,"%"]);
 for(const [metric,value,unit] of rows){
   const derived=metric.includes("share")||metric.includes("dependence")||metric.includes("dependency")||metric==="china_trade_exposure";
   observations.push([`${id}-${metric}-2024`,"country",id,metric,value,null,unit,"2024",derived?(metric==="china_trade_exposure"?"un-comtrade-hs2601-2024":"worldsteel-figures-2026"):"worldsteel-figures-2026",derived?`Derived for presentation audit${metric==="china_trade_exposure"?": China customs imports divided by worldsteel country exports; source methodologies may differ.":" from the 2024 iron ore balance."}`:null,derived?"derived":"reported"]);
 }
}
for(const [id,value] of Object.entries(steel2025)) observations.push([`${id}-steel-2025-audit`,"country",id,"crude_steel_production",value,null,"Mt","2025","worldsteel-figures-2026",null,"reported"]);

const top3Production=100*(953.9+449.2+300.1)/worldOre;
const top3Exports=100*(901.6+389.2+61.2)/1740.5;
const steelCr10=100*(124.76+63.43+57.78+57.61+42.49+39.10+38.02+37.36+32.03+30.46)/worldSteel;
observations.push(
 ["io-production-cr3-2024","commodity","iron-ore","production_cr3",top3Production,null,"%","2024","worldsteel-figures-2026","Australia + Brazil + China production divided by world production.","derived"],
 ["io-export-cr3-2024","commodity","iron-ore","export_cr3",top3Exports,null,"%","2024","worldsteel-figures-2026","Australia + Brazil + South Africa exports divided by world exports.","derived"],
 ["steel-company-cr10-2025","product","crude-steel","company_cr10",steelCr10,null,"%","2025","worldsteel-figures-2026","Top ten steel-producing company tonnages divided by world crude steel production.","derived"],
 ["chn-steel-share-2025","country","chn","global_crude_steel_production_share",100*960.8/worldSteel,null,"%","2025","worldsteel-figures-2026","China crude steel production divided by world crude steel production.","derived"]
);

const metricDefs=[
 ["production-cr3","Production CR3","Sum of top three country production shares","Share of supply controlled by the three largest producing countries.","%","Country production; world production","active"],
 ["export-cr3","Export CR3","Sum of top three exporter shares","Share of exports controlled by the three largest exporting countries.","%","Country exports; world exports","active"],
 ["company-cr10","Company CR10","Top ten company output / global output","Share of output produced by the ten largest companies.","%","Company output; global output","active"],
 ["china-trade-exposure","China trade exposure","Exports to China / total exports","Exporter dependence on Chinese demand.","%","Bilateral exports to China; total exports","active"],
];

const run=db.transaction(()=>{
 const c=db.prepare("INSERT OR IGNORE INTO countries VALUES (?,?,?,?,?,?,?)"); countries.forEach(x=>c.run(...x));
 const o=db.prepare("INSERT OR REPLACE INTO observations VALUES (?,?,?,?,?,?,?,?,?,?)");
 const om=db.prepare("INSERT OR REPLACE INTO observation_metadata VALUES (?,?,?,?)");
 observations.forEach(x=>{o.run(...x.slice(0,10));om.run(x[0],x[10],x[7],"Iron ore presentation audit.")});
 const md=db.prepare("INSERT OR REPLACE INTO metric_definitions VALUES (?,?,?,?,?,?,?)");metricDefs.forEach(x=>md.run(...x));
}); run();
console.log(`Iron ore presentation audit: ${observations.length} observations across ${balances.length} ore-balance countries and ${Object.keys(steel2025).length} steel countries.`);
