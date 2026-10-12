import type { CVAnalysis } from '@/types';

const fields = ['skills', 'languages', 'education', 'experience', 'cv_feedback', 'suggested_roles'] as const;

// Treat both model output and database JSON as untrusted input.
export function parseCVAnalysis(value: unknown): CVAnalysis | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (typeof data.summary !== 'string' || !data.summary.trim() || data.summary.length > 3000) return null;
  const result: CVAnalysis = { summary: data.summary.trim(), skills: [], languages: [], education: [], experience: [], cv_feedback: [], suggested_roles: [] };
  for (const field of fields) {
    const list = data[field];
    if (!Array.isArray(list) || list.length > 30 || list.some(item => typeof item !== 'string' || !item.trim() || item.length > 1000)) return null;
    result[field] = [...new Set((list as string[]).map(item => item.trim()))];
  }
  return result;
}
