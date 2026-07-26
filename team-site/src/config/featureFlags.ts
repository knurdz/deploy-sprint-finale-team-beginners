/**
 * Runtime feature flags from env / GitHub Secret (injected at build).
 * Never hardcode the live flag value here.
 */
export function featureFlags() {
  return {
    task: 'T15',
    showInsights: import.meta.env.VITE_FEATURE_SHOW_INSIGHTS === 'true',
    valueRedacted: true,
  };
}
