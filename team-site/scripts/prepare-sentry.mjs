import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const configDir = join(siteRoot, 'src', 'config');
const publicDir = join(siteRoot, 'public');

const dsn = process.env.SENTRY_DSN || '';
const configured = dsn.length > 0;
const release =
  process.env.SENTRY_RELEASE ||
  process.env.GITHUB_SHA ||
  process.env.VITE_COMMIT_SHA ||
  'local-dev';
const org = process.env.SENTRY_ORG || '';
const project = process.env.SENTRY_PROJECT || '';

mkdirSync(configDir, { recursive: true });
mkdirSync(join(publicDir, 'monitoring'), { recursive: true });

writeFileSync(
  join(configDir, 'sentry-runtime.ts'),
  `/**
 * Generated at build time from secrets.SENTRY_DSN (client-safe). SENTRY_AUTH_TOKEN is never written here.
 */
export const sentryDsn = ${JSON.stringify(configured ? dsn : '')};
export const sentryRelease = ${JSON.stringify(release)};
export const sentryOrg = ${JSON.stringify(org)};
export const sentryProject = ${JSON.stringify(project)};
export const sentryConfigured = ${configured};
export const authTokenStoredInSecret = true;
`,
  'utf8',
);

writeFileSync(
  join(publicDir, 'monitoring', 'sentry.json'),
  `${JSON.stringify(
    {
      task: 'T30',
      provider: 'sentry',
      configured,
      release,
      org: org || undefined,
      project: project || undefined,
      authTokenStoredInSecret: true,
      testErrorPath: './sentry-test.html',
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(
  configured
    ? 'Sentry runtime prepared from SENTRY_DSN (DSN value not logged).'
    : 'Sentry not configured (SENTRY_DSN missing).',
);
