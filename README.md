# Industrial Atlas

### From physical supply-chain change to an investable conclusion

Industrial Atlas is an independent fundamental-research project by **Becky Ting**. It tests how macro conditions, policy decisions and physical disruptions travel through industrial systems into commodity balances, company earnings and valuation.

> Bloomberg shows what happened. Capital IQ organizes company data. Industrial Atlas asks what changes the forecast, why the market may be wrong, and what evidence would invalidate the view.

**Public beta:** coverage is intentionally uneven. Reported, estimated, derived and provisional observations are labelled separately. Nothing in this repository is investment advice.

## Start here

| Worked analysis | Investment question | What it demonstrates |
|---|---|---|
| **BYD** | Can profitable overseas growth offset domestic price competition and weaker cash conversion? | Three-statement forecasting, consensus comparison, DCF/forward-P/E valuation and explicit thesis-break rules |
| **Mongolia–China rail** | Will announced rail capacity materially change delivered coking-coal supply? | Primary research translated into construction milestones, throughput indicators and forecast actions |
| **China EAF transition** | Can China’s EAF fleet become economically competitive rather than merely larger? | Expert-interview synthesis, scrap/power economics, utilization monitoring and implications for ore intensity |
| **Iron ore** | How does a change in Chinese steel demand reach seaborne ore, freight and producer economics? | A mine-to-steel hierarchy linking concentrated supply, logistics, import dependence and demand pull |

Recommended recruiter path: **Companies → BYD**, then **Research → Mongolia rail / China EAF**, then **Supply Chain → Iron ore**.

## Why this is differentiated

- Links macro and policy signals to measurable physical variables.
- Separates nameplate capacity from production, utilization and economic output.
- Preserves an audit trail for sources, vintages, assumptions and limitations.
- States the market debate, variant view, catalyst and disconfirmation rule.
- Shows missing evidence instead of silently filling gaps.
- Combines public-source research, primary-research synthesis, financial modelling and product development.

## What I built

- A React and MapLibre research interface.
- An Express API backed by a normalized SQLite research database.
- Country macro workstations, commodity balance monitors and interactive industrial hierarchies.
- Asset, port, route, chokepoint and trade-flow visualizations.
- Standardized public-company research pages with driver models and valuation scenarios.
- A linked BYD three-statement forecast and target-price framework.
- Primary-research monitoring protocols for Mongolia rail and China’s EAF transition.

## Research standard

A module is described as **decision-ready** only when it contains:

1. a dated source and current observation;
2. a forward expectation;
3. a documented physical transmission mechanism;
4. a company-estimate linkage;
5. a market or valuation hurdle;
6. a catalyst and disconfirmation rule.

Coverage that does not meet this standard remains visibly marked as analytical scaffolding or work in progress.

## Repository guide

| Location | Purpose |
|---|---|
| `src/` | Interface, maps, research workstations and financial models |
| `server/schema.sql` | Normalized research-data schema |
| `server/seed-*.js` | Reproducible sourced datasets and worked cases |
| `data/atlas.sqlite` | Versioned, read-mostly public-beta snapshot |
| `docs/` | Methodology and portfolio case-study material |
| `render.yaml` | One-service public deployment configuration |

## Run locally

Requires Node.js 20 or newer.

```text
npm install
npm run db:seed
npm run dev
```

Open `http://localhost:5173`. The API runs on port `8787`.

Before deployment:

```text
npm run deploy:check
```

## Deploy

The repository includes `render.yaml`, which deploys the interface, API and curated SQLite snapshot as one Render web service.

1. Push this folder as a dedicated GitHub repository.
2. Confirm `data/atlas.sqlite` is committed.
3. In Render, create a **Blueprint** and connect the repository.
4. Verify `/api/health`, then add a custom subdomain such as `atlas.yourname.com`.

Render automatically rebuilds the public Atlas after each push to the connected branch. Shareable entry points can link directly to a view, for example `?view=companies&context=byd`, `?view=research&context=china-eaf-transition` or `?view=chain&context=iron-ore`.

SQLite is currently a versioned research snapshot. A hosted database is only necessary if authentication, browser editing or durable writes are introduced.

## Portfolio presentation

- [Recruiter-facing case study](docs/portfolio-case-study.md)
- [Personal-site project section](docs/personal-site-project.html)
- [Deployment and update workflow](docs/deployment-and-updates.md)
- [BYD valuation methodology](docs/byd-valuation-methodology.md)

## Method and limitations

Public filings, official statistics, government publications, industry associations and selected public research are prioritized. Primary-research findings are anonymized and presented directionally. Proprietary market feeds and live institutional consensus are not implied where they are not connected.

© Becky Ting. Public portfolio project.
