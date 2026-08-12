import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url)); db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const countries=[
 ["tur","TUR","Türkiye","Europe / Middle East",38.96,35.24,"Large EAF-oriented steel producer and scrap importer."],
 ["deu","DEU","Germany","Europe",51.17,10.45,"Europe's largest steel-producing economy."],
 ["vnm","VNM","Viet Nam","Southeast Asia",14.06,108.28,"Rapidly growing steel producer and consumer."],
 ["ita","ITA","Italy","Europe",41.87,12.57,"Large EAF-oriented steel producer."],
 ["twn","TWN","Taiwan, China","East Asia",23.7,121.0,"Major steelmaking and manufacturing economy."],
 ["egy","EGY","Egypt","North Africa",26.82,30.8,"Large DRI- and EAF-oriented steel producer."],
];
const products=[
 ["coking-coal","Coking coal","Coal with properties suitable for conversion into metallurgical coke.","Raw material","Coal mining and preparation",null,"Coke and blast-furnace ironmaking","Mt"],
 ["met-coke","Metallurgical coke","Carbon-rich blast-furnace fuel and reducing agent produced from coking coal.","Prepared input","Coke oven carbonisation",null,"Blast-furnace ironmaking","Mt"],
 ["steel-scrap","Steel scrap","Recovered ferrous material remelted as metallic feedstock.","Recycled input","Collection, sorting and processing",null,"EAF and BOF metallic charge","Mt"],
 ["dri","Direct reduced iron","Solid metallic iron produced by reducing iron ore below its melting point.","Ironmaking","Gas- or coal-based direct reduction",null,"EAF metallic feedstock","Mt"],
 ["slab","Steel slab","Semi-finished rectangular steel used for flat products.","Semi-finished steel","Continuous casting",null,"HRC, plate and sheet","Mt"],
 ["billet","Steel billet","Semi-finished square steel used for long products.","Semi-finished steel","Continuous casting",null,"Rebar, bar and wire rod","Mt"],
 ["plate","Steel plate","Thick flat-rolled steel product.","Finished steel","Plate rolling",null,"Shipbuilding, machinery and energy","Mt"],
 ["rebar","Reinforcing bar","Ribbed long steel product used to reinforce concrete.","Finished steel","Hot rolling",null,"Construction and infrastructure","Mt"],
 ["wire-rod","Wire rod","Coiled long steel product used as feed for wire products.","Finished steel","Hot rolling",null,"Construction, automotive and manufacturing","Mt"],
 ["automotive-sheet","Automotive sheet","High-quality coated or uncoated flat steel for vehicle bodies and structures.","Advanced finished steel","Cold rolling, annealing and coating",null,"Automotive manufacturing","Mt"],
];
const transformations=[
 ["coal-to-coke","coking-coal","met-coke","Coke making",null,null,"Heat recovered from coke ovens","Removes volatiles and produces strong porous carbon for the blast furnace."],
 ["ore-to-dri","pellet","dri","Direct reduction",null,null,"Natural gas, coal or hydrogen","Produces solid metallic iron without a blast furnace."],
 ["scrap-to-crude-steel","steel-scrap","crude-steel","Electric arc furnace steelmaking",null,null,"Electricity, oxygen and fluxes","Melts recycled steel; DRI or pig iron may supplement scrap."],
 ["dri-to-crude-steel","dri","crude-steel","Electric arc furnace steelmaking",null,null,"Electricity, oxygen and fluxes","DRI provides low-residual metallic units for EAF steel."],
 ["coke-to-pig-iron","met-coke","pig-iron","Blast furnace ironmaking",null,null,"Hot blast and injected fuels","Coke supplies reducing gas, heat and physical support."],
 ["steel-to-slab","crude-steel","slab","Continuous casting",null,null,"Electricity and cooling water","Casts crude steel for flat-product rolling."],
 ["steel-to-billet","crude-steel","billet","Continuous casting",null,null,"Electricity and cooling water","Casts crude steel for long-product rolling."],
 ["slab-to-hrc","slab","hrc","Hot-strip rolling",null,null,"Reheat furnace fuel and electricity","Produces the principal flat-rolled steel intermediate."],
 ["slab-to-plate","slab","plate","Plate rolling",null,null,"Reheat furnace fuel and electricity","Produces heavy flat products."],
 ["billet-to-rebar","billet","rebar","Long-product rolling",null,null,"Reheat furnace fuel and electricity","Produces reinforcing bar."],
 ["billet-to-wire-rod","billet","wire-rod","Wire-rod rolling",null,null,"Reheat furnace fuel and electricity","Produces coiled rod."],
 ["hrc-to-auto-sheet","hrc","automotive-sheet","Cold rolling and coating",null,null,"Electricity, heat, zinc and process gases","Produces surface-critical and high-strength automotive sheet."],
];
const concepts=[
 ["basic-oxygen-furnace","Basic oxygen furnace (BOF)","A vessel that converts molten pig iron and scrap into steel using high-purity oxygen.","BOF links blast-furnace iron—and therefore iron ore and coking coal—to crude steel output.","Pig iron, scrap, oxygen and fluxes","Crude steel and slag","Integrated steelworks","BOF is steelmaking; the blast furnace is ironmaking.","worldsteel-figures-2026"],
 ["electric-arc-furnace","Electric arc furnace (EAF)","A furnace that melts scrap and metallic feedstocks using electric arcs.","EAF shifts dependency from ore and coke toward scrap, DRI and electricity.","Scrap, DRI, pig iron, electricity and fluxes","Crude steel and slag","Mini-mills and integrated sites","EAF does not necessarily mean scrap-only or zero-carbon steel.","worldsteel-figures-2026"],
 ["direct-reduction","Direct reduction (DRI)","Solid-state reduction of iron ore using reducing gases or coal.","DRI enables ore-based EAF production and is central to many hydrogen-steel pathways.","High-grade pellets or lump ore and reducing gas","Direct reduced iron","DRI modules linked to EAFs or export hubs","DRI is metallic iron, not finished steel.","worldsteel-figures-2026"],
 ["steel-capacity-v-production","Capacity versus production","Capacity is maximum potential output; production is actual realised output.","Their ratio measures utilisation and separates installed industrial scale from current activity.","Installed equipment and operating output","Capacity utilisation","Country and plant comparisons","Production must not be presented as capacity.","worldsteel-figures-2026"],
];

