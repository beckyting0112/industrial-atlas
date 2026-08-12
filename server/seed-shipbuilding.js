import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url)); db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
 ["oecd-uk-shipbuilding-2026","Peer Review of the United Kingdom Shipbuilding Industry 2026","OECD","https://www.oecd.org/content/dam/oecd/en/publications/reports/2026/02/peer-review-of-the-united-kingdom-shipbuilding-industry_911a512a/c5f4407d-en.pdf","2026-02-01","2024","government_intergovernmental","high","2026-08-08","Reports the 2024 global commercial orderbook at 132.8m CGT: China 66.4m, Korea 38.9m, Japan 14.4m and Europe 8.6m."],
 ["unctad-rmt-2025-ch2","Review of Maritime Transport 2025, chapter 2","UN Trade and Development","https://unctad.org/system/files/official-document/rmt2025ch2_en.pdf","2025-09-24","2024-2025","government_intergovernmental","high","2026-08-08","Reports 120 active Chinese yards, around 45% of global yard capacity and about 60% of the orderbook; discusses vessel specialization."],
 ["imo-ship-types","Safety regulations for different types of ships","International Maritime Organization","https://www.imo.org/en/ourwork/safety/pages/regulationsdefault.aspx",null,"current","government_intergovernmental","high","2026-08-08","Official treaty-based descriptions of major vessel types."],
 ["imabari-company-2026","Imabari Shipbuilding company information","Imabari Shipbuilding","https://www.imazo.co.jp/company/",null,"current","company","high","2026-08-08","Reports a network of 13 domestic shipyards."],
 ["oecd-maritime-decarbonisation-2025","The Role of Shipbuilding in Maritime Decarbonisation","OECD","https://www.oecd.org/en/publications/the-role-of-shipbuilding-in-maritime-decarbonisation_0c8362c0-en.html","2025-04-01","2024","government_intergovernmental","high","2026-08-08","Quantifies builder-country shares of alternative-fuel-capable orderbooks and deliveries."],
 ["oecd-korea-shipbuilding-2026","Peer Review of the Korean Shipbuilding Industry 2026","OECD","https://www.oecd.org/en/publications/peer-review-of-the-korean-shipbuilding-industry_c19e0105-en.html","2026-04-01","2024-2025","government_intergovernmental","high","2026-08-08","Documents Korea's high-value specialization, completion share, capacity and workforce constraints."],
];
const putSource=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)"); sources.forEach(x=>putSource.run(...x));

const countries=[
 ["jpn","JPN","Japan","East Asia",36.2,138.25,"A leading shipbuilding and steel economy specializing in efficient bulk carriers and other commercial vessels."],
];
const putCountry=db.prepare("INSERT OR IGNORE INTO countries VALUES (?,?,?,?,?,?,?)"); countries.forEach(x=>putCountry.run(...x));

