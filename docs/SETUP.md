# Setup and private configuration

## Existing working installation

This publication is a clean copy of the working application. Keep its original Windows installation and .env.local unchanged. To continue using the new local repository folder, copy the private .env.local locally only after reviewing it; never add it to Git.

Install using npm ci, then run type-check and build before starting the development server. If package-lock.json is missing, generate it with npm install and review the resulting versions before committing.

## Supabase

Set NEXT_PUBLIC_SUPABASE_URL and a public publishable key. The optional legacy anon key is supported by the current configuration adapter. Never place a Supabase secret/service-role key in a NEXT_PUBLIC_ variable.

Account access requires the application's schema and owner-scoped RLS/storage policies. Existing code references profiles, careerai_jobs, careerai_preferences, careerai_document_versions, careerorbit_candidate_profile, careerorbit_document_settings, careerorbit_automation and careerorbit_runs, plus scheduler RPCs.

The publication kit does not export the live database or reconstruct initial migrations. Preserve your existing working schema. Fresh installations need a separately reviewed schema-only setup, without account records, CV content, scheduler keys or data dumps. Do not rerun historical update SQL blindly on an existing database.

Google and GitHub sign-in must be enabled/configured in Supabase with the corresponding site/callback URLs. OAuth client secrets belong in provider configuration, not public frontend variables.

## n8n

Configure the five production webhook URLs in .env.local and a matching N8N_WEBHOOK_SECRET. Keep LLM provider keys in n8n credentials. See WORKFLOWS.md for the distinction between credentials and exported source.

A configured URL means the app has a setting; it does not prove the provider is reachable. Use a published/active workflow and inspect controlled response errors when testing.

## Optional scheduler

SUPABASE_SECRET_KEY is a privileged, server-only setting used for automation storage. Configure it only for the reviewed scheduler feature, and review database functions/authorization before deployment. Scheduler authorization keys are generated privately per account, not committed as shared constants.

Local workflows stop being reachable when their host is off. Always-on public operation requires separate hosted web/API, database and scheduler services.

## Deployment preparation

Use Node.js 22 or newer. See SECURITY-UPGRADE.md for the framework migration and verification. Run npm audit and review dependency advisories; advisories can change after a lockfile is created. TypeScript/build checks alone do not establish live-provider functionality.