// country: production, oxygen %, electric %, other %, apparent finished-steel use, pig iron (all 2025; Mt where applicable)
const rows={
 chn:[960.8,89.4,10.6,0,796.0,836.0],ind:[164.9,42.3,57.7,0,159.8,95.6],usa:[81.9,28.7,71.3,0,90.9,21.4],jpn:[80.7,74.2,25.8,0,48.0,58.5],rus:[67.9,64.9,33.0,2.2,37.6,50.4],kor:[62.2,73.0,27.0,0,43.6,43.7],tur:[38.1,27.8,72.2,0,39.3,9.7],deu:[34.1,69.4,30.6,0,29.2,21.9],bra:[33.4,76.0,22.9,1.1,26.8,26.3],irn:[32.0,8.1,91.9,0,20.3,3.7],vnm:[24.7,null,null,null,null,null],ita:[20.7,9.9,90.1,0,23.8,2.0],idn:[19.0,null,null,null,null,null],twn:[17.2,60.3,39.7,0,17.4,9.4],mex:[13.5,4.1,95.9,0,25.0,0.5],can:[11.5,55.1,44.9,0,12.6,5.7],egy:[10.6,0,100,0,10.0,null],mys:[7.7,null,null,null,null,null],ukr:[7.4,50.0,6.6,43.4,4.1,7.9],aus:[5.2,75.6,24.4,0,null,3.5],zaf:[4.5,50.5,49.5,0,4.4,2.4],swe:[4.0,66.9,33.1,0,2.9,2.7]
};
const world=1848.9, observations=[];
for(const [id,[prod,bof,eaf,other,use,pig]] of Object.entries(rows)){
 const vals=[["crude_steel_production",prod,"Mt","reported"],["global_crude_steel_production_share",100*prod/world,"%","derived"]];
 if(bof!=null) vals.push(["oxygen_steel_share",bof,"%","reported"],["electric_steel_share",eaf,"%","reported"],["other_steel_share",other,"%","reported"]);
 if(use!=null) vals.push(["apparent_steel_use",use,"Mt","reported"],["steel_use_global_share",100*use/1718.2,"%","derived"]);
 if(pig!=null) vals.push(["pig_iron_production",pig,"Mt","reported"],["ore_based_steel_proxy",100*pig/prod,"%","derived"]);
 for(const [metric,value,unit,status] of vals) observations.push([`${id}-${metric}-2025`,`country`,id,metric,value,null,unit,"2025","worldsteel-figures-2026",status==="derived"?"Derived from Worldsteel 2025 country and world totals.":null,status]);
}
observations.push(["world-steel-prod-2025","product","crude-steel","global_production",world,null,"Mt","2025","worldsteel-figures-2026",null,"reported"],["world-steel-use-2025","product","crude-steel","global_apparent_steel_use",1718.2,null,"Mt","2025","worldsteel-figures-2026",null,"reported"],["world-bof-share-2025","product","crude-steel","oxygen_steel_share",69.4,null,"%","2025","worldsteel-figures-2026",null,"reported"],["world-eaf-share-2025","product","crude-steel","electric_steel_share",30.3,null,"%","2025","worldsteel-figures-2026",null,"reported"]);

