# n8n integration and export review

The application expects configured production webhooks for CV receipt, CV analysis, jobs, documents and assistant requests. The scheduler may call the application's automation route separately.

The application authenticates outgoing requests with X-CareerAI-Key and N8N_WEBHOOK_SECRET. This is different from a Groq/Gemini/provider API credential or a per-account scheduler key.

Your current working Docker workflows are authoritative. Older update-package JSON files may predate provider/source fixes. No raw n8n exports are copied by this kit.

Before publishing an export:

1. Export only the intended workflow source, not execution history.
2. Remove pinned data, example CVs, candidate contact details, signed download links, prompts containing real CV text and saved responses.
3. Remove credential IDs/names and any header values, tokens, embedded passwords or API keys.
4. Replace project-specific hostnames and URLs with explicit configuration placeholders.
5. Confirm the JSON still imports and document the credentials the reader must create.
6. Test using isolated synthetic data, not a real applicant's documents.

Never assume an export is safe solely because n8n normally stores credential values separately. Code nodes, request bodies and pinned data can still contain secrets or personal information.
