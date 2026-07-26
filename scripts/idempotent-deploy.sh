#!/usr/bin/env bash
# T28: race-safe, idempotent deploy operations (dry-run / local staging).
# Adapted from the starter lock snippet. Safe to rerun against the same target.
set -euo pipefail

LOCK_DIR="${LOCK_DIR:-/tmp/deploy-sprint-beginners.lock}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/tmp/deploy-sprint-beginners}"
RELEASES_DIR="${DEPLOY_ROOT}/releases"
TARGET_DIR="${DEPLOY_ROOT}/current"
SHA="${DEPLOY_SHA:-local-dev}"
PASS="${DEPLOY_PASS:-1}"
LOG_FILE="${LOG_FILE:-/tmp/t28-idempotent-deploy.log}"

log() {
  local line="[T28][pass=${PASS}] $*"
  echo "$line"
  echo "$line" >> "$LOG_FILE"
}

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  log "another deploy is running (lock busy: ${LOCK_DIR})"
  exit 1
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true; log "released lock ${LOCK_DIR}"' EXIT

log "acquired lock ${LOCK_DIR}"

# Retry-safe directory layout
mkdir -p "$RELEASES_DIR"
release_dir="${RELEASES_DIR}/${SHA}"

if [ -d "$release_dir" ] && [ -f "${release_dir}/RELEASE" ]; then
  log "reuse existing release directory ${release_dir} (idempotent)"
else
  # Create release dir atomically via temp + rename
  tmp_dir="${release_dir}.tmp.$$"
  rm -rf "$tmp_dir"
  mkdir -p "$tmp_dir"
  {
    echo "task=T28"
    echo "commit=${SHA}"
    echo "createdAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  } > "${tmp_dir}/RELEASE"
  # Replace-or-reuse: if another run finished first, keep the winner
  if mv -T "$tmp_dir" "$release_dir" 2>/dev/null; then
    log "created release directory ${release_dir}"
  else
    rm -rf "$tmp_dir"
    log "race resolved â€” using existing release directory ${release_dir}"
  fi
fi

# Point current at the same target safely (retry-safe replace)
tmp_link="${DEPLOY_ROOT}/current.next.$$"
rm -rf "$tmp_link"
ln -sfn "$release_dir" "$tmp_link"
if mv -Tf "$tmp_link" "$TARGET_DIR" 2>/dev/null; then
  log "switched current -> ${release_dir}"
else
  # Fallback replace that remains safe to rerun
  rm -rf "$TARGET_DIR"
  ln -sfn "$release_dir" "$TARGET_DIR"
  rm -rf "$tmp_link"
  log "fallback switch current -> ${release_dir}"
fi

log "deploy target ready: $(readlink -f "$TARGET_DIR" 2>/dev/null || ls -ld "$TARGET_DIR")"
log "idempotent deploy pass ${PASS} complete for sha=${SHA}"
