import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CV_BUCKET, isSameOrigin, ownsCV } from '@/lib/cv';
import { AnalysisWorkflowError, analyzeCVWithN8N, isAnalysisConfigured, workflowErrorMessage } from '@/lib/n8n';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail('Request origin is not allowed.', 403);
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return fail('Please sign in to analyze your CV.', 401);
    if (!isAnalysisConfigured()) return fail('Gemini analysis has not been connected yet.', 503);
    const { data: profile, error } = await supabase.from('profiles').select('cv_url,full_name,job_preference,location').eq('id', user.id).maybeSingle();
    if (error) return fail('Your profile is temporarily unavailable.', 502);
    if (!profile || !ownsCV(profile.cv_url, user.id)) return fail('Upload your CV first.', 400);
    const path = profile.cv_url;
    const { data: signed, error: signError } = await supabase.storage.from(CV_BUCKET).createSignedUrl(path, 300);
    if (signError || !signed) return fail('Your saved CV could not be accessed.', 502);
    const { analysis, model } = await analyzeCVWithN8N({ user_id: user.id, cv_url: signed.signedUrl, full_name: profile.full_name, job_preference: profile.job_preference, location: profile.location });
    const analyzedAt = new Date().toISOString();
    // A replacement uploaded in another tab must not receive this older CV's result.
    const { data, error: saveError } = await supabase.from('profiles').update({ profile_summary: analysis.summary, cv_analysis: analysis, cv_analyzed_at: analyzedAt, cv_analysis_model: model }).eq('id', user.id).eq('cv_url', path).select('id').maybeSingle();
    if (saveError) return fail('Analysis completed, but we could not save it. Please try again.', 502);
    if (!data) return fail('Your CV changed during analysis. Analyze your newly saved CV.', 409);
    return NextResponse.json({ success: true, status: 'analyzed', analyzedAt }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof AnalysisWorkflowError) return fail(workflowErrorMessage(error.code, true), error.code === 'CV_UNREADABLE' ? 422 : error.code === 'TIMEOUT' ? 504 : 502);
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) return fail('Analysis took too long. Check the workflow before trying again.', 504);
    return fail('Gemini analysis failed. Check the n8n workflow, Gemini credential, model access, and API quota, then try again.', 502);
  }
}
