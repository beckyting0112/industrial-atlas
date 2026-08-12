import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here=dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
  ["mng-rail-authority-launch-2025","Construction of the Cross-Border Railway at Gashuunsukhait–Ganqimod Border Launched","Railway Authority of Mongolia","https://en.railway.gov.mn/n/56","2025-06-15","2025","government","high","2026-08-11","Official project scope, construction timing, capacity and budget."],
  ["mng-rail-authority-contract-2025","Five Major Achievements in Mongolia’s Railway Sector","Railway Authority of Mongolia","https://en.railway.gov.mn/n/48","2025-06-05","2025","government","high","2026-08-11","Official disclosure of the 16-year, 247 Mt coal transport contract."],
  ["mng-rail-ministry-agreement-2025","Gashuunsukhait–Gantsmod intergovernmental railway agreement","Ministry of Road and Transport Development of Mongolia","https://mrt.gov.mn/i/4414","2025-02-18","2025","government","high","2026-08-11","Official agreement and initial broad-/standard-gauge capacity split."],
  ["china-eaf-policy-2024","2024–2025 Energy Conservation and Carbon Reduction Action Plan","State Council of China","https://big5.mee.gov.cn/gate/big5/www.mee.gov.cn/zcwj/gwywj/202405/t20240530_1074495.shtml","2024-05-29","2025 target","government_policy","high","2026-08-11","Official target for EAF share and scrap utilization."],
  ["china-resource-recycling-2024","Xi makes instruction on establishment of resource-recycling company","State Council of China / Xinhua","https://english.www.gov.cn/news/202410/18/content_WS67123c6bc6d0868f4e8ec0d0.html","2024-10-18","2024","government","high","2026-08-11","Official establishment and national-platform mandate for China Resources Recycling Group."],
  ["china-resource-recycling-scrap-2024","China Resources Recycling Group formally established","Zhejiang Economic Information Center / China Economic Net","https://zjic.zj.gov.cn/ywdh/nyhj/202410/t20241018_22942226.shtml","2024-10-25","2024","government_republication","medium-high","2026-08-11","Shareholders, business scope and stated 260 Mt annual scrap-steel utilization ambition."],
  ["china-scrap-industry-2025","Strengthening standardized management of the scrap-steel processing industry","Ministry of Industry and Information Technology of China","https://www.miit.gov.cn/jgsj/jns/zhlyh/art/2025/art_4ec399339ae6404cb343a3154204d377.html","2025-12-01","2021–2025","government","high","2026-08-11","Processing-enterprise coverage, average scrap ratio and cumulative resource effects."],
  ["worldsteel-figures-2025","World Steel in Figures 2025","World Steel Association","https://worldsteel.org/zh-hans/media/publications/world-steel-in-figures-2025/?do_download_id=51535995-e7c2-49d3-b0c3-690bfaba9b57","2025-06-01","2024","industry_association","high","2026-08-11","Country crude-steel production and process-route shares."],
];
const putSource=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)");
sources.forEach(x=>putSource.run(...x));

const putQuestion=db.prepare(`INSERT OR REPLACE INTO research_questions
 (id,question,theme,rationale,status,display_order) VALUES (?,?,?,?,?,?)`);
putQuestion.run("mongolia-china-rail","Will the Mongolia–China cross-border railway materially change coking-coal supply into China?","Primary research · mining and logistics","Test whether physical rail integration converts Mongolia’s resource advantage into reliable, scalable Chinese supply—and which indicators reveal slippage or market impact.","active",2);
putQuestion.run("china-eaf-transition","Can China’s EAF transition become economically competitive at scale?","Primary research · steel transition","Separate policy ambition and nameplate capacity from realized utilization, metallic-input economics, product capability and durable competitive advantage.","active",3);
db.prepare("UPDATE research_questions SET display_order=4 WHERE id='simandou-disruption'").run();
db.prepare("UPDATE research_questions SET display_order=5 WHERE id='battery-concentration'").run();
db.prepare("UPDATE research_questions SET display_order=6 WHERE id='suez-vulnerability'").run();

const putAnswer=db.prepare(`INSERT OR REPLACE INTO research_answers
 (research_question_id,verdict,answer_summary,mechanism,caveats,updated_at,source_ids)
 VALUES (?,?,?,?,?,?,?)`);
