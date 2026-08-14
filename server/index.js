import express from "express";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { getFxRate, getQuote, tryLive } from "./market.js";

const here = dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here, "schema.sql"), "utf8"));
for(const [name,definition] of [["source_tier","INTEGER NOT NULL DEFAULT 3"],["source_rationale","TEXT"],["summary_provenance","TEXT NOT NULL DEFAULT 'summary pending review'"]])if(!db.prepare("PRAGMA table_info(news_events)").all().some(x=>x.name===name))db.exec(`ALTER TABLE news_events ADD COLUMN ${name} ${definition}`);
const app = express();
app.use(express.json());

const newsTokens=text=>new Set(String(text||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(x=>x.length>3&&!new Set(["with","from","that","this","after","amid","over","into","says","report","news"]).has(x)));
const newsSimilarity=(a,b)=>{const left=newsTokens(a),right=newsTokens(b),shared=[...left].filter(x=>right.has(x)).length;return shared/Math.max(1,Math.min(left.size,right.size))};
const editorialCorroboration=headline=>/grain terminals|novorossiysk/i.test(headline)?[{publisher:"AP",url:"https://apnews.com/article/9eadff0d7590923e3d98c99e2b61150b",tier:1}]:/red sea|houthi/i.test(headline)?[{publisher:"AP",url:"https://apnews.com/article/29115cc1fbc209ed4be2d2f80eabc1bf",tier:1}]:/panama canal/i.test(headline)?[{publisher:"Bloomberg",url:"https://www.bloomberg.com/news/articles/2026-04-16/panama-canal-traffic-jam-spurs-4-million-line-jumping-payment",tier:1},{publisher:"Lloyd's List",url:"https://www.lloydslist.com/LL1156994/Hormuz-crisis-drives-up-Panama-Canal-delays-and-auction-prices",tier:2}]:[];
const clusterNews=rows=>{const clusters=[];for(const row of rows){const match=clusters.find(c=>(c.location_label&&c.location_label===row.location_label&&c.event_type===row.event_type)||((c.event_type===row.event_type||c.location_label===row.location_label)&&newsSimilarity(c.headline,row.headline)>=.42));if(match){match.related_reports=(match.related_reports||1)+1;match.corroborating_reports=[...(match.corroborating_reports||[]),{publisher:row.publisher,url:row.source_url,tier:row.source_tier}].filter((x,i,a)=>a.findIndex(y=>y.publisher===x.publisher)===i);if(Number(row.source_tier)<Number(match.source_tier)){const score=Math.max(Number(match.materiality_score),Number(row.materiality_score)),reports=match.corroborating_reports;Object.assign(match,{...row,materiality_score:score,severity:score>=85?'critical':score>=70?'high':'medium',related_reports:match.related_reports,corroborating_reports:reports})}}else clusters.push({...row,related_reports:1,corroborating_reports:[{publisher:row.publisher,url:row.source_url,tier:row.source_tier}]})}return clusters.map(cluster=>({...cluster,corroborating_reports:[...editorialCorroboration(cluster.headline),...(cluster.corroborating_reports||[])].filter((x,i,a)=>a.findIndex(y=>y.publisher===x.publisher)===i).sort((a,b)=>Number(a.tier||3)-Number(b.tier||3))}))};

app.get("/api/news/morning", (_req,res)=>{
  db.prepare("UPDATE news_events SET active=0 WHERE map_expires_at IS NOT NULL AND datetime(map_expires_at) < datetime('now')").run();
  const rows=db.prepare(`SELECT * FROM news_events WHERE active=1 AND review_status!='rejected' AND materiality_score>=58 AND datetime(published_at)>=datetime('now','-72 hours') ORDER BY materiality_score DESC,published_at DESC`).all();
  const clustered=clusterNews(rows),freshCutoff=Date.now()-36*3600e3,fresh=clustered.filter(x=>new Date(x.published_at).getTime()>=freshCutoff),reserve=clustered.filter(x=>new Date(x.published_at).getTime()<freshCutoff),brief=[...fresh,...reserve].slice(0,3);
  const map_events=clustered.filter(x=>x.latitude!=null&&x.longitude!=null&&x.map_expires_at&&new Date(x.map_expires_at)>new Date()).slice(0,12);
  res.json({generated_at:new Date().toISOString(),review_required:brief.some(x=>x.review_status==='candidate'),brief,map_events});
});

app.get("/api/news/review",(req,res)=>{const rows=db.prepare(`SELECT * FROM news_events WHERE active=1 AND review_status!='rejected' ORDER BY materiality_score DESC,published_at DESC LIMIT 80`).all(),excludedIds=new Set(String(req.query.exclude||'').split(',').filter(Boolean)),featured=rows.filter(x=>excludedIds.has(x.id)),sameFeatured=item=>featured.some(top=>item.id===top.id||item.source_url===top.source_url||(item.cluster_key&&item.cluster_key===top.cluster_key)||(((item.location_label&&item.location_label===top.location_label)||item.event_type===top.event_type)&&newsSimilarity(item.headline,top.headline)>=.5));res.json(clusterNews(rows).filter(item=>!sameFeatured(item)))});
app.patch("/api/news/review/:id",(req,res)=>{const {status,reported_summary,summary_provenance}=req.body||{};if(status&&!['candidate','reviewed','published','rejected'].includes(status))return res.status(400).json({error:'Invalid review status'});if(!status&&!reported_summary)return res.status(400).json({error:'No review update supplied'});const result=db.prepare(`UPDATE news_events SET review_status=COALESCE(?,review_status),reported_summary=COALESCE(?,reported_summary),summary_provenance=COALESCE(?,summary_provenance),last_verified_at=? WHERE id=?`).run(status||null,reported_summary||null,summary_provenance||null,new Date().toISOString(),req.params.id);if(!result.changes)return res.status(404).json({error:'Event not found'});res.json({ok:true,id:req.params.id,status:status||'summary updated'})});

app.get("/api/atlas", (_req, res) => {
  const assets = db.prepare(`
    SELECT a.*, c.name country, c.iso3, co.name company, m.name commodity, m.color,
      sp.crude_steel_capacity_mtpa,sp.actual_production_mt,spf.production_route,
      spf.iron_ore_source,spf.coal_or_scrap_source,spf.downstream_sectors,spf.transition_project
    FROM assets a JOIN countries c ON c.id=a.country_id
    LEFT JOIN companies co ON co.id=a.company_id
    LEFT JOIN commodities m ON m.id=a.commodity_id
    LEFT JOIN steel_plant_details sp ON sp.asset_id=a.id
    LEFT JOIN steel_plant_profiles spf ON spf.asset_id=a.id ORDER BY a.name
  `).all();
  const flows = db.prepare(`
    SELECT f.*, oc.name origin, oc.longitude origin_lng, oc.latitude origin_lat,
      dc.name destination, dc.longitude destination_lng, dc.latitude destination_lat,
      m.name commodity, m.color
    FROM trade_flows f JOIN countries oc ON oc.id=f.origin_country_id
    JOIN countries dc ON dc.id=f.destination_country_id
    JOIN commodities m ON m.id=f.commodity_id ORDER BY f.volume DESC
  `).all();
  const countries = db.prepare(`
    SELECT c.*, COUNT(DISTINCT a.id) asset_count
    FROM countries c LEFT JOIN assets a ON a.country_id=c.id GROUP BY c.id ORDER BY c.name
  `).all();
  const countryObservations = db.prepare(`SELECT o.*, c.name country, s.title source_title, s.url source_url,
      om.data_status FROM observations o JOIN countries c ON c.id=o.entity_id
      LEFT JOIN sources s ON s.id=o.source_id LEFT JOIN observation_metadata om ON om.observation_id=o.id
      WHERE o.entity_type='country' ORDER BY c.name, o.metric, o.period DESC`).all();
  const profiles = countries.map(country => {
    const seen=new Set();
    const metrics=countryObservations.filter(o=>o.entity_id===country.id && !seen.has(o.metric) && seen.add(o.metric));
    const allExports=flows.filter(f=>f.origin_country_id===country.id && f.commodity_id==='iron-ore');
    const allImports=flows.filter(f=>f.destination_country_id===country.id && f.commodity_id==='iron-ore');
    const exportYear=Math.max(...allExports.map(f=>f.year),0), importYear=Math.max(...allImports.map(f=>f.year),0);
    const exports=allExports.filter(f=>f.year===exportYear), imports=allImports.filter(f=>f.year===importYear);
    const exportTotal=exports.reduce((sum,f)=>sum+Number(f.volume),0);
    const importTotal=imports.reduce((sum,f)=>sum+Number(f.volume),0);
    return {...country, metrics,
      top_exports: exports.slice(0,4).map(f=>({...f,share_pct:exportTotal?100*Number(f.volume)/exportTotal:0})),
      top_imports: imports.slice(0,4).map(f=>({...f,share_pct:importTotal?100*Number(f.volume)/importTotal:0})),
    };
  });
  const systemMetrics=db.prepare(`SELECT o.*, COALESCE(m.name,p.name) entity_name, s.title source_title,
    om.data_status FROM observations o LEFT JOIN commodities m ON o.entity_type='commodity' AND m.id=o.entity_id
    LEFT JOIN products p ON o.entity_type='product' AND p.id=o.entity_id LEFT JOIN sources s ON s.id=o.source_id
    LEFT JOIN observation_metadata om ON om.observation_id=o.id
    WHERE o.id IN ('io-production-cr3-2024','io-export-cr3-2024')`).all();
  const supplyLinks=db.prepare(`SELECT r.*,s.title source_title,s.url source_url,
    COALESCE(sa.name,sc.name) origin,COALESCE(sa.longitude,sc.longitude) origin_lng,COALESCE(sa.latitude,sc.latitude) origin_lat,
    COALESCE(oa.name,oc.name) destination,COALESCE(oa.longitude,oc.longitude) destination_lng,COALESCE(oa.latitude,oc.latitude) destination_lat
    FROM entity_relationships r
    LEFT JOIN assets sa ON r.subject_type='asset' AND sa.id=r.subject_id LEFT JOIN countries sc ON r.subject_type='country' AND sc.id=r.subject_id
    LEFT JOIN assets oa ON r.object_type='asset' AND oa.id=r.object_id LEFT JOIN countries oc ON r.object_type='country' AND oc.id=r.object_id
    LEFT JOIN sources s ON s.id=r.source_id
    WHERE r.relationship_type IN ('served_by_port','documented_ore_source_for','domestic_ore_system_for','illustrative_gateway_to')
    ORDER BY r.relationship_type,r.id`).all();
  const companyHubs=db.prepare(`SELECT co.id,co.name,co.industry,co.ownership,c.name country,cp.*,
    o.value crude_steel_production_mt,o.period production_period
    FROM company_profiles cp JOIN companies co ON co.id=cp.company_id LEFT JOIN countries c ON c.id=co.country_id
    LEFT JOIN observations o ON o.entity_type='company' AND o.entity_id=co.id AND o.metric='crude_steel_production'
    ORDER BY o.value DESC,co.name`).all().map(x=>({...x,entity_type:'company'}));
  const companySupplyLinks=supplyLinks.filter(l=>['documented_ore_source_for','domestic_ore_system_for'].includes(l.relationship_type)).map(l=>{
    const plant=assets.find(a=>a.id===l.object_id),hub=companyHubs.find(h=>h.id===plant?.company_id);
    return hub?{...l,id:`company-${l.id}`,destination:hub.name,destination_lng:hub.longitude,destination_lat:hub.latitude,object_type:'company',object_id:hub.id,evidence_scope:'representative_plant'}:null;
  }).filter(Boolean);
  const steelProductFlows=db.prepare(`SELECT f.*,oc.name origin,oc.longitude origin_lng,oc.latitude origin_lat,
    dc.name destination,dc.longitude destination_lng,dc.latitude destination_lat,s.title source_title,s.url source_url,
    CASE f.hs_code WHEN '7208' THEN '#e8743b' WHEN '7210' THEN '#d8a04e' WHEN '7207' THEN '#8d72cc' WHEN '7214' THEN '#4fb6a8' ELSE '#5f8fd3' END color
    FROM steel_product_trade_flows f JOIN countries oc ON oc.id=f.origin_country_id
    JOIN countries dc ON dc.id=f.destination_country_id LEFT JOIN sources s ON s.id=f.source_id
    ORDER BY f.hs_code,f.volume_mt DESC`).all().map(f=>({...f,volume:f.volume_mt,unit:'Mt'}));
  const shippingRoutes=db.prepare(`SELECT r.*,oa.name origin,oa.longitude origin_lng,oa.latitude origin_lat,
    da.name destination,da.longitude destination_lng,da.latitude destination_lat,m.name commodity,
    COALESCE(rp.cargo_label,m.name) cargo_label,COALESCE(rp.route_status,'documented benchmark route') route_status,
    COALESCE(rp.volume_status,CASE WHEN r.annual_volume IS NULL THEN 'not collected' ELSE 'reported or route-specific' END) volume_status,
    rp.methodology,rp.color,s.title source_title,s.url source_url,ve.central_mtpa,ve.low_mtpa,ve.high_mtpa,
    ve.estimate_status,ve.basis estimate_basis
    FROM shipping_routes r JOIN assets oa ON oa.id=r.origin_asset_id JOIN assets da ON da.id=r.destination_asset_id
    LEFT JOIN commodities m ON m.id=r.commodity_id LEFT JOIN shipping_route_profiles rp ON rp.route_id=r.id
    LEFT JOIN sources s ON s.id=rp.source_id LEFT JOIN shipping_route_volume_estimates ve ON ve.route_id=r.id
    ORDER BY cargo_label,r.name`).all();
  const waypointRows=db.prepare(`SELECT * FROM shipping_route_waypoints ORDER BY route_id,sequence_no`).all();
  shippingRoutes.forEach(r=>{r.waypoints=waypointRows.filter(w=>w.route_id===r.id);r.volume=r.central_mtpa||r.high_mtpa||1;r.unit='Mtpa estimate';r.is_shipping_route=true;});
  const chokepoints=db.prepare(`SELECT * FROM chokepoints ORDER BY annual_volume DESC,name`).all();
  const routeChokepoints=db.prepare(`SELECT rc.*,cp.name chokepoint_name FROM route_chokepoints rc JOIN chokepoints cp ON cp.id=rc.chokepoint_id ORDER BY rc.route_id,rc.sequence_no`).all();
  const disruptionScenarios=db.prepare(`SELECT ds.*,cp.name chokepoint_name,s.title source_title,s.url source_url
    FROM route_disruption_scenarios ds JOIN chokepoints cp ON cp.id=ds.chokepoint_id
    LEFT JOIN sources s ON s.id=ds.source_id ORDER BY cp.name,ds.route_id`).all().map(s=>({...s,alternative_waypoints:JSON.parse(s.alternative_waypoints_json)}));
  res.json({ assets, flows, shipping_routes:shippingRoutes, chokepoints, route_chokepoints:routeChokepoints, disruption_scenarios:disruptionScenarios, steel_product_flows:steelProductFlows, supply_links:supplyLinks, company_hubs:companyHubs, company_supply_links:companySupplyLinks, countries, country_profiles: profiles, system_metrics:systemMetrics.filter(m=>m.metric!=='company_cr10') });
});

app.get("/api/assets/:id", (req, res) => {
  const asset = db.prepare(`SELECT a.*, c.name country, co.name company, m.name commodity, m.color
    FROM assets a JOIN countries c ON c.id=a.country_id LEFT JOIN companies co ON co.id=a.company_id
    LEFT JOIN commodities m ON m.id=a.commodity_id WHERE a.id=?`).get(req.params.id);
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const observations = db.prepare(`SELECT o.*, s.title source_title, s.url source_url, s.publisher
    FROM observations o LEFT JOIN sources s ON s.id=o.source_id
    WHERE o.entity_type='asset' AND o.entity_id=? ORDER BY o.period DESC`).all(req.params.id);
  res.json({ ...asset, observations });
});

app.get("/api/countries/:id", (req, res) => {
  const country = db.prepare("SELECT * FROM countries WHERE id=?").get(req.params.id);
  if (!country) return res.status(404).json({ error: "Country not found" });
  const assets = db.prepare(`SELECT a.*, m.name commodity, m.color FROM assets a
    LEFT JOIN commodities m ON m.id=a.commodity_id WHERE a.country_id=? ORDER BY a.name`).all(req.params.id);
  const observations = db.prepare(`SELECT o.*, s.title source_title, s.url source_url FROM observations o
    LEFT JOIN sources s ON s.id=o.source_id WHERE o.entity_type='country' AND o.entity_id=? ORDER BY o.period DESC`).all(req.params.id);
  res.json({ ...country, assets, observations });
});

app.get("/api/health", (_req, res) => {const news=db.prepare("SELECT MAX(published_at) latest_published_at,MAX(collected_at) latest_collected_at,COUNT(*) news_rows FROM news_events").get();res.json({ok:true,commit:process.env.RENDER_GIT_COMMIT||process.env.GITHUB_SHA||"local",...news})});

app.get("/api/directory", (_req, res) => {
  const count = table => db.prepare(`SELECT COUNT(*) count FROM ${table}`).get().count;
  const questions = db.prepare(`SELECT q.*, a.verdict, a.answer_summary, a.mechanism, a.caveats, a.updated_at, a.source_ids
    FROM research_questions q LEFT JOIN research_answers a ON a.research_question_id=q.id
    ORDER BY q.display_order, q.question`).all();
  const answerMetric = db.prepare(`SELECT m.*, s.title source_title, s.url source_url
    FROM research_answer_metrics m LEFT JOIN sources s ON s.id=m.source_id
    WHERE m.research_question_id=? ORDER BY m.display_order, m.label`);
  questions.forEach(q => { q.answer_metrics = answerMetric.all(q.id); });
  res.json({
    counts: {
      countries: count("countries"), commodities: count("commodities"), companies: count("companies"),
      assets: count("assets"), trade_flows: count("trade_flows"), products: count("products"),
      policies: count("policies"), events: count("events"), concepts: count("concepts"),
      sources: count("sources"), metrics: count("metric_definitions"), questions: count("research_questions"),
    },
    countries: db.prepare(`SELECT c.*, COUNT(DISTINCT a.id) asset_count FROM countries c LEFT JOIN assets a ON a.country_id=c.id GROUP BY c.id ORDER BY c.name`).all(),
    commodities: db.prepare(`SELECT m.*, COUNT(DISTINCT a.id) asset_count, COUNT(DISTINCT f.id) flow_count FROM commodities m LEFT JOIN assets a ON a.commodity_id=m.id LEFT JOIN trade_flows f ON f.commodity_id=m.id GROUP BY m.id ORDER BY m.name`).all(),
    companies: db.prepare(`SELECT co.*, c.name country, COUNT(DISTINCT a.id) asset_count FROM companies co LEFT JOIN countries c ON c.id=co.country_id LEFT JOIN assets a ON a.company_id=co.id GROUP BY co.id ORDER BY co.name`).all(),
    products: db.prepare("SELECT * FROM products ORDER BY processing_stage, name").all(),
    transformations: db.prepare(`SELECT t.*, i.name input_name, o.name output_name FROM transformations t JOIN products i ON i.id=t.input_product_id JOIN products o ON o.id=t.output_product_id ORDER BY t.id`).all(),
    metrics: db.prepare("SELECT * FROM metric_definitions ORDER BY name").all(),
    questions,
    policies: db.prepare("SELECT p.*, c.name country FROM policies p LEFT JOIN countries c ON c.id=p.country_id ORDER BY effective_date DESC").all(),
  });
});

app.get("/api/companies/:id/finance", (req,res)=>{
  const company=db.prepare(`SELECT co.*,c.name country FROM companies co LEFT JOIN countries c ON c.id=co.country_id WHERE co.id=?`).get(req.params.id);
  if(!company)return res.status(404).json({error:"Company not found"});
  const metrics=db.prepare(`SELECT m.*,s.title source_title,s.url source_url FROM company_financial_metrics m LEFT JOIN sources s ON s.id=m.source_id WHERE m.company_id=? ORDER BY m.period DESC,m.metric`).all(req.params.id);
  const exposures=db.prepare(`SELECT e.*,s.title source_title,s.url source_url FROM company_finance_exposures e LEFT JOIN sources s ON s.id=e.source_id WHERE e.company_id=? ORDER BY e.category,e.factor`).all(req.params.id);
  const factors=db.prepare(`SELECT f.*,s.title source_title,s.url source_url FROM company_investment_factors f LEFT JOIN sources s ON s.id=f.source_id WHERE f.company_id=? ORDER BY CASE f.factor_type WHEN 'debate' THEN 0 WHEN 'catalyst' THEN 1 ELSE 2 END,f.title`).all(req.params.id);
  const pitch=db.prepare(`SELECT * FROM company_stock_pitches WHERE company_id=?`).get(req.params.id)||null;
  const pitch_scenarios=db.prepare(`SELECT * FROM company_pitch_scenarios WHERE company_id=? ORDER BY CASE scenario WHEN 'Bull' THEN 0 WHEN 'Base' THEN 1 ELSE 2 END`).all(req.params.id);
  const pitch_kpis=db.prepare(`SELECT * FROM company_pitch_kpis WHERE company_id=?`).all(req.params.id);
  const equity_research=db.prepare(`SELECT r.*,s.url source_url FROM company_equity_research r LEFT JOIN sources s ON s.id=r.source_id WHERE r.company_id=? ORDER BY r.report_date DESC`).all(req.params.id);
  const assets=db.prepare(`SELECT a.*,c.name country,m.name commodity FROM assets a JOIN countries c ON c.id=a.country_id LEFT JOIN commodities m ON m.id=a.commodity_id WHERE a.company_id=? ORDER BY a.asset_type,a.name`).all(req.params.id);
  const sources=db.prepare(`SELECT DISTINCT s.* FROM sources s WHERE s.id IN (SELECT source_id FROM company_financial_metrics WHERE company_id=? UNION SELECT source_id FROM company_finance_exposures WHERE company_id=? UNION SELECT source_id FROM company_investment_factors WHERE company_id=?)`).all(req.params.id,req.params.id,req.params.id);
  res.json({company,metrics,exposures,factors,pitch,pitch_scenarios,pitch_kpis,equity_research,assets,sources,coverage:{valuation:"scenario model",consensus:"connected · dated",contracts:"partial disclosure",hedges:"partial disclosure"},coverage_detail:[
    {key:"consensus",status:"CONNECTED · DATED",headline:"FY2026E: RMB927.6bn revenue · RMB41.9bn net profit",detail:"Bloomberg consensus reproduced by CMB International on 29 April 2026. This is a dated snapshot, not a live consensus feed.",source_url:"https://pdf.dfcfw.com/pdf/H3_AP202604291821724116_1.pdf"},
    {key:"contracts",status:"PARTIAL",headline:"Commercial terms remain a research gap",detail:"BYD discloses supplier/customer balances and selected commitments, but the Atlas does not yet have systematic contract duration, indexation, volume commitments, or commodity pass-through terms.",source_url:"https://www.chinamoney.com.cn/chinese/cwbg/20260330/3307255.html"},
    {key:"hedges",status:"PARTIAL",headline:"Derivative P&L visible; hedge coverage is not",detail:"Q1 2026 disclosed fair-value losses on derivatives and an FX-driven finance-cost swing. Notional amounts, hedge ratios, maturities, counterparties, and commodity coverage still require note-level extraction.",source_url:"https://www.bydglobal.com/sites/Satellite/BYD%20PDF%20Viewer?blobcol=urldata&blobheader=application%2Fpdf&blobkey=id&blobtable=MungoBlobs&blobwhere=1638928524585&ssbinary=true"}
  ]});
});

app.get("/api/market/fx", async (req, res) => {
  const from = String(req.query.from || "CNY").toUpperCase();
  const to = String(req.query.to || "HKD").toUpperCase();
  res.json(await tryLive(getFxRate(from, to)));
});

app.get("/api/market/quote", async (req, res) => {
  const symbol = String(req.query.symbol || "");
  if (!symbol) return res.status(400).json({ live: false, error: "symbol required" });
  res.json(await tryLive(getQuote(symbol)));
});

app.get("/api/chains/iron-ore", (_req, res) => {
  const productIds = ["iron-ore-product","iron-ore-fines","iron-ore-lump","iron-ore-concentrate","pellet","sinter","pig-iron","crude-steel","hrc"];
  const placeholders = productIds.map(()=>"?").join(",");
  const auditMetrics=['iron_ore_production','global_iron_ore_production_share','iron_ore_exports','iron_ore_imports','iron_ore_apparent_consumption','iron_ore_import_dependency','iron_ore_export_dependence','china_trade_exposure'];
  const auditRows=db.prepare(`SELECT c.id,c.name,o.metric,o.value FROM countries c LEFT JOIN observations o
    ON o.entity_type='country' AND o.entity_id=c.id AND o.metric IN (${auditMetrics.map(()=>'?').join(',')})
    WHERE EXISTS (SELECT 1 FROM observations x WHERE x.entity_type='country' AND x.entity_id=c.id AND x.metric='iron_ore_production')`).all(...auditMetrics);
  const auditCountries=[...new Map(auditRows.map(r=>[r.id,{id:r.id,name:r.name,metrics:new Map()}])).values()];
  auditRows.forEach(r=>r.metric&&auditCountries.find(c=>c.id===r.id).metrics.set(r.metric,r.value));
  const presentationAudit=auditCountries.map(c=>{
    const required=['iron_ore_production','global_iron_ore_production_share','iron_ore_exports','iron_ore_imports','iron_ore_apparent_consumption'];
    if(Number(c.metrics.get('iron_ore_production'))>0) required.push('iron_ore_export_dependence');
    if(Number(c.metrics.get('iron_ore_apparent_consumption'))>0) required.push('iron_ore_import_dependency');
    if(Number(c.metrics.get('iron_ore_export_dependence'))>=20 && Number(c.metrics.get('iron_ore_exports'))>=5) required.push('china_trade_exposure');
    const missing=required.filter(m=>!c.metrics.has(m));
    return {id:c.id,name:c.name,complete_fields:required.length-missing.length,total_fields:required.length,coverage_pct:Math.round(100*(required.length-missing.length)/required.length),missing};
  }).sort((a,b)=>b.coverage_pct-a.coverage_pct||a.name.localeCompare(b.name));
  res.json({
    id: "iron-ore", name: "Iron Ore to Steel", status: "active",
    products: db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`).all(...productIds),
    transformations: db.prepare(`SELECT t.*, i.name input_name, o.name output_name FROM transformations t JOIN products i ON i.id=t.input_product_id JOIN products o ON o.id=t.output_product_id WHERE t.input_product_id IN (${placeholders}) OR t.output_product_id IN (${placeholders}) ORDER BY t.id`).all(...productIds,...productIds),
    observations: db.prepare(`SELECT o.*, COALESCE(c.name,m.name,p.name,a.name,co.name) entity_name, s.title source_title, s.url source_url, s.publisher, om.data_status, om.vintage FROM observations o LEFT JOIN countries c ON o.entity_type='country' AND c.id=o.entity_id LEFT JOIN commodities m ON o.entity_type='commodity' AND m.id=o.entity_id LEFT JOIN products p ON o.entity_type='product' AND p.id=o.entity_id LEFT JOIN assets a ON o.entity_type='asset' AND a.id=o.entity_id LEFT JOIN companies co ON o.entity_type='company' AND co.id=o.entity_id LEFT JOIN sources s ON s.id=o.source_id LEFT JOIN observation_metadata om ON om.observation_id=o.id WHERE o.metric LIKE '%iron_ore%' OR o.metric IN ('pig_iron_production','crude_steel_production','oxygen_steel_share','global_production','global_exports') ORDER BY o.period DESC, o.metric, entity_name`).all(),
    concepts: db.prepare("SELECT c.*, s.title source_title, s.url source_url FROM concepts c LEFT JOIN sources s ON s.id=c.source_id WHERE c.id IN ('iron-ore-fines-concept','beneficiation','sintering','blast-furnace') ORDER BY c.term").all(),
    sources: db.prepare("SELECT * FROM sources WHERE id IN ('worldsteel-figures-2025','worldsteel-figures-2026','usgs-mcs-2025','aus-req-mar-2025','china-customs-dec-2025','rio-q4-2025','bhp-fy2025','fortescue-fy2025','vale-ar-2025','rio-wa-network','vale-logistics','un-comtrade-hs2601-2024','csn-c3-freight-1q25','csn-c3-freight-3q25','csn-c3-freight-4q25') ORDER BY publisher, publication_date DESC").all(),
    assets: db.prepare(`SELECT a.*, c.name country, co.name company, m.name commodity, m.color, md.grade_value, md.grade_unit, md.production_cost_value, md.production_cost_currency, md.rail_connection, p.name export_port FROM assets a JOIN countries c ON c.id=a.country_id LEFT JOIN companies co ON co.id=a.company_id LEFT JOIN commodities m ON m.id=a.commodity_id LEFT JOIN mine_details md ON md.asset_id=a.id LEFT JOIN assets p ON p.id=md.export_port_asset_id WHERE a.commodity_id='iron-ore' ORDER BY a.asset_type,a.name`).all(),
    regional_flows: db.prepare(`SELECT f.*, s.title source_title FROM regional_trade_flows f LEFT JOIN sources s ON s.id=f.source_id WHERE f.commodity_id='iron-ore' ORDER BY f.year DESC,f.volume DESC`).all(),
    bilateral_flows: db.prepare(`SELECT f.*, oc.name origin, dc.name destination, s.title source_title,
      f.value_usd / (f.volume * 1000000.0) unit_value_usd_per_t
      FROM trade_flows f JOIN countries oc ON oc.id=f.origin_country_id
      JOIN countries dc ON dc.id=f.destination_country_id LEFT JOIN sources s ON s.id=f.source_id
      WHERE f.commodity_id='iron-ore' AND f.hs_code='2601' ORDER BY f.year DESC,f.volume DESC`).all(),
    routes: db.prepare(`SELECT r.*, oa.name origin, da.name destination
      FROM shipping_routes r LEFT JOIN assets oa ON oa.id=r.origin_asset_id
      LEFT JOIN assets da ON da.id=r.destination_asset_id
      WHERE r.commodity_id='iron-ore' ORDER BY r.distance_nm`).all(),
    route_metrics: db.prepare(`SELECT rm.*, r.name route_name, s.title source_title, s.url source_url
      FROM shipping_route_metrics rm JOIN shipping_routes r ON r.id=rm.route_id
      LEFT JOIN sources s ON s.id=rm.source_id WHERE r.commodity_id='iron-ore'
      ORDER BY rm.year DESC, r.name, rm.metric`).all(),
    system_metrics: db.prepare(`SELECT o.*, COALESCE(m.name,p.name) entity_name, s.title source_title, om.data_status
      FROM observations o LEFT JOIN commodities m ON o.entity_type='commodity' AND m.id=o.entity_id
      LEFT JOIN products p ON o.entity_type='product' AND p.id=o.entity_id LEFT JOIN sources s ON s.id=o.source_id
      LEFT JOIN observation_metadata om ON om.observation_id=o.id
      WHERE o.id IN ('io-production-cr3-2024','io-export-cr3-2024') ORDER BY o.id`).all(),
    presentation_audit: presentationAudit,
    logistics_links: db.prepare(`SELECT er.*, sa.name subject_name, oa.name object_name, s.title source_title FROM entity_relationships er JOIN assets sa ON er.subject_type='asset' AND sa.id=er.subject_id JOIN assets oa ON er.object_type='asset' AND oa.id=er.object_id LEFT JOIN sources s ON s.id=er.source_id WHERE er.relationship_type='served_by_port' ORDER BY sa.name,oa.name`).all(),
  });
});

app.get("/api/chains/shipbuilding", (_req, res) => {
  const countryIds=['chn','kor','jpn'];
  const placeholders=countryIds.map(()=>'?').join(',');
  const observations=db.prepare(`SELECT o.*,c.name entity_name,s.title source_title,s.url source_url,om.data_status
    FROM observations o JOIN countries c ON c.id=o.entity_id LEFT JOIN sources s ON s.id=o.source_id
    LEFT JOIN observation_metadata om ON om.observation_id=o.id
    WHERE o.entity_type='country' AND o.entity_id IN (${placeholders}) AND
      (o.metric LIKE 'shipbuilding_%' OR o.metric IN ('global_shipbuilding_orderbook_share','global_shipbuilding_completion_share_gt','global_shipyard_capacity_share','active_shipyards','alternative_fuel_orderbook_share','alternative_fuel_delivery_specialization'))
    ORDER BY o.metric,o.value DESC`).all(...countryIds);
  const steelObservations=db.prepare(`SELECT o.*,s.title source_title,s.url source_url,om.data_status
    FROM observations o LEFT JOIN sources s ON s.id=o.source_id LEFT JOIN observation_metadata om ON om.observation_id=o.id
    WHERE o.entity_type='country' AND o.entity_id IN (${placeholders}) AND
      o.metric IN ('crude_steel_production','global_crude_steel_production_share','bof_capacity_share','eaf_capacity_share')
    ORDER BY o.period DESC`).all(...countryIds);
  const countries=countryIds.map(id=>{const country=db.prepare('SELECT * FROM countries WHERE id=?').get(id);return {...country,metrics:observations.filter(o=>o.entity_id===id),steel_metrics:steelObservations.filter(o=>o.entity_id===id)}});
  res.json({
    countries,
    observations,
    system_metrics:db.prepare(`SELECT o.*,s.title source_title,s.url source_url,om.data_status FROM observations o
      LEFT JOIN sources s ON s.id=o.source_id LEFT JOIN observation_metadata om ON om.observation_id=o.id
      WHERE o.entity_type='industry' AND o.entity_id='shipbuilding' ORDER BY o.metric`).all(),
    vessel_types:db.prepare(`SELECT st.*,s.title source_title,s.url source_url FROM ship_types st LEFT JOIN sources s ON s.id=st.source_id ORDER BY st.display_order`).all(),
    specializations:db.prepare(`SELECT sp.*,c.name country,st.name vessel_type,s.title source_title,s.url source_url
      FROM shipbuilding_specializations sp JOIN countries c ON c.id=sp.country_id JOIN ship_types st ON st.id=sp.ship_type_id
      LEFT JOIN sources s ON s.id=sp.source_id ORDER BY st.display_order,sp.position_score DESC,c.name`).all(),
    companies:db.prepare(`SELECT co.*,c.name country,COUNT(a.id) representative_yards FROM companies co
      JOIN countries c ON c.id=co.country_id LEFT JOIN assets a ON a.company_id=co.id AND a.asset_type='shipyard'
      WHERE co.industry='Shipbuilding' GROUP BY co.id ORDER BY c.name,co.name`).all(),
    yards:db.prepare(`SELECT a.*,c.name country,co.name company,m.color FROM assets a JOIN countries c ON c.id=a.country_id
      LEFT JOIN companies co ON co.id=a.company_id LEFT JOIN commodities m ON m.id=a.commodity_id
      WHERE a.asset_type='shipyard' ORDER BY c.name,a.name`).all(),
    steel_links:db.prepare(`SELECT l.*,sc.name steel_company,bc.name shipbuilder_company,c.name country,
      s.title source_title,s.url source_url FROM steel_shipbuilding_links l
      JOIN companies sc ON sc.id=l.steel_company_id LEFT JOIN companies bc ON bc.id=l.shipbuilder_company_id
      LEFT JOIN countries c ON c.id=l.country_id LEFT JOIN sources s ON s.id=l.source_id
      ORDER BY CASE l.data_status WHEN 'documented' THEN 1 ELSE 2 END,l.country_id`).all(),
    routes:db.prepare(`SELECT r.*,oa.name origin,da.name destination,COALESCE(rp.cargo_label,m.name) cargo_label,
      COALESCE(rp.route_status,'documented benchmark route') route_status,COALESCE(rp.volume_status,'not collected') volume_status,
      rp.methodology,rp.color,s.title source_title,s.url source_url FROM shipping_routes r LEFT JOIN assets oa ON oa.id=r.origin_asset_id
      LEFT JOIN assets da ON da.id=r.destination_asset_id LEFT JOIN commodities m ON m.id=r.commodity_id
      LEFT JOIN shipping_route_profiles rp ON rp.route_id=r.id LEFT JOIN sources s ON s.id=rp.source_id
      ORDER BY cargo_label,r.vessel_class,r.distance_nm`).all(),
    sources:db.prepare(`SELECT * FROM sources WHERE id IN ('oecd-uk-shipbuilding-2026','unctad-rmt-2025-ch2','imo-ship-types','imabari-company-2026','oecd-maritime-decarbonisation-2025','oecd-korea-shipbuilding-2026','posco-step-hyundai-2017','nippon-imabari-nsafe-2015','arcelormittal-shipbuilding-offer','oecd-shipbuilding-headline-2025','unctad-shipbuilding-2025') ORDER BY publisher`).all()
  });
});

app.get("/api/chains/steel", (_req,res)=>{
  const productIds=['coking-coal','met-coke','iron-ore-product','pellet','steel-scrap','dri','pig-iron','crude-steel','slab','billet','hrc','plate','rebar','wire-rod','automotive-sheet'];
  const placeholders=productIds.map(()=>'?').join(',');
  const observations=db.prepare(`SELECT o.*,COALESCE(c.name,p.name,co.name) entity_name,s.title source_title,s.url source_url,
    om.data_status FROM observations o LEFT JOIN countries c ON o.entity_type='country' AND c.id=o.entity_id
    LEFT JOIN products p ON o.entity_type='product' AND p.id=o.entity_id LEFT JOIN companies co ON o.entity_type='company' AND co.id=o.entity_id
    LEFT JOIN sources s ON s.id=o.source_id LEFT JOIN observation_metadata om ON om.observation_id=o.id
    WHERE o.metric IN ('crude_steel_production','global_crude_steel_production_share','oxygen_steel_share','electric_steel_share','other_steel_share','apparent_steel_use','steel_use_global_share','pig_iron_production','ore_based_steel_proxy','global_production','global_apparent_steel_use','steel_capacity_concentration','steelmaking_capacity','bof_steelmaking_capacity','eaf_steelmaking_capacity','induction_steelmaking_capacity','integrated_steelmaking_capacity','nonintegrated_steelmaking_capacity','bof_capacity_share','eaf_capacity_share','steel_capacity_utilization_proxy','steel_exports','steel_imports','net_steel_exports','steel_export_intensity','steel_import_dependence','global_nominal_steelmaking_capacity','global_excess_steelmaking_capacity','global_steel_capacity_utilization','tracked_operating_steel_capacity')
    ORDER BY o.period DESC,o.metric,o.value DESC`).all();
  const countryRows=observations.filter(o=>o.entity_type==='country');
  const countryMap=new Map(); countryRows.forEach(o=>{if(!countryMap.has(o.entity_id))countryMap.set(o.entity_id,{id:o.entity_id,name:o.entity_name,metrics:[]});countryMap.get(o.entity_id).metrics.push(o)});
  const required=['crude_steel_production','global_crude_steel_production_share','steelmaking_capacity','steel_capacity_utilization_proxy','bof_capacity_share','eaf_capacity_share','steel_exports','steel_imports'];
  const audit=[...countryMap.values()].map(c=>{const present=new Set(c.metrics.map(m=>m.metric)),missing=required.filter(m=>!present.has(m));return {...c,coverage_pct:Math.round(100*(required.length-missing.length)/required.length),missing}}).sort((a,b)=>(b.metrics.find(x=>x.metric==='crude_steel_production')?.value||0)-(a.metrics.find(x=>x.metric==='crude_steel_production')?.value||0));
  res.json({id:'steel',name:'Steel',status:'active',
    products:db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`).all(...productIds),
    transformations:db.prepare(`SELECT t.*,i.name input_name,o.name output_name FROM transformations t JOIN products i ON i.id=t.input_product_id JOIN products o ON o.id=t.output_product_id WHERE t.input_product_id IN (${placeholders}) OR t.output_product_id IN (${placeholders}) ORDER BY t.id`).all(...productIds,...productIds),
    observations,
    product_trade_mix:db.prepare(`SELECT tm.*,c.name country,s.title source_title,s.url source_url
      FROM steel_product_trade_mix tm JOIN countries c ON c.id=tm.country_id
      LEFT JOIN sources s ON s.id=tm.source_id ORDER BY tm.year DESC,tm.share_pct DESC`).all(),
    bilateral_product_flows:db.prepare(`SELECT f.*,oc.name origin,dc.name destination,s.title source_title,s.url source_url
      FROM steel_product_trade_flows f JOIN countries oc ON oc.id=f.origin_country_id
      JOIN countries dc ON dc.id=f.destination_country_id LEFT JOIN sources s ON s.id=f.source_id
      ORDER BY f.hs_code,f.volume_mt DESC`).all(),
    countries:audit,
    companies:db.prepare(`SELECT co.*,c.name country,o.value crude_steel_production_mt,o.period,s.title source_title FROM companies co LEFT JOIN countries c ON c.id=co.country_id JOIN observations o ON o.entity_type='company' AND o.entity_id=co.id AND o.metric='crude_steel_production' LEFT JOIN sources s ON s.id=o.source_id ORDER BY o.value DESC`).all(),
    concepts:db.prepare("SELECT c.*,s.title source_title,s.url source_url FROM concepts c LEFT JOIN sources s ON s.id=c.source_id WHERE c.id IN ('basic-oxygen-furnace','electric-arc-furnace','direct-reduction','steel-capacity-v-production') ORDER BY c.term").all(),
    assets:db.prepare(`SELECT a.*,c.name country,co.name company,sp.crude_steel_capacity_mtpa,sp.actual_production_mt,sp.bf_bof_capacity_mtpa,sp.eaf_capacity_mtpa,sp.dri_capacity_mtpa,sp.coke_capacity_mtpa,sp.sinter_capacity_mtpa,sp.product_mix,sp.carbon_intensity_tco2_per_t,spf.production_route,spf.iron_ore_source,spf.coal_or_scrap_source,spf.downstream_sectors,spf.transition_project,s.title source_title,s.url source_url FROM assets a JOIN countries c ON c.id=a.country_id LEFT JOIN companies co ON co.id=a.company_id LEFT JOIN steel_plant_details sp ON sp.asset_id=a.id LEFT JOIN steel_plant_profiles spf ON spf.asset_id=a.id LEFT JOIN sources s ON s.id=spf.source_id WHERE a.asset_type='steel_plant' ORDER BY sp.crude_steel_capacity_mtpa DESC,a.name`).all(),
    sources:db.prepare("SELECT * FROM sources WHERE id IN ('worldsteel-figures-2026','gem-gist-jun-2026','oecd-steel-outlook-2026','smm-steel-annual-2025')").all(),
    system_metrics:observations.filter(o=>['world-steel-prod-2025','world-steel-use-2025','world-bof-share-2025','world-eaf-share-2025','world-oecd-steel-capacity-2025','world-oecd-excess-capacity-2025','world-oecd-cap-util-2025','world-gem-operating-capacity-2026'].includes(o.id)),
    china_link:observations.filter(o=>o.entity_id==='chn').concat(db.prepare(`SELECT o.*,s.title source_title,om.data_status FROM observations o LEFT JOIN sources s ON s.id=o.source_id LEFT JOIN observation_metadata om ON om.observation_id=o.id WHERE o.entity_type='country' AND o.entity_id='chn' AND o.metric LIKE 'iron_ore_%' ORDER BY o.period DESC`).all()),
  });
});

