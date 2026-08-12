import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
const here=dirname(fileURLToPath(import.meta.url));db.exec(readFileSync(resolve(here,"schema.sql"),"utf8"));
const sources=[
 ["byd-results-2025","BYD 2025 annual results","BYD Company Limited","https://www.bydglobal.com/cn/news/2026-03-30/1617162790006","2026-03-30","2025","company_filing","high","2026-08-08","FY2025 revenue, net profit and R&D."],
 ["byd-sales-2025","Production and sales volume for December 2025","BYD Company Limited","https://www.bydglobal.com/sites/Satellite/BYD%2BPDF%2BViewer?blobcol=urldata&blobheader=application%2Fpdf&blobkey=id&blobtable=MungoBlobs&blobwhere=1638928517653&ssbinary=true","2026-01-01","2025","company_filing","high","2026-08-08","Unaudited vehicle volumes and installed battery capacity."],
 ["byd-update-2026h1","BYD 17 million NEV milestone and 2026 H1 update","BYD Company Limited","https://www.bydglobal.com/cn/news/2026-07-09/1617162816258","2026-07-09","2026H1","company_release","medium","2026-08-08","2026 H1 total and overseas sales."],
 ["byd-interim-2025","BYD 2025 interim report","BYD Company Limited","https://www1.hkexnews.hk/listedco/listconews/sehk/2025/0829/2025082902252.pdf","2025-08-29","2025H1","company_filing","high","2026-08-08","Revenue, gross profit, margin, net profit, R&D and operating cash flow."],
 ["byd-q1-2026","BYD 2026 first quarterly report","BYD Company Limited","https://www.bydglobal.com/sites/Satellite/BYD%20PDF%20Viewer?blobcol=urldata&blobheader=application%2Fpdf&blobkey=id&blobtable=MungoBlobs&blobwhere=1638928524585&ssbinary=true","2026-04-22","2026Q1","company_filing","high","2026-08-08","Q1 2026 revenue, net profit and operating cash flow with comparatives."],
 ["byd-price-20260722","BYD Co Ltd 1211:HKG historical price","Financial Times / LSEG","https://markets.ft.markitdigital.com/data/equities/tearsheet/historical?s=1211%3AHKG.HS","2026-07-22","2026-07-22","market_data","medium","2026-08-08","Delayed H-share close used as a dated reference, not a live quote."],
 ["byd-ft-financials-2025","BYD Co Ltd financials: income statement","Financial Times / LSEG","https://markets.ft.markitdigital.com/data/equities/tearsheet/financials?s=0VSO%3ALSE&subView=IncomeStatement","2026-08-08","2025","market_data","medium","2026-08-08","Standardized operating income and depreciation/amortization. EBITDA is calculated by the Atlas, not reported by BYD."],
 ["byd-annual-report-2025","BYD Company Limited 2025 annual report","BYD Company Limited","https://www.chinamoney.com.cn/chinese/cwbg/20260330/3307255.html","2026-03-30","2025-12-31","company_filing","high","2026-08-08","Audited year-end balance sheet used for the conventional net-debt bridge."],
 ["iea-ev-2026-finance","Trends in electric cars — Global EV Outlook 2026","International Energy Agency","https://www.iea.org/reports/global-ev-outlook-2026/trends-in-electric-cars","2026-06-01","2025","government_intergovernmental","high","2026-08-08","Market demand and competitive context."],
 ["byd-cmbi-20260429","Overseas, R&D support 1Q26 earnings resilience","CMB International Global Markets","https://www.cmbi.com.hk/article/13015.html?lang=en","2026-04-29","2026Q1","equity_research","high","2026-08-09","Accessible company update with forecasts, valuation and disclosures."],
 ["byd-mirae-20250901","Medium/long-term competitiveness remains intact","Mirae Asset Securities","https://securities.miraeasset.com/bbs/download/2138358.pdf?attachmentId=2138358","2025-09-01","2025Q2","equity_research","high","2026-08-09","Accessible six-page company report."],
 ["byd-dbs-20250827","CIO Weekly: BYD investment overview","DBS Group Research","https://www.dbs.com/content/article/pdf/CIO/2025/202508/250827EquitiesWeekly.pdf","2025-08-27","2025H1","equity_research_excerpt","high","2026-08-09","Published research excerpt with a SOTP valuation."],
 ["byd-ubs-20260617","BYD rating and price target history","UBS Investment Bank","https://researchdmz.ibb.ubs.com/openaccess/compliance/181194_2_new.html","2026-06-17","2026-06-17","research_disclosure","high","2026-08-09","Official H-share rating and target history; underlying note is not public here."],
];
const metrics=[
 ["byd-revenue-2025","byd","2025","revenue",804,"RMB bn",3.5,"reported","FY2025 result.","byd-results-2025"],
 ["byd-net-profit-2025","byd","2025","net_profit",32.6,"RMB bn",-19,"reported","Profit attributable headline.","byd-results-2025"],
 ["byd-rd-2025","byd","2025","research_and_development",63.4,"RMB bn",17,"reported","Company-reported R&D investment.","byd-results-2025"],
 ["byd-net-margin-2025","byd","2025","net_margin",4.05,"%",-1.13,"derived","Net profit divided by revenue; YoY is approximate percentage-point change.","byd-results-2025"],
 ["byd-rd-intensity-2025","byd","2025","rd_intensity",7.89,"%",0.91,"derived","R&D divided by revenue; YoY is approximate percentage-point change.","byd-results-2025"],
 ["byd-nev-sales-2025","byd","2025","nev_sales",4.602,"million vehicles",7.73,"reported","Company operating announcement.","byd-sales-2025"],
 ["byd-overseas-sales-2025","byd","2025","overseas_nev_sales",1.05,"million vehicles",145,"reported","Overseas sales exceeded one million.","byd-results-2025"],
 ["byd-battery-installations-2025","byd","2025","battery_installations",285.634,"GWh",null,"reported","NEV power and energy-storage battery installed capacity.","byd-sales-2025"],
 ["byd-nev-sales-2026h1","byd","2026H1","nev_sales",1.809,"million vehicles",null,"reported","Company operating update.","byd-update-2026h1"],
 ["byd-overseas-sales-2026h1","byd","2026H1","overseas_nev_sales",0.789,"million vehicles",68,"reported","Passenger vehicle and pickup overseas sales.","byd-update-2026h1"],
 ["byd-revenue-2024","byd","2024","revenue",777.1,"RMB bn",29.0,"reported","FY2024 comparative.","byd-results-2025"],
 ["byd-net-profit-2024","byd","2024","net_profit",40.25,"RMB bn",34.0,"reported","FY2024 comparative.","byd-results-2025"],
 ["byd-revenue-2024h1","byd","2024H1","revenue",301.13,"RMB bn",null,"reported","Comparative disclosed in 2025 interim report.","byd-interim-2025"],
 ["byd-net-profit-2024h1","byd","2024H1","net_profit",13.631,"RMB bn",null,"reported","Comparative disclosed in 2025 interim report.","byd-interim-2025"],
 ["byd-revenue-2025h1","byd","2025H1","revenue",371.281,"RMB bn",23.30,"reported","Interim result.","byd-interim-2025"],
 ["byd-net-profit-2025h1","byd","2025H1","net_profit",15.510,"RMB bn",13.79,"reported","Interim result.","byd-interim-2025"],
 ["byd-gross-margin-2025h1","byd","2025H1","gross_margin",18.01,"%",-0.77,"reported","YoY field is percentage-point change from 18.78%.","byd-interim-2025"],
 ["byd-operating-cash-flow-2025h1","byd","2025H1","operating_cash_flow",31.8,"RMB bn",null,"reported","Net cash flow from operating activities.","byd-interim-2025"],
 ["byd-revenue-2025q1","byd","2025Q1","revenue",170.360,"RMB bn",null,"reported","Comparative disclosed in Q1 2026 report.","byd-q1-2026"],
 ["byd-net-profit-2025q1","byd","2025Q1","net_profit",9.155,"RMB bn",null,"reported","Comparative disclosed in Q1 2026 report.","byd-q1-2026"],
 ["byd-operating-cash-flow-2025q1","byd","2025Q1","operating_cash_flow",8.581,"RMB bn",null,"reported","Comparative disclosed in Q1 2026 report.","byd-q1-2026"],
 ["byd-revenue-2026q1","byd","2026Q1","revenue",150.225,"RMB bn",-11.82,"reported","First quarterly report.","byd-q1-2026"],
 ["byd-net-profit-2026q1","byd","2026Q1","net_profit",4.085,"RMB bn",-55.38,"reported","First quarterly report.","byd-q1-2026"],
 ["byd-operating-cash-flow-2026q1","byd","2026Q1","operating_cash_flow",2.790,"RMB bn",-67.48,"reported","First quarterly report.","byd-q1-2026"],
 ["byd-short-term-borrowings-2026q1","byd","2026Q1","short_term_borrowings",66.296,"RMB bn",72.27,"reported","Compared with RMB38.485bn at FY2025.","byd-q1-2026"],
 ["byd-finance-expense-2026q1","byd","2026Q1","finance_expense",2.100,"RMB bn",null,"reported","Changed from an RMB1.908bn finance gain in Q1 2025, mainly due to FX losses versus gains.","byd-q1-2026"],
 ["byd-shares-2026q1","byd","2026Q1","shares_outstanding",9.117,"bn shares",null,"reported","Adjusted ordinary share count after the 2025 bonus and capitalization issues.","byd-q1-2026"],
 ["byd-h-price-20260722","byd","2026-07-22","h_share_price",87.85,"HKD/share",null,"market snapshot","Delayed closing price; not live.","byd-price-20260722"],
 ["byd-operating-income-2025","byd","2025","operating_income",40.185,"RMB bn",null,"standardized","Financial Times/LSEG standardized operating income.","byd-ft-financials-2025"],
 ["byd-da-2025","byd","2025","depreciation_amortization",13.267,"RMB bn",null,"standardized","Financial Times/LSEG standardized depreciation and amortization.","byd-ft-financials-2025"],
 ["byd-ebitda-proxy-2025","byd","2025","ebitda_proxy",53.452,"RMB bn",null,"derived","Atlas proxy = RMB40.185bn operating income + RMB13.267bn depreciation/amortization. Not company-reported adjusted EBITDA.","byd-ft-financials-2025"],
 ["byd-cash-2025","byd","2025","cash_and_cash_equivalents",75.425,"RMB bn",null,"reported","Year-end monetary funds; used as the cash leg of the conventional bridge.","byd-annual-report-2025"],
 ["byd-short-debt-2025","byd","2025","short_term_borrowings",38.485,"RMB bn",null,"reported","Year-end short-term borrowings.","byd-annual-report-2025"],
 ["byd-long-debt-2025","byd","2025","long_term_borrowings",60.706,"RMB bn",null,"reported","Year-end non-current long-term borrowings.","byd-annual-report-2025"],
 ["byd-current-maturities-2025","byd","2025","current_maturities",6.312,"RMB bn",null,"reported","Non-current liabilities due within one year.","byd-annual-report-2025"],
 ["byd-lease-liabilities-2025","byd","2025","lease_liabilities",8.620,"RMB bn",null,"reported","Year-end non-current lease liabilities.","byd-annual-report-2025"],
 ["byd-net-debt-incl-leases-2025","byd","2025","net_debt_including_leases",38.698,"RMB bn",null,"derived","Short-term borrowings + long-term borrowings + current maturities + lease liabilities - monetary funds. Supplier payables are excluded.","byd-annual-report-2025"],
];
const exposures=[
 ["byd-exp-battery","byd","commodity","Battery cells","mixed","Integration lowers procurement exposure but makes utilization and technology execution internal earnings drivers.","Internal production plus external ecosystem","partially disclosed","How much output is transferred internally versus sold externally?","byd-sales-2025"],
 ["byd-exp-lithium","byd","commodity","Lithium compounds","cost negative","Lower lithium prices can reduce cell cost, subject to inventory and contract lags.","Contract and spot-linked terms not fully disclosed","research gap","What is the pass-through lag from lithium benchmarks to vehicle margin?","byd-results-2025"],
 ["byd-exp-nickel","byd","commodity","Nickel","limited cost negative","LFP-heavy chemistry reduces nickel exposure relative to NMC-focused competitors.","Chemistry-dependent","partially disclosed","How quickly is chemistry mix changing by segment and region?","iea-ev-2026-finance"],
 ["byd-exp-steel","byd","commodity","Automotive steel","cost negative","Sheet steel affects body and component cost; grade premiums matter more than crude-steel prices.","Supplier contracts; terms not disclosed","research gap","Which steel benchmarks best explain vehicle cost?","byd-results-2025"],
 ["byd-exp-fx","byd","macro","RMB and destination FX","mixed","A weaker RMB can support exports but raises imported-input and overseas-investment costs.","Transactional and translation exposure","research gap","What portion is naturally or financially hedged?","byd-results-2025"],
 ["byd-exp-demand","byd","macro","China EV demand and price competition","positive volume / negative margin","High penetration supports scale while discounting pressures realization and margin.","Retail pricing, incentives and mix","observable proxy","Are volume gains coming with stable vehicle-level gross profit?","iea-ev-2026-finance"],
 ["byd-exp-trade","byd","macro","Tariffs and localization","mixed","Tariffs penalize exports; local production preserves access but adds capex and ramp risk.","Policy-specific","partially disclosed","Do overseas plants improve delivered margin after utilization costs?","iea-ev-2026-finance"],
];
const factors=[
 ["byd-debate-margin","byd","debate","Scale versus margin","Record revenue and volume coincided with lower FY2025 profit, making realization and mix more important than unit growth alone.","Net margin, discounts, model mix","next 4 quarters","byd-results-2025"],
 ["byd-catalyst-overseas","byd","catalyst","Overseas mix expands","Overseas sales exceeded one million in 2025 and continued growing in 2026H1.","Overseas sales share and plant ramps","1–3 years","byd-update-2026h1"],
 ["byd-catalyst-tech","byd","catalyst","Battery differentiation","Battery integration and charging technology could support differentiation if deployment scales economically.","Battery installations, charging rollout, ASP","12–24 months","byd-update-2026h1"],
 ["byd-risk-china","byd","risk","Domestic competition","Intense competition can transfer scale benefits to consumers through lower prices.","Monthly sales, share, incentives","monthly","iea-ev-2026-finance"],
 ["byd-risk-capex","byd","risk","Global capacity ramp","Overseas factories reduce tariff exposure but add fixed cost and utilization sensitivity.","Capex, start dates, utilization","1–3 years","byd-results-2025"],
];
const pitch=["byd","2026-08-10","WATCH / NEUTRAL","medium","12–18 months","Scale is proven; earnings quality is the unresolved variable.","BYD remains the industry’s strongest integrated volume platform, but FY2025 revenue growth of 3.5% accompanied a 19% profit decline, and Q1 2026 revenue, net profit and operating cash flow fell 11.8%, 55.4% and 67.5% year over year. Overseas growth and technology can rebuild earnings, but the investment case requires evidence that geographic mix produces margin and cash—not merely replacement volume.","The market can mistake global unit leadership for automatic earnings leadership. The differentiated upside is that overseas ASP, mix and localization eventually lift group profit per vehicle; the differentiated downside is that domestic price competition, factory ramp costs and working-capital intensity absorb the benefit for longer than expected.","Remain neutral. Do not upgrade on monthly sales alone; require two reporting periods of stable or improving group margin, stronger operating cash conversion and profitable overseas growth before moving to Constructive.","Upgrade to CONSTRUCTIVE when overseas sales remain above 30% growth while group margin stabilizes and operating cash conversion improves for two consecutive reporting periods.","Move to AVOID if profit per vehicle continues to fall, operating cash flow remains materially below earnings, or borrowings rise without a measurable overseas earnings contribution.","byd-q1-2026"];
const scenarios=[
 ["byd-pitch-bull","byd","Bull",25,45,24,1.08,127.94,"Overseas mix scales faster than local fixed costs, domestic pricing stabilizes and technology supports premium realization.","Net profit trends toward RMB45bn; overseas growth remains above 40%; margin expands."],
 ["byd-pitch-base","byd","Base",50,32.6,20,1.08,77.24,"Overseas growth offsets domestic weakness but does not yet restore FY2024 profitability.","Profit holds near RMB33bn; overseas growth stays strong; margin is broadly flat."],
 ["byd-pitch-bear","byd","Bear",25,22,12,1.08,31.27,"China price competition persists while overseas inventory, tariffs and factory ramps absorb cash.","Profit falls toward RMB22bn; margin contracts; debt rises faster than earnings."],
];
const pitchKpis=[
 ["byd-kpi-margin","byd","Group net margin","4.05% FY2025","Stabilizes above 4.5%","Falls below 3.5%","quarterly / interim","byd-results-2025"],
 ["byd-kpi-overseas","byd","Overseas vehicle sales","+68% YoY in 2026H1",">30% growth with local plants ramping","<20% growth or inventory build","monthly / half-year","byd-update-2026h1"],
 ["byd-kpi-profit","byd","Attributable net profit","−55.4% YoY in 2026Q1","Returns to YoY growth","Decline persists in next report","quarterly","byd-q1-2026"],
 ["byd-kpi-cash","byd","Operating cash conversion","RMB2.8bn OCF in 2026Q1","OCF grows faster than profit","OCF remains materially below profit","quarterly","byd-q1-2026"],
 ["byd-kpi-leverage","byd","Short-term borrowings","RMB66.3bn in 2026Q1","Debt stabilizes as overseas assets ramp","Debt rises without earnings recovery","quarterly","byd-q1-2026"],
];
const run=db.transaction(()=>{
 const equityResearch=[
  ["byd-er-ubs-20260617","byd","UBS","2026-06-17","Rating and price target update","official disclosure","Buy",135,"HKD",81.9,null,"The public disclosure confirms positive coverage but does not reproduce the analyst thesis.","Not available publicly.","Operating risks are not reproduced.","Method not publicly reproduced.","No public forecast table.","A current bullish target marker, not evidence for the operating thesis.","byd-ubs-20260617"],
  ["byd-er-cmbi-20260429","byd","CMB International","2026-04-29","Overseas, R&D support 1Q26 earnings resilience","full report","Buy",125,"HKD",null,null,"Overseas mix supported ASP and gross margin; R&D discipline could add resilience despite weaker volume.","Higher-margin overseas mix, expense discipline and high oil prices.","Market volatility and forecast execution.","22x FY2027E P/E.","FY2026E revenue RMB888.0bn, net profit RMB37.9bn and gross margin 17.6%, below reproduced consensus.","Supports our overseas-mix focus but assumes recovery beyond our base case.","byd-cmbi-20260429"],
  ["byd-er-mirae-20250901","byd","Mirae Asset Securities","2025-09-01","Medium/long-term competitiveness remains intact","full report","Buy",167,"CNY",114.06,"Jinsuk Kim","Price cuts and ADAS/R&D costs weakened near-term earnings; overseas and premium mix support competitiveness.","Overseas factories, premium mix and easing price competition.","Domestic weakness, price cuts and high initial ADAS costs.","26.2x FY2026E P/E, a 20% premium to cited peers.","FY2026E revenue RMB1,132bn, operating profit RMB71bn and net profit RMB59bn.","More bullish than our base case; requires faster earnings normalization and a premium multiple.","byd-mirae-20250901"],
  ["byd-er-dbs-20250827","byd","DBS Group Research","2025-08-27","BYD: diversified global EV maker","published excerpt","Buy",164,"HKD",111.4,"Rachel Miu","Supply-chain control, broad products and overseas localization support growth despite domestic competition.","Brazil and Thailand ramp; Hungary, Turkey and Indonesia plants.","Weak AI-enabled vehicle demand could trigger price cuts.","SOTP: 11x/9x FY2025E EV/EBITDA for auto/handsets and 2x P/BV for other operations.","FY2025 volume forecast about 5.3m units in August 2025.","Useful segment valuation; the old volume forecast is superseded by FY2025 actuals.","byd-dbs-20250827"]
 ];
 const s=db.prepare("INSERT OR REPLACE INTO sources VALUES (?,?,?,?,?,?,?,?,?,?)");sources.forEach(x=>s.run(...x));
 const m=db.prepare("INSERT OR REPLACE INTO company_financial_metrics VALUES (?,?,?,?,?,?,?,?,?,?)");metrics.forEach(x=>m.run(...x));
 const e=db.prepare("INSERT OR REPLACE INTO company_finance_exposures VALUES (?,?,?,?,?,?,?,?,?,?)");exposures.forEach(x=>e.run(...x));
 const f=db.prepare("INSERT OR REPLACE INTO company_investment_factors VALUES (?,?,?,?,?,?,?,?)");factors.forEach(x=>f.run(...x));
 const p=db.prepare("INSERT OR REPLACE INTO company_stock_pitches VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");p.run(...pitch);
 const ps=db.prepare("INSERT OR REPLACE INTO company_pitch_scenarios VALUES (?,?,?,?,?,?,?,?,?,?)");scenarios.forEach(x=>ps.run(...x));
 const pk=db.prepare("INSERT OR REPLACE INTO company_pitch_kpis VALUES (?,?,?,?,?,?,?,?)");pitchKpis.forEach(x=>pk.run(...x));
 const er=db.prepare("INSERT OR REPLACE INTO company_equity_research VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");equityResearch.forEach(x=>er.run(...x));
});run();console.log(`Seeded BYD finance profile: ${metrics.length} metrics, ${exposures.length} exposures, ${factors.length} factors.`);
