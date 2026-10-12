export interface CareerJob {
 jobId: string; title: string; company: string; location: string; sourceUrl: string;
 description: string; detailAvailable: boolean; score: number; reason: string;
 strengths: string[]; gaps: string[]; englishEligible: boolean; languageAssessment: string; studentCompatibility: string;
}
export interface CareerDocuments { jobId: string; cvText: string; coverLetterText: string; truthfulKeywordsUsed: string[]; unsupportedRequirements: string[]; }
export interface CareerJobRow { id: string; cv_path: string; job_data: CareerJob; documents: CareerDocuments | null; status: string; created_at: string; notes?: string; deadline?: string|null; updated_at?: string; }
const text = (v: unknown, max: number, required = true): v is string => typeof v === 'string' && (!required || Boolean(v.trim())) && v.length <= max;
const list = (v: unknown, max = 5): v is string[] => Array.isArray(v) && v.length <= max && v.every(s => text(s, 600));
export function parseJob(value: unknown): CareerJob | null {
 if (!value || typeof value !== 'object') return null;
 const v = value as Record<string, unknown>;
 if (!text(v.jobId, 200) || !v.jobId.startsWith('ba:') || !text(v.title, 300) || !text(v.company, 300) || !text(v.location, 300, false) || !text(v.description, 2000, false)) return null;
 if (!text(v.sourceUrl, 1000)) return null;
 let url: URL; try { url = new URL(v.sourceUrl); } catch { return null; }
 if (url.protocol !== 'https:' || url.hostname !== 'www.arbeitsagentur.de' || !url.pathname.startsWith('/jobsuche/jobdetail/') || url.username || url.password) return null;
 if (!Number.isInteger(v.score) || Number(v.score) < 0 || Number(v.score) > 100 || typeof v.englishEligible !== 'boolean' || typeof v.detailAvailable !== 'boolean') return null;
 if (!text(v.reason, 1000) || !text(v.languageAssessment, 1000) || !text(v.studentCompatibility, 1000) || !list(v.strengths) || !list(v.gaps)) return null;
 return {jobId:v.jobId,title:v.title,company:v.company,location:v.location,sourceUrl:v.sourceUrl,description:v.description,detailAvailable:v.detailAvailable,score:Number(v.score),reason:v.reason,strengths:v.strengths,gaps:v.gaps,englishEligible:v.englishEligible,languageAssessment:v.languageAssessment,studentCompatibility:v.studentCompatibility};
}
export function parseDocuments(value: unknown, jobId: string): CareerDocuments | null {
 if (!value || typeof value !== 'object') return null;
 const v=value as Record<string,unknown>;
 if(v.jobId!==jobId || !text(v.cvText,12000) || v.cvText.length<200 || !text(v.coverLetterText,3000) || v.coverLetterText.length<120 || v.coverLetterText.trim().split(/\s+/).length>300 || !list(v.truthfulKeywordsUsed,20) || !list(v.unsupportedRequirements,20)) return null;
 return {jobId,cvText:v.cvText,coverLetterText:v.coverLetterText,truthfulKeywordsUsed:v.truthfulKeywordsUsed,unsupportedRequirements:v.unsupportedRequirements};
}