app.get("/api/chains/nickel", (_req,res)=>{
  const productIds=['nickel-ore','nickel-intermediate','class1-nickel','nickel-sulfate','cathode-active-material'];
  const placeholders=productIds.map(()=>'?').join(',');
  const observations=db.prepare(`SELECT o.*,c.name entity_name,s.title source_title,s.url source_url,om.data_status
    FROM observations o LEFT JOIN countries c ON o.entity_type='country' AND c.id=o.entity_id
    LEFT JOIN sources s ON s.id=o.source_id LEFT JOIN observation_metadata om ON om.observation_id=o.id
    WHERE o.metric IN ('global_nickel_mine_production','global_nickel_mine_production_share','nickel_mine_production')
    ORDER BY o.period DESC,o.value DESC`).all();
  res.json({id:'nickel',name:'Nickel',status:'active',
    products:db.prepare(`SELECT * FROM products WHERE id IN (${placeholders}) ORDER BY rowid`).all(...productIds),
    transformations:db.prepare(`SELECT t.*,i.name input_name,o.name output_name FROM transformations t JOIN products i ON i.id=t.input_product_id JOIN products o ON o.id=t.output_product_id WHERE t.input_product_id IN (${placeholders}) OR t.output_product_id IN (${placeholders}) ORDER BY t.id`).all(...productIds,...productIds),
    observations,
    countries:db.prepare(`SELECT DISTINCT c.*,o.value production_share,o.period,s.title source_title FROM observations o JOIN countries c ON c.id=o.entity_id LEFT JOIN sources s ON s.id=o.source_id WHERE o.metric='global_nickel_mine_production_share' ORDER BY o.value DESC`).all(),
    companies:db.prepare(`SELECT co.*,c.name country,COUNT(a.id) representative_assets FROM companies co LEFT JOIN countries c ON c.id=co.country_id LEFT JOIN assets a ON a.company_id=co.id WHERE co.industry LIKE 'Nickel%' GROUP BY co.id ORDER BY co.name`).all(),
    assets:db.prepare(`SELECT a.*,c.name country,co.name company,m.color FROM assets a JOIN countries c ON c.id=a.country_id LEFT JOIN companies co ON co.id=a.company_id LEFT JOIN commodities m ON m.id=a.commodity_id WHERE a.commodity_id='nickel' ORDER BY a.name`).all(),
    sources:db.prepare("SELECT * FROM sources WHERE id IN ('usgs-nickel-2026','insg-nickel-market-2025') ORDER BY publisher").all()
  });
});

