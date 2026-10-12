import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CV_BUCKET,isSameOrigin,ownsCV } from '@/lib/cv';
import { parseJob,parseDocuments } from '@/lib/career-jobs';
import { callCareerWorkflow,CareerWorkflowError } from '@/lib/career-workflows';
export const dynamic='force-dynamic';export const runtime='nodejs';export const maxDuration=150;
const reply=(d:unknown,s=200)=>NextResponse.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(!isSameOrigin(request))return reply({error:'Request origin is not allowed.'},403);
 try{
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return reply({error:'Please sign in.'},401);
 const b=await request.json().catch(()=>null);if(typeof b?.id!=='string'||!/^[0-9a-f-]{36}$/i.test(b.id))return reply({error:'Choose a saved job.'},400);
 const {data:row,error}=await supabase.from('careerai_jobs').select('*').eq('id',b.id).eq('user_id',user.id).maybeSingle();if(error)return reply({error:'Saved job could not be loaded.'},502);if(!row)return reply({error:'Job not found.'},404);
 const job=parseJob(row.job_data);if(!job?.detailAvailable)return reply({error:'A readable job description is needed before tailoring documents.'},400);
 const {data:p}=await supabase.from('profiles').select('cv_url').eq('id',user.id).maybeSingle();if(!ownsCV(p?.cv_url,user.id)||p.cv_url!==row.cv_path)return reply({error:'This match belongs to an older CV. Search again using your current CV.'},409);
 const {data:signed,error:signError}=await supabase.storage.from(CV_BUCKET).createSignedUrl(p.cv_url,300);if(signError||!signed)return reply({error:'Saved CV could not be accessed.'},502);
 const result=await callCareerWorkflow('documents',{user_id:user.id,cv_url:signed.signedUrl,job});
 const docs=parseDocuments(result.documents,job.jobId);if(result.success!==true||result.status!=='drafted'||!docs)throw new CareerWorkflowError('Workflow returned invalid or incomplete document drafts.');
 const {data:current}=await supabase.from('profiles').select('cv_url').eq('id',user.id).maybeSingle();if(current?.cv_url!==p.cv_url)return reply({error:'Your CV changed during generation. Generate drafts for a new match.'},409);
 const {data:saved,error:saveError}=await supabase.from('careerai_jobs').update({documents:docs,updated_at:new Date().toISOString()}).eq('id',row.id).eq('user_id',user.id).eq('cv_path',p.cv_url).select('id').maybeSingle();if(saveError||!saved)return reply({error:'Drafts could not be saved.'},502);
 return reply({success:true});
 }catch(e){return reply({error:e instanceof CareerWorkflowError?e.message:'Document generation failed. Please try again.'},502);}
}
