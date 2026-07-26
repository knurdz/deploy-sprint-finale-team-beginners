# Compose runtime service (T22)

Organizer values:

- `SERVICE_NAME=deploy-sprint-team-01`
- `COMPOSE_PROJECT_NAME=deploy-sprint-team-01`
- `RUNTIME_ENV_PATH=/opt/deploy-sprint/team-01/.env`
- `APP_PORT=8080`

## What lives where

| Item | Location |
| --- | --- |
| Service definition | `compose.yml` in git (healthcheck, `restart: unless-stopped`, `env_file`) |
| Variable **names** | `.env.example` (placeholders only) |
| Real runtime values | VPS file at `RUNTIME_ENV_PATH`, written by the **organizer deployer** from GitHub vars + approved secrets during deploy |
| Release identity | `/status` → `runtime: "compose"`, `compose.appImage`, `compose.release` (commit SHA) |

No populated `.env` is committed (see `.gitignore`).

## Deploy flow

1. **CI** runs `docker compose config` with a temporary `.env.compose-ci` (placeholder image, no secrets).
2. CI uploads `compose-deploy-<sha>` manifest artifact.
3. **Request Organizer Deploy** builds the same manifest and sends `deploy_mode: compose` to `knurdz/deploy-sprint-deployer` with `runtime_env_path`, `runtime_env_keys`, and `runtime_secret_names` (names only).
4. Deployer on VPS: write `.env`, `docker compose pull`, `docker compose up -d --remove-orphans`, `docker compose ps`.

## Safe updates

- Overlap with T21: deploy uses `production-${{ github.ref }}` concurrency (`cancel-in-progress: false`) so compose deploys queue.
- Service update replaces containers via compose (`up -d --remove-orphans`), not manual `docker run`.
- Secrets never appear in compose.yml or committed env files.

## Verify

- PR: CI step **Validate Compose config** + artifact `compose-deploy-<sha>`.
- Deploy run: summary lists manifest + `RUNTIME_ENV_PATH`.
- Live: `curl …/health` and `/status` shows `runtime` and `compose` block matching merge commit.

## Judge answer (short)

Runtime **variables** are defined by name in `.env.example` and `compose.yml` references `env_file`; **values** are generated on the VPS at `RUNTIME_ENV_PATH` during an Actions-triggered deploy from repository variables and deployment secrets. Updates roll out by merging to `main`, CI passing, and the deployer re-running compose with a new `APP_IMAGE` / `APP_VERSION` tag—without editing secrets in git.

