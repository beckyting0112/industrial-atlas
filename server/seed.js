import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here = dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here, "schema.sql"), "utf8"));

const countries = [
  ["chn","CHN","China","East Asia",35.86,104.2,"The largest steel producer and a major processor of battery materials."],
  ["aus","AUS","Australia","Oceania",-25.27,133.78,"A globally important iron ore and metallurgical coal exporter."],
  ["bra","BRA","Brazil","Latin America",-14.24,-51.93,"A major seaborne iron ore supplier."],
  ["gin","GIN","Guinea","West Africa",9.95,-9.7,"Home to the developing Simandou iron ore system."],
  ["idn","IDN","Indonesia","Southeast Asia",-0.79,113.92,"A leading nickel producer with rapid downstream investment."],
  ["kor","KOR","South Korea","East Asia",35.91,127.77,"A major steel, battery and automotive manufacturing economy."],
  ["ind","IND","India","South Asia",20.59,78.96,"A fast-growing steel producer and consumer."],
  ["usa","USA","United States","North America",37.09,-95.71,"A large EAF-based steel and growing battery market."],
];
const commodities = [["iron-ore","Iron ore","#e8743b","Mt","Steelmaking feedstock"],["steel","Steel","#b8c4da","Mt","Crude and finished steel"],["nickel","Nickel","#3e9c90","kt Ni","Battery and stainless steel input"],["battery","Battery","#8d72cc","GWh","Battery cells"]];
const companies = [["rio","Rio Tinto","aus","Mining","Public"],["vale","Vale","bra","Mining","Public"],["posco","POSCO","kor","Steel","Public"],["jsw","JSW Steel","ind","Steel","Public"],["tesla","Tesla","usa","EV and battery","Public"]];
const assets = [
  ["pilbara","Pilbara Iron Operations","mine","aus","rio","iron-ore",-22.5,119.5,"operating",345,"Mtpa",1966,"Integrated mine, rail and port system"],
  ["simandou","Simandou","mine","gin","rio","iron-ore",8.7,-9.2,"development",120,"Mtpa",2025,"New high-grade iron ore system"],
  ["carajas","Carajás Complex","mine","bra","vale","iron-ore",-6.0,-50.0,"operating",230,"Mtpa",1985,"Northern System iron ore complex"],
  ["pohang","Pohang Works","steel_plant","kor","posco","steel",36.03,129.38,"operating",17,"Mtpa",1973,"Integrated coastal steelworks"],
  ["vijayanagar","Vijayanagar Works","steel_plant","ind","jsw","steel",15.18,76.66,"operating",12,"Mtpa",1997,"Integrated steelworks"],
  ["weda-bay","Weda Bay Industrial Park","processing_plant","idn",null,"nickel",0.48,127.96,"operating",130,"kt Ni",2020,"Nickel mining and processing cluster"],
  ["giga-nevada","Gigafactory Nevada","battery_plant","usa","tesla","battery",39.54,-119.44,"operating",40,"GWh",2017,"Battery cell and drivetrain plant"],
  ["port-hedland","Port Hedland","port","aus",null,"iron-ore",-20.31,118.58,"operating",620,"Mtpa",null,"Major iron ore export port"],
  ["ponta-madeira","Ponta da Madeira","port","bra","vale","iron-ore",-2.57,-44.38,"operating",230,"Mtpa",1986,"Vale iron ore export terminal"],
  ["qingdao","Qingdao Port","port","chn",null,"iron-ore",36.08,120.28,"operating",300,"Mtpa",null,"Major dry-bulk import gateway"],
];
const flows = [["aus-chn-io-2024","aus","chn","iron-ore",2024,620,"Mt"],["bra-chn-io-2024","bra","chn","iron-ore",2024,210,"Mt"],["gin-chn-io-2024","gin","chn","iron-ore",2024,60,"Mt"],["idn-chn-ni-2024","idn","chn","nickel",2024,55,"kt Ni"]];
const products = [
  ["iron-ore-product","Iron ore","Mined iron-bearing material","Extraction","Mining and beneficiation",null,"Steelmaking","Mt"],
  ["pellet","Iron ore pellet","Agglomerated iron ore feed","Processing","Concentration and pelletizing",null,"Blast furnace and DRI feed","Mt"],
  ["crude-steel","Crude steel","First solid steel product","Primary metal","BF-BOF, EAF or DRI-EAF",null,"Semifinished steel production","Mt"],
  ["hrc","Hot-rolled coil","Flat steel rolled at high temperature","Finished steel","Hot rolling",null,"Automotive, machinery and construction","Mt"],
];
const transformations = [
  ["ore-to-pellet","iron-ore-product","pellet","Beneficiation and pelletizing",null,null,null,"Illustrative chain"],
  ["pellet-to-steel","pellet","crude-steel","Ironmaking and steelmaking",null,null,null,"Illustrative chain"],
  ["steel-to-hrc","crude-steel","hrc","Casting and hot rolling",null,null,null,"Illustrative chain"],
];
const metrics = [
  ["production-share","Production share","entity production / global production","Who controls supply?","%","entity production; global production","planned"],
  ["export-dependence","Export dependence","exports / production","How reliant is a producer on foreign demand?","%","exports; production","planned"],
  ["import-dependence","Import dependence","imports / apparent consumption","How vulnerable is a consuming market?","%","imports; apparent consumption","planned"],
  ["china-exposure","China exposure","exports to China / total exports","How dependent is a producer on Chinese demand?","%","China exports; total exports","planned"],
  ["supply-hhi","Supply HHI","sum(market share squared)","How concentrated is supply?","index","producer market shares","planned"],
  ["capacity-utilization","Capacity utilization","production / capacity","How tight is the industry?","%","production; capacity","planned"],
  ["shipping-intensity","Shipping intensity","freight cost / commodity value","How geography-sensitive is the commodity?","%","freight cost; commodity value","planned"],
];
const questions = [
  ["china-ore-dependency","How dependent is China on imported iron ore?","Steel and mining","Connect domestic production, imports, origins and steel demand.","active",1],
  ["simandou-disruption","Could Simandou disrupt the seaborne iron ore market?","Mining and trade","Compare planned capacity with incumbent supply and freight economics.","planned",2],
  ["battery-concentration","How concentrated is the battery supply chain?","EV and batteries","Compare mining, refining and cell-manufacturing concentration.","planned",3],
  ["suez-vulnerability","Which industrial flows are vulnerable to a Suez disruption?","Shipping","Connect routes, diversion distances, freight and commodity value.","planned",4],
];

