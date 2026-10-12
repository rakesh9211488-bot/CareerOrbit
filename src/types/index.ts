export interface Profile {
  id: string;
  full_name: string;
  email: string;
  job_preference: string;
  location: string;
  cv_url?: string;
  cv_file_name?: string;
  cv_uploaded_at?: string;
  cv_analysis?: CVAnalysis;
  cv_analyzed_at?: string;
  cv_analysis_model?: string;
  generated_cv_url?: string;
  profile_summary?: string;
  created_at: string;
}

export interface CVAnalysis {
  summary: string;
  skills: string[];
  languages: string[];
  education: string[];
  experience: string[];
  cv_feedback: string[];
  suggested_roles: string[];
}

export interface Job {
  job_id: string;
  company: string;
  role: string;
  apply_link: string;
  location: string;
  tags?: string[];
  description?: string;
  created_at?: string;
}

export interface MatchedJob extends Job {
  match_score: number;
  matched_at: string;
}

export interface AuthFormData {
  full_name?: string;
  email: string;
  job_preference?: string;
  location?: string;
  password: string;
  confirm_password?: string;
}

export interface UploadCVPayload {
  user_id: string;
  cv_url: string;
  full_name: string;
  job_preference: string;
  location: string;
}

export interface MatchedJobsResponse {
  success: boolean;
  data?: MatchedJob[];
  error?: string;
}

export type JobPreference = 
  | 'Software Engineer'
  | 'Product Manager'
  | 'Data Scientist'
  | 'Designer'
  | 'Marketing'
  | 'DevOps'
  | 'Sales'
  | 'Other';
