# Deploy Sprint Finale Submission

Complete this file on `main` as tasks are completed. Do not paste secrets, private keys, token values, or screenshots that reveal credentials.

## Team

- Team name:
- Team members:
- Live IP URL:
- Assigned domain URL:
- Repository URL:

## Release Evidence

- Current production commit:
- Current artifact/image identifier:
- Current deployment workflow run:
- Current release manifest path or URL:
- Notes on live evidence or fallback evidence:

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
| T06 |  |  |  |
| T07 |  |  |  |
| T08 |  |  |  |
| T09 |  |  |  |
| T10 |  |  |  |
| T11 |  |  |  |
| T12 |  |  |  |
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

- T03: CI builds once and uploads immutable artifact `site-dist-${github.sha}`. The `dry-run-deploy` job downloads that exact artifact (no `npm run build`). `/status` exposes `artifact` and `workflowRun`. Organizer deploy request also downloads the same SHA-named artifact before dispatch.

List anything judges should know without exposing credentials or private infrastructure details.
