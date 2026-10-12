'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-wrap">
      <Lock className="input-icon" size={17} aria-hidden="true" />
      <input {...props} type={visible ? 'text' : 'password'} className="form-input password-input" />
      <button type="button" className="password-toggle" onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
