import {redirect,notFound} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {parseJob,parseDocuments} from '@/lib/career-jobs';
import {PrintDocuments} from '@/components/dashboard/PrintDocuments';
export const dynamic='force-dynamic';
export default async function PrintPage({params}:{params:{id:string}}){const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect('/auth');const {data}=await s.from('careerai_jobs').select('job_data,documents').eq('id',params.id).eq('user_id',user.id).maybeSingle();const j=parseJob(data?.job_data);const d=j?parseDocuments(data?.documents,j.jobId):null;if(!d)notFound();return <PrintDocuments cv={d.cvText} letter={d.coverLetterText}/>;}
