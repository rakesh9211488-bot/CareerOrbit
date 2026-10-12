'use client';

import { MatchedJob } from '@/types';
import { JobCard } from './JobCard';
import { Briefcase } from 'lucide-react';

interface JobsListProps {
  jobs: MatchedJob[];
  onGenerateCV: (jobId: string) => void;
  onApply: (url: string) => void;
  isGenerating?: string | null;
  isLoading?: boolean;
}

export function JobsList({
  jobs,
  onGenerateCV,
  onApply,
  isGenerating = null,
  isLoading = false,
}: JobsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-80 bg-surface border border-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
            <Briefcase className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">No matches yet</h3>
        <p className="text-gray-400 mb-6">Upload your CV to get started</p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Upload CV
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job, idx) => (
        <JobCard
          key={job.job_id}
          job={job}
          onGenerateCV={onGenerateCV}
          onApply={onApply}
          isGenerating={isGenerating === job.job_id}
          delay={idx * 80}
        />
      ))}
    </div>
  );
}
