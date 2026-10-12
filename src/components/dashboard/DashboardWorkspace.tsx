import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Briefcase, Check, FileText, MapPin, ShieldCheck, Sparkles, Target, User } from 'lucide-react';
import { Sidebar } from './Sidebar';
import type { Profile } from '@/types';
import { CVUploadPanel } from './CVUploadPanel';
import { CVInsights } from './CVInsights';
import { parseCVAnalysis } from '@/lib/cv-analysis';

export function DashboardWorkspace({ profile, profileUnavailable = false, workflowConfigured = false, analysisConfigured = false }: { profile: Profile; profileUnavailable?: boolean; workflowConfigured?: boolean; analysisConfigured?: boolean }) {
  const firstName = profile.full_name.split(' ')[0];
  const analysis = profile.cv_url ? parseCVAnalysis(profile.cv_analysis) : null;
  return (
    <div className="workspace-shell">
      <Sidebar userName={profile.full_name} userEmail={profile.email} />
      <main className="workspace-main">
        <header className="workspace-topbar"><span>Workspace <span>/</span> Overview</span><span><ShieldCheck size={14} aria-hidden="true" /> Your personal career space</span></header>
        <div className="workspace-content">
          <div className="workspace-heading"><div><span className="section-kicker">A LITTLE CLARITY GOES A LONG WAY</span><h1>Let’s look ahead, {firstName}.</h1><p>Your experience. Your possibilities. All in one place.</p></div><span className="workspace-avatar"><User size={24} aria-hidden="true" /></span></div>
          <section className="welcome-banner"><div><span><Sparkles size={14} aria-hidden="true" /> YOUR NEXT CHAPTER</span><h2>Good opportunities start<br />with a better picture of you.</h2><p>Bring your skills and ambitions together in your career profile.</p><a href="#profile">Review your profile <ArrowUpRight size={16} aria-hidden="true" /></a></div><div className="banner-art" aria-hidden="true"><Target size={100} strokeWidth={.7} /><span><Check size={17} /> Make room for what’s next.</span></div></section>
          <div className="workspace-stats"><div><span><User size={16} aria-hidden="true" /> Your account</span><strong>Ready <i><Check size={13} aria-hidden="true" /></i></strong><small>A place to start your next chapter</small></div><div><span><FileText size={16} aria-hidden="true" /> Your CV</span><strong>{analysis ? 'Analyzed' : profile.cv_url ? 'Saved' : 'Add your CV'}</strong><small>Private PDF storage · Up to 5 MB</small></div><div><span><Briefcase size={16} aria-hidden="true" /> Opportunities</span><strong>—</strong><small>Search from Matched jobs</small></div></div>
          <CVUploadPanel savedName={profile.cv_file_name} hasSavedCV={Boolean(profile.cv_url)} workflowConfigured={workflowConfigured} analysisConfigured={analysisConfigured} analysisSaved={Boolean(analysis)} profileUnavailable={profileUnavailable} />
          {analysis && <CVInsights analysis={analysis} analyzedAt={profile.cv_analyzed_at} />}
          <div className="workspace-grid">
            <section className="workspace-card" id="profile"><div className="workspace-card-heading"><h2>Your profile</h2><span><User size={17} aria-hidden="true" /></span></div>{profileUnavailable && <p className="workspace-notice" role="status">Your account is ready. Profile details are temporarily unavailable, so we’re showing the information from your account.</p>}<h3>{profile.full_name}</h3><p className="profile-email">{profile.email}</p><div className="profile-details"><div><Briefcase size={17} aria-hidden="true" /><span>Looking for<strong>{profile.job_preference || 'Not selected yet'}</strong></span></div><div><MapPin size={17} aria-hidden="true" /><span>Preferred location<strong>{profile.location || 'Not selected yet'}</strong></span></div></div><div className="profile-summary"><span>YOUR STORY</span><p>{analysis ? 'Your CV analysis is saved. Review your summary, skills, and suggestions in CV insights above.' : profile.profile_summary || 'Upload your CV and analyze it to create a summary of your skills and background.'}</p></div></section>
            <section className="workspace-card" id="matches"><div className="workspace-card-heading"><h2>Your next opportunities</h2><span><ArrowDown size={17} aria-hidden="true" /></span></div><div className="matches-empty"><span><Briefcase size={28} strokeWidth={1.4} aria-hidden="true" /></span><h3>Room for something good.</h3><p>Open Matched jobs to search real vacancies and prepare application drafts.</p><Link href="/dashboard/jobs" className="coming-soon">Open Matched jobs</Link></div></section>
          </div>
          <footer className="workspace-footer"><span>CareerOrbit · Built for your next chapter.</span><span><ShieldCheck size={14} aria-hidden="true" /> Apply only when you’re ready.</span></footer>
        </div>
      </main>
    </div>
  );
}
