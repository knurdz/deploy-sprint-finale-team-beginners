import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
mkdirSync(publicDir, { recursive: true });

const publicDeployLabel =
  process.env.PUBLIC_DEPLOY_LABEL ||
  process.env.VITE_PUBLIC_DEPLOY_LABEL ||
  'unset-public-label';
const privateTokenConfigured =
  process.env.PRIVATE_DEPLOY_TOKEN_CONFIGURED === 'true';
const team = process.env.TEAM_NAME || process.env.VITE_TEAM_NAME || 'BEGINNERS';
const commit = process.env.GITHUB_SHA || process.env.VITE_COMMIT_SHA || 'local-dev';
const releaseId =
  process.env.RELEASE_ID ||
  process.env.GITHUB_RUN_ID ||
  process.env.VITE_RELEASE_ID ||
  `local-${Date.now()}`;
const deployTime =
  process.env.DEPLOY_TIME || process.env.VITE_DEPLOY_TIME || new Date().toISOString();
const publicUrl =
  process.env.PUBLIC_URL ||
  process.env.IP_PUBLIC_URL ||
  process.env.VITE_PUBLIC_URL ||
  'http://20.114.32.177';
const taskMarker = process.env.TASK_MARKER || 'T01';

const status = {
  team,
  team_slug: process.env.TEAM_SLUG || 'beginners',
  commit,
  commit_short: commit.slice(0, 7),
  release_id: String(releaseId),
  deploy_time: deployTime,
  public_url: publicUrl,
  task: taskMarker,
  marker: taskMarker,
  config: {
    publicDeployLabel,
    privateDeployTokenConfigured: privateTokenConfigured,
    secretsRedacted: true,
  },
};

writeFileSync(join(publicDir, 'health'), 'ok\n', 'utf8');
writeFileSync(join(publicDir, 'status'), `${JSON.stringify(status, null, 2)}\n`, 'utf8');
console.log(
  `Wrote /health and /status for ${team} @ ${status.commit_short} (${taskMarker}); label=${publicDeployLabel}, privateTokenConfigured=${privateTokenConfigured}`,
);
