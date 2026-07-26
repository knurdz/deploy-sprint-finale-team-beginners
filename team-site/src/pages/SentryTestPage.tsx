import { captureT30TestError } from '../sentry';

export function SentryTestPage() {
  return (
    <main className="shell" style={{ padding: '2rem', maxWidth: '42rem' }}>
      <h1>T30 · Sentry test</h1>
      <p>
        This page is for judges only. The button below sends one intentional test error to Sentry.
        Normal site load does not throw.
      </p>
      <button
        type="button"
        className="iconButton"
        data-testid="sentry-test-error"
        onClick={() => captureT30TestError()}
      >
        Send test error to Sentry
      </button>
      <p className="deployLabel">
        Safe client value: SENTRY_DSN. Secret value: SENTRY_AUTH_TOKEN (Actions only).
      </p>
      <p>
        <a href="./index.html">Back to dashboard</a>
      </p>
    </main>
  );
}
