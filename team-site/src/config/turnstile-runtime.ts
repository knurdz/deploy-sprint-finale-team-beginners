/**
 * Build-time Turnstile runtime (placeholder in git; CI overwrites from TURNSTILE_SITE_KEY).
 * Public site key only. Do not commit real secrets. Never use VITE_TURNSTILE_SECRET_KEY.
 */
export const turnstileSiteKey = '';
export const turnstileSiteKeyConfigured = false;
export const turnstileProvider = 'cloudflare-turnstile' as const;
export const turnstileSecretKeySecretName = 'TURNSTILE_SECRET_KEY' as const;
export const turnstileAllowedHostname = 'beginners.deploysprint-finals.knurdz.org';
