import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(siteRoot, 'public');
const runtimePath = join(siteRoot, 'src', 'config', 'web3forms-runtime.ts');

const accessKey = process.env.WEB3FORMS_ACCESS_KEY || '';
const configured = accessKey.length > 0;

mkdirSync(join(publicDir, 'api'), { recursive: true });

writeFileSync(
  join(publicDir, 'api', 'contact-provider.json'),
  `${JSON.stringify(
    {
      provider: 'web3forms',
      configured,
      endpoint: 'https://api.web3forms.com/submit',
      accessKeyStoredInSecret: true,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

writeFileSync(
  runtimePath,
  `/**
 * Generated during CI from secrets.WEB3FORMS_ACCESS_KEY — not committed with a real key.
 */
export const web3formsSubmitEndpoint = 'https://api.web3forms.com/submit';
export const web3formsAccessKey = ${JSON.stringify(configured ? accessKey : '')};
export const web3formsConfigured = ${configured};
export const accessKeyStoredInSecret = true;
`,
  'utf8',
);

console.log(
  configured
    ? 'Web3Forms runtime prepared from WEB3FORMS_ACCESS_KEY (value not logged).'
    : 'Web3Forms not configured locally (WEB3FORMS_ACCESS_KEY missing).',
);
