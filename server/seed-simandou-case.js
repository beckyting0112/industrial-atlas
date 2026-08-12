import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const here=dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));

const sources=[
 ["rio-simandou-investment-2024","Conditions on Simandou investment now satisfied","Rio Tinto","https://www.riotinto.com/en/news/releases/2024/conditions-on-simandou-investment-now-satisfied","2024-07-16","2024","company_release","high","2026-08-07","Defines the two 60 Mtpa systems, shared 120 Mtpa infrastructure, ownership, logistics scope, capex and initial ramp plan."],
 ["rio-simandou-project-update-2025","Simandou key project update and first shipment","Rio Tinto","https://www.riotinto.com/en/invest/reports/annual-report/key-project-updates","2026-02-01","2025-2026","company_filing","high","2026-08-07","Reports first shipment in December 2025, commissioning sequence and the 30-month SimFer ramp."],
 ["rio-simandou-grade","Simandou: Khoun na Keli","Rio Tinto","https://www.riotinto.com/news/stories/simandou-khoun-na-keli","2025-01-01","2025","company_release","high","2026-08-07","Describes Simandou ore resources and reserves at approximately 65-67% Fe."],
];
const putSource=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)");
sources.forEach(x=>putSource.run(...x));

db.prepare(`INSERT OR REPLACE INTO research_answers
 (research_question_id,verdict,answer_summary,mechanism,caveats,updated_at,source_ids)
 VALUES (?,?,?,?,?,?,?)`).run(
 "simandou-disruption",
 "Yes—but through a phased ramp, not a 120 Mt overnight shock.",
 "At full design capacity, the Simandou export corridor would equal 6.9% of 2024 world iron ore exports and nearly 10% of China's imports: enough to diversify Chinese procurement and pressure incumbent market shares. The nearer-term, documented SimFer mine is 60 Mtpa. Its first shipment occurred in December 2025, with a 30-month ramp following common-infrastructure commissioning. High-grade ore strengthens its competitive position, while the long Atlantic voyage to China leaves Australia with a major freight advantage.",
 "High-grade new supply → greater Chinese supplier diversification → lower incumbent market share and possible pressure on benchmark prices and quality premiums. The effect becomes genuinely disruptive if both 60 Mtpa systems ramp reliably while seaborne demand grows by less than the added supply.",
 "The 120 Mtpa figure is shared infrastructure capacity, not current mine output. SimFer and WCS are separately developed 60 Mtpa systems. Realized disruption depends on commissioning, ramp reliability, Chinese steel demand, displacement of higher-cost tonnes and the delivered-cost premium earned by 65–67% Fe ore. A public Simandou–China freight benchmark has not been used; Brazil–China C3 is shown only as a long-haul Atlantic comparator.",
 "2026-08-07",
 JSON.stringify(["rio-simandou-investment-2024","rio-simandou-project-update-2025","rio-simandou-grade","worldsteel-figures-2026","csn-c3-freight-4q25"])
);
db.prepare("UPDATE research_questions SET status='active' WHERE id='simandou-disruption'").run();

const metrics=[
 ["sim-corridor-cap","simandou-disruption","Full corridor design capacity",120,null,"Mtpa","planned","reported","rio-simandou-investment-2024","Two separately developed 60 Mtpa systems sharing rail and port infrastructure.",1],
 ["sim-simfer-cap","simandou-disruption","Documented SimFer mine target",60,null,"Mtpa","planned","reported","rio-simandou-investment-2024","Blocks 3 and 4; WCS separately develops Blocks 1 and 2.",2],
 ["sim-ramp","simandou-disruption","SimFer ramp period",30,null,"months","from commissioning","reported","rio-simandou-project-update-2025","First shipment was December 2025; ramp follows common-infrastructure commissioning.",3],
 ["sim-world-share","simandou-disruption","Full capacity / world exports",6.9,null,"%","2024 baseline","derived","worldsteel-figures-2026","120 / 1,740.5 Mt world exports.",4],
 ["sim-china-share","simandou-disruption","Full capacity / China imports",9.7,null,"%","2024 baseline","derived","worldsteel-figures-2026","120 / 1,238.2 Mt China imports; scale comparison, not forecast destination share.",5],
 ["sim-incumbents","simandou-disruption","Australia + Brazil export share",74.2,null,"%","2024","derived","worldsteel-figures-2026","(901.6 + 389.2) / 1,740.5 Mt world exports.",6],
 ["sim-grade","simandou-disruption","Ore quality",null,"65–67","% Fe","resource / reserve range","reported","rio-simandou-grade","Approximate range reported by Rio Tinto.",7],
 ["sim-atlantic-freight","simandou-disruption","Atlantic freight comparator",21.8,null,"USD/t","2025 average","derived","csn-c3-freight-4q25","Brazil–China C3 quarterly average; comparator only, not a Simandou freight quote.",8]
];
const putMetric=db.prepare(`INSERT OR REPLACE INTO research_answer_metrics
 (id,research_question_id,label,value,text_value,unit,period,data_status,source_id,methodology,display_order)
 VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
metrics.forEach(x=>putMetric.run(...x));

console.log("Seeded Simandou research case.");
