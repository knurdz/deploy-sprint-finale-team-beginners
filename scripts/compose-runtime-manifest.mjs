#!/usr/bin/env node
/**
 * T22: Build compose deploy manifest (no secret values). Used in deploy workflow + CI dry-run.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const sha = process.env.GITHUB_SHA || process.env.TEAM_SHA || 'local-dev';
const repo = (process.env.GITHUB_REPOSITORY || 'knurdz/deploy-sprint-finale-team-beginners').toLowerCase();
const image =
  process.env.APP_IMAGE ||
  process.env.CONTAINER_IMAGE ||
  `ghcr.io/${repo}/team-site:${sha}`;

const manifest = {
  task: 'T22',
  runtime: 'compose',
  commit: sha,
  composeProjectName: process.env.COMPOSE_PROJECT_NAME || 'deploy-sprint-team-01',
  serviceName: process.env.SERVICE_NAME || 'deploy-sprint-team-01',
  runtimeEnvPath: process.env.RUNTIME_ENV_PATH || '/opt/deploy-sprint/team-01/.env',
  appPort: Number(process.env.APP_PORT || '8080'),
  publicUrl: process.env.PUBLIC_URL || process.env.DOMAIN_PUBLIC_URL || '',
  appImage: image,
  composeFile: 'compose.yml',
  envExampleFile: '.env.example',
  runtimeEnvKeys: [
    'APP_VERSION',
    'APP_IMAGE',
    'APP_PORT',
    'PUBLIC_URL',
    'COMPOSE_PROJECT_NAME',
    'SERVICE_NAME',
    'RUNTIME_ENV_PATH',
    'TEAM_NAME',
    'TEAM_SLUG',
    'PUBLIC_DEPLOY_LABEL',
  ],
  runtimeSecretNames: [
    'PRIVATE_DEPLOY_TOKEN',
    'WEB3FORMS_ACCESS_KEY',
  ],
  deployerActions: [
    'write runtime .env at RUNTIME_ENV_PATH from vars + approved secrets (never from git)',
    'copy compose.yml to deploy path',
    'docker compose pull',
    'docker compose up -d --remove-orphans',
    'docker compose ps',
  ],
  secretsRedacted: true,
};

const envLines = readFileSync(join(repoRoot, '.env.example'), 'utf8')
  .split('\n')
  .filter((line) => line.trim() && !line.trim().startsWith('#'))
  .map((line) => line.split('=')[0].trim())
  .filter(Boolean);

manifest.runtimeEnvKeysFromExample = envLines;

const outPath = process.env.COMPOSE_MANIFEST_PATH || join(repoRoot, 'compose-deploy-manifest.json');
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outPath} for compose runtime @ ${sha.slice(0, 7)}`);
