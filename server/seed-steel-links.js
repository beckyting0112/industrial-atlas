import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url)); db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const source=["atlas-steel-link-method","Atlas ore-to-steel linkage methodology","Industrial Atlas","","2026-08-07","current","methodology","medium","2026-08-07","Documented source-area links reproduce named sourcing geographies in GEM plant profiles. Illustrative gateway corridors connect those source areas through major mapped export ports; they are not measured plant-specific shipments."];
// subject type/id, relationship, object type/id, source, notes
const links=[
 ["country","aus","documented_ore_source_for","asset","pohang","gem-gist-plants-2026","GEM identifies imported Australian Pilbara ore as a Pohang input."],
 ["country","aus","documented_ore_source_for","asset","kimitsu-works","gem-gist-plants-2026","GEM identifies Australia among Kimitsu's imported ore sources."],
 ["country","bra","documented_ore_source_for","asset","kimitsu-works","gem-gist-plants-2026","GEM identifies Brazil among Kimitsu's imported ore sources."],
 ["country","ind","documented_ore_source_for","asset","kimitsu-works","gem-gist-plants-2026","GEM identifies India among Kimitsu's imported ore sources."],
 ["country","ind","domestic_ore_system_for","asset","vijayanagar","gem-gist-plants-2026","GEM identifies captive Karnataka and Odisha mines."],
 ["country","ind","domestic_ore_system_for","asset","kalinganagar-works","gem-gist-plants-2026","GEM identifies Tata's Noamundi, Joda East and Khondbond mines."],
 ["asset","cape-lambert","illustrative_gateway_to","asset","pohang","atlas-steel-link-method","Illustrative Pilbara gateway connection; not a measured plant-specific shipment."],
 ["asset","port-hedland","illustrative_gateway_to","asset","pohang","atlas-steel-link-method","Illustrative Pilbara gateway connection; not a measured plant-specific shipment."],
 ["asset","port-hedland","illustrative_gateway_to","asset","kimitsu-works","atlas-steel-link-method","Illustrative Australian gateway connection; not a measured plant-specific shipment."],
 ["asset","ponta-madeira","illustrative_gateway_to","asset","kimitsu-works","atlas-steel-link-method","Illustrative Brazilian gateway connection; not a measured plant-specific shipment."]
];
const run=db.transaction(()=>{
 db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)").run(...source);
 const q=db.prepare("INSERT OR REPLACE INTO entity_relationships VALUES (?,?,?,?,?,?,?,?,?,?,?)");
 links.forEach((x,i)=>q.run(`steel-link-${i+1}`,x[0],x[1],x[2],x[3],x[4],null,null,null,x[5],x[6]));
}); run(); console.log(`Steel links: ${links.length} source and gateway relationships seeded.`);
