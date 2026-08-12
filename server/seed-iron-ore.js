import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here = dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here, "schema.sql"), "utf8"));

const sources = [
  ["worldsteel-figures-2025","World Steel in Figures 2025","World Steel Association","https://worldsteel.org/wp-content/uploads/World-Steel-in-Figures-2025.pdf","2025-05-01","2024","industry_association","high","2026-08-07","Iron ore balance data refer to 2023; pig iron and steel data refer to 2024. Iron ore source noted by worldsteel as RMG Consulting."],
  ["usgs-mcs-2025","Mineral Commodity Summaries 2025","U.S. Geological Survey","https://doi.org/10.3133/mcs2025","2025-03-03","2024","government","high","2026-08-07","Comprehensive early source for 2024 world mineral production and reserves."],
  ["aus-req-mar-2025","Resources and Energy Quarterly: March 2025","Australian Department of Industry, Science and Resources","https://www.industry.gov.au/publications/resources-and-energy-quarterly-march-2025","2025-03-01","2024-2025","government","high","2026-08-07","Australian iron ore market, export and outlook context."],
];

const products = [
  ["iron-ore-fines","Iron ore fines","Small particles of iron ore, generally requiring agglomeration before blast-furnace use.","Mine product","Crushing, screening and classification",null,"Sinter feed, pellet feed and blending","Mt"],
  ["iron-ore-lump","Iron ore lump","Coarser calibrated ore that can be charged directly to a blast furnace.","Mine product","Crushing and screening",null,"Direct blast-furnace feed","Mt"],
  ["iron-ore-concentrate","Iron ore concentrate","Beneficiated fine material with increased iron content and reduced impurities.","Processed ore","Grinding, magnetic separation or flotation",null,"Pellet feed, sinter feed and selected DRI routes","Mt"],
  ["sinter","Sinter","Porous agglomerate made from iron ore fines, fluxes and coke breeze.","Agglomerated feed","Sintering",null,"Blast-furnace burden","Mt"],
  ["pig-iron","Pig iron","High-carbon iron produced by smelting iron ore in a blast furnace.","Ironmaking","Blast furnace smelting",null,"Basic oxygen furnace steelmaking and foundries","Mt"],
];
const transformations = [
  ["ore-to-fines","iron-ore-product","iron-ore-fines","Crushing and screening",null,null,"Electricity and diesel","Produces the dominant traded ore form."],
  ["fines-to-concentrate","iron-ore-fines","iron-ore-concentrate","Beneficiation",null,null,"Electricity and water","Raises grade and removes impurities."],
  ["concentrate-to-pellet","iron-ore-concentrate","pellet","Pelletizing",null,null,"Heat and electricity","Produces uniform high-grade agglomerates."],
  ["fines-to-sinter","iron-ore-fines","sinter","Sintering",null,null,"Coke breeze and electricity","Usually performed at integrated steelworks."],
  ["sinter-to-pig-iron","sinter","pig-iron","Blast furnace ironmaking",null,null,"Coke, injected coal and hot blast","Reduces iron oxides and melts iron."],
  ["pellet-to-pig-iron","pellet","pig-iron","Blast furnace ironmaking",null,null,"Coke, injected coal and hot blast","Pellets form part of the blast-furnace burden."],
  ["pig-iron-to-steel","pig-iron","crude-steel","Basic oxygen steelmaking",null,null,"Oxygen and electricity","Removes carbon and impurities to make steel."],
];
const concepts = [
  ["iron-ore-fines-concept","Iron ore fines","Fine particles created during mining and crushing.","Fines dominate seaborne trade but generally require sintering or pelletizing before ironmaking.","Run-of-mine ore","Sized fines","Mines, beneficiation plants and steelworks","Fines are a size category, not a single chemical grade.","worldsteel-figures-2025"],
  ["beneficiation","Beneficiation","Physical processing that increases ore grade and removes unwanted material.","It determines usable yield, product quality, energy use and tailings volumes.","Run-of-mine ore, water and energy","Concentrate and tailings","Mine and processing sites","Beneficiation is not the same as smelting.","usgs-mcs-2025"],
  ["sintering","Sintering","Thermal agglomeration of fines into porous blast-furnace feed.","It allows fine ore to be used efficiently in integrated steelmaking.","Fines, fluxes, return fines and coke breeze","Sinter","Integrated BF-BOF steelworks","Sinter is not the same product as an iron ore pellet.","worldsteel-figures-2025"],
  ["blast-furnace","Blast furnace","A shaft furnace that reduces and melts iron-bearing burden using coke and hot blast.","It is the core ironmaking unit in the dominant BF-BOF steel route.","Sinter, pellets, lump ore, coke and fluxes","Pig iron and slag","Integrated steelworks","The blast furnace makes iron; the BOF converts that iron into steel.","worldsteel-figures-2025"],
];

