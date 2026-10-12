# Security and applicant privacy

CVs, cover letters, account records, scheduler keys, signed storage URLs and provider credentials are private data. Never commit them, attach them to public issues or include them in screenshots/demo records.

## Configuration

Use .env.local for private local configuration. Commit only the empty .env.example template. Supabase public keys may be used in the browser; secret/service-role keys and N8N_WEBHOOK_SECRET must remain server-side. Provider keys belong in n8n credentials.

The publication guard checks common credential formats and private file types. It is heuristic and does not replace manual review or provider-side key revocation. If a secret was previously shared or committed, revoke it; creating a clean source folder does not revoke it or erase older history elsewhere.

## Database and workflows

Review RLS and storage ownership for every exposed table/bucket. Privileged scheduler storage and database functions require explicit account authorization. Treat CV text, vacancy content and workflow responses as untrusted input.

Check current dependency advisories before deployment. GitHub source/build checks do not prove that production credentials, provider callbacks, storage policies or automation functions are secure.

Report issues privately to the maintainer using an available private contact channel. Never post live credentials or applicant documents publicly.
