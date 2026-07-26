# Deploy Sprint Finale Submission

Complete this file on `main` as tasks are completed. Do not paste secrets, private keys, token values, or screenshots that reveal credentials.

## Team

- Team name: BEGINNERS
- Team members: kulunuthalgahagoda
- Live IP URL: http://20.114.32.177
- Assigned domain URL: https://beginners.deploysprint-finals.knurdz.org
- Repository URL: https://github.com/knurdz/deploy-sprint-finale-team-beginners

## Release Evidence

- Current production commit:
- Current artifact/image identifier: `site-dist-<sha>`
- Current deployment workflow run:
- Current release manifest path or URL: `/release-manifest.json` and Actions artifact `release-manifest-<sha>`
- Notes on live evidence or fallback evidence:
  - HTTPS domain: https://beginners.deploysprint-finals.knurdz.org
  - HTTP domain compatibility and raw IP: http://20.114.32.177
  - `/status` must show `domain.connected=true` and assigned domain fields
  - DNS A record: `beginners` → `20.114.32.177`
  - T23: `release-manifest.json` maps commit SHA to `site-dist-<sha>` and workflow run ID

## Score Summary

- Automated points out of 800:
- Judge points out of 200:
- Final total points out of 1000:

## Completed Tasks

Use this section for short public notes and links. Full task instructions and checks are in the finalist dashboard.

| Task | PR | Evidence | Notes |
| --- | --- | --- | --- |
| T01 | [T01] Launch Provided Website | `/health`, `/status`, CI deploy request | Merged |
| T02 | [T02] Connect Custom Domain | `/status` domain block, `domain.config.json`, HTTPS+HTTP+IP | A record beginners → 20.114.32.177; `domain.connected=true` |
| T03 |  |  |  |
| T04 | [T04] Rollback To Known-Good Release | Actions summary + `rollback-manifest` artifact | `.github/workflows/rollback.yml`; input `release_ref`; default `dry_run=true` |
| T05 | [T05] Secret And Config Separation | `/status` config block, `.env.example`, CI masked secret | `PUBLIC_DEPLOY_LABEL` variable; `PRIVATE_DEPLOY_TOKEN` secret (names only in PR) |
| T06 | [T06] CI Gate Before Deployment | `.github/workflows/ci.yml` Node 20 + `npm ci` + build + `site-dist-<sha>`; deploy gated on CI success | See Public Notes |
| T07 | [T07] OpenWeather API Widget | Merged |  |
| T08 |  |  |  |
| T09 | [T09] Conflict Merge With Both Outcomes | `deadlines.ts` keeps `repo-setup-checkpoint` + `merge-conflict-lab`; no conflict markers; build | Merged `task-assets/conflict-merge`; preserved both main and organizer deadline cards |
| T10 | [T10] Web3Forms Contact Service | `/contact`, `contact.html`, `/status` contact.provider | Secret name only: `WEB3FORMS_ACCESS_KEY` |
| T11 |  |  |  |
| T12 | [T12] Fast Dependency Pipeline | CI summary: cache-hit + npm ci + audit | `setup-node` cache keyed on `team-site/package-lock.json`; `npm ci` always runs |
| T13 |  |  |  |
| T14 |  |  |  |
| T15 | [T15] Runtime Feature Flag | `/status` `featureFlags` + Insights UI | `FEATURE_SHOW_INSIGHTS` secret/var → `VITE_FEATURE_SHOW_INSIGHTS`; no hardcoded flag |
| T16 | [T16] Resend Email Alerts | `/status` email + `/email/status.json` | Secret name only: `RESEND_API_KEY`; CI dry-run evidence |
| T17 |  |  |  |
| T18 |  |  |  |
| T19 | [T19] Post-Deploy Smoke Tests | `.github/workflows/deploy.yml` `smoke-test` job; `/` `/health` `/status` `/contact.html` | Live + fallback modes; fails workflow on mismatch |
| T20 |  |  |  |
| T21 |  |  |  |
| T22 |  |  |  |
| T23 | [T23] Release Evidence Manifest | `release-manifest.json` artifact + `/status.releaseManifest` | commit, artifact, workflowRun, deployedAt, taskMarkers |
| T24 |  |  |  |
| T25 |  |  |  |
| T26 |  |  |  |
| T27 |  |  |  |
| T28 |  |  |  |
| T29 |  |  |  |
| T30 |  |  |  |

