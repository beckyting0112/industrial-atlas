# Morning system-events workflow

The morning brief is a discovery and triage layer, not an automatic forecast engine.

## Local experiment

Run once each morning:

```text
npm run news:pull
```

The collector searches four 36-hour signal families: logistics disruption, commodity supply/policy, industrial capacity/guidance and macro-to-manufacturing transmission. GDELT is attempted first; Google News RSS provides a discovery fallback when GDELT is unavailable or rate-limited. Candidates are scored, clustered and stored in SQLite.

List active candidates:

```text
npm run news:review
```

After opening the source and checking the event against a primary source or second credible report:

```text
npm run news:review -- review NEWS_ID
npm run news:review -- publish NEWS_ID
npm run news:review -- reject NEWS_ID
```

`review` records that the source has been checked. `publish` promotes the event for later production rules. `reject` removes it from the morning endpoint.

## Presentation rules

- The homepage shows at most three clusters from the preceding 48 hours.
- Reported fact, observed physical impact and analyst inference remain separate.
- Candidate events are visibly labelled `AUTO-TRIAGED · REVIEW REQUIRED`.
- Headlines never change forecasts automatically.
- Only geolocated events receive map markers.
- Markers expire after 72 hours and duplicate reports in the same event cluster produce one marker.
- Historical records remain in SQLite after the marker expires.
- Source tiers affect ranking: Tier 1 covers primary institutions and top-tier financial reporting; Tier 2 covers established specialist/general reporting; Tier 3 is discovery-only and requires corroboration.
- The homepage review queue lets the analyst open sources and mark a candidate published, reviewed or rejected.

## Current prototype limitations

- Entity extraction is vocabulary-based rather than a full named-entity model.
- Location matching covers strategic Atlas chokepoints and industrial systems, not every place.
- GDELT is used for discovery; inclusion does not verify the underlying report.
- Publisher tiers are rules-based and require periodic maintenance; a high-quality publisher does not independently verify an event.
- Observed impact and inference use cautious event-family templates until an analyst edits the record.
- FT, WSJ and other subscription reporting can be linked during review but is not scraped or republished.

## Promotion path

Before deployment automation, add:

1. stronger publisher tiers;
2. semantic duplicate clustering;
3. a small browser-based review screen;
4. route and asset linking beyond location coordinates;
5. a scheduled GitHub workflow that commits only reviewed data or writes to a durable hosted store.

SQLite remains appropriate for the local experiment. Fully automated public updates would require a durable database because changes made inside a Render instance do not persist across deployments.

## Daily GitHub and Render synchronization

`.github/workflows/daily-morning-brief.yml` runs at 12:00 UTC every day and can also be started manually from the GitHub Actions page. It pulls the morning candidates, verifies the production build, commits the refreshed `data/atlas.sqlite` snapshot to `main`, and pushes it to GitHub. Render watches `main` with auto-deploy enabled, so that data commit becomes the deployed public version after the Render build completes.

The workflow needs repository **Actions → General → Workflow permissions** set to **Read and write permissions**. If branch protection blocks direct bot commits, allow GitHub Actions to bypass the rule or change the workflow to open a pull request instead.
