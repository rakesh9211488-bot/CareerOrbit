'use client';

import { useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, FileText, Loader2, ShieldCheck, Sparkles, UploadCloud, Workflow } from 'lucide-react';
import { MAX_CV_BYTES } from '@/lib/cv';

interface Props { savedName?: string; hasSavedCV: boolean; workflowConfigured: boolean; analysisConfigured: boolean; analysisSaved: boolean; profileUnavailable: boolean; }

export function CVUploadPanel({ savedName, hasSavedCV, workflowConfigured, analysisConfigured, analysisSaved, profileUnavailable }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<File | null>(null);
  const [saved, setSaved] = useState(hasSavedCV);
  const [name, setName] = useState(savedName || 'Your saved CV');
  const [busy, setBusy] = useState<'upload' | 'send' | 'analyze' | null>(null);
  const [analyzed, setAnalyzed] = useState(analysisSaved);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] }, maxSize: MAX_CV_BYTES, minSize: 1, multiple: false,
    disabled: Boolean(busy) || profileUnavailable,
    onDrop(accepted, rejected) {
      setNotice('');
      setError(rejected.length ? 'Choose one PDF file, no larger than 5 MB.' : '');
      setSelected(accepted[0] || null);
    },
  });

  async function act(action: 'upload' | 'send' | 'analyze') {
    if (lock.current || (action === 'upload' && !selected)) return;
    lock.current = true;
    setBusy(action); setError(''); setNotice('');
    try {
      let body: FormData | undefined;
      if (action === 'upload' && selected) { body = new FormData(); body.append('file', selected); }
      const endpoint = action === 'upload' ? '/api/cv' : action === 'send' ? '/api/cv/send' : '/api/cv/analyze';
      const response = await fetch(endpoint, { method: 'POST', body });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Please try again.');
      if (action === 'upload') {
        setSaved(true); setName(result.fileName); setSelected(null); setAnalyzed(false);
        setNotice('Your CV is saved privately. You can open it below.');
        router.refresh();
      } else if (action === 'analyze') {
        setAnalyzed(true);
        setNotice('Your CV analysis is saved. Review your CV insights below.');
        router.refresh();
      } else { setNotice('Your workflow confirmed receipt of your CV. Use Analyze CV to create your CV insights.'); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Connection failed. Please try again.'); }
    finally { lock.current = false; setBusy(null); }
  }

  return (
    <section className="workspace-card cv-card" id="cv-upload" aria-labelledby="cv-title">
      <div className="workspace-card-heading"><h2 id="cv-title">Your experience starts here</h2><span><FileText size={18} aria-hidden="true" /></span></div>
      <div className="cv-panel-grid">
        <div>
          <p className="cv-intro">Bring your CV into your career workspace.</p>
          <div {...getRootProps({ className: `cv-dropzone ${isDragActive ? 'cv-dropzone-active' : ''}`, 'aria-label': 'Choose or drop a PDF CV', 'aria-disabled': Boolean(busy) || profileUnavailable })}>
            <input {...getInputProps()} />
            <span className="cv-upload-icon"><UploadCloud size={27} strokeWidth={1.5} aria-hidden="true" /></span>
            <strong>{selected ? selected.name : isDragActive ? 'Drop your PDF here' : 'Drop your CV here, or browse'}</strong>
            <span>{selected ? `${(selected.size / 1024).toFixed(0)} KB · Ready to upload` : 'One PDF · Up to 5 MB'}</span>
          </div>
          <button className="cv-primary" type="button" disabled={!selected || Boolean(busy) || profileUnavailable} onClick={() => act('upload')}>
            {busy === 'upload' ? <Loader2 size={16} className="cv-spin" aria-hidden="true" /> : <UploadCloud size={16} aria-hidden="true" />}
            {busy === 'upload' ? 'Saving your CV…' : saved ? 'Save replacement CV' : 'Save my CV'}
          </button>
        </div>
        <div className="cv-saved-panel">
          <span className="section-kicker">YOUR NEXT STEP</span>
          <div className="cv-file-row"><FileText size={23} aria-hidden="true" /><div><strong>{saved ? name : 'A little more of your story.'}</strong><span>{saved ? 'Saved in your private workspace' : 'Save your CV to get started.'}</span></div>{saved && <CheckCircle2 size={17} aria-label="Saved" />}</div>
          {saved && <a className="cv-open" href="/api/cv" target="_blank" rel="noopener noreferrer">Open saved CV <ExternalLink size={14} aria-hidden="true" /></a>}
          <div className="cv-workflow"><Sparkles size={17} aria-hidden="true" /><div><strong>{analysisConfigured ? 'Ready for CV analysis' : 'AI setup pending'}</strong><p>{analysisConfigured ? 'Turn your saved CV into a summary, skills, and practical suggestions.' : 'Connect your AI workflow to create insights from your saved CV.'}</p></div></div>
          <div className="cv-actions">
            <button className="cv-primary cv-analyze" type="button" disabled={!saved || Boolean(busy) || !analysisConfigured || profileUnavailable} onClick={() => act('analyze')}>{busy === 'analyze' ? <Loader2 size={15} className="cv-spin" aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}{busy === 'analyze' ? 'Reading your CV…' : analyzed ? 'Analyze CV again' : 'Analyze CV'}</button>
            <button className="cv-secondary" type="button" disabled={!saved || Boolean(busy) || !workflowConfigured || profileUnavailable} onClick={() => act('send')}>{busy === 'send' ? <Loader2 size={15} className="cv-spin" aria-hidden="true" /> : <Workflow size={15} aria-hidden="true" />}{busy === 'send' ? 'Sending…' : 'Confirm CV connection'}</button>
          </div>
          <p className="cv-provider-note">Analyzing sends your PDF to your configured AI provider through n8n and uses your provider API quota.</p>
        </div>
      </div>
      {profileUnavailable && <p className="cv-error" role="alert">Your profile is unavailable. Refresh the page before uploading.</p>}
      {error && <p className="cv-error" role="alert">{error}</p>}
      {notice && <p className="cv-success" role="status"><CheckCircle2 size={16} aria-hidden="true" />{notice}</p>}
      {busy === 'analyze' && <p className="cv-analysis-progress" role="status">Your AI workflow is reading your CV. Keep this page open; this can take up to 90 seconds.</p>}
      <p className="cv-privacy"><ShieldCheck size={13} aria-hidden="true" /> Your CV stays private. You choose when to send it to your workflow.</p>
    </section>
  );
}
