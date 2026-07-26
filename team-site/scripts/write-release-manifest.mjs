import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * T23: release evidence manifest.
 * Adapted from the starter snippet — adds artifact identity and task markers.
 * Never writes secret values.
 */
const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(siteRoot, '..');
const publicDir = join(siteRoot, 'public');
mkdirSync(publicDir, { recursive: true });

const commit = process.env.GITHUB_SHA || process.env.VITE_COMMIT_SHA || 'local-dev';
const workflowRun = String(
  process.env.GITHUB_RUN_ID || process.env.RELEASE_ID || process.env.VITE_RELEASE_ID || 'local',
);
const deployedAt =
  process.env.DEPLOY_TIME || process.env.VITE_DEPLOY_TIME || new Date().toISOString();
const artifact =
  process.env.BUILD_ARTIFACT_NAME || `site-dist-${commit}`;

const defaultMarkers = [
  'T01',
  'T02',
  'T04',
  'T05',
  'T06',
  'T07',
  'T09',
  'T10',
  'T12',
  'T15',
  'T23',
];

const taskMarkers = (process.env.COMPLETED_TASK_MARKERS || defaultMarkers.join(','))
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);

if (!taskMarkers.includes('T23')) {
  taskMarkers.push('T23');
}

const manifest = {
  task: 'T23',
  commit,
  commit_short: commit.slice(0, 7),
  artifact,
  workflowRun,
  deployedAt,
  deployTime: deployedAt,
  taskMarkers,
  secretsRedacted: true,
};

const json = `${JSON.stringify(manifest, null, 2)}\n`;

writeFileSync(join(repoRoot, 'release-manifest.json'), json, 'utf8');
writeFileSync(join(publicDir, 'release-manifest.json'), json, 'utf8');

console.log(
  `Wrote release-manifest.json for commit=${manifest.commit_short} artifact=${artifact} workflowRun=${workflowRun}`,
);

export { manifest };