## Public Notes

- T02: Domain evidence is in `/status` (`domain.connected`, assigned domain, A-record target) and `domain.config.json`. Verify HTTPS domain, plain HTTP domain/IP compatibility at `http://20.114.32.177`. No DNS portal credentials are committed.
- T09: Conflicted file was `team-site/src/data/deadlines.ts`. Rule: keep both useful outcomes — main's `repo-setup-checkpoint` card and organizer `merge-conflict-lab` card from `task-assets/conflict-merge`. Verify with a source search for both ids and zero `<<<<<<<` / `=======` / `>>>>>>>` markers, then `npm run build` in `team-site/`.
- T06: CI workflow (`.github/workflows/ci.yml`) runs on `pull_request` and `push` to `main`. It uses Node 20, `npm ci` from `team-site/package-lock.json`, `npm run build` in `team-site/`, and uploads `team-site/dist` as `site-dist-<sha>`. `Request Organizer Deploy` only continues when that CI workflow succeeds on `main`.

List anything judges should know without exposing credentials or private infrastructure details.

### T04 rollback

- Manual rollback workflow accepts `release_ref` and records a rollback manifest without editing application source.
- Default `dry_run=true` for no-live fallback; set `dry_run=false` only when requesting organizer redeploy of the selected known-good SHA/tag.
- Starter bug: `inputs.releaseRef` was empty; fixed to `inputs.release_ref`. Link failed diagnostic run and successful rerun in the PR when available.
- Judge answer: provide the known-good `release_ref` (tag, SHA, or artifact id) to the rollback workflow — not current `main` source.

### T12 fast dependency pipeline

- Snippet placed in `.github/workflows/ci.yml` Setup Node step: `cache: npm` + `cache-dependency-path: team-site/package-lock.json`.
- Same cache settings mirrored in `.github/workflows/pages.yml`.
- Install stays `npm ci` in `team-site/` (never skipped on cache hit).
- CI step summary records cache-hit output and `npm audit` exit code (document-only).
- Cache invalidates when `team-site/package-lock.json` changes; `npm ci` still enforces lockfile integrity.

### T15 runtime feature flag

- Snippet adapted in `team-site/src/config/featureFlags.ts` (reads `VITE_FEATURE_SHOW_INSIGHTS`).
- CI injects `FEATURE_SHOW_INSIGHTS` / `VITE_FEATURE_SHOW_INSIGHTS` from GitHub Secret or Variable (default `false`).
- `/status` includes `featureFlags: { task, showInsights, valueRedacted: true }` only — no secret strings.
- UI Insights panel shows only when flag is `true`.
- Verify off: set secret/var to `false`, rebuild; panel hidden; status `showInsights: false`.
- Verify on: set to `true`, rebuild; panel visible; status `showInsights: true`.
- Incident disable: set `FEATURE_SHOW_INSIGHTS=false` and redeploy (no source change).


### T23 release evidence manifest

- Starter adapted to `team-site/scripts/write-release-manifest.mjs` (also written during `write-release-evidence.mjs`).
- CI generates `release-manifest.json` and uploads artifact `release-manifest-<sha>`.
- Manifest fields: `task`, `commit`, `artifact` (`site-dist-<sha>`), `workflowRun`, `deployedAt`/`deployTime`, `taskMarkers`, `secretsRedacted`.
- Safe exposure: `/status.releaseManifest` and `/release-manifest.json` in the dist artifact.
- Verify: download Actions artifact or open `/release-manifest.json` and confirm `commit` matches the scored SHA.

### T16 Resend email alerts

- API key lives only as GitHub Secret `RESEND_API_KEY` (never `VITE_`, never committed).
- Send/simulate path: `team-site/scripts/prepare-resend-email.mjs` (CI/deploy-time Node only).
- Default `EMAIL_ALERT_MODE=dry-run` — no network send; optional `send` uses Resend API from env.
- Evidence: `/status` `email.provider=resend`, `email.configured=true`, `secretRedacted=true` plus `/email/status.json`.
- Client marker: `team-site/src/config/emailAlerts.ts` (provider/secret name only; no key).
- Verify: CI summary + `site-dist-<sha>` artifact contains redacted status; search repo/artifacts for no `re_` key values.

