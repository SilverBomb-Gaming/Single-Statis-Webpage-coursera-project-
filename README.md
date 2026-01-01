# Alfredo Cardona Portfolio

This repository hosts the single-page portfolio used for the Coursera final project and its GitHub Pages deployment.

## Recommendation Guestbook Workflow

1. **Visitors submit on GitHub** – The "Leave a Recommendation (GitHub)" button on the site opens a prefilled issue form that collects the visitor's name and message.
2. **Review new issues** – Open the issue under **Issues → Recommendation** and read the submitted text.
3. **Approve for publication** – Apply the `approved` label once the content is safe to show. The site only renders issues tagged with both `recommendation` and `approved`.
4. **Update or hide later** – Remove the `approved` label (or close the issue) to take a recommendation back offline. The next page load drops it automatically.

## Maintaining Labels & Templates

- `.github/ISSUE_TEMPLATE/recommendation.yml` defines the public submission form and auto-applies the `recommendation` label.
- `.github/workflows/sync-labels.yml` ensures the `recommendation` and `approved` labels exist (it runs on push or manually via the **Sync labels** workflow dispatch).

## Front-End Data Flow

- `script.js` fetches open issues via the GitHub REST API, filters to those with both labels, and caches the sanitized payload in `sessionStorage`.
- A loading placeholder and error fallback guarantee that the page never breaks if GitHub throttles anonymous requests. Cached data keeps rendering even if the live API call fails.
- Recommendations are displayed read-only; visitors must use GitHub to submit new entries, so every submission is traceable and moderated.