putAnswer.run(
  "mongolia-china-rail",
  "Potentially material, but execution—not announced capacity—is the investable variable.",
  "The Gashuunsukhait–Gantsmod connection closes a long-standing cross-border rail gap on Mongolia’s largest coal corridor. Official plans provide 40 Mtpa of rail capacity and a 24-month construction program, while a disclosed 16-year transport contract covers 247 Mt through 2041. The prospective supply effect is therefore credible, but should be underwritten through construction milestones, border throughput, realized rail volumes, Chinese coking-coal prices and inventories—not headline national export aspirations.",
  "Cross-border construction and commissioning → lower transshipment friction and more reliable deliveries → higher Mongolian landborne availability into northern China → pressure on marginal seaborne coking-coal demand and regional price differentials. The effect strengthens only when rail utilization and downstream demand validate nameplate capacity.",
  "Primary research included discussions with analysts and consultants, supplemented by coal-price, inventory and trade-flow tracking. Those conversations are anonymized and are not presented as independently verifiable facts. The 40 Mtpa project capacity, 247 Mt contract and broader export aspirations are different measures; none should be treated as immediate incremental supply. Timing, border operations, gauge transfer, mine output, contract execution and Chinese steel demand remain key risks.",
  "2026-08-11",
  JSON.stringify(["mng-rail-authority-launch-2025","mng-rail-authority-contract-2025","mng-rail-ministry-agreement-2025"])
);
putAnswer.run(
  "china-eaf-transition",
  "The transition is real, but economics and product capability are advancing more slowly than policy ambition.",
  "China’s 2024 EAF output share was 10.2%, below the policy ambition of 15% by end-2025. The constraint is not simply furnace construction: realized utilization depends on scrap purchase cost and quality, regional power economics, local support and downstream demand. Expert and company discussions indicated uneven utilization and concentration in rebar and other long products; competing in higher-grade flat or automotive steel requires cleaner metallics, tighter process control and customer qualification. China Resources Recycling Group may improve collection, standards and traceability, but its creation does not by itself make EAF steel cost competitive.",
  "Equipment replacement and an aging capital stock → larger obsolete-scrap pool → more formal collection, sorting and traceability → potentially lower and more consistent metallic-input cost → higher EAF utilization → broader product capability. Competitive convergence requires this chain to work alongside affordable low-carbon power and mill-level execution.",
  "Primary research comprised preparation, documentation and follow-up across roughly 10 expert and company conversations at two industry meetings, synthesized into a circa-30-slide assessment and a monitoring spreadsheet. The findings are directional and anonymized. Public data still do not provide a complete mill-level series for realized EAF utilization, scrap quality-adjusted spreads or subsidies; national installed capacity must not be used as a proxy for economic output.",
  "2026-08-11",
  JSON.stringify(["china-eaf-policy-2024","china-resource-recycling-2024","china-resource-recycling-scrap-2024","china-scrap-industry-2025","worldsteel-figures-2025"])
);

const putMetric=db.prepare(`INSERT OR REPLACE INTO research_answer_metrics
 (id,research_question_id,label,value,text_value,unit,period,data_status,source_id,methodology,display_order)
 VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
const metrics=[
  ["mng-method","mongolia-china-rail","Primary-research method",null,"Analyst and consultant discussions + market tracking",null,"Project work","qualitative",null,"Prepared questions, documented discussions and tracked coal prices, inventories and trade flows; participants anonymized.",1],
  ["mng-capacity","mongolia-china-rail","Cross-border design capacity",40,null,"Mtpa","planned","reported","mng-rail-authority-launch-2025","Official dual-gauge project capacity; not current throughput.",2],
  ["mng-build","mongolia-china-rail","Official construction period",24,null,"months","from June 2025 launch","reported","mng-rail-authority-launch-2025","Official schedule; milestone slippage should be monitored.",3],
  ["mng-contract","mongolia-china-rail","Contracted transport volume",247,null,"Mt","2025–2041","reported","mng-rail-authority-contract-2025","16-year contract; average implied volume is about 15.4 Mtpa, but annual delivery schedule was not disclosed.",4],
  ["mng-trackers","mongolia-china-rail","Key monitoring dashboard",null,"Milestones · border throughput · rail volumes · coal prices · inventories",null,"Monthly / event-driven","qualitative",null,"Leading indicators for separating construction progress from realized market impact.",5],
  ["eaf-method","china-eaf-transition","Primary-research method",null,"~10 expert/company discussions across two industry meetings",null,"Project work","qualitative",null,"Questions focused on utilization, scrap economics and quality, power, local support and product capability; findings anonymized.",1],
  ["eaf-share","china-eaf-transition","China EAF output share",10.2,null,"%","2024","reported","worldsteel-figures-2025","Share of crude steel produced using the electric route; output share, not capacity share.",2],
  ["eaf-target","china-eaf-transition","Policy ambition",15,null,"% of crude steel","end-2025 target","reported","china-eaf-policy-2024","Official aspiration, not an achieved or forecast result.",3],
  ["eaf-scrap-target","china-eaf-transition","Policy scrap-use ambition",300,null,"Mt","end-2025 target","reported","china-eaf-policy-2024","Official action-plan objective.",4],
  ["eaf-recyclers","china-eaf-transition","Approved scrap processors",968,null,"companies","2025","reported","china-scrap-industry-2025","Thirteen approved cohorts across 30 provincial-level regions; said to represent about 60% of social scrap resources by annual business volume.",5],
  ["eaf-group","china-eaf-transition","Central recycling platform",null,"China Resources Recycling Group",null,"established Oct 2024","reported","china-resource-recycling-2024","National platform mandate; operational impact must be tracked rather than assumed.",6],
  ["eaf-trackers","china-eaf-transition","Key monitoring dashboard",null,"Utilization · scrap spread/quality · power cost · product mix · policy support",null,"Monthly / quarterly","qualitative",null,"The variables most likely to show whether EAF capacity is economically competitive and moving beyond long products.",7],
];
metrics.forEach(x=>putMetric.run(...x));
console.log("Seeded Mongolia rail and China EAF primary-research cases.");