const observations = [
  // 2023 iron ore balance, million tonnes actual weight; World Steel in Figures 2025 pp. 18-19.
  ["chn-io-prod-2023","country","chn","iron_ore_production",298.3,null,"Mt","2023","worldsteel-figures-2025","Production adjusted by source so Fe content is similar to the world average."],
  ["chn-io-exp-2023","country","chn","iron_ore_exports",21.5,null,"Mt","2023","worldsteel-figures-2025",null],
  ["chn-io-imp-2023","country","chn","iron_ore_imports",1180.3,null,"Mt","2023","worldsteel-figures-2025",null],
  ["chn-io-cons-2023","country","chn","iron_ore_apparent_consumption",1457.2,null,"Mt","2023","worldsteel-figures-2025","Production - exports + imports."],
  ["aus-io-prod-2023","country","aus","iron_ore_production",952.5,null,"Mt","2023","worldsteel-figures-2025","Production adjusted by source so Fe content is similar to the world average."],
  ["aus-io-exp-2023","country","aus","iron_ore_exports",898.5,null,"Mt","2023","worldsteel-figures-2025",null],
  ["aus-io-cons-2023","country","aus","iron_ore_apparent_consumption",55.0,null,"Mt","2023","worldsteel-figures-2025","Production - exports + imports."],
  ["bra-io-prod-2023","country","bra","iron_ore_production",418.0,null,"Mt","2023","worldsteel-figures-2025","Production adjusted by source so Fe content is similar to the world average."],
  ["bra-io-exp-2023","country","bra","iron_ore_exports",408.0,null,"Mt","2023","worldsteel-figures-2025",null],
  ["ind-io-prod-2023","country","ind","iron_ore_production",278.0,null,"Mt","2023","worldsteel-figures-2025",null],
  ["world-io-prod-2023","commodity","iron-ore","global_production",2522.0,null,"Mt","2023","worldsteel-figures-2025","Production adjusted so Fe content is similar to the world average."],
  ["world-io-exports-2023","commodity","iron-ore","global_exports",1712.0,null,"Mt","2023","worldsteel-figures-2025",null],
  ["chn-pig-iron-2024","country","chn","pig_iron_production",851.7,null,"Mt","2024","worldsteel-figures-2025",null],
  ["world-pig-iron-2024","product","pig-iron","global_production",1293.5,null,"Mt","2024","worldsteel-figures-2025",null],
  ["chn-steel-2024","country","chn","crude_steel_production",1005.1,null,"Mt","2024","worldsteel-figures-2025","Worldsteel estimate."],
  ["chn-bof-share-2024","country","chn","oxygen_steel_share",89.8,null,"%","2024","worldsteel-figures-2025","Share of crude steel produced by oxygen converter route."],
  // Derived values use unrounded source observations above.
  ["chn-io-import-dep-2023","country","chn","iron_ore_import_dependency",81.00,null,"%","2023","worldsteel-figures-2025","Derived: imports / apparent consumption = 1180.3 / 1457.2."],
  ["aus-io-export-dep-2023","country","aus","iron_ore_export_dependence",94.33,null,"%","2023","worldsteel-figures-2025","Derived: exports / production = 898.5 / 952.5."],
  ["bra-io-export-dep-2023","country","bra","iron_ore_export_dependence",97.61,null,"%","2023","worldsteel-figures-2025","Derived: exports / production = 408.0 / 418.0."],
  ["aus-io-share-2023","country","aus","global_iron_ore_production_share",37.77,null,"%","2023","worldsteel-figures-2025","Derived: 952.5 / 2522.0."],
  ["bra-io-share-2023","country","bra","global_iron_ore_production_share",16.57,null,"%","2023","worldsteel-figures-2025","Derived: 418.0 / 2522.0."],
  ["chn-io-share-2023","country","chn","global_iron_ore_production_share",11.83,null,"%","2023","worldsteel-figures-2025","Derived: 298.3 / 2522.0."],
];

const run = db.transaction(() => {
  const source = db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)"); sources.forEach(row=>source.run(...row));
  const product = db.prepare("INSERT OR REPLACE INTO products VALUES (?,?,?,?,?,?,?,?)"); products.forEach(row=>product.run(...row));
  const transform = db.prepare("INSERT OR REPLACE INTO transformations VALUES (?,?,?,?,?,?,?,?)"); transformations.forEach(row=>transform.run(...row));
  const concept = db.prepare("INSERT OR REPLACE INTO concepts VALUES (?,?,?,?,?,?,?,?,?)"); concepts.forEach(row=>concept.run(...row));
  const observation = db.prepare("INSERT OR REPLACE INTO observations VALUES (?,?,?,?,?,?,?,?,?,?)"); observations.forEach(row=>observation.run(...row));
});
run();
console.log(`Iron ore chain populated: ${products.length} products, ${transformations.length} transformations, ${concepts.length} concepts, ${observations.length} observations, ${sources.length} sources.`);
