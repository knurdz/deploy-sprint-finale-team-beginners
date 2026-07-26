# Workflow safety (T21)

Organizer baseline:

- `DEFAULT_PERMISSIONS=contents: read`
- `DEPLOY_CONCURRENCY_GROUP=production`
- `PR_WORKFLOWS_GET_NO_DEPLOY_SECRETS=true`

## Permissions by workflow

| Workflow | Permissions | Why beyond `contents: read` |
| --- | --- | --- |
| **CI** | `contents: read`, `actions: write`, `packages: write` | Upload artifacts; push container image to GHCR on `main` |
| **PR Preview** | `contents: read`, `pull-requests: write`, `actions: read` | PR comment + artifact download links; no repo write |
| **Request Organizer Deploy** | `contents: read`, `actions: read` | Read-only; deploy uses `repository_dispatch` curl + secrets (not `GITHUB_TOKEN` write) |
| **Rollback** | `contents: read`, `actions: read` | Manifest artifact; optional deployer dispatch on manual `dry_run=false` |
| **Disaster Recovery (T29)** | `contents: read`, `actions: write` | Upload recovery runtime + manifest artifacts; live path uses deployer secrets |
| **Deploy dashboard (Pages)** | `contents: read`, `pages: write`, `id-token: write`, `actions: read` | GitHub Pages OIDC publish |

No workflow uses `permissions: write-all` or `pull_request_target`.

## Concurrency

| Workflow | Group | `cancel-in-progress` | Behavior |
| --- | --- | --- | --- |
| **CI** | `ci-<workflow>-<ref>` | `true` | New push on same ref cancels stale CI (safe for builds) |
| **PR Preview** | `pr-preview-<PR#>` | `true` | Latest commit on PR wins |
| **Request Organizer Deploy** | `production-<ref>` | `false` | Overlapping deploy **queues**; avoids two VPS writes at once |
| **Rollback** | `production-<ref>` | `false` | Shares queue with deploy so rollback and deploy do not race |
| **Disaster Recovery** | `production-<ref>` | `false` | Same production queue as deploy/rollback |
| **Pages** | `pages-<ref>` | `true` | Independent from VPS `production-*` group |

## PR workflows and deploy secrets

- **CI** on `pull_request`: does **not** reference `PRIVATE_DEPLOY_TOKEN` or `DEPLOYER_DISPATCH_TOKEN`; `/status` evidence uses `privateDeployTokenConfigured: false` on PR builds.
- **PR Preview**: same — no deploy secrets; build-only preview artifacts.

## Verify overlapping deploys

1. Merge T21, then push two commits to `main` quickly (or run **Request Organizer Deploy** twice via `workflow_dispatch` while CI runs).
2. In Actions, open **Request Organizer Deploy** runs: one should run while the other shows **Queued** (same `production-refs/heads/main` group).
3. Confirm VPS `/status` ends on a single latest commit after both complete.

## Judge answer (short)

Each workflow gets only the token scopes it needs (read by default; `actions: write` for artifacts; `pull-requests: write` for preview comments; Pages OIDC for `pages.yml`). When two production deploys overlap, `cancel-in-progress: false` on `production-${{ github.ref }}` **queues** the second run so only one deploy request hits the VPS at a time.


