# Low-downtime release strategy (T17)

## Strategy

Symlinked releases under a deploy root:

- `releases/<sha>/` — each candidate is prepared here first
- `current` — symlink that points at the active release
- Switch traffic **only after** the candidate `/health` check passes

`SWITCH_ONLY_AFTER_HEALTH=true`  
`KEEP_PREVIOUS_RELEASE_ON_FAILURE=true`

## Exact switch step

```bash
ln -sfn "$DEPLOY_ROOT/releases/$SHA" "$DEPLOY_ROOT/current.next.$$"
mv -Tf "$DEPLOY_ROOT/current.next.$$" "$DEPLOY_ROOT/current"
```

What stops a bad release: the script exits **before** this switch if `releases/<sha>/health` is not `ok`. The previous `current` target stays in place and the known-good directory remains on disk.

## How to verify (Actions dry-run)

1. Merge this workflow to `main` (so **Run workflow** appears).
2. Actions → **Low-Downtime Release Strategy** → Run workflow (`run_failure_proof=true`).
3. Confirm logs:
   - `prepared release directory ... (current pointer unchanged)`
   - `health check passed` then `switched current -> ...`
   - bad candidate: `HEALTH FAIL ... refusing switch` and `current still <healthy-sha>`
4. Download artifact `t17-low-downtime-<sha>`.

## Live note

Organizer VPS publish still goes through the deployer. This workflow proves the release-pointer + health-gate pattern with no-live fallback evidence. Live health remains on the last healthy release when a candidate fails checks.
