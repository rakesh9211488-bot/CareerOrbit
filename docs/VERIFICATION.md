# Verification and honest status

The publication copies the latest working Windows source. Earlier development snapshots are not substituted for that source.

## Included checks

- Publication guard: excluded private/generated file types and common credential formats.
- Guard tests: confirms legitimate CV API paths remain allowed while private environment files and credential material are rejected.
- TypeScript: npm run type-check.
- Production build: npm run build.

GitHub Actions runs these checks on the actual published code. A passing build is not a live integration test. The latest Windows export must pass its own checks; results from an older workspace snapshot do not prove that export is identical.

## Live flow checklist

Use private configuration and verify signup/login/logout, CV upload/analysis, job search/save, document review/export, application-state persistence, assistant replies and scheduler pause/run limits. Separate provider failures from application failures. Use synthetic fixtures when recording public evidence.

No public screenshots, CV examples or workflow histories are included by this kit. Future demonstration assets must use fictional details and be clearly labeled.

## Remaining production checks

Dependency advisories, authentication/provider callbacks, owner isolation, private storage, privileged automation RPCs, quotas/timeouts, always-on scheduling, backups/restore, HTTPS deployment and monitoring. Do not infer that every capability works for every source, country or account from a single successful request.
