# Containerized VPS deploy (T18)

Organizer runtime targets:

- `CONTAINER_NAME=deploy-sprint-team-01`
- `APP_PORT=8080`
- `PUBLIC_URL=<team-public-url>`

## Flow

1. **CI** (`/.github/workflows/ci.yml`) builds `team-site`, then builds a Docker image tagged with the commit SHA:
   - `ghcr.io/knurdz/deploy-sprint-finale-team-beginners/team-site:<sha>`
   - local tag `deploy-sprint/team-site:<sha>` (build logs)
2. On **push to `main`**, CI pushes the image to GHCR (package visibility must allow the organizer deployer to pull).
3. **Request Organizer Deploy** (`deploy.yml`) runs after CI succeeds on `main` and sends a `repository_dispatch` to `knurdz/deploy-sprint-deployer` with `deploy_mode: container`, `image`, `container_name`, and `app_port`. No participant SSH keys are used.
4. The deployer replaces the running container (for example `docker rm -f deploy-sprint-team-01 || true` then `docker run ... -p 8080:80`).
5. **Evidence:** live `/status` includes `container.image` and `image` matching the SHA tag; `/health` returns `ok`. Fallback: CI artifact `container-deploy-<sha>` and workflow summaries.

## How you know the running container matches the reviewed commit

The image tag is the full Git commit SHA built in CI and recorded in `/status` (`container.imageTag`, `commit`, and top-level `image`). The deploy request sends the same SHA and image reference to the organizer deployer, so the reviewed merge commit, CI build, GHCR tag, and live `/status` should all align.

## Verification

- PR: confirm CI **Build container image** step succeeds and summary lists the GHCR tag.
- After merge: open **Request Organizer Deploy** summary for the image line and optional health check output.
- Live: `curl https://beginners.deploysprint-finals.knurdz.org/health` and inspect `/status` for `container` + `commit`.

## Safety notes

- Do not start containers manually on the VPS; use Actions + deployer only.
- Do not use `:latest` without a SHA tag.
- Old container removal should be idempotent (`docker rm -f` before `docker run` with a fixed name) to avoid port conflicts.
