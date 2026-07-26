import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(siteRoot, 'public');
mkdirSync(publicDir, { recursive: true });

const commit = process.env.GITHUB_SHA || process.env.VITE_COMMIT_SHA || 'local-dev';
const workflowRun = String(
  process.env.GITHUB_RUN_ID || process.env.VITE_RELEASE_ID || process.env.RELEASE_ID || 'local',
);
const artifact =
  process.env.BUILD_ARTIFACT_NAME || `site-dist-${commit}`;

const publicDeployLabel =
  process.env.PUBLIC_DEPLOY_LABEL ||
  process.env.VITE_PUBLIC_DEPLOY_LABEL ||
  'unset-public-label';
const privateTokenConfigured =
  process.env.PRIVATE_DEPLOY_TOKEN_CONFIGURED === 'true';

const status = {
  team: process.env.TEAM_NAME || 'BEGINNERS',
  commit,
  commit_short: commit.slice(0, 7),
  task: process.env.TASK_MARKER || 'T03',
  marker: process.env.TASK_MARKER || 'T03',
  // T03 organizer field names
  artifact,
  workflowRun,
  config: {
    publicDeployLabel,
    privateDeployTokenConfigured: privateTokenConfigured,
    secretsRedacted: true,
  },
};

writeFileSync(join(publicDir, 'health'), 'ok\n', 'utf8');
writeFileSync(join(publicDir, 'status'), `${JSON.stringify(status, null, 2)}\n`, 'utf8');
console.log(
  `Wrote /status artifact=${artifact} workflowRun=${workflowRun} commit=${status.commit_short}`,
);
