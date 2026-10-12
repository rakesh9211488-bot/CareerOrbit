'use client';

import { Profile } from '@/types';

interface ProfileSummaryProps {
  profile: Profile;
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  return (
    <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Profile Summary</p>
        <p className="text-sm text-gray-100 leading-relaxed">
          {profile.profile_summary ||
            'Your AI-generated profile summary will appear here after your first CV upload.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Job Preference</p>
          <p className="text-sm font-semibold text-indigo-400">{profile.job_preference}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Location</p>
          <p className="text-sm font-semibold text-cyan-400">{profile.location}</p>
        </div>
      </div>
    </div>
  );
}