app.get("/api/chains/battery", (_req,res)=>{
  const productIds=['nickel-sulfate','cathode-active-material','battery-cell','battery-pack'];
  const placeholders=productIds.map(()=>'?').join(',');
  const observations=db.prepare(`SELECT o.*,c.name entity_name,s.title source_title,s.url source_url,om.data_status
    FROM observations o LEFT JOIN countries c ON o.entity_type='country' AND c.id=o.entity_id
    LEFT JOIN sources s ON s.id=o.source_id LEFT JOIN observation_metadata om ON om.observation_id=o.id
    WHERE o.metric IN ('global_battery_cell_capacity','global_battery_cell_capacity_share','global_battery_cell_production_share','global_cathode_active_material_production_share','global_anode_active_material_production_share','representative_battery_assets')
    ORDER BY o.period DESC,o.value DESC`).all();
  res.json({id:'battery',name:'Batteries',status:'active',
    products:db.prepare(`SELECT * FROM products WHERE id IN (${placeholders}) ORDER BY rowid`).all(...productIds),
    transformations:db.prepare(`SELECT t.*,i.name input_name,o.name output_name FROM transformations t JOIN products i ON i.id=t.input_product_id JOIN products o ON o.id=t.output_product_id WHERE t.input_product_id IN (${placeholders}) OR t.output_product_id IN (${placeholders}) ORDER BY t.id`).all(...productIds,...productIds),
    observations,
    countries:db.prepare(`SELECT c.*,GROUP_CONCAT(o.metric||'='||o.value||' '||o.unit) metric_summary FROM countries c JOIN observations o ON o.entity_type='country' AND o.entity_id=c.id WHERE o.metric IN ('global_battery_cell_capacity_share','global_battery_cell_production_share','global_cathode_active_material_production_share','global_anode_active_material_production_share','representative_battery_assets') GROUP BY c.id ORDER BY MAX(o.value) DESC`).all(),
    companies:db.prepare(`SELECT co.*,c.name country,COUNT(a.id) representative_assets FROM companies co LEFT JOIN countries c ON c.id=co.country_id LEFT JOIN assets a ON a.company_id=co.id AND a.asset_type='battery_plant' WHERE co.industry IN ('EV and battery','Battery manufacturing') GROUP BY co.id ORDER BY co.name`).all(),
    assets:db.prepare(`SELECT a.*,c.name country,co.name company,m.color,bp.capacity_gwh,bp.chemistry,bp.cell_format FROM assets a JOIN countries c ON c.id=a.country_id LEFT JOIN companies co ON co.id=a.company_id LEFT JOIN commodities m ON m.id=a.commodity_id LEFT JOIN battery_plant_details bp ON bp.asset_id=a.id WHERE a.asset_type='battery_plant' ORDER BY a.name`).all(),
    sources:db.prepare("SELECT * FROM sources WHERE id IN ('iea-gevo-2026-batteries','iea-gevo-2026-manufacturing') ORDER BY title").all()
  });
});

