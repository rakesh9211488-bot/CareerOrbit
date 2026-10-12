import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CV_BUCKET, isSameOrigin, ownsCV } from '@/lib/cv';
import { isWorkflowConfigured, triggerN8NWorkflow, ReceiptWorkflowError, workflowErrorMessage } from '@/lib/n8n';

export const dynamic = 'force-dynamic';
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail('Request origin is not allowed.', 403);
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return fail('Please sign in to send your CV.', 401);
    if (!isWorkflowConfigured()) return fail('The workflow connection has not been set up yet.', 503);
    const { data: profile, error } = await supabase.from('profiles').select('cv_url,full_name,job_preference,location').eq('id', user.id).maybeSingle();
    if (error) return fail('Your profile is temporarily unavailable.', 502);
    if (!profile || !ownsCV(profile.cv_url, user.id)) return fail('Upload your CV first.', 400);
    const { data: signed, error: signError } = await supabase.storage.from(CV_BUCKET).createSignedUrl(profile.cv_url, 300);
    if (signError || !signed) return fail('Your saved CV could not be accessed.', 502);
    await triggerN8NWorkflow({ user_id: user.id, cv_url: signed.signedUrl, full_name: profile.full_name, job_preference: profile.job_preference, location: profile.location });
    return NextResponse.json({ success: true, status: 'received' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ReceiptWorkflowError) return fail(workflowErrorMessage(error.code), error.code === 'TIMEOUT' ? 504 : 502);
    return fail('CV receipt failed before confirmation. Check profile access and the server terminal.', 502);
  }
}
