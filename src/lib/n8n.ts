import 'server-only';
import type { UploadCVPayload } from '@/types';
import { parseCVAnalysis } from '@/lib/cv-analysis';

export function isWorkflowConfigured() {
  return Boolean(
    process.env.N8N_WEBHOOK_URL && process.env.N8N_WEBHOOK_SECRET
  );
}

export class ReceiptWorkflowError extends Error {
  constructor(public readonly code: string) { super('CV receipt did not complete.'); }
}

export function workflowErrorMessage(code: string, analysis = false): string {
  const label = analysis ? 'analysis' : 'receipt';
  const messages: Record<string, string> = {
    NOT_CONFIGURED: `The ${label} webhook URL or shared secret is missing in .env.local.`,
    INVALID_URL: `The ${label} URL must be an HTTP(S) production webhook URL, not webhook-test.`,
    SAME_URL: 'Receipt and analysis use the same URL. Set separate production webhook URLs in .env.local.',
    CONNECTION_FAILED: 'CareerOrbit could not connect to n8n. Check Docker is running and the webhook address is reachable.',
    TIMEOUT: 'n8n did not respond before the time limit. Check the workflow execution.',
    HTTP_401: 'n8n rejected webhook authentication (401). Check the selected Header Auth credential and shared secret.',
    HTTP_403: 'n8n rejected webhook authentication (403). Check X-CareerAI-Key and the shared secret.',
    HTTP_404: `n8n could not find the ${label} webhook (404). Check its production URL and publication status.`,
    HTTP_429: 'n8n returned a rate-limit response (429). Check the workflow error for the specific limit.',
    HTTP_500: 'n8n returned HTTP 500 before confirming completion. Inspect its Docker logs; if no execution exists, check webhook credentials.',
    HTTP_503: 'n8n returned service unavailable (503). Check the failed node before retrying.',
    INVALID_RESPONSE: `n8n returned invalid JSON or an unexpected ${label} response. Check that this URL points to the correct workflow.`,
    CV_URL_MISSING: 'The analysis workflow did not receive a CV URL. Start analysis from CareerOrbit using a saved CV.',
    CV_UNREADABLE: 'Gemini could not read this CV. Try a readable PDF with selectable text.',
    AI_RESPONSE_INVALID: 'Gemini returned an incomplete analysis. Check its output and token limit.',
    AI_PROVIDER_ERROR: 'The Gemini node failed. Open its failed execution for the provider error.',
  };
  return messages[code] || `The ${label} workflow failed (${ /^HTTP_\d{3}$/.test(code) ? code.replace('_', ' ') : 'unrecognized response' }). Check the n8n execution.`;
}

function config(analysis: boolean) {
  const ErrorType = analysis ? AnalysisWorkflowError : ReceiptWorkflowError;
  const url = (analysis ? process.env.N8N_ANALYSIS_WEBHOOK_URL : process.env.N8N_WEBHOOK_URL)?.trim();
  const secret = process.env.N8N_WEBHOOK_SECRET?.trim();
  if (!url || !secret) throw new ErrorType('NOT_CONFIGURED');
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new ErrorType('INVALID_URL'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname.includes('/webhook-test/')) throw new ErrorType('INVALID_URL');
  if (process.env.N8N_WEBHOOK_URL?.trim() === process.env.N8N_ANALYSIS_WEBHOOK_URL?.trim()) throw new ErrorType('SAME_URL');
  return {url, secret};
}

async function callWorkflow(payload: UploadCVPayload, analysis: boolean) {
  const ErrorType = analysis ? AnalysisWorkflowError : ReceiptWorkflowError;
  const {url, secret} = config(analysis);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST', headers: {'Content-Type': 'application/json', 'X-CareerAI-Key': secret},
      body: JSON.stringify(payload), cache: 'no-store', redirect: 'error',
      signal: AbortSignal.timeout(analysis ? 90_000 : 25_000),
    });
  } catch (error) {
    const code = error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name) ? 'TIMEOUT' : 'CONNECTION_FAILED';
    console.error('[CareerOrbit webhook]', analysis ? 'analysis' : 'receipt', code);
    throw new ErrorType(code);
  }
  // Never log credentials, CV URLs, request bodies or provider response bodies.
  console.info('[CareerOrbit webhook]', analysis ? 'analysis' : 'receipt', 'HTTP', response.status);
  if (!response.ok) throw new ErrorType(`HTTP_${response.status}`);
  if (Number(response.headers.get('content-length')) > 64_000) throw new ErrorType('INVALID_RESPONSE');
  const body = await response.text();
  if (body.length > 64_000) throw new ErrorType('INVALID_RESPONSE');
  try {
    const result: unknown = JSON.parse(body);
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error();
    return result as Record<string, unknown>;
  } catch { throw new ErrorType('INVALID_RESPONSE'); }
}

export async function triggerN8NWorkflow(payload: UploadCVPayload): Promise<void> {
  const result = await callWorkflow(payload, false);
  if (result.success !== true || result.status !== 'received') throw new ReceiptWorkflowError('INVALID_RESPONSE');
}

export function isAnalysisConfigured() {
  return Boolean(
    process.env.N8N_ANALYSIS_WEBHOOK_URL &&
      process.env.N8N_WEBHOOK_SECRET
  );
}

export class AnalysisWorkflowError extends Error {
  constructor(public readonly code: string) {
    super('The analysis workflow did not complete.');
  }
}

export async function analyzeCVWithN8N(payload: UploadCVPayload) {
  const result = await callWorkflow(payload, true);

  if (result.success !== true || result.status !== 'analyzed') {
    throw new AnalysisWorkflowError(
      typeof result.error_code === 'string'
        ? result.error_code
        : 'INVALID_RESPONSE'
    );
  }

  const analysis = parseCVAnalysis(result.analysis);

  if (!analysis) {
    throw new AnalysisWorkflowError('INVALID_RESPONSE');
  }

  const model =
    typeof result.model === 'string' &&
    /^[a-zA-Z0-9./_-]{1,120}$/.test(result.model)
      ? result.model
      : 'Gemini';

  return { analysis, model };
}