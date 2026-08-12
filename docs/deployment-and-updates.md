# Deployment and update workflow

## Recommended structure

Use one dedicated public GitHub repository as the source of truth and one Render web service as the public application.

```text
Edit research or data locally
        ↓
Run deployment check
        ↓
Push to GitHub main
        ↓
GitHub verifies the build
        ↓
Render automatically publishes the new version
        ↓
Personal website continues pointing to the same URL
```

This avoids maintaining separate copies of the Atlas on GitHub, Render and the personal website.

## Initial publication

1. Create a dedicated public GitHub repository named `industrial-atlas`.
2. Push the contents of this folder with `main` as the production branch.
3. In Render, choose **New → Blueprint** and connect the repository. Render will read `render.yaml`.
4. Confirm that the deployment health check succeeds at `/api/health`.
5. Assign a stable address. A personal subdomain such as `atlas.yourdomain.com` is preferable to changing links whenever the hosting provider changes.
6. Replace `REPLACE-WITH-LIVE-DEMO` and `REPLACE-WITH-USERNAME` in `personal-site-project.html`.
7. Add the project section to the personal website and link its primary button to the featured BYD deep link.

## Shareable links

The Atlas accepts view and context parameters, allowing a recruiter to bypass the directory:

- Homepage: `/`
- BYD report: `/?view=companies&context=byd`
- China EAF research: `/?view=research&context=china-eaf-transition`
- Iron-ore system: `/?view=chain&context=iron-ore`

Use the homepage on a résumé when one link is available. Use the BYD deep link in a stock-pitch or equity-research application, and the EAF link when discussing primary research.

## Updating narrative or analysis

1. Edit the relevant interface or research file.
2. Run `npm run deploy:check`.
3. Commit and push to `main`.
4. GitHub Actions verifies the same build independently.
5. Render deploys automatically after the push.

The personal website does not need to be edited because its links remain stable.

## Updating structured data

1. Add or revise the appropriate `server/seed-*.js` research record, including source, period and evidence status.
2. Run the relevant seed command locally.
3. Inspect the affected page and run `npm run deploy:check`.
4. Commit both the seed logic and updated `data/atlas.sqlite` snapshot.
5. Push once; verification and deployment proceed automatically.

This keeps the published database reproducible. Avoid changing only the SQLite file without preserving how the observation was created.

## When SQLite should be replaced

Keep SQLite while the Atlas is a read-only portfolio and research publication. Move to a hosted database only if the project introduces browser-based editing, multiple contributors, authentication or data that must persist independently of deployments.

## Personal-site presentation

Use a project card or case-study section rather than embedding the entire application in an iframe. A direct link gives the Atlas the full screen required by the map and research workbenches, works better on mobile and avoids duplicate navigation.

Recommended project-card hierarchy:

1. `Industrial Atlas`
2. `From physical supply-chain change to an investable conclusion.`
3. One sentence describing personal ownership of research, financial modelling and development.
4. A static screenshot of the new homepage or BYD report.
5. Primary button: `Explore featured research`.
6. Secondary link: `Methodology and code`.

## Routine maintenance

- Update prominent market prices and “as of” dates together.
- Preserve prior forecast vintages when an investment conclusion changes.
- Test all featured deep links before sharing the portfolio.
- Keep proprietary or identifiable primary-research material out of the public repository.
- Create a tagged GitHub release before major applications so the submitted version remains identifiable.
