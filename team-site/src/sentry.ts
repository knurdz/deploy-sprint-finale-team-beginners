import * as Sentry from '@sentry/react';
import {
  authTokenStoredInSecret,
  sentryConfigured,
  sentryDsn,
  sentryOrg,
  sentryProject,
  sentryRelease,
} from './config/sentry-runtime';

/** Initialize browser monitoring (DSN only — auth token stays in GitHub Actions). */
export function initSentry(): void {
  if (!sentryConfigured || !sentryDsn) {
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    release: sentryRelease,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
  });

  Sentry.setTag('task', 'T30');
  if (sentryOrg) {
    Sentry.setTag('sentry.org', sentryOrg);
  }
  if (sentryProject) {
    Sentry.setTag('sentry.project', sentryProject);
  }

  if (authTokenStoredInSecret) {
    console.info('T30 Sentry initialized without exposing auth token');
  }
}

/** Judge-only test path — call from a button click, not on page load. */
export function captureT30TestError(): void {
  Sentry.captureException(new Error('T30 intentional Sentry test error (judge trigger)'));
}