const run = db.transaction(() => {
  db.prepare("INSERT OR REPLACE INTO countries VALUES (?,?,?,?,?,?,?)").run(...countries[0]);
  const c = db.prepare("INSERT OR REPLACE INTO countries VALUES (?,?,?,?,?,?,?)"); countries.slice(1).forEach(x => c.run(...x));
  const m = db.prepare("INSERT OR REPLACE INTO commodities VALUES (?,?,?,?,?)"); commodities.forEach(x => m.run(...x));
  const co = db.prepare("INSERT OR REPLACE INTO companies VALUES (?,?,?,?,?)"); companies.forEach(x => co.run(...x));
  const a = db.prepare("INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"); assets.forEach(x => a.run(...x));
  const f = db.prepare("INSERT OR REPLACE INTO trade_flows(id,origin_country_id,destination_country_id,commodity_id,year,volume,unit) VALUES (?,?,?,?,?,?,?)"); flows.forEach(x => f.run(...x));
  const p = db.prepare("INSERT OR REPLACE INTO products VALUES (?,?,?,?,?,?,?,?)"); products.forEach(x => p.run(...x));
  const t = db.prepare("INSERT OR REPLACE INTO transformations VALUES (?,?,?,?,?,?,?,?)"); transformations.forEach(x => t.run(...x));
  const md = db.prepare("INSERT OR REPLACE INTO metric_definitions VALUES (?,?,?,?,?,?,?)"); metrics.forEach(x => md.run(...x));
  const rq = db.prepare("INSERT OR REPLACE INTO research_questions VALUES (?,?,?,?,?,?)"); questions.forEach(x => rq.run(...x));
});
run();
console.log(`Seeded ${assets.length} assets, ${flows.length} flows, ${products.length} products, ${metrics.length} metrics and ${questions.length} research questions.`);
