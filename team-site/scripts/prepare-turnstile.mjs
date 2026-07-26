/**
 * T24: deploy-time / CI Cloudflare Turnstile verification path.
 * Reads TURNSTILE_SECRET_KEY from env only (GitHub Secret). Never writes the secret
 * into Vite client bundles, logs, or public artifacts.
 * Public widget key may be TURNSTILE_SITE_KEY / VITE_TURNSTILE_SITE_KEY only.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(siteRoot, 'public');
const turnstileDir = join(publicDir, 'turnstile');
const runtimePath = join(siteRoot, 'src', 'config', 'turnstile-runtime.ts');

const secretKey = process.env.TURNSTILE_SECRET_KEY || '';
const siteKey =
  process.env.TURNSTILE_SITE_KEY ||
  process.env.VITE_TURNSTILE_SITE_KEY ||
  '';
const allowedHostname =
  process.env.TURNSTILE_ALLOWED_HOSTNAME ||
  process.env.ASSIGNED_DOMAIN ||
  process.env.VITE_ASSIGNED_DOMAIN ||
  'beginners.deploysprint-finals.knurdz.org';
const verifyMode = (process.env.TURNSTILE_VERIFY_MODE || 'dry-run').toLowerCase();
const dryRun = verifyMode !== 'live';

const secretConfigured = secretKey.length > 0;
const siteKeyConfigured = siteKey.length > 0;
const configured = secretConfigured && siteKeyConfigured;

/**
 * Server/CI-only siteverify path. Dry-run proves secret presence without network
 * and without logging key material. Live mode posts to Cloudflare siteverify.
 */
async function verifyOrSimulate() {
  if (!secretConfigured) {
    return { ok: false, mode: dryRun ? 'dry-run' : 'live', reason: 'secret-missing' };
  }

  if (dryRun) {
    return {
      ok: true,
      mode: 'dry-run',
      reason: 'secret-present-siteverify-path-ready',
    };
  }

  const responseToken = process.env.TURNSTILE_RESPONSE_TOKEN || '';
  if (!responseToken) {
    return { ok: false, mode: 'live', reason: 'missing-response-token' };
  }

  const body = new URLSearchParams();
  body.set('secret', secretKey);
  body.set('response', responseToken);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  // Never log response bodies (may include challenge metadata).
  let success = false;
  try {
    const payload = await response.json();
    success = Boolean(payload && payload.success);
  } catch {
    success = false;
  }

  return {
    ok: response.ok && success,
    mode: 'live',
    reason: success ? 'siteverify-ok' : `siteverify-failed-${response.status}`,
  };
}

const result = await verifyOrSimulate();

const turnstileStatus = {
  task: 'T24',
  provider: 'cloudflare-turnstile',
  siteKeyPublic: true,
  secretKeyServerOnly: Boolean(process.env.TURNSTILE_SECRET_KEY),
  secretRedacted: true,
  configured,
  siteKeyConfigured,
  secretConfigured,
  secretKeySecretName: 'TURNSTILE_SECRET_KEY',
  allowedHostname,
  mode: result.mode,
  verifyOk: result.ok,
  'turnstile.provider': 'cloudflare-turnstile',
  'turnstile.configured': configured,
};

mkdirSync(turnstileDir, { recursive: true });
writeFileSync(join(turnstileDir, 'status.json'), `${JSON.stringify(turnstileStatus, null, 2)}\n`, 'utf8');

writeFileSync(
  runtimePath,
  `/**
 * Generated during CI from TURNSTILE_SITE_KEY — public widget key only.
 * TURNSTILE_SECRET_KEY stays server/CI-only (never written here; never VITE_).
 */
export const turnstileSiteKey = ${JSON.stringify(siteKey)};
export const turnstileSiteKeyConfigured = ${siteKeyConfigured};
export const turnstileProvider = 'cloudflare-turnstile' as const;
export const turnstileSecretKeySecretName = 'TURNSTILE_SECRET_KEY' as const;
export const turnstileAllowedHostname = ${JSON.stringify(allowedHostname)};
`,
  'utf8',
);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(
    process.env.GITHUB_OUTPUT,
    [
      `configured=${configured}`,
      `secret_configured=${secretConfigured}`,
      `site_key_configured=${siteKeyConfigured}`,
      `secret_redacted=true`,
      `mode=${result.mode}`,
      `verify_ok=${result.ok}`,
      `allowed_hostname=${allowedHostname}`,
    ].join('\n') + '\n',
    { flag: 'a' },
  );
}

console.log(
  configured
    ? `Turnstile evidence prepared (mode=${result.mode}, hostname=${allowedHostname}, secretRedacted=true; keys not logged).`
    : 'Turnstile not fully configured (need TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY). Wrote redacted status.',
);
