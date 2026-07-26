/**
 * T16 client-safe Resend markers only.
 * The API key lives in GitHub Secret RESEND_API_KEY and is used solely by
 * team-site/scripts/prepare-resend-email.mjs (CI / deploy-time). Never import
 * or reference a VITE_RESEND_* key here.
 */
export const emailProvider = 'resend' as const;
export const emailApiKeySecretName = 'RESEND_API_KEY' as const;
export const emailTask = 'T16' as const;
