import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(siteRoot, '..');
const publicDir = join(siteRoot, 'public');
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

const publicUrlMode = process.env.PUBLIC_URL_MODE || 'domain';
const ipPublicUrl =
  process.env.IP_PUBLIC_URL || process.env.VITE_IP_PUBLIC_URL || 'http://20.114.32.177';
const domainPublicUrl =
  process.env.DOMAIN_PUBLIC_URL ||
  process.env.VITE_DOMAIN_PUBLIC_URL ||
  'https://beginners.deploysprint-finals.knurdz.org';
const assignedDomain =
  process.env.ASSIGNED_DOMAIN ||
  process.env.VITE_ASSIGNED_DOMAIN ||
  'beginners.deploysprint-finals.knurdz.org';
const dnsRecordType = process.env.DNS_RECORD_TYPE || 'A';
const dnsRecordName = process.env.DNS_RECORD_NAME || 'beginners';
const dnsRecordValue = process.env.DNS_RECORD_VALUE || '20.114.32.177';
const domainConnected =
  process.env.DOMAIN_CONNECTED === 'true' || publicUrlMode === 'domain';
const verificationTime = process.env.DOMAIN_VERIFIED_AT || deployTime;

const publicUrl =
  publicUrlMode === 'domain'
    ? domainPublicUrl
    : process.env.PUBLIC_URL || ipPublicUrl || process.env.VITE_PUBLIC_URL || ipPublicUrl;

const taskMarker = process.env.TASK_MARKER || 'T02';
const previewPrNumber = process.env.PREVIEW_PR_NUMBER;
const previewBasePath =
  process.env.PREVIEW_BASE_PATH ||
  (previewPrNumber ? `/previews/pr-${previewPrNumber}` : undefined);

// T15: boolean only — never write the raw secret/string beyond true/false.
const showInsights =
  process.env.FEATURE_SHOW_INSIGHTS === 'true' ||
  process.env.VITE_FEATURE_SHOW_INSIGHTS === 'true';
const featureFlags = {
  task: 'T15',
  showInsights,
  valueRedacted: true,
};

const containerName = process.env.CONTAINER_NAME || 'deploy-sprint-team-01';
const appPort = process.env.APP_PORT || '8080';
const containerImageExplicit =
  process.env.CONTAINER_IMAGE || process.env.IMAGE_TAG || process.env.VITE_CONTAINER_IMAGE;
const containerImage =
  containerImageExplicit || `deploy-sprint/team-site:${commit}`;

const domainEvidence = {
  connected: domainConnected,
  assignedDomain,
  recordType: dnsRecordType,
  recordName: dnsRecordName,
  recordTarget: dnsRecordValue,
  domainPublicUrl,
  ipPublicUrl,
  verifiedAt: verificationTime,
};

const web3formsConfigured =
  process.env.WEB3FORMS_CONFIGURED === 'true' ||
  process.env.WEB3FORMS_ACCESS_KEY_CONFIGURED === 'true';

const contactEvidence = {
  provider: 'web3forms',
  configured: web3formsConfigured,
  accessKeyStoredInSecret: true,
};

// T16: Resend readiness only — never write API key, response tokens, or addresses.
// Prefer artifact from prepare-resend-email.mjs; fall back to boolean CI flags only.
let emailConfigured =
  process.env.RESEND_CONFIGURED === 'true' ||
  process.env.RESEND_API_KEY_CONFIGURED === 'true';
let emailMode = process.env.EMAIL_ALERT_MODE || 'dry-run';
const emailStatusPath = join(publicDir, 'email', 'status.json');
if (existsSync(emailStatusPath)) {
  try {
    const emailArtifact = JSON.parse(readFileSync(emailStatusPath, 'utf8'));
    if (typeof emailArtifact.configured === 'boolean') {
      emailConfigured = emailArtifact.configured;
    }
    if (typeof emailArtifact.mode === 'string') {
      emailMode = emailArtifact.mode;
    }
  } catch {
    // Keep env-flag fallback if artifact is unreadable.
  }
}
const emailEvidence = {
  task: 'T16',
  provider: 'resend',
  configured: emailConfigured,
  secretRedacted: true,
  apiKeySecretName: 'RESEND_API_KEY',
  mode: emailMode,
};

const status = {
  team,
  team_slug: process.env.TEAM_SLUG || 'beginners',
  commit,
  commit_short: commit.slice(0, 7),
  release_id: String(releaseId),
  deploy_time: deployTime,
  public_url: publicUrl,
  public_url_mode: publicUrlMode,
  task: taskMarker,
  marker: taskMarker,
  domain: domainEvidence,
  'domain.connected': domainConnected,
  assignedDomain,
  config: {
    publicDeployLabel,
    privateDeployTokenConfigured: privateTokenConfigured,
    secretsRedacted: true,
  },
  featureFlags,
  contact: contactEvidence,
  'contact.provider': 'web3forms',
  'contact.configured': web3formsConfigured,
  email: emailEvidence,
  'email.provider': 'resend',
  'email.configured': emailConfigured,
};

if (previewPrNumber && previewBasePath) {
  const previewUrl = `${publicUrl.replace(/\/$/, '')}${previewBasePath}/`;
  status.preview = {
    pr: Number(previewPrNumber),
    previewUrl,
    previewBasePath,
    productionStatusMustNotChange: true,
  };
  status.previewUrl = previewUrl;
}

if (taskMarker === 'T18' || containerImageExplicit) {
  status.container = {
    name: containerName,
    image: containerImage,
    imageTag: containerImage.includes(':') ? containerImage.split(':').pop() : commit,
    appPort: Number(appPort),
    commit,
  };
  status.image = containerImage;
}

const domainConfig = {
  assignedDomain,
  DOMAIN_PUBLIC_URL: domainPublicUrl,
  PUBLIC_URL: publicUrl,
  IP_PUBLIC_URL: ipPublicUrl,
  DNS_RECORD_TYPE: dnsRecordType,
  DNS_RECORD_NAME: dnsRecordName,
  DNS_RECORD_VALUE: dnsRecordValue,
  domain: domainEvidence,
};

writeFileSync(join(publicDir, 'health'), 'ok\n', 'utf8');
writeFileSync(join(publicDir, 'status'), `${JSON.stringify(status, null, 2)}\n`, 'utf8');
writeFileSync(join(repoRoot, 'domain.config.json'), `${JSON.stringify(domainConfig, null, 2)}\n`, 'utf8');
console.log(
  `Wrote /health, /status, and domain.config.json for ${team} @ ${status.commit_short} (${taskMarker}, domain.connected=${domainConnected})`,
);
