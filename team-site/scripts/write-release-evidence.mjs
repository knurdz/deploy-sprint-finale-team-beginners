import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(siteRoot, 'public');
mkdirSync(publicDir, { recursive: true });

const publicDeployLabel =
  process.env.PUBLIC_DEPLOY_LABEL ||
  process.env.VITE_PUBLIC_DEPLOY_LABEL ||
  'unset-public-label';
const privateTokenConfigured =
  process.env.PRIVATE_DEPLOY_TOKEN_CONFIGURED === 'true';

const status = {
  team: process.env.TEAM_NAME || 'BEGINNERS',
  task: 'T05',
  marker: 'T05',
  config: {
    publicDeployLabel,
    privateDeployTokenConfigured: privateTokenConfigured,
    secretsRedacted: true,
  },
};

writeFileSync(join(publicDir, 'health'), 'ok\n', 'utf8');
writeFileSync(join(publicDir, 'status'), `${JSON.stringify(status, null, 2)}\n`, 'utf8');
console.log(
  `Wrote deploy config evidence: label=${publicDeployLabel}, privateTokenConfigured=${privateTokenConfigured}`,
);
