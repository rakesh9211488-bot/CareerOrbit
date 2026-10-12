import 'server-only';
export class CareerWorkflowError extends Error {}
export function careerWorkflowConfigured(kind: 'jobs' | 'documents' | 'assistant') {
 return Boolean(process.env[kind === 'jobs' ? 'N8N_JOBS_WEBHOOK_URL' : kind === 'documents' ? 'N8N_DOCUMENTS_WEBHOOK_URL' : 'N8N_ASSISTANT_WEBHOOK_URL'] && process.env.N8N_WEBHOOK_SECRET);
}
export async function callCareerWorkflow(kind: 'jobs' | 'documents' | 'assistant', payload: unknown) {
 const raw=process.env[kind==='jobs'?'N8N_JOBS_WEBHOOK_URL':kind==='documents'?'N8N_DOCUMENTS_WEBHOOK_URL':'N8N_ASSISTANT_WEBHOOK_URL']?.trim();
 const secret=process.env.N8N_WEBHOOK_SECRET?.trim();
 if(!raw||!secret) throw new CareerWorkflowError(`The ${kind} workflow URL has not been configured.`);
 let url: URL;try {url=new URL(raw);}catch{throw new CareerWorkflowError('The workflow URL is invalid.');}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.pathname.includes('/webhook-test/')) throw new CareerWorkflowError('Use the workflow Production URL.');
 let response: Response;
 try {response=await fetch(raw,{method:'POST',headers:{'Content-Type':'application/json','X-CareerAI-Key':secret},body:JSON.stringify(payload),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(kind === 'documents' ? 115_000 : 90_000)});}
 catch {throw new CareerWorkflowError('Could not reach the workflow before the time limit. Check Docker and n8n.');}
 console.info('[CareerOrbit workflow]',kind,'HTTP',response.status);
 if(!response.ok)throw new CareerWorkflowError(`n8n returned HTTP ${response.status}. Check the latest ${kind} workflow execution.`);
 if(Number(response.headers.get('content-length'))>100000)throw new CareerWorkflowError('Workflow response is too large.');
 const body=await response.text();if(body.length>100000)throw new CareerWorkflowError('Workflow response is too large.');
 try {const d:unknown=JSON.parse(body);if(!d||typeof d!=='object'||Array.isArray(d))throw new Error();return d as Record<string,unknown>;}
 catch{throw new CareerWorkflowError('Workflow returned invalid JSON.');}
}
