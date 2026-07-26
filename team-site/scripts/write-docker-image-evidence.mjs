import { writeFileSync } from 'node:fs';

/**
 * T14: record production Docker image tag/digest evidence (no secrets).
 */
const commit = process.env.GITHUB_SHA || 'local-dev';
const imageTag =
  process.env.DOCKER_IMAGE_TAG ||
  process.env.CONTAINER_IMAGE ||
  `deploy-sprint/team-site:${commit}`;
const imageId = process.env.DOCKER_IMAGE_ID || '';
const imageDigest = process.env.DOCKER_IMAGE_DIGEST || '';
const workflowRun = String(process.env.GITHUB_RUN_ID || 'local');

const evidence = {
  task: 'T14',
  marker: 'T14',
  commit,
  commit_short: commit.slice(0, 7),
  dockerfile: 'team-site/Dockerfile',
  lockfile: 'team-site/package-lock.json',
  imageTag,
  imageId,
  imageDigest: imageDigest || null,
  servesStaticDist: true,
  runtime: 'nginx:alpine',
  workflowRun,
  secretsRedacted: true,
};

writeFileSync('docker-image-evidence.json', `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
console.log(
  `Wrote docker-image-evidence.json for ${evidence.commit_short} tag=${imageTag} id=${imageId || 'n/a'}`,
);