const obs=[
 ["chn-ship-orderbook-cgt-2024","country","chn","shipbuilding_orderbook_cgt",66.4,null,"m CGT","2024","oecd-uk-shipbuilding-2026",null,"reported"],
 ["chn-ship-orderbook-share-2024","country","chn","global_shipbuilding_orderbook_share",50.0,null,"%","2024","oecd-uk-shipbuilding-2026","66.4 / 132.8 million CGT.","reported"],
 ["kor-ship-orderbook-cgt-2024","country","kor","shipbuilding_orderbook_cgt",38.9,null,"m CGT","2024","oecd-uk-shipbuilding-2026",null,"reported"],
 ["kor-ship-orderbook-share-2024","country","kor","global_shipbuilding_orderbook_share",29.3,null,"%","2024","oecd-uk-shipbuilding-2026",null,"reported"],
 ["jpn-ship-orderbook-cgt-2024","country","jpn","shipbuilding_orderbook_cgt",14.4,null,"m CGT","2024","oecd-uk-shipbuilding-2026",null,"reported"],
 ["jpn-ship-orderbook-share-2024","country","jpn","global_shipbuilding_orderbook_share",10.4,null,"%","2024","oecd-uk-shipbuilding-2026",null,"reported"],
 ["chn-yard-cap-share-2024","country","chn","global_shipyard_capacity_share",45,null,"%","2024","unctad-rmt-2025-ch2","UNCTAD reports approximately 45%.","reported"],
 ["chn-active-yards-2024","country","chn","active_shipyards",120,null,"yards","2024","unctad-rmt-2025-ch2",null,"reported"],
 ["world-ship-orderbook-cgt-2024","industry","shipbuilding","global_shipbuilding_orderbook",132.8,null,"m CGT","2024","oecd-uk-shipbuilding-2026",null,"reported"],
 ["shipbuilding-top3-share-2024","industry","shipbuilding","shipbuilding_orderbook_cr3",89.7,null,"%","2024","oecd-uk-shipbuilding-2026","China, Korea and Japan shares reported by OECD; displayed total reflects published rounded shares.","derived"],
 ["chn-ship-completion-share-gt-2024","country","chn","global_shipbuilding_completion_share_gt",54.57,null,"%","2024","unctad-rmt-2025-ch2",null,"reported"],
 ["kor-ship-completion-share-gt-2024","country","kor","global_shipbuilding_completion_share_gt",28.02,null,"%","2024","unctad-rmt-2025-ch2",null,"reported"],
 ["jpn-ship-completion-share-gt-2024","country","jpn","global_shipbuilding_completion_share_gt",12.56,null,"%","2024","unctad-rmt-2025-ch2",null,"reported"],
 ["chn-alt-fuel-orderbook-share-2024","country","chn","alternative_fuel_orderbook_share",47,null,"%","2024-09","oecd-maritime-decarbonisation-2025",null,"reported"],
 ["kor-alt-fuel-orderbook-share-2024","country","kor","alternative_fuel_orderbook_share",42,null,"%","2024-09","oecd-maritime-decarbonisation-2025",null,"reported"],
 ["jpn-alt-fuel-orderbook-share-2024","country","jpn","alternative_fuel_orderbook_share",3,null,"%","2024-09","oecd-maritime-decarbonisation-2025",null,"reported"],
 ["kor-alt-fuel-delivery-share-2024","country","kor","alternative_fuel_delivery_specialization",69,null,"%","2024","oecd-maritime-decarbonisation-2025","Share of Korea's 2024 deliveries that were alternative-fuel capable.","reported"],
];
const putObs=db.prepare("INSERT OR REPLACE INTO observations(id,entity_type,entity_id,metric,value,text_value,unit,period,source_id,methodology) VALUES (?,?,?,?,?,?,?,?,?,?)");
const putMeta=db.prepare("INSERT OR REPLACE INTO observation_metadata VALUES (?,?,?,?)");
obs.forEach(x=>{putObs.run(...x.slice(0,10));putMeta.run(x[0],x[10],x[7],null)});

const types=[
 ["bulk-carrier","Bulk carrier","Dry bulk","Handysize to Valemax / VLOC","Heavy marine plate and structural sections","China; Japan; Korea","Iron ore, coal and grain corridors","Medium","Single-deck vessel designed primarily for unpackaged dry commodities; ore carriers are a specialized form.","imo-ship-types",1],
 ["container-ship","Container ship","Liner cargo","Feeder to 24,000+ TEU","Marine plate, high-strength steel and container-cell structure","China; Korea; Japan","Manufactured-goods and intermediate-input routes","High","Cellular cargo ship designed around standardized intermodal containers.","imo-ship-types",2],
 ["oil-tanker","Oil and product tanker","Liquid bulk","Product tanker to VLCC","Marine plate, corrosion-resistant systems and double-hull structure","China; Korea; Japan","Crude-oil and refined-product routes","High","Double-hull vessel constructed or adapted primarily to carry oil in bulk.","imo-ship-types",3],
 ["lng-carrier","LNG carrier","Cryogenic gas","Common large class around 174,000 m³","Marine plate plus cryogenic containment materials","Korea; China; Japan","LNG export-import corridors","Very high","Specialized gas carrier with insulated containment for liquefied natural gas.","imo-ship-types",4],
 ["vehicle-carrier","Vehicle carrier","Ro-ro vehicles","Capacity commonly expressed in CEU","Marine plate and lightweight multi-deck structure","China; Japan; Korea","Automotive and EV export routes","High","Multi-deck roll-on/roll-off cargo vessel designed for cars and trucks.","imo-ship-types",5],
 ["cruise-ship","Cruise ship","Passenger","Berths / gross tonnage","Marine plate plus exceptionally high outfitting content","Italy; France; Finland; Germany","Tourism rather than commodity trade","Very high","Passenger vessel whose value is dominated by complex systems, accommodation and outfitting as well as the hull.","unctad-rmt-2025-ch2",6],
];
const putType=db.prepare("INSERT OR REPLACE INTO ship_types VALUES (?,?,?,?,?,?,?,?,?,?,?)"); types.forEach(x=>putType.run(...x));

