# Industrial Atlas — Portfolio Case Study

## One-line pitch

I built an industrial-research system that traces macro, policy and physical supply-chain changes into commodity balances, company estimates and valuation—and makes the evidence required to change a view explicit.

## The problem

Industrial research is often fragmented across macro dashboards, commodity data, asset databases, company filings and qualitative research. Each source can be individually useful while leaving the analyst to reconstruct the causal chain.

The Atlas was designed around a stricter question:

**What changed → where does it enter the industrial system → which operating assumption moves → how does that affect earnings and valuation → what would disprove the thesis?**

## My contribution

I independently designed and built:

- the research ontology and SQLite schema;
- source and evidence-status conventions;
- the React/MapLibre analytical interface;
- country, commodity, supply-chain, company and research workstations;
- driver-based financial models and scenario tools;
- primary-research synthesis and monitoring frameworks.

This was not a visualization exercise built around a pre-existing dataset. The data architecture, research questions, collection method, analysis and interface were developed together.

## Three representative outputs

### 1. BYD: growth versus earnings quality

The company page tests whether overseas unit growth and vertical integration can offset domestic price competition, working-capital normalization and localization capex. It includes a linked forecast, dated external-research comparison, DCF and forward-P/E target framework, catalysts and explicit downgrade rules.

### 2. Mongolia–China rail: execution versus headline capacity

The research case separates a 40 Mtpa design headline from construction milestones, border throughput, contracted transport volumes and delivered coal economics. The conclusion does not enter the commodity balance until realized throughput is observed.

### 3. China EAF: utilization versus nameplate capacity

The project synthesizes roughly ten expert and company conversations across two industry meetings. It focuses on realized utilization, scrap quality and price, regional power economics, product capability and policy support. The monitoring framework distinguishes policy ambition from economically competitive production.

## What makes the project relevant to fundamental research

- **Variant perception:** every live company page identifies the core debate and where the Atlas view may differ.
- **Estimate discipline:** external signals move a forecast only through a documented operating driver.
- **Primary research:** expert findings become measurable indicators rather than standalone meeting notes.
- **Risk management:** thesis-break rules are defined before the catalyst occurs.
- **Data judgment:** unavailable evidence remains a visible gap; reported, forecast, derived and provisional figures are not blended.
- **Communication:** complex industrial systems are presented as a decision workflow rather than an encyclopedia.

## Current limitations

- Several high-frequency commodity series require licensed or continuously maintained feeds.
- Company coverage is deliberately uneven; BYD, Cleveland-Cliffs and Equinix are deeper worked examples.
- Some scenario models remain sensitivity tools rather than target-price-ready forecasts.
- The SQLite snapshot is read-only in production and is not intended to replace a commercial market-data platform.

These limitations are part of the research design: the interface tells the user when the evidence is insufficient to underwrite a conclusion.

## Suggested 90-second interview walkthrough

1. Begin on the homepage and explain the signal → physical system → estimate → valuation framework.
2. Open the nickel commodity page and show the INSG surplus, LME inventory and contango evidence.
3. Open the nickel/battery/EV hierarchy to show where chemistry and utilization affect demand transmission.
4. Open BYD and show how upstream evidence changes—or does not automatically change—the earnings model.
5. Finish on the EAF primary-research case and its forecast-revision protocol.

## Technology

React, Vite, MapLibre GL, Express, SQLite, normalized entity/observation/source tables, responsive CSS and reproducible seed scripts.
