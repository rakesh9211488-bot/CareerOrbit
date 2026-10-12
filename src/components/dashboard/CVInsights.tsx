import { Briefcase, CheckCircle2, GraduationCap, Languages, Lightbulb, Sparkles } from 'lucide-react';
import type { CVAnalysis } from '@/types';

function InsightList({ items }: { items: string[] }) {
  return items.length ? <ul>{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : <p className="insight-empty">Not listed in this CV.</p>;
}

export function CVInsights({ analysis, analyzedAt }: { analysis: CVAnalysis; analyzedAt?: string }) {
  const date = analyzedAt ? new Date(analyzedAt) : null;
  const dateText = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : null;
  return (
    <section className="workspace-card cv-insights" id="cv-insights" aria-labelledby="insights-title">
      <div className="workspace-card-heading"><h2 id="insights-title">Your CV insights</h2><span><Sparkles size={18} aria-hidden="true" /></span></div>
      <div className="insight-meta"><span><CheckCircle2 size={13} aria-hidden="true" /> Gemini analysis saved</span>{dateText && <span>{dateText}</span>}</div>
      <p className="insight-summary">{analysis.summary}</p>
      <div className="insight-skills"><h3>Skills from your CV</h3>{analysis.skills.length ? <ul>{analysis.skills.map(skill => <li key={skill}>{skill}</li>)}</ul> : <p className="insight-empty">Not listed in this CV.</p>}</div>
      <div className="insight-grid">
        <div><h3><GraduationCap size={16} aria-hidden="true" /> Education</h3><InsightList items={analysis.education} /></div>
        <div><h3><Briefcase size={16} aria-hidden="true" /> Experience</h3><InsightList items={analysis.experience} /></div>
        <div><h3><Languages size={16} aria-hidden="true" /> Languages</h3><InsightList items={analysis.languages} /></div>
        <div><h3><Lightbulb size={16} aria-hidden="true" /> Ways to strengthen your CV</h3>{analysis.cv_feedback.length ? <InsightList items={analysis.cv_feedback} /> : <p className="insight-empty">No specific suggestions returned.</p>}</div>
      </div>
      {analysis.suggested_roles.length > 0 && <div className="insight-roles"><h3>Role directions to explore</h3><p>Suggestions based on your CV and preferences. Live job matching is still pending.</p><ul>{analysis.suggested_roles.map(role => <li key={role}>{role}</li>)}</ul></div>}
      <p className="insight-review">Review AI-generated details for accuracy before using them in an application.</p>
    </section>
  );
}
