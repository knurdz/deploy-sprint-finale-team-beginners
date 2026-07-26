# Sentry monitoring (T30)

Docs: [React SDK](https://docs.sentry.io/platforms/javascript/guides/react/) · [Release automation](https://docs.sentry.io/product/releases/setup/release-automation/github-actions/)

## GitHub Secrets (required)

| Secret | Client-safe? | Usage |
| --- | --- | --- |
| `SENTRY_DSN` | **Yes** (browser) | Injected at build via `prepare-sentry.mjs` → `sentry-runtime.ts` |
| `SENTRY_AUTH_TOKEN` | **No** | CI `sentry-cli` release + source maps only |
| `SENTRY_ORG` | Org slug | Release automation + `/status` metadata |
| `SENTRY_PROJECT` | Project slug | Release automation + `/status` metadata |

Never commit real values. Never put `SENTRY_AUTH_TOKEN` in React source, Vite env, or workflow logs.

## App behavior

- `@sentry/react` initialized in `src/sentry.ts` from generated DSN.
- **Judge test path:** `sentry-test.html` → button **Send test error to Sentry** (does not run on normal load).
- Nav link **Sentry test** on the main dashboard.

## CI

1. `prepare-sentry.mjs` (from `SENTRY_DSN`)
2. `npm run build` (source maps enabled)
3. `sentry-cli releases new/finalize` + optional sourcemap upload using `SENTRY_AUTH_TOKEN`

## Evidence

- `/status`: `monitoring.provider=sentry`, release = commit SHA, `authTokenStoredInSecret: true`
- `public/monitoring/sentry.json` in build output
- Workflow summary line for T30 release

## Judge answer

**Safe in the browser:** `SENTRY_DSN` (public client key for sending events).  
**Must stay secret:** `SENTRY_AUTH_TOKEN` (creates/releases and uploads source maps — Actions only).

<!-- AI-REVIEW-MARKER: participant must manually remove this marker -->
