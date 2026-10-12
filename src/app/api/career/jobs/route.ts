import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSameOrigin, ownsCV } from '@/lib/cv';
import { parseCVAnalysis } from '@/lib/cv-analysis';
import {defaultPreferences,parsePreferences,preferenceMatch,languageOptions} from '@/lib/preferences';
import { parseJob } from '@/lib/career-jobs';
import { callCareerWorkflow, CareerWorkflowError } from '@/lib/career-workflows';
export const dynamic='force-dynamic';export const runtime='nodejs';export const maxDuration=120;
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(!isSameOrigin(request))return reply({error:'Request origin is not allowed.'},403);
 try {
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return reply({error:'Please sign in.'},401);
 const b=await request.json().catch(()=>null);const query=typeof b?.query==='string'?b.query.trim():'';const languageMode=languageOptions.some(([key])=>key===b?.languageMode)?b.languageMode:'english_only';
 if(query.length<3||query.length>120)return reply({error:'Enter a search query between 3 and 120 characters.'},400);
 const {data:profile,error}=await supabase.from('profiles').select('cv_url,cv_analysis,location').eq('id',user.id).maybeSingle();
 if(error)return reply({error:'Profile could not be loaded.'},502);
 const analysis=parseCVAnalysis(profile?.cv_analysis);if(!analysis||!ownsCV(profile?.cv_url,user.id))return reply({error:'Upload and analyze your CV first.'},400);
 const {data:setting,error:prefError}=await supabase.from('careerai_preferences').select('preferences').eq('user_id',user.id).maybeSingle();if(prefError)return reply({error:'Preferences could not be loaded. Try again.'},502);const prefs=parsePreferences(setting?.preferences)||defaultPreferences;const effectivePrefs={...prefs,languageMode:languageMode as typeof prefs.languageMode};
 const result=await callCareerWorkflow('jobs',{user_id:user.id,query,languageMode,analysis,location:prefs.locations.join(', ')||profile.location,preferences:effectivePrefs});
 if(result.success!==true||result.status!=='matched'||!Array.isArray(result.jobs)||result.jobs.length>3)throw new CareerWorkflowError('Unexpected matching response.');
 const jobs=result.jobs.map(parseJob);if(jobs.some(j=>!j)||new Set(jobs.map(j=>j?.jobId)).size!==jobs.length)throw new CareerWorkflowError('Matching returned invalid job data.');
 const {data:current}=await supabase.from('profiles').select('cv_url').eq('id',user.id).maybeSingle();if(current?.cv_url!==profile.cv_url)return reply({error:'Your CV changed during the search. Search again with the new CV.'},409);
 const selectedJobs=jobs.filter(j=>j&&preferenceMatch(j,effectivePrefs));
 if(selectedJobs.length){
 const rows=selectedJobs.map(j=>({user_id:user.id,source_job_id:j!.jobId,cv_path:profile.cv_url,job_data:{...j!,score:languageMode==='english_only'&&!j!.englishEligible?Math.min(j!.score,45):!j!.detailAvailable?Math.min(j!.score,30):j!.score},updated_at:new Date().toISOString()}));
 const {error:saveError}=await supabase.from('careerai_jobs').upsert(rows,{onConflict:'user_id,source_job_id,cv_path'});if(saveError)return reply({error:'Matches returned, but could not be saved. Check the CareerOrbit jobs table.'},502);
 }
 return reply({success:true,count:selectedJobs.length,candidates:jobs.length});
 }catch(e){return reply({error:e instanceof CareerWorkflowError?e.message:'Job search failed. Please try again.'},502);}
}
