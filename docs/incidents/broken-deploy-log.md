# Broken Deploy Rehearsal (T26)

## Seeded symptom

Deployment artifact upload fails because the organizer workflow pointed at `build`, but Vite writes production output to `team-site/dist`.

Seeded failing step name: `Upload wrong directory`  
Seeded path: `build`

## Root cause (decisive log line)

```text
No files were found with the provided path: build
```

Why this proves it: the build step can succeed (or root scripts can run) while the upload still targets a directory that does not exist. Production would get an empty/wrong artifact if this path shipped.

## Response order

1. **Rollback first** if production is unhealthy — use `.github/workflows/rollback.yml` with a known-good `release_ref` (`dry_run=true` for no-live evidence).
2. **Forward fix** — change the rehearsal workflow to install/build in `team-site/` and upload `team-site/dist`.

## Forward fix

- `npm ci` / `npm run build` with `working-directory: team-site`
- Upload path `team-site/dist` (not `build`, not bare `dist`)
- `if-no-files-found: error` so a missing dist fails the job

## Verification

1. Actions → **Broken deploy rehearsal** → Run workflow (default `recovery_target=team-site/dist`)
2. Confirm log line: `Log line proving recovery target: recovery_target=team-site/dist`
3. Confirm artifact `recovered-deploy-output` uploads
4. Optional failure proof: re-run with `recovery_target=build` and confirm the job refuses/fails