const specializations=[
 ["chn-bulk-lead","chn","bulk-carrier","Global leader",5,"China led 2024 contracting in commercial cargo segments other than gas carriers; bulk shipping remains a core scale segment.","2024","qualitative","unctad-rmt-2025-ch2"],
 ["chn-container-lead","chn","container-ship","Global leader",5,"China led container-ship contracting in 2024 and is closing technology gaps in higher-value construction.","2024","qualitative","unctad-rmt-2025-ch2"],
 ["chn-tanker-lead","chn","oil-tanker","Global leader",5,"China led tanker contracting in 2024, combining cost advantage with broad yard capacity.","2024","qualitative","unctad-rmt-2025-ch2"],
 ["chn-lng-challenger","chn","lng-carrier","Fast-rising challenger",4,"Gas carriers were the only major segment in which China did not lead 2024 contracting.","2024","qualitative","unctad-rmt-2025-ch2"],
 ["chn-vehicle-lead","chn","vehicle-carrier","Global leader",5,"UNCTAD reports China leading commercial cargo segments other than gas; vehicle-carrier demand is reinforced by automotive exports.","2024","qualitative","unctad-rmt-2025-ch2"],
 ["kor-lng-lead","kor","lng-carrier","Technology leader",5,"Korea retained the majority share of gas-carrier construction and specializes in high-value LNG-capable vessels.","2024","qualitative","unctad-rmt-2025-ch2"],
 ["kor-container-strong","kor","container-ship","High-value specialist",4,"Korean yards retain a strong position in ultra-large container ships and alternative-fuel-capable designs.","2024","qualitative","oecd-korea-shipbuilding-2026"],
 ["kor-tanker-strong","kor","oil-tanker","High-value specialist",4,"Korea remains strong in technologically demanding tanker construction.","2024","qualitative","unctad-rmt-2025-ch2"],
 ["kor-bulk-selective","kor","bulk-carrier","Selective presence",2,"Korea has shifted away from cost-competitive bulkers toward higher-value segments.","2024","qualitative","oecd-korea-shipbuilding-2026"],
 ["jpn-bulk-specialist","jpn","bulk-carrier","Established specialist",4,"Japan's current production focus remains strongly associated with efficient bulk carriers.","2024","qualitative","oecd-maritime-decarbonisation-2025"],
 ["jpn-tanker-presence","jpn","oil-tanker","Established presence",3,"Japan retains a presence in tanker construction despite long-run market-share decline.","2024","qualitative","unctad-rmt-2025-ch2"],
 ["jpn-container-presence","jpn","container-ship","Established presence",3,"Japan retains a presence in container construction while focusing on smart and green ships.","2024","qualitative","unctad-rmt-2025-ch2"],
];
const putSpec=db.prepare("INSERT OR REPLACE INTO shipbuilding_specializations VALUES (?,?,?,?,?,?,?,?,?)"); specializations.forEach(x=>putSpec.run(...x));

const companies=[
 ["cssc","China State Shipbuilding Corporation","chn","Shipbuilding","State-owned"],
 ["hd-hyundai-shipbuilding","HD Hyundai shipbuilding group","kor","Shipbuilding","Public group"],
 ["hanwha-ocean","Hanwha Ocean","kor","Shipbuilding","Public group"],
 ["samsung-heavy","Samsung Heavy Industries","kor","Shipbuilding","Public"],
 ["imabari","Imabari Shipbuilding","jpn","Shipbuilding","Private"],
];
const putCompany=db.prepare("INSERT OR REPLACE INTO companies VALUES (?,?,?,?,?)"); companies.forEach(x=>putCompany.run(...x));

const assets=[
 ["jiangnan-shipyard","Jiangnan Shipyard","shipyard","chn","cssc","steel",31.35,121.74,"operating",null,null,null,"Representative CSSC yard; shown as a case within a much larger Chinese yard network."],
 ["ulsan-shipyard","Ulsan Shipyard","shipyard","kor","hd-hyundai-shipbuilding","steel",35.52,129.44,"operating",null,null,null,"Representative large Korean shipbuilding complex."],
 ["hanwha-geoje","Hanwha Ocean Geoje","shipyard","kor","hanwha-ocean","steel",34.89,128.70,"operating",null,null,null,"Representative high-value commercial and offshore shipyard."],
 ["samsung-geoje","Samsung Heavy Industries Geoje","shipyard","kor","samsung-heavy","steel",34.90,128.61,"operating",null,null,null,"Representative Korean yard specializing in complex vessels."],
 ["imabari-saijo","Imabari Saijo Shipyard","shipyard","jpn","imabari","steel",33.94,133.18,"operating",null,null,null,"Representative yard in Imabari's 13-yard domestic network."],
];
const putAsset=db.prepare("INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"); assets.forEach(x=>putAsset.run(...x));

db.prepare("INSERT OR REPLACE INTO metric_definitions VALUES (?,?,?,?,?,?,?)").run("shipbuilding-orderbook-share","Shipbuilding orderbook share","country orderbook CGT / global orderbook CGT","Shows where future commercial-vessel production is concentrated.","%","country and global orderbook CGT","active");
console.log("Seeded shipbuilding country layer, six vessel classes and representative company yards.");
