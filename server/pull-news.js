import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { get } from "node:https";
import { resolve,dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here=dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));
for(const [name,definition] of [["source_tier","INTEGER NOT NULL DEFAULT 3"],["source_rationale","TEXT"],["summary_provenance","TEXT NOT NULL DEFAULT 'summary pending review'"]])if(!db.prepare("PRAGMA table_info(news_events)").all().some(x=>x.name===name))db.exec(`ALTER TABLE news_events ADD COLUMN ${name} ${definition}`);
const queries=[
  '(shipping OR port OR vessel OR pipeline OR railway OR canal) (strike OR attack OR closure OR outage OR congestion OR disruption OR collision)',
  '("iron ore" OR coal OR copper OR nickel OR lithium OR grain OR oil OR LNG OR steel) (production OR exports OR inventory OR shortage OR surplus OR sanctions OR tariff OR ban)',
  '(mine OR refinery OR smelter OR steelmaker OR automaker OR battery) (capacity OR guidance OR curtailment OR shutdown OR expansion OR demand)',
  '(PMI OR inflation OR stimulus OR property OR infrastructure) (China OR US OR Europe OR India OR Indonesia) (manufacturing OR commodity OR steel OR construction)'
];
const tier1=/(reuters|associated press|ap news|financial times|wall street journal|new york times|bloomberg|sp global|iea|eia|unctad|world bank|imf)/i;
const tier2=/(cnbc|bbc|economist|mining\.com|maritime executive|argus|hellenic shipping|offshore energy)/i;
const sourceTier=domain=>tier1.test(domain||"")?1:tier2.test(domain||"")?2:3;
const locations=[
  [/(odesa|odessa|chornomorsk|pivdennyi)/i,"Odesa port system",30.72,46.48,"Ukraine","Black Sea"],
  [/novorossiysk/i,"Novorossiysk",37.77,44.72,"Russia","Black Sea"],
  [/(suez|red sea|bab el.mandeb|houthi)/i,"Red Sea / Suez",43.32,13.5,"Egypt; Yemen","Suez / Red Sea"],
  [/(hormuz|persian gulf)/i,"Strait of Hormuz",56.25,26.56,"Iran; Oman","Hormuz"],
  [/(strait of malacca|malacca strait|singapore strait)/i,"Strait of Malacca",101.1,2.7,"Malaysia; Indonesia; Singapore","Malacca"],
  [/(panama canal|panama)/i,"Panama Canal",-79.68,9.08,"Panama","Panama Canal"],
  [/(pilbara|port hedland|dampier)/i,"Pilbara export system",118.58,-20.31,"Australia","Australia–Asia iron ore"],
  [/(constanta|danube|izmail)/i,"Danube / Constanța corridor",28.65,44.17,"Romania; Ukraine","Danube diversion"]
];
const commodities={grain:/\b(grain|wheat|corn|maize|barley)\b/i,"iron ore":/iron ore/i,coal:/\b(coal|coking coal)\b/i,steel:/\bsteel\b/i,nickel:/\bnickel\b/i,lithium:/\blithium\b/i,"crude oil":/\b(crude|oil tanker|oil terminal)\b/i,LNG:/\b(LNG|liquefied natural gas)\b/i,containers:/\b(container|boxship)\b/i};
const types={attack:/\b(strike|attack|missile|drone|war)\b/i,closure:/\b(close|closed|closure|halt|suspend|shutdown)\b/i,policy:/\b(tariff|sanction|export ban|quota|restriction)\b/i,weather:/\b(cyclone|hurricane|flood|drought|storm)\b/i,outage:/\b(outage|accident|fire|force majeure|maintenance)\b/i,congestion:/\b(congestion|delay|backlog|queue)\b/i};
const impacts={attack:"Physical impact is not yet independently measured. Check vessel calls, port status and confirmed infrastructure damage.",closure:"The report indicates a possible interruption. Confirm operating status, duration and effective capacity unavailable.",policy:"Implementation date, product scope and exemptions require confirmation before changing trade assumptions.",weather:"Observed shipments, utilization and inventories determine whether weather exposure becomes material.",outage:"Confirm affected units, restart timing and available inventories before estimating lost output.",congestion:"Confirm whether queues reduce throughput or primarily add transit time and freight cost.",other:"No observed physical impact has yet been verified."};
const inferences={attack:"Persistent disruption could move war-risk insurance, freight and route availability before annual balances change.",closure:"A sustained closure could redirect flows and raise delivered costs; a short interruption may be absorbed by inventories.",policy:"The investable effect depends on rerouting, regional price separation and capacity-utilization changes.",weather:"The market effect depends on duration, seasonal inventories and substitute supply.",outage:"Forecast revisions should follow observed lost output and restart progress, not nameplate capacity alone.",congestion:"Monitor whether delays become inventory shortages or remain a temporary logistics cost.",other:"Treat as a candidate until a physical transmission mechanism is identified."};
const fetchJson=url=>new Promise((resolvePromise,reject)=>{const request=get(url,{headers:{"User-Agent":"IndustrialAtlas/0.1"}},response=>{let body="";response.setEncoding("utf8");response.on("data",chunk=>body+=chunk);response.on("end",()=>{if(response.statusCode<200||response.statusCode>=300)return reject(new Error(`GDELT request failed: ${response.statusCode}`));try{resolvePromise(JSON.parse(body))}catch(error){reject(error)}})});request.setTimeout(60000,()=>request.destroy(new Error("GDELT request timed out after 60 seconds")));request.on("error",reject)});
const fetchText=url=>new Promise((resolvePromise,reject)=>{const request=get(url,{headers:{"User-Agent":"Mozilla/5.0 IndustrialAtlas/0.2"}},response=>{let body="";response.setEncoding("utf8");response.on("data",chunk=>body+=chunk);response.on("end",()=>response.statusCode>=200&&response.statusCode<300?resolvePromise(body):reject(new Error(`RSS request failed: ${response.statusCode}`)))});request.setTimeout(60000,()=>request.destroy(new Error("RSS request timed out")));request.on("error",reject)});
const decodeXml=value=>String(value||"").replace(/<!\[CDATA\[|\]\]>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");
const parseGoogleNews=xml=>[...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match=>{const item=match[1],read=tag=>decodeXml(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1]);const source=decodeXml(item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]);return {title:read("title").replace(/\s+-\s+[^-]+$/,"").trim(),url:read("link"),seendate:new Date(read("pubDate")).toISOString(),domain:source||"Google News source",description:read("description")}}).filter(x=>x.title&&x.url);
const results=[];
for(const query of queries){const params=new URLSearchParams({query,mode:"artlist",format:"json",maxrecords:"100",timespan:"36h",sort:"datedesc"});try{const payload=await fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`);results.push(...(payload.articles||[]))}catch(error){console.error(`Query unavailable: ${error.message}`)}}
if(!results.length){for(const query of queries){const params=new URLSearchParams({q:`${query} when:2d`,hl:"en-US",gl:"US",ceid:"US:en"});try{results.push(...parseGoogleNews(await fetchText(`https://news.google.com/rss/search?${params}`)))}catch(error){console.error(`Fallback unavailable: ${error.message}`)}}}
const articles=[...new Map(results.filter(x=>x.url).map(x=>[x.url,x])).values()],now=new Date(),expires=new Date(now.getTime()+72*3600e3).toISOString();
if(!articles.length){console.error("Morning pull unavailable. Existing brief retained.");process.exitCode=2;process.exit()}
const insert=db.prepare(`INSERT INTO news_events (id,cluster_key,headline,publisher,source_url,published_at,collected_at,review_status,evidence_status,event_type,severity,materiality_score,commodity_tags,country_tags,route_tags,source_tier,source_rationale,latitude,longitude,location_label,reported_summary,summary_provenance,observed_impact,analyst_inference,monitor_next,map_expires_at,active) VALUES (@id,@cluster_key,@headline,@publisher,@source_url,@published_at,@collected_at,'candidate','reported',@event_type,@severity,@materiality_score,@commodity_tags,@country_tags,@route_tags,@source_tier,@source_rationale,@latitude,@longitude,@location_label,@reported_summary,@summary_provenance,@observed_impact,@analyst_inference,@monitor_next,@map_expires_at,1) ON CONFLICT(source_url) DO UPDATE SET cluster_key=excluded.cluster_key,collected_at=excluded.collected_at,materiality_score=MAX(news_events.materiality_score,excluded.materiality_score),source_tier=excluded.source_tier,source_rationale=excluded.source_rationale,country_tags=excluded.country_tags,route_tags=excluded.route_tags,latitude=excluded.latitude,longitude=excluded.longitude,location_label=excluded.location_label,map_expires_at=excluded.map_expires_at,active=1`);
let stored=0;
for(const a of articles){
  const text=`${a.title||""} ${a.description||""}`,tags=Object.entries(commodities).filter(([,rx])=>rx.test(text)).map(([x])=>x),type=Object.entries(types).find(([,rx])=>rx.test(text))?.[0]||"other",loc=locations.find(([rx])=>rx.test(text));
  const tier=sourceTier(a.domain),scoreBoost=tier===1?16:tier===2?8:0;
  let score=16+(tags.length?18:0)+(type!=="other"?16:0)+(loc?16:0)+(/port|terminal|vessel|ship|rail|pipeline|mine|refinery|smelter|inventory|production|capacity/i.test(text)?12:0)+(/close|halt|suspend|kill|damage|capacity|ton|barrel|export|guidance|tariff/i.test(text)?10:0)+scoreBoost;score=Math.min(100,score);
  if(score<50||!a.url||!a.title)continue;
  const id=`news-${createHash("sha1").update(a.url).digest("hex").slice(0,14)}`,cluster_key=createHash("sha1").update(`${type}|${loc?.[1]||"global"}|${tags.sort().join(",")}`).digest("hex").slice(0,12);
  const raw=String(a.seendate||"").replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,'$1-$2-$3T$4:$5:$6Z'),published=Number.isNaN(Date.parse(raw))?now.toISOString():new Date(raw).toISOString();
  const synopsis=String(a.description||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(),hasSynopsis=synopsis.length>90&&!synopsis.toLowerCase().includes(a.title.toLowerCase().slice(0,45));
  insert.run({id,cluster_key,headline:a.title,publisher:a.domain||a.sourcecountry||"Publisher",source_url:a.url,published_at:published,collected_at:now.toISOString(),event_type:type,severity:score>=85?"critical":score>=70?"high":"medium",materiality_score:score,commodity_tags:tags.join(", "),country_tags:loc?.[4]||"",route_tags:loc?.[5]||"",source_tier:tier,source_rationale:tier===1?"Primary institution or top-tier financial wire/publication":tier===2?"Specialist or established general-news source":"Discovery source; corroboration required",latitude:loc?.[3]??null,longitude:loc?.[2]??null,location_label:loc?.[1]||null,reported_summary:hasSynopsis?synopsis.slice(0,420):"A meaningful factual summary is pending source review.",summary_provenance:hasSynopsis?"source-provided synopsis":"summary pending review",observed_impact:impacts[type],analyst_inference:inferences[type],monitor_next:"Confirm with a primary source or second credible report; monitor throughput, vessel calls, prices, freight and inventories as applicable.",map_expires_at:loc?expires:null});stored++;
}
db.prepare("UPDATE news_events SET active=0 WHERE map_expires_at IS NOT NULL AND datetime(map_expires_at) < datetime('now')").run();
console.log(`Morning pull complete: ${articles.length} scanned, ${stored} relevant candidates stored.`);
db.pragma("wal_checkpoint(TRUNCATE)");
db.close();
