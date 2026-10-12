import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CV_BUCKET, MAX_CV_BYTES, isSameOrigin, ownsCV } from '@/lib/cv';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail('Request origin is not allowed.', 403);
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return fail('Please sign in before uploading your CV.', 401);
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    if (!file || typeof file === 'string') return fail('Choose a PDF to upload.', 400);
    if (file.size === 0 || file.size > MAX_CV_BYTES) return fail('Your PDF must be between 1 byte and 5 MB.', 400);
    if (!file.name.toLowerCase().endsWith('.pdf') || file.type !== 'application/pdf') return fail('Only PDF files are accepted.', 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (Buffer.from(bytes.subarray(0, 5)).toString('ascii') !== '%PDF-') return fail('This file does not appear to be a PDF.', 400);
    const path = `${user.id}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage.from(CV_BUCKET).upload(path, bytes, { contentType: 'application/pdf', upsert: false });
    if (uploadError) return fail('We could not save your CV. Please try again.', 502);
    const fileName = file.name.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200);
    const uploadedAt = new Date().toISOString();
    const { data, error } = await supabase.from('profiles').update({ cv_url: path, cv_file_name: fileName, cv_uploaded_at: uploadedAt, profile_summary: null, generated_cv_url: null, cv_analysis: null, cv_analyzed_at: null, cv_analysis_model: null }).eq('id', user.id).select('id').maybeSingle();
    if (error || !data) {
      await supabase.storage.from(CV_BUCKET).remove([path]);
      return fail('Your profile could not be updated. Refresh the page and try again.', 502);
    }
    return NextResponse.json({ success: true, fileName, uploadedAt }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return fail('Upload failed. Please try again.', 500); }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return fail('Please sign in to open your CV.', 401);
    const { data, error } = await supabase.from('profiles').select('cv_url').eq('id', user.id).maybeSingle();
    if (error) return fail('Your CV is temporarily unavailable.', 502);
    if (!ownsCV(data?.cv_url, user.id)) return fail('Upload a CV first.', 404);
    const { data: signed, error: signError } = await supabase.storage.from(CV_BUCKET).createSignedUrl(data.cv_url, 60);
    if (signError || !signed) return fail('Your CV could not be opened. Please try again.', 502);
    return new NextResponse(null, { status: 302, headers: { Location: signed.signedUrl, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
  } catch { return fail('Your CV could not be opened.', 500); }
}
