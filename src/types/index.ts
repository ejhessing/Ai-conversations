// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Scenario {
  id: string;
  title: string;
  persona: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  context: string;
  script_seed: string;
  created_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  scenario_id: string;
  transcript: string;
  ai_transcript: string;
  duration_seconds?: number;
  created_at: string;
}

export interface Feedback {
  id: string;
  session_id: string;
  clarity_score: number;
  empathy_score: number;
  confidence_score: number;
  pacing_score: number;
  filler_count: number;
  words_per_minute: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  practice_drill: string;
  created_at: string;
}

export interface Metrics {
  id: string;
  user_id: string;
  week_start: string;
  avg_clarity: number;
  avg_confidence: number;
  avg_empathy: number;
  avg_filler_rate: number;
  total_sessions: number;
  total_practice_time: number;
}

// API Request/Response Types
export interface TranscriptionRequest {
  audio_base64: string;
  session_id: string;
}

export interface TranscriptionResponse {
  transcript: string;
  duration: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

export interface SimulateReplyRequest {
  scenario_id: string;
  conversation_history: ConversationMessage[];
  user_message: string;
}

export interface SimulateReplyResponse {
  ai_message: string;
  audio_url?: string;
  emotion?: string;
}

export interface GenerateFeedbackRequest {
  session_id: string;
  user_transcript: string;
  ai_transcript: string;
  duration_seconds: number;
}

export interface GenerateFeedbackResponse {
  clarity_score: number;
  empathy_score: number;
  confidence_score: number;
  pacing_score: number;
  filler_count: number;
  words_per_minute: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  practice_drill: string;
  detailed_analysis: {
    filler_words: Array<{ word: string; count: number }>;
    tone_analysis: string;
    structure_quality: string;
    question_ratio: number;
    active_listening_score: number;
  };
}

// UI State Types
export interface ConversationMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  audio_url?: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioUri?: string;
}

export interface ProgressData {
  current_streak: number;
  total_sessions: number;
  average_scores: {
    clarity: number;
    confidence: number;
    empathy: number;
    pacing: number;
  };
  weekly_trend: Array<{
    week: string;
    clarity: number;
    confidence: number;
    filler_rate: number;
  }>;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
}

// Configuration Types
export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  openaiApiKey?: string;
  elevenlabsApiKey?: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data?: T;
  error?: Error;
  status: LoadingState;
}
