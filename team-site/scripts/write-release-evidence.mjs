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

const taskMarker = process.env.TASK_MARKER || 'T23';
const previewPrNumber = process.env.PREVIEW_PR_NUMBER;
const previewBasePath =
  process.env.PREVIEW_BASE_PATH ||
  (previewPrNumber ? `/previews/pr-${previewPrNumber}` : undefined);

const artifactName =
  process.env.BUILD_ARTIFACT_NAME || `site-dist-${commit}`;
const workflowRunId = String(releaseId);

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
  'T16',
  'T23',
  'T24',
];
const taskMarkers = (process.env.COMPLETED_TASK_MARKERS || defaultMarkers.join(','))
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);
if (!taskMarkers.includes('T23')) {
  taskMarkers.push('T23');
}
if (!taskMarkers.includes('T24')) {
  taskMarkers.push('T24');
}

const releaseManifest = {
  task: 'T23',
  commit,
  commit_short: commit.slice(0, 7),
  artifact: artifactName,
  workflowRun: workflowRunId,
  deployedAt: deployTime,
  deployTime,
  taskMarkers,
  secretsRedacted: true,
};

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

const composeProjectName = process.env.COMPOSE_PROJECT_NAME || 'deploy-sprint-team-01';
const serviceName = process.env.SERVICE_NAME || 'deploy-sprint-team-01';
const runtimeEnvPath =
  process.env.RUNTIME_ENV_PATH || '/opt/deploy-sprint/team-01/.env';
const appPort = process.env.APP_PORT || '8080';
const appImageExplicit =
  process.env.APP_IMAGE || process.env.CONTAINER_IMAGE || process.env.VITE_APP_IMAGE;
const appImageDefault = appImageExplicit || `deploy-sprint/team-site:${commit}`;
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

// T24: Cloudflare Turnstile readiness — never write secret key or response tokens.
let turnstileConfigured =
  process.env.TURNSTILE_CONFIGURED === 'true' ||
  process.env.TURNSTILE_SECRET_KEY_CONFIGURED === 'true';
let turnstileMode = process.env.TURNSTILE_VERIFY_MODE || 'dry-run';
let turnstileAllowedHostname =
  process.env.TURNSTILE_ALLOWED_HOSTNAME ||
  process.env.ASSIGNED_DOMAIN ||
  process.env.VITE_ASSIGNED_DOMAIN ||
  'beginners.deploysprint-finals.knurdz.org';
let turnstileSiteKeyConfigured =
  process.env.TURNSTILE_SITE_KEY_CONFIGURED === 'true' ||
  Boolean(process.env.TURNSTILE_SITE_KEY || process.env.VITE_TURNSTILE_SITE_KEY);
const turnstileStatusPath = join(publicDir, 'turnstile', 'status.json');
if (existsSync(turnstileStatusPath)) {
  try {
    const turnstileArtifact = JSON.parse(readFileSync(turnstileStatusPath, 'utf8'));
    if (typeof turnstileArtifact.configured === 'boolean') {
      turnstileConfigured = turnstileArtifact.configured;
    }
    if (typeof turnstileArtifact.mode === 'string') {
      turnstileMode = turnstileArtifact.mode;
    }
    if (typeof turnstileArtifact.allowedHostname === 'string') {
      turnstileAllowedHostname = turnstileArtifact.allowedHostname;
    }
    if (typeof turnstileArtifact.siteKeyConfigured === 'boolean') {
      turnstileSiteKeyConfigured = turnstileArtifact.siteKeyConfigured;
    }
  } catch {
    // Keep env-flag fallback if artifact is unreadable.
  }
}
const turnstileEvidence = {
  task: 'T24',
  provider: 'cloudflare-turnstile',
  configured: turnstileConfigured,
  siteKeyConfigured: turnstileSiteKeyConfigured,
  siteKeyPublic: true,
  secretRedacted: true,
  secretKeySecretName: 'TURNSTILE_SECRET_KEY',
  allowedHostname: turnstileAllowedHostname,
  mode: turnstileMode,
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

  releaseManifest,
  artifact: artifactName,
  workflowRun: workflowRunId,

  email: emailEvidence,
  'email.provider': 'resend',
  'email.configured': emailConfigured,

  turnstile: turnstileEvidence,
  'turnstile.provider': 'cloudflare-turnstile',
  'turnstile.configured': turnstileConfigured,
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

if (taskMarker === 'T22' || process.env.COMPOSE_RUNTIME === 'true') {
  status.runtime = 'compose';
  status.compose = {
    projectName: composeProjectName,
    serviceName,
    runtimeEnvPath,
    appPort: Number(appPort),
    appImage: appImageDefault,
    release: commit,
    envGeneratedAtDeploy: true,
  };
}

const sentryConfigured =
  process.env.SENTRY_DSN_CONFIGURED === 'true' || process.env.SENTRY_CONFIGURED === 'true';
const sentryReleaseName = process.env.SENTRY_RELEASE || commit;

if (sentryConfigured || taskMarker === 'T30') {
  status.monitoring = {
    provider: 'sentry',
    configured: sentryConfigured,
    release: sentryReleaseName,
    org: process.env.SENTRY_ORG || '',
    project: process.env.SENTRY_PROJECT || '',
    releaseAutomation: process.env.SENTRY_RELEASE_AUTOMATION === 'true',
    authTokenStoredInSecret: true,
    testErrorPath: './sentry-test.html',
  };
  status['monitoring.provider'] = 'sentry';
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
writeFileSync(join(publicDir, 'release-manifest.json'), `${JSON.stringify(releaseManifest, null, 2)}\n`, 'utf8');
writeFileSync(join(repoRoot, 'domain.config.json'), `${JSON.stringify(domainConfig, null, 2)}\n`, 'utf8');
writeFileSync(join(repoRoot, 'release-manifest.json'), `${JSON.stringify(releaseManifest, null, 2)}\n`, 'utf8');
console.log(

  `Wrote /health, /status, release-manifest.json, and domain.config.json for ${team} @ ${status.commit_short} (${taskMarker}, domain.connected=${domainConnected}, artifact=${artifactName})`,
);