const companies=[
 ["baowu","China Baowu Group","chn","Steel","State-owned"],["arcelormittal","ArcelorMittal",null,"Steel","Public"],["nippon-steel","Nippon Steel Corporation","jpn","Steel","Public"],["ansteel","Ansteel Group","chn","Steel","State-owned"],["hbis","HBIS Group","chn","Steel","State-owned"],["shagang","Shagang Group","chn","Steel","Private"],["jianlong","Jianlong Group","chn","Steel","Private"],["delong","Delong Steel","chn","Steel","Private"],["tata-steel","Tata Steel Group","ind","Steel","Public"]
];
const companyOutput={baowu:124.76,arcelormittal:63.43,"nippon-steel":57.78,ansteel:57.61,hbis:42.49,shagang:39.10,jianlong:38.02,posco:37.36,delong:32.03,"tata-steel":30.46};
for(const [id,value] of Object.entries(companyOutput)) observations.push([`${id}-steel-output-2025`,`company`,id,"crude_steel_production",value,null,"Mt","2025","worldsteel-figures-2026",null,"reported"]);

const run=db.transaction(()=>{
 const c=db.prepare("INSERT OR IGNORE INTO countries VALUES (?,?,?,?,?,?,?)");countries.forEach(x=>c.run(...x));
 const p=db.prepare("INSERT OR REPLACE INTO products VALUES (?,?,?,?,?,?,?,?)");products.forEach(x=>p.run(...x));
 const t=db.prepare("INSERT OR REPLACE INTO transformations VALUES (?,?,?,?,?,?,?,?)");transformations.forEach(x=>t.run(...x));
 const con=db.prepare("INSERT OR REPLACE INTO concepts VALUES (?,?,?,?,?,?,?,?,?)");concepts.forEach(x=>con.run(...x));
 const co=db.prepare("INSERT OR REPLACE INTO companies VALUES (?,?,?,?,?)");companies.forEach(x=>co.run(...x));
 const o=db.prepare("INSERT OR REPLACE INTO observations VALUES (?,?,?,?,?,?,?,?,?,?)"),om=db.prepare("INSERT OR REPLACE INTO observation_metadata VALUES (?,?,?,?)");observations.forEach(x=>{o.run(...x.slice(0,10));om.run(x[0],x[10],x[7],"Steel chain v1.")});
});run();
console.log(`Steel v1: ${products.length} products, ${transformations.length} transformations, ${Object.keys(rows).length} countries, ${observations.length} observations, ${Object.keys(companyOutput).length} top companies.`);
