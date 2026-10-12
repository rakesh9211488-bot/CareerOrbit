# Contributing

Use a focused branch and describe the final behavior, validation and limitations in the pull request.

- Install using the committed lockfile.
- Keep environment files, real CVs, generated applications and database dumps out of Git.
- Use synthetic applicant data for tests and public examples.
- Preserve original font/dependency licenses and existing author attribution.
- Keep CareerOrbit separate from TechFarming.
- Do not rename working database/header identifiers solely for branding.
- Add meaningful tests for changed behavior and record live integration limits honestly.

Run:

```powershell
node scripts/check-repository.js --all
npm run type-check
npm run build
```

Review npm audit findings separately. Do not use a force upgrade without reviewing and testing its effects.
