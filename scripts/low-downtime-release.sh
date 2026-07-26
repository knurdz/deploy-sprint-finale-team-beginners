#!/usr/bin/env bash
# T17: low-downtime symlinked releases — prepare candidate, health-check, switch only on success.
# KEEP_PREVIOUS_RELEASE_ON_FAILURE=true
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/tmp/deploy-sprint-beginners-t17}"
RELEASES_DIR="${DEPLOY_ROOT}/releases"
CURRENT_LINK="${DEPLOY_ROOT}/current"
SHA="${DEPLOY_SHA:?DEPLOY_SHA is required}"
MODE="${RELEASE_MODE:-promote}" # promote | fail-health
HEALTH_MARKER="${HEALTH_MARKER:-ok}"
LOG_FILE="${LOG_FILE:-${DEPLOY_ROOT}/t17-low-downtime.log}"

mkdir -p "$RELEASES_DIR" "$DEPLOY_ROOT"
touch "$LOG_FILE"

log() {
  local line="[T17] $*"
  echo "$line"
  echo "$line" >> "$LOG_FILE"
}

read_current_release() {
  if [ -L "$CURRENT_LINK" ] || [ -d "$CURRENT_LINK" ]; then
    basename "$(readlink -f "$CURRENT_LINK" 2>/dev/null || readlink "$CURRENT_LINK" 2>/dev/null || echo "")" 2>/dev/null || true
  else
    echo ""
  fi
}

previous="$(read_current_release)"
log "prepare start sha=${SHA} previous=${previous:-<none>} mode=${MODE}"

# 1) Deploy candidate into a NEW release directory (do not touch current yet).
release_dir="${RELEASES_DIR}/${SHA}"
tmp_dir="${release_dir}.tmp.$$"
rm -rf "$tmp_dir"
mkdir -p "$tmp_dir"

{
  echo "task=T17"
  echo "commit=${SHA}"
  echo "createdAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "${tmp_dir}/RELEASE"

# Candidate health file used by local fallback HEALTH check.
if [ "$MODE" = "fail-health" ]; then
  printf 'unhealthy\n' > "${tmp_dir}/health"
  log "candidate prepared with failing health marker (simulated bad release)"
else
  printf '%s\n' "$HEALTH_MARKER" > "${tmp_dir}/health"
  log "candidate prepared with healthy marker"
fi

printf 'ok\n' > "${tmp_dir}/ready"

# Atomic publish of release directory contents.
rm -rf "$release_dir"
mv "$tmp_dir" "$release_dir"
log "prepared release directory ${release_dir} (current pointer unchanged)"

# 2) Health-check the CANDIDATE only (not live traffic).
candidate_health="${release_dir}/health"
log "health check candidate path=${candidate_health}"
if ! grep -qx "$HEALTH_MARKER" "$candidate_health"; then
  log "HEALTH FAIL for candidate ${SHA} — refusing switch"
  log "KEEP_PREVIOUS_RELEASE_ON_FAILURE=true previous=${previous:-<none>}"
  if [ -n "$previous" ] && [ -e "${RELEASES_DIR}/${previous}" ]; then
    log "known-good release still available at ${RELEASES_DIR}/${previous}"
  fi
  if [ -L "$CURRENT_LINK" ] || [ -d "$CURRENT_LINK" ]; then
    log "current still points to $(readlink -f "$CURRENT_LINK" 2>/dev/null || readlink "$CURRENT_LINK")"
  else
    log "current pointer absent; no traffic switch performed"
  fi
  exit 1
fi
log "health check passed for candidate ${SHA}"

# 3) Switch traffic ONLY after health passes (atomic symlink replace).
log "switch step: ln -sfn releases/${SHA} -> current (traffic cutover)"
tmp_link="${DEPLOY_ROOT}/current.next.$$"
rm -rf "$tmp_link"
ln -sfn "$release_dir" "$tmp_link"
if mv -Tf "$tmp_link" "$CURRENT_LINK" 2>/dev/null; then
  log "switched current -> ${release_dir}"
else
  rm -rf "$CURRENT_LINK"
  ln -sfn "$release_dir" "$CURRENT_LINK"
  rm -rf "$tmp_link"
  log "fallback switched current -> ${release_dir}"
fi

current_now="$(read_current_release)"
log "currentRelease=${current_now}"
log "previousRelease=${previous:-<none>}"
log "deployTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
log "low-downtime promote complete for sha=${SHA}"
