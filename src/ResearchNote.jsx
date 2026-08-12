import {MarketQuoteBadge} from "./marketData.jsx";
import "./researchNote.css";

export function ResearchNote({eyebrow,companyName,strapline,narrative,keyData,quote,symbol,disclosure,compact=false}){
  if(!narrative)return null;
  return <section className="research-note">
    <div className="research-note-main">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{companyName}</h1>
      <p className="rn-strapline">{strapline}</p>
      {compact?<details className="rn-compact-detail"><summary>Company overview</summary><p className="rn-prose">{narrative.overview}</p></details>:<><h2 className="section-title">Company overview</h2><p className="rn-prose">{narrative.overview}</p></>}
      <h2 className="section-title">Investment overview</h2>
      <div className="rn-points">{narrative.investmentPoints.map(([heading,body])=><p key={heading}><b>{heading}.</b> {body}</p>)}</div>
      {compact?<details className="rn-compact-detail risk"><summary>Principal risks</summary><div className="rn-points rn-risks">{narrative.risks.map(([heading,body])=><p key={heading}><b>{heading}.</b> {body}</p>)}</div></details>:<><h2 className="section-title">Risks</h2><div className="rn-points rn-risks">{narrative.risks.map(([heading,body])=><p key={heading}><b>{heading}.</b> {body}</p>)}</div></>}
    </div>
    <aside className="research-note-sidebar">
      <div className="rn-byline"><span>ATLAS RESEARCH</span><b>Becky Ting</b></div>
      <div className="rn-keydata"><span>KEY DATA</span><table><tbody>{keyData.map(([k,v])=><tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table></div>
      <MarketQuoteBadge quote={quote} symbol={symbol}/>
      {disclosure&&<p className="rn-disclosure">{disclosure}</p>}
    </aside>
  </section>;
}
