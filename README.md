# CareerOrbit

**An AI-assisted career workspace: from CV analysis to reviewed application drafts.**

CareerOrbit connects a private candidate profile, job-search preferences, vacancy matching, document review and application tracking. It combines a Next.js interface, Supabase storage/authentication and configurable n8n workflows.

Maintained by **Rakesh Siripaka**. Developed with AI-assisted implementation and review. CareerOrbit and TechFarming are separate projects.

## Capabilities

| Area | What the application supports |
| --- | --- |
| Account access | Supabase sign-in, registration and optional configured Google/GitHub providers |
| Candidate information | Private CV upload, analysis, profile details and preferences |
| Job matching | Workflow-based vacancy search, relevance assessment and saved results |
| Documents | Reviewable CV/cover-letter drafts, editing, history and PDF export |
| Applications | User-maintained stages, notes and planning dates |
| Assistant | Contextual help through a configured workflow |
| Automation | Per-account controls, scheduler authorization and saved run history |

AI suggestions require human review. CareerOrbit does not guarantee interviews, independently verify every vacancy, or automatically submit applications to employers. Text-readiness checks are heuristics, not an employer's ATS score.

## Technology

Next.js · TypeScript · React · Tailwind CSS · Lucide icons · Supabase · n8n · LLM APIs · PDF rendering

## Local setup

Use Node.js 22 or a runtime compatible with the committed dependencies.

```powershell
npm ci
```

Create private configuration from the template without overwriting an existing file:

```powershell
if (!(Test-Path .env.local)) {
    Copy-Item .env.example .env.local
}
notepad .env.local
```

Configure your Supabase project and published n8n webhooks. LLM provider keys remain in n8n credentials. The historical `X-CareerAI-Key` header and `careerai_*` schema names are retained for integration compatibility.

```powershell
npm run type-check
npm run build
npm run dev
```

Open http://localhost:3000. Supabase schema/storage policies and the required n8n workflows must already be provisioned; cloning this repository alone does not create those external services.

## Documentation

- [Setup and configuration](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [n8n integration](docs/WORKFLOWS.md)
- [Verification and status](docs/VERIFICATION.md)
- [Development roadmap](docs/ROADMAP.md)
- [Security](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Repository structure

| Path | Purpose |
| --- | --- |
| `src/app/` | Pages, authentication callback and server API routes |
| `src/components/` | Account and career workspace interfaces |
| `src/lib/` | Supabase clients, workflow adapters, documents and automation |
| `src/types/` | Application types |
| `public/fonts/` | PDF fonts and their original licenses |
| `scripts/` | Publication privacy checks |
| `.github/workflows/` | Automated source, TypeScript and build checks |

## Status and limits

This is a development/beta project, not a fully deployed public service. Searches depend on provider availability and quotas. Current country/source coverage is determined by the configured workflows; selecting a region does not create unsupported vacancy sources. Scheduled execution requires an active scheduler and reachable services.

No CVs, cover letters, database dumps, private environment files or live credentials belong in this repository. Read the security guide before publishing workflow exports or deploying publicly. Preserve any original LICENSE/NOTICE files and third-party notices. The publishing kit does not select a new project-wide license.
