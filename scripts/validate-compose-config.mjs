#!/usr/bin/env node
/**
 * T22: Validate compose.yml renders with placeholder env (no secrets committed).
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const ciEnvPath = join(repoRoot, '.env.compose-ci');
const sha = process.env.GITHUB_SHA || 'ci-validate';

const lines = [
  'APP_VERSION=' + sha,
  'APP_IMAGE=nginx:alpine',
  'APP_PORT=8080',
  'PUBLIC_URL=http://127.0.0.1:8080',
  'COMPOSE_PROJECT_NAME=deploy-sprint-team-01-ci',
  'SERVICE_NAME=deploy-sprint-team-01-ci',
  'RUNTIME_ENV_PATH=/opt/deploy-sprint/team-01/.env',
  'RUNTIME_ENV_FILE=' + ciEnvPath,
  'TEAM_NAME=BEGINNERS',
  'TEAM_SLUG=beginners',
  'PUBLIC_DEPLOY_LABEL=compose-ci-validate',
];

writeFileSync(ciEnvPath, `${lines.join('\n')}\n`, 'utf8');

try {
  execSync('docker compose --env-file .env.compose-ci config', {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  console.log('T22: docker compose config succeeded (placeholder env, no secrets).');
} finally {
  try {
    unlinkSync(ciEnvPath);
  } catch {
    /* ignore */
  }
}
