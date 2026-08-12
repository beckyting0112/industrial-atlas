import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url));db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
 ["gem-gist-jun-2026","Global Iron and Steel Tracker: Operating Steel Capacity by Production Method","Global Energy Monitor","https://docs.google.com/spreadsheets/d/1mOWPPmjCQtoAWUCY0pAChgWskobG0odjdNUHV041_a8/edit?usp=sharing","2026-06-01","June 2026","research_database","high","2026-08-07","Operating capacity only; plants at or above the tracker threshold. TTPA converted to Mtpa."],
 ["oecd-steel-outlook-2026","OECD Steel Outlook 2026","OECD","https://www.oecd.org/content/dam/oecd/en/publications/reports/2026/06/oecd-steel-outlook-2026_a79fb861/99ab9b0c-en.pdf","2026-06-01","2025","intergovernmental","high","2026-08-07","Global nominal capacity, excess capacity and utilisation."],
];
// country: total, BOF, EAF, IF, integrated, non-integrated operating capacity; Mtpa, June 2026.
const capacity={
 chn:[1087.894,898.083,189.571,.240,931.460,156.434],ind:[145.459,90.663,26.578,13.768,141.826,3.633],usa:[112.196,30.651,81.545,0,33.651,78.545],jpn:[105.900,76.812,29.088,0,67.705,38.195],rus:[85.015,51.660,33.355,0,67.225,17.790],kor:[80.885,53.000,27.885,0,57.957,22.928],tur:[56.332,13.102,43.230,0,13.102,43.230],deu:[44.720,31.520,13.200,0,28.620,16.100],bra:[42.917,32.497,10.420,0,36.501,6.416],irn:[36.758,5.100,29.723,1.935,29.750,7.008],vnm:[39.926,25.574,9.502,4.350,26.874,13.052],ita:[31.736,7.800,23.936,0,7.800,23.936],idn:[21.400,11.980,9.420,0,11.980,9.420],twn:[24.701,15.001,9.700,0,16.081,8.620],mex:[23.041,2.500,20.541,0,10.230,12.811],can:[14.550,5.800,8.750,0,7.600,6.950],egy:[15.560,0,15.560,0,11.300,4.260],mys:[11.920,6.200,4.920,.800,7.100,4.820],ukr:[19.677,12.255,3.303,.017,16.357,3.320],aus:[5.930,4.400,1.530,0,1.200,4.730],zaf:[4.810,3.360,1.450,0,3.960,.850],swe:[4.813,3.800,1.013,0,3.813,1.000],omn:[3.200,0,3.200,0,2.500,.700],per:[2.000,0,2.000,0,0,2.000],kaz:[6.000,6.000,0,0,6.000,0]
};
// Total steel product trade in 2025; Mt. Individual EU countries include intra-EU trade.
const trade={chn:[133.6,7.0],jpn:[29.8,5.7],kor:[27.9,12.6],deu:[20.9,20.2],tur:[17.5,19.8],rus:[15.2,4.8],ita:[14.3,20.4],irn:[13.5,1.5],idn:[11.6,13.0],vnm:[11.1,13.5],bra:[11.0,6.3],ind:[9.9,10.4],twn:[8.5,8.3],usa:[7.1,23.9],mex:[3.0,14.8]};
const production=Object.fromEntries(db.prepare("SELECT entity_id,value FROM observations WHERE entity_type='country' AND metric='crude_steel_production' AND period='2025'").all().map(x=>[x.entity_id,x.value]));
const use=Object.fromEntries(db.prepare("SELECT entity_id,value FROM observations WHERE entity_type='country' AND metric='apparent_steel_use' AND period='2025'").all().map(x=>[x.entity_id,x.value]));
const observations=[];
for(const [id,[total,bof,eaf,induction,integrated,nonintegrated]] of Object.entries(capacity)){
 const values=[["steelmaking_capacity",total,"Mtpa","reported"],["bof_steelmaking_capacity",bof,"Mtpa","reported"],["eaf_steelmaking_capacity",eaf,"Mtpa","reported"],["induction_steelmaking_capacity",induction,"Mtpa","reported"],["integrated_steelmaking_capacity",integrated,"Mtpa","reported"],["nonintegrated_steelmaking_capacity",nonintegrated,"Mtpa","reported"],["bof_capacity_share",100*bof/total,"%","derived"],["eaf_capacity_share",100*eaf/total,"%","derived"]];
 if(production[id]!=null) values.push(["steel_capacity_utilization_proxy",100*production[id]/total,"%","derived"]);
 for(const [metric,value,unit,status] of values) observations.push([`${id}-${metric}-2026`,`country`,id,metric,value,null,unit,"2026-06","gem-gist-jun-2026",status==="derived"?(metric.includes("utilization")?"2025 Worldsteel production divided by June 2026 GEM operating capacity; cross-vintage analytical proxy.":"Derived from GEM operating capacity by method."):null,status]);
}
for(const [id,[exports,imports]] of Object.entries(trade)){
 const vals=[["steel_exports",exports,"Mt","reported"],["steel_imports",imports,"Mt","reported"],["net_steel_exports",exports-imports,"Mt","derived"]];
 if(production[id]) vals.push(["steel_export_intensity",100*exports/production[id],"%","derived"]);
 if(use[id]) vals.push(["steel_import_dependence",100*imports/use[id],"%","derived"]);
 for(const [metric,value,unit,status] of vals) observations.push([`${id}-${metric}-2025`,`country`,id,metric,value,null,unit,"2025","worldsteel-figures-2026",status==="derived"?"Derived from Worldsteel steel product trade and country production/use totals.":null,status]);
}
observations.push(
 ["world-oecd-steel-capacity-2025","product","crude-steel","global_nominal_steelmaking_capacity",2445,null,"Mtpa","2025","oecd-steel-outlook-2026",null,"reported"],
 ["world-oecd-excess-capacity-2025","product","crude-steel","global_excess_steelmaking_capacity",640,null,"Mt","2025","oecd-steel-outlook-2026",null,"reported"],
 ["world-oecd-cap-util-2025","product","crude-steel","global_steel_capacity_utilization",76,null,"%","2025","oecd-steel-outlook-2026",null,"reported"],
 ["world-gem-operating-capacity-2026","product","crude-steel","tracked_operating_steel_capacity",2228.713,null,"Mtpa","2026-06","gem-gist-jun-2026",null,"reported"],
 ["chn-steel-net-export-share-2025","country","chn","global_net_steel_export_share",null,"China ranked first with 126.6 Mt net exports",null,"2025","worldsteel-figures-2026","Worldsteel ranking statement.","reported"]
);
const metricDefs=[
 ["steel-cap-util","Steel capacity utilisation","Crude steel production / steelmaking capacity","Share of installed steelmaking capacity represented by output.","%","Production; operating or nominal capacity","active"],
 ["steel-export-intensity","Steel export intensity","Steel product exports / crude steel production","Orientation of a steel industry toward foreign markets.","%","Steel exports; crude steel production","active"],
 ["steel-import-dependence","Steel import dependence","Steel product imports / apparent steel use","Exposure of domestic finished-steel demand to imports.","%","Steel imports; apparent steel use","active"],
];
const run=db.transaction(()=>{
 const s=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)");sources.forEach(x=>s.run(...x));
 const o=db.prepare("INSERT OR REPLACE INTO observations VALUES (?,?,?,?,?,?,?,?,?,?)"),om=db.prepare("INSERT OR REPLACE INTO observation_metadata VALUES (?,?,?,?)");observations.forEach(x=>{o.run(...x.slice(0,10));om.run(x[0],x[10],x[7],"Steel phase 2.")});
 const md=db.prepare("INSERT OR REPLACE INTO metric_definitions VALUES (?,?,?,?,?,?,?)");metricDefs.forEach(x=>md.run(...x));
});run();
console.log(`Steel phase 2: ${Object.keys(capacity).length} capacity profiles, ${Object.keys(trade).length} trade profiles, ${observations.length} observations.`);
