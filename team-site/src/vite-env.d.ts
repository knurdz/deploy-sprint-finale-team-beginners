/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_DEPLOY_LABEL?: string;
  readonly VITE_PUBLIC_URL?: string;
  /** Build-time mirror of FEATURE_SHOW_INSIGHTS (secret/var). Never commit real values. */
  readonly VITE_FEATURE_SHOW_INSIGHTS?: string;
  /** Public Turnstile site key only. Never VITE_TURNSTILE_SECRET_KEY. */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
