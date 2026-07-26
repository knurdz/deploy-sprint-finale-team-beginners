# Disaster recovery from Actions only (T29)

## Simulated failure

Organizers remove the app directory or the running container.

`MANUAL_VPS_REPAIR_ALLOWED=false` — do not SSH / Termius / copy files by hand.

## Restore target

Use the **latest confirmed** release:

- Git commit SHA that passed CI, **or**
- Artifact `site-dist-<sha>`, **or**
- Container image `ghcr.io/knurdz/deploy-sprint-finale-team-beginners/team-site:<sha>`

## Runbook

1. Confirm failure (`/health` down or organizer notice).
2. Pick the latest confirmed `restore_target` SHA from CI / release-manifest / `/status`.
3. Actions → **Disaster Recovery From Actions Only** → Run workflow.
4. Input `restore_target=<sha>`; leave `dry_run=true` for no-live rehearsal, or `false` for live organizer container redeploy.
5. Confirm log line: `Log line proving restore target: restore_target=<sha>`.
6. Download artifact `recovery-manifest-<run_id>` and check `restore_target` / `image` / `manual_vps_repair: false`.
7. Live verify: `PUBLIC_URL/health` and `/status` commit/image match the restored release.

## What the workflow recreates (order)

When the VPS app directory is empty:

1. App directories (`app/releases`, `app/shared`, `app/current`)
2. Env placeholders (secret **names** only — values stay in GitHub Secrets)
3. Container/service config (`container.env`, illustrative `docker-run.example.sh`)
4. Release pointer bound to artifact + GHCR image for the SHA
5. Service recreate via organizer deployer (`dry_run=false`) or simulated recreate (`dry_run=true`)
6. Verify `/health` + `/status` (live) or recovery manifest (fallback)

## Safety

- No secret values in the runbook, manifests, or committed env files.
- Live redeploy uses `DEPLOYER_DISPATCH_TOKEN` / `PRIVATE_DEPLOY_TOKEN` in Actions only.
- Shares production concurrency group so recovery queues with deploy/rollback.
