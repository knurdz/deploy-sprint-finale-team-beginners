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
- Current release manifest path or URL: https://beginners.deploysprint-finals.knurdz.org/status
- Notes on live evidence or fallback evidence:
  - HTTPS domain: https://beginners.deploysprint-finals.knurdz.org
  - HTTP domain compatibility and raw IP: http://20.114.32.177
  - `/status` must show `domain.connected=true` and assigned domain fields
  - DNS A record: `beginners` → `20.114.32.177`

## Score Summary

- Automated points out of 800:
- Judge points out of 200:
- Final total points out of 1000:

## Completed Tasks

Use this section for short public notes and links. Full task instructions and checks are in the finalist dashboard.

| Task | PR | Evidence | Notes |
| --- | --- | --- | --- |
| T01 |  |  |  |
| T02 |  |  |  |
| T03 | [T03] Build Once Deploy Same Artifact | CI `site-dist-<sha>` + dry-run download; `/status.artifact` + `workflowRun`; `release-manifest-<sha>` | Deploy path does not run `npm run build` |
| T04 |  |  |  |
| T05 | [T05] Secret And Config Separation | `/status` config block, `.env.example`, CI masked secret | `PUBLIC_DEPLOY_LABEL` variable; `PRIVATE_DEPLOY_TOKEN` secret (names only in PR) |
| T06 | [T06] CI Gate Before Deployment | `.github/workflows/ci.yml` Node 20 + `npm ci` + build + `site-dist-<sha>`; deploy gated on CI success | See Public Notes |
| T07 | [T07] OpenWeather API Widget | Merged |  |
| T08 |  |  |  |
| T09 |  |  |  |
| T10 | [T10] Web3Forms Contact Service | `/contact`, `contact.html`, `/status` contact.provider | Secret name only: `WEB3FORMS_ACCESS_KEY` |
| T11 |  |  |  |
| T12 | [T12] Fast Dependency Pipeline | CI summary: cache-hit + npm ci + audit | `setup-node` cache keyed on `team-site/package-lock.json`; `npm ci` always runs |
| T13 |  |  |  |
| T14 |  |  |  |
| T15 |  |  |  |
| T16 |  |  |  |
| T17 |  |  |  |
| T18 |  |  |  |
| T19 |  |  |  |
| T20 |  |  |  |
| T21 |  |  |  |
| T22 |  |  |  |
| T23 |  |  |  |
| T24 |  |  |  |
| T25 |  |  |  |
| T26 |  |  |  |
| T27 |  |  |  |
| T28 |  |  |  |
| T29 |  |  |  |
| T30 |  |  |  |

## Public Notes

z- T03: CI builds once and uploads immutable artifact `site-dist-${github.sha}`. The `dry-run-deploy` job downloads that exact artifact (no `npm run build`). `/status` exposes `artifact` and `workflowRun`. Organizer deploy request also downloads the same SHA-named artifact before dispatch.

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
