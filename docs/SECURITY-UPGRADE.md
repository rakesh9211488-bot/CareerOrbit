# Security dependency migration

This branch replaces Next.js 14 with Next.js 16.4.0 and migrates React to 19, Tailwind CSS to 4, and the PDF renderer to 4.9.0. It updates asynchronous cookies and dynamic route parameters, adopts the proxy file convention, and preserves the existing Tailwind theme through explicit configuration. Unused UUID dependencies are removed. The obsolete next lint script is removed; type-check is available separately.

## Verification performed

- Clean lockfile installation, TypeScript and production build.
- npm audit reported zero vulnerabilities on 12 October 2026.
- Desktop and mobile authentication-page rendering, GitHub icon and protected-dashboard redirect without configured credentials.
- Eight synthetic PDF exports: international/German presets, Sans/Serif fonts, CV and letter.

Private Supabase sign-in, saved account data and n8n integrations were not exercised in this environment. This does not change the live database, workflow credentials or original Windows installation.

## Check on Windows before merging

```powershell
cd "D:\GitHubProjects\CareerOrbit"
git status --short
git pull --ff-only origin maintenance/security-updates
node --version
npm ci
npm run type-check
npm run build
npm audit
```

Node.js must be version 22 or newer. For a private live-integration check, copy your existing .env.local locally into this repository only if absent. Keep it out of Git. Stop the old app before starting this one on port 3000. Check sign-in, saved CV analysis, job matching, document editing/download and automation controls. Do not merge until the live checks pass.

Tailwind 4 targets modern browsers. Test required browsers before public deployment. The existing custom stylesheet and theme are retained, but a major styling dependency upgrade still needs review of authenticated pages.
