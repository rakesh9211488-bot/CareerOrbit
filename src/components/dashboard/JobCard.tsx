'use client';

import { MatchedJob } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Download, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

interface JobCardProps {
  job: MatchedJob;
  onGenerateCV: (jobId: string) => void;
  onApply: (url: string) => void;
  isGenerating?: boolean;
  delay?: number;
}

export function JobCard({
  job,
  onGenerateCV,
  onApply,
  isGenerating = false,
  delay = 0,
}: JobCardProps) {
  const matchPercentage = Math.min(Math.max(job.match_score, 0), 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (matchPercentage / 100) * circumference;

  return (
    <div
      className="card-shimmer bg-surface border border-gray-700 rounded-lg p-6 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all"
      style={{
        animation: `fadeInUp 0.5s ease-out ${delay}ms both`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">{job.company}</h3>
          <p className="text-sm text-gray-400 mt-1">
            <span className="font-mono text-xs">#{job.job_id.slice(0, 8)}</span>
          </p>
        </div>
        <svg width="100" height="100" className="-mt-2 -mr-2">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(107, 114, 128, 0.3)"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            fill="#22D3EE"
            fontSize="20"
            fontWeight="bold"
            className="font-sora"
          >
            {matchPercentage}%
          </text>
        </svg>
      </div>

      {/* Role and Location */}
      <div className="mb-4">
        <h4 className="text-base font-semibold text-gray-100">{job.role}</h4>
        <p className="text-sm text-gray-400 mt-1">{job.location}</p>
      </div>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.tags.map((tag) => (
            <Badge key={tag} label={tag} variant="default" />
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-700 my-4" />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onApply(job.apply_link)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 font-medium rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all"
        >
          <ExternalLink size={16} />
          Apply
        </button>
        <button
          onClick={() => onGenerateCV(job.job_id)}
          disabled={isGenerating}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg transition-all',
            isGenerating
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-500'
          )}
        >
          <Download size={16} />
          {isGenerating ? 'Generating...' : 'CV'}
        </button>
      </div>
    </div>
  );
}
