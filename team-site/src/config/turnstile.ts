/**
 * T24 client-safe Cloudflare Turnstile markers only.
 * Site key is public (see turnstile-runtime.ts). Secret lives in GitHub Secret
 * TURNSTILE_SECRET_KEY and is used solely by team-site/scripts/prepare-turnstile.mjs
 * (CI / deploy-time siteverify). Never expose the secret through a Vite client env.
 */
export const turnstileStatus = {
  task: 'T24',
  provider: 'cloudflare-turnstile' as const,
  siteKeyPublic: true,
  secretKeyServerOnly: true,
  secretRedacted: true,
};
