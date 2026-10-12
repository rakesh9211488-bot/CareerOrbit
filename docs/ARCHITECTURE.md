# Architecture

| Boundary | Responsibility |
| --- | --- |
| Browser to Next.js | User input, authenticated pages and structured API requests |
| Next.js to Supabase | User/session validation, private records and CV storage |
| Next.js to n8n | Server-side authenticated workflow requests |
| n8n to providers | Vacancy retrieval and configured model analysis/generation |
| Response to workspace | Save and render validated results for user review |
| Scheduler to automation route | Authorized runs, limits, pause checks and recorded outcomes |

The application has separate routes for CVs, matching, documents, assistant, preferences, profile information and automation. Provider credentials and the shared webhook secret remain server-side.

CV download links supplied to workflows are temporary signed URLs for private objects. They are not public portfolio assets. Document and relevance outputs are reviewed before application submission.

Product branding uses CareerOrbit; legacy integration identifiers such as careerai_* and X-CareerAI-Key are retained to avoid breaking working storage and webhooks.