app.get("/api/chains/ev", (_req,res)=>{
  const productIds=['automotive-sheet','battery-pack','electric-vehicle'];
  const placeholders=productIds.map(()=>'?').join(',');
  const observations=db.prepare(`SELECT o.*,c.name entity_name,s.title source_title,s.url source_url,om.data_status FROM observations o LEFT JOIN countries c ON o.entity_type='country' AND c.id=o.entity_id LEFT JOIN sources s ON s.id=o.source_id LEFT JOIN observation_metadata om ON om.observation_id=o.id WHERE o.metric IN ('global_ev_sales','global_ev_sales_share','global_ev_production','ev_sales','ev_sales_share','global_ev_production_share','ev_exports') ORDER BY o.period DESC,o.value DESC`).all();
  res.json({id:'ev',name:'Electric vehicles',status:'active',
    products:db.prepare(`SELECT * FROM products WHERE id IN (${placeholders}) ORDER BY rowid`).all(...productIds),
    transformations:db.prepare(`SELECT t.*,i.name input_name,o.name output_name FROM transformations t JOIN products i ON i.id=t.input_product_id JOIN products o ON o.id=t.output_product_id WHERE t.output_product_id='electric-vehicle' ORDER BY t.id`).all(),
    observations,
    countries:db.prepare(`SELECT c.*,GROUP_CONCAT(o.metric||'='||o.value||' '||o.unit) metric_summary FROM countries c JOIN observations o ON o.entity_type='country' AND o.entity_id=c.id WHERE o.metric IN ('ev_sales','ev_sales_share','global_ev_production_share','ev_exports') GROUP BY c.id ORDER BY MAX(CASE WHEN o.metric='ev_sales' THEN o.value ELSE 0 END) DESC`).all(),
    companies:db.prepare(`SELECT co.*,c.name country,COUNT(a.id) representative_assets FROM companies co LEFT JOIN countries c ON c.id=co.country_id LEFT JOIN assets a ON a.company_id=co.id AND a.asset_type='ev_plant' WHERE co.industry IN ('EV and battery','EV manufacturing') GROUP BY co.id ORDER BY co.name`).all(),
    assets:db.prepare(`SELECT a.*,c.name country,co.name company,m.color,ep.production_capacity_units,ep.actual_production_units,ep.vehicle_models,ep.powertrain_types,ep.battery_chemistry FROM assets a JOIN countries c ON c.id=a.country_id LEFT JOIN companies co ON co.id=a.company_id LEFT JOIN commodities m ON m.id=a.commodity_id LEFT JOIN ev_plant_details ep ON ep.asset_id=a.id WHERE a.asset_type='ev_plant' ORDER BY a.name`).all(),
    sources:db.prepare("SELECT * FROM sources WHERE id IN ('iea-gevo-2026','iea-gevo-2026-manufacturing','worldsteel-figures-2026') ORDER BY title").all()
  });
});
app.get("/api/chains/data-centers", (_req,res)=>{
  const evidence=db.prepare(`SELECT e.*,s.title source_title,s.publisher,s.url source_url FROM data_center_evidence e LEFT JOIN sources s ON s.id=e.source_id ORDER BY CASE e.geography WHEN 'United States' THEN 0 WHEN 'China' THEN 1 ELSE 2 END,e.theme,e.id`).all();
  const sources=db.prepare(`SELECT DISTINCT s.* FROM sources s JOIN data_center_evidence e ON e.source_id=s.id ORDER BY s.publisher,s.title`).all();
  res.json({id:"data-centers",name:"Data center construction",status:"hypothesis testing",evidence,sources});
});
const publicDir=resolve(here,"../dist");
if(existsSync(publicDir)){
  app.use(express.static(publicDir,{maxAge:"1h",etag:true}));
  app.get(/^(?!\/api\/).*/,(_req,res)=>res.sendFile(resolve(publicDir,"index.html")));
}
const port = Number(process.env.PORT || 8787);
app.listen(port,"0.0.0.0",() => console.log(`Atlas running on port ${port}`));
