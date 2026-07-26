/**
 * T16: deploy-time / CI Resend alert path.
 * Reads RESEND_API_KEY from env only (GitHub Secret). Never writes the key into
 * Vite client bundles, logs, or public artifacts.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(siteRoot, 'public');
const emailDir = join(publicDir, 'email');

const apiKey = process.env.RESEND_API_KEY || '';
const fromEmail = process.env.RESEND_FROM_EMAIL || '';
const recipientEmail = process.env.ALERT_RECIPIENT_EMAIL || '';
const provider = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase();
const alertMode = (process.env.EMAIL_ALERT_MODE || 'dry-run').toLowerCase();
const dryRun = alertMode !== 'send';

const configured = apiKey.length > 0 && provider === 'resend';
const fromConfigured = fromEmail.length > 0;
const recipientConfigured = recipientEmail.length > 0;

/**
 * Server/CI-only send path. Dry-run simulates without calling Resend or logging
 * addresses/payloads. Live send uses the secret from env and redacts response ids.
 */
async function sendOrSimulateAlert() {
  if (!configured) {
    return { ok: false, mode: dryRun ? 'dry-run' : 'send', reason: 'not-configured' };
  }

  if (dryRun) {
    return {
      ok: true,
      mode: 'dry-run',
      reason: 'simulated-without-network',
    };
  }

  if (!fromConfigured || !recipientConfigured) {
    return { ok: false, mode: 'send', reason: 'missing-from-or-recipient' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [recipientEmail],
      subject: '[Deploy Sprint] T16 transactional alert',
      text: 'Safe deploy-time alert evidence. No secrets in body.',
    }),
  });

  // Never log response bodies (may include message ids / tokens).
  return {
    ok: response.ok,
    mode: 'send',
    reason: response.ok ? 'sent' : `http-${response.status}`,
  };
}

const result = await sendOrSimulateAlert();

const emailStatus = {
  task: 'T16',
  provider: 'resend',
  configured,
  secretRedacted: true,
  apiKeySecretName: 'RESEND_API_KEY',
  fromConfigured,
  recipientConfigured,
  mode: result.mode,
  alertOk: result.ok,
  'email.provider': 'resend',
  'email.configured': configured,
};

mkdirSync(emailDir, { recursive: true });
writeFileSync(join(emailDir, 'status.json'), `${JSON.stringify(emailStatus, null, 2)}\n`, 'utf8');

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(
    process.env.GITHUB_OUTPUT,
    [
      `configured=${configured}`,
      `secret_redacted=true`,
      `mode=${result.mode}`,
      `alert_ok=${result.ok}`,
    ].join('\n') + '\n',
    { flag: 'a' },
  );
}

console.log(
  configured
    ? `Resend email evidence prepared (mode=${result.mode}, secretRedacted=true; API key not logged).`
    : 'Resend not configured (RESEND_API_KEY missing). Wrote redacted status with configured=false.',
);
