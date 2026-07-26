# PR preview deployment (T11)

Organizer preview naming:

- `PREVIEW_BASE_PATH=/previews/pr-<number>`
- `PREVIEW_STATUS_FIELD=previewUrl`
- `PRODUCTION_STATUS_MUST_NOT_CHANGE=true`

## How previews differ from production

| | Production | PR preview |
| --- | --- | --- |
| Trigger | `CI` workflow completes on **`main`** → `Request Organizer Deploy` | `PR Preview` workflow on **`pull_request`** only |
| Output | Live site at domain root (`/`, `/status`, `/health`) | GitHub Actions artifact `pr-preview-<PR#>-<commit SHA>` |
| Path pattern | `/` | `/previews/pr-<PR#>/` (documented in `preview-manifest.json`; VPS path deploy is optional) |
| Secrets | Uses organizer deploy token via deploy workflow | Build uses repo vars + `PRIVATE_DEPLOY_TOKEN` presence check only; **does not** invoke deploy workflow |

## Cleanup / overwrite behavior

- **Artifacts:** Each push to the PR uploads a new artifact named with that commit SHA. Older artifacts for the same PR remain until GitHub retention removes them; the latest run is the one linked in the updated PR comment.
- **Concurrency:** `concurrency` on PR number cancels in-progress preview builds when new commits are pushed.
- **VPS (if enabled later):** Deploying to `/previews/pr-<number>/` would overwrite only that PR’s preview directory, never the production web root.

## Verification

1. Open a PR and wait for **PR Preview** to finish.
2. Read the workflow **Summary** or the bot **T11 PR preview** comment (PR number + commit + artifact name).
3. Download artifact `pr-preview-<PR#>-<sha>`, open `preview-manifest.json` and `status` (includes `previewUrl` when built with `PREVIEW_PR_NUMBER`).
4. If production is live, confirm production `/status` commit is unchanged after a preview workflow run (preview does not run deploy).
