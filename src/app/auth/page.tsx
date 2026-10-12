'use client';

import { useEffect,useState } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import {OAuthButtons} from '@/components/auth/OAuthButtons';
import { Brand } from '@/components/ui/Brand';
import { ArrowUpRight, Check, FileText, MapPin, ShieldCheck, Sparkles, Target } from 'lucide-react';

export default function AuthPage() {
  const [oauthError,setOauthError]=useState(false);useEffect(()=>{setOauthError(new URLSearchParams(window.location.search).has('oauth_error'));},[]);
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  return (
    <main className="auth-shell">
      <section className="story-panel" aria-label="About CareerOrbit">
        <header className="story-header">
          <Brand light />
          <a className="story-link" href="#how-it-works">How it works <ArrowUpRight size={15} aria-hidden="true" /></a>
        </header>
        <div className="story-content">
          <div className="eyebrow"><span className="status-dot" /> A LITTLE INTELLIGENCE. A LOT OF POSSIBILITY.</div>
          <h1>A better fit.<br />A brighter <span>future.</span></h1>
          <p className="story-description">Your experience is unique. Your job search should be too. Turn your CV into opportunities that make sense for you.</p>
          <div className="match-preview" aria-label="Illustration of a job match, using example data">
            <div className="preview-caption"><Sparkles size={15} aria-hidden="true" /> THE RIGHT OPPORTUNITY, LESS GUESSWORK <span>Example</span></div>
            <div className="preview-card">
              <div className="preview-card-top">
                <div className="company-symbol"><Target size={25} strokeWidth={1.6} aria-hidden="true" /></div>
                <div className="preview-company"><strong>Your next team</strong><span>Technology & transformation</span></div>
                <span className="match-pill"><Sparkles size={12} aria-hidden="true" /> 94% fit</span>
              </div>
              <h2>Digital Transformation Analyst</h2>
              <div className="preview-location"><MapPin size={14} aria-hidden="true" /> Berlin, Germany <span /> Hybrid</div>
              <div className="preview-tags"><span>Process improvement</span><span>AI & automation</span></div>
              <div className="preview-insight"><span className="insight-check"><Check size={13} aria-hidden="true" /></span> Your skills. A clearer direction. <ArrowUpRight size={17} aria-hidden="true" /></div>
            </div>
            <div className="cv-note"><span className="cv-note-icon"><FileText size={19} aria-hidden="true" /></span><div><strong>From your CV to your next chapter</strong><span>Skills, experience, and preferences — connected.</span></div></div>
          </div>
          <div className="story-steps" id="how-it-works">
            <div><span>01</span><strong>Bring your story</strong><p>Upload your CV</p></div>
            <div><span>02</span><strong>Find your fit</strong><p>Explore relevant matches</p></div>
            <div><span>03</span><strong>Make your move</strong><p>Apply with confidence</p></div>
          </div>
        </div>
        <footer className="story-footer"><span>Built for your next chapter.</span><span><ShieldCheck size={14} aria-hidden="true" /> You stay in control</span></footer>
      </section>
      <section className="account-panel" aria-label="Your CareerOrbit account">
        <div className="mobile-brand"><Brand /></div>
        <div className="account-topline"><span>YOUR NEXT CHAPTER STARTS HERE</span><span className="account-top-icon"><ArrowUpRight size={19} aria-hidden="true" /></span></div>
        <div className="account-content">
          <div className="account-intro"><span className="section-kicker">LESS SEARCHING. MORE POSSIBILITY.</span><h2>{activeTab === 'register' ? 'Start with you.' : 'Welcome back.'}</h2><p>{activeTab === 'register' ? 'Tell us a little about yourself. Let’s find what’s next.' : 'Your next opportunity could be waiting. Let’s pick up where you left off.'}</p></div>
          {oauthError&&<p className="form-alert" role="alert">Social sign-in did not complete. Check provider configuration or use email sign-in.</p>}<OAuthButtons/><div className="auth-card">
            <div className="auth-tabs" role="tablist" aria-label="Account access">
              <button id="register-tab" type="button" role="tab" aria-selected={activeTab === 'register'} aria-controls="auth-form-panel" tabIndex={activeTab === 'register' ? 0 : -1}
                onClick={() => setActiveTab('register')} onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setActiveTab('login'); document.getElementById('login-tab')?.focus(); } }}>Create account</button>
              <button id="login-tab" type="button" role="tab" aria-selected={activeTab === 'login'} aria-controls="auth-form-panel" tabIndex={activeTab === 'login' ? 0 : -1}
                onClick={() => setActiveTab('login')} onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setActiveTab('register'); document.getElementById('register-tab')?.focus(); } }}>Sign in</button>
            </div>
            <div id="auth-form-panel" role="tabpanel" aria-labelledby={`${activeTab}-tab`} tabIndex={0}>
              {activeTab === 'register' ? <RegisterForm /> : <LoginForm />}
            </div>
          </div>
          <p className="account-switch">{activeTab === 'register' ? 'Already have an account?' : 'New to CareerOrbit?'} <button type="button" onClick={() => setActiveTab(activeTab === 'register' ? 'login' : 'register')}>{activeTab === 'register' ? 'Sign in' : 'Create an account'} <ArrowUpRight size={13} aria-hidden="true" /></button></p>
          <div className="account-trust"><ShieldCheck size={16} aria-hidden="true" /><span>Your career, your choices. Apply only when you’re ready.</span></div>
        </div>
        <footer className="account-footer"><span>© {new Date().getFullYear()} Rakesh Siripaka. All rights reserved.</span><span>A thoughtful way forward.</span></footer>
      </section>
    </main>
  );
}
