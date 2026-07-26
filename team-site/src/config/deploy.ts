const fallbackLabel = 'Deploy Sprint';

export function getPublicDeployLabel(): string {
  const label = import.meta.env.VITE_PUBLIC_DEPLOY_LABEL?.trim();
  return label && label.length > 0 ? label : fallbackLabel;
}
