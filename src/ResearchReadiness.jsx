import "./researchReadiness.css";

export function MonitoringRules({rules}){return <section className="monitoring-rules"><header><span>FORECAST-REVISION PROTOCOL</span><h3>What to monitor, and what action follows</h3></header><div><div><span>Indicator</span><span>Current / baseline</span><span>Trigger</span><span>Cadence</span><span>Forecast action</span></div>{rules.map((x,i)=><article key={`${x.indicator}-${i}`}><b>{x.indicator}</b><span>{x.current}</span><strong>{x.trigger}</strong><em>{x.cadence}</em><p>{x.action}</p></article>)}</div></section>}

export const researchMonitoring={
  "mongolia-china-rail":[
    {indicator:"Cross-border construction",current:"24-month official program",trigger:"Milestone slips > one quarter",cadence:"Monthly / event",action:"Push realized-volume ramp right; do not change price assumptions on announced capacity."},
    {indicator:"Border rail throughput",current:"Pre-ramp",trigger:"Sustained commercial throughput begins",cadence:"Monthly",action:"Add only observed annualized tonnes to China's landborne supply balance."},
    {indicator:"China–Mongolia coal spread",current:"Series connection pending",trigger:"Delivered discount persists after rail ramp",cadence:"Weekly",action:"Lower marginal Chinese coking-coal cost; test displacement of seaborne tonnes."}
  ],
  "china-eaf-transition":[
    {indicator:"EAF utilization",current:"Comparable series incomplete",trigger:"Sustained rise across tracked mills",cadence:"Monthly",action:"Raise scrap demand and reduce ore intensity only for realized output—not nameplate capacity."},
    {indicator:"Scrap–hot-metal cost spread",current:"Regional tracker pending",trigger:"EAF reaches parity through a full quarter",cadence:"Weekly / monthly",action:"Increase EAF utilization forecast and review BF raw-material demand."},
    {indicator:"Flat/auto product qualification",current:"EAF concentrated in long products",trigger:"Named customer qualification and commercial volume",cadence:"Quarterly / event",action:"Expand addressable margin pool; revise product-mix assumptions rather than national tonnage first."}
  ]
};
