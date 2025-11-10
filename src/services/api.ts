import { supabase } from '@/config/supabase';
import type {
  TranscriptionRequest,
  TranscriptionResponse,
  SimulateReplyRequest,
  SimulateReplyResponse,
  GenerateFeedbackRequest,
  GenerateFeedbackResponse,
  Scenario,
  Session,
  Feedback,
  Metrics,
} from '@/types';

// Construct the Edge Functions URL from the Supabase URL
const FUNCTIONS_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

/**
 * Helper to call Supabase Edge Functions with authentication
 */
async function callEdgeFunction<T>(
  functionName: string,
  body: any
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  if (!FUNCTIONS_URL) {
    throw new Error('Supabase Functions URL not configured');
  }

  const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    // Safely handle error response parsing
    try {
      const error = await response.json();
      throw new Error(error.error || `Failed to call ${functionName}`);
    } catch (parseError) {
      // If JSON parsing fails, use status text
      throw new Error(`Failed to call ${functionName}: ${response.statusText}`);
    }
  }

  // Safely parse successful response
  try {
    return await response.json();
  } catch (parseError) {
    throw new Error(`Failed to parse response from ${functionName}`);
  }
}

// ==================== Audio Transcription ====================

export async function transcribeAudio(
  request: TranscriptionRequest
): Promise<TranscriptionResponse> {
  return callEdgeFunction<TranscriptionResponse>('transcribe-audio', request);
}

// ==================== AI Conversation Simulation ====================

export async function simulateReply(
  request: SimulateReplyRequest
): Promise<SimulateReplyResponse> {
  return callEdgeFunction<SimulateReplyResponse>('simulate-reply', request);
}

// ==================== Feedback Generation ====================

export async function generateFeedback(
  request: GenerateFeedbackRequest
): Promise<GenerateFeedbackResponse> {
  return callEdgeFunction<GenerateFeedbackResponse>('generate-feedback', request);
}

// ==================== Database Queries ====================

export async function fetchScenarios(): Promise<Scenario[]> {
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .order('difficulty', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchScenario(id: string): Promise<Scenario> {
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSession(
  scenarioId: string,
  userId: string
): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      scenario_id: scenarioId,
      transcript: '',
      ai_transcript: '',
      duration_seconds: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Session>
): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserSessions(userId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, scenarios(*), feedback(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function fetchSessionFeedback(sessionId: string): Promise<Feedback | null> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function fetchUserMetrics(userId: string): Promise<Metrics[]> {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(12); // Last 12 weeks

  if (error) throw error;
  return data || [];
}

export async function fetchUserProgress(userId: string) {
  // Fetch recent sessions with feedback
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*, feedback(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (sessionsError) throw sessionsError;

  // Calculate streak (consecutive days with sessions)
  let currentStreak = 0;
  const sessionsData = sessions || [];

  if (sessionsData.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique days with sessions
    const uniqueDays = new Set(
      sessionsData.map(s => new Date(s.created_at).toDateString())
    );

    // Check if user practiced today or yesterday (streak is still active if they practiced yesterday)
    let checkDate = new Date(today);
    const hasToday = uniqueDays.has(checkDate.toDateString());

    if (!hasToday) {
      // If no practice today, check yesterday to see if streak is still active
      checkDate.setDate(checkDate.getDate() - 1);
      if (!uniqueDays.has(checkDate.toDateString())) {
        // Streak is broken - no practice today or yesterday
        currentStreak = 0;
      }
    }

    // Count consecutive days backwards
    if (currentStreak !== 0 || hasToday) {
      checkDate = new Date(today);
      while (uniqueDays.has(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  }

  // Calculate average scores
  const feedbackData = sessionsData
    .map(s => s.feedback)
    .filter(f => f && f.length > 0)
    .flat();

  const avgScores = {
    clarity: 0,
    confidence: 0,
    empathy: 0,
    pacing: 0,
  };

  if (feedbackData.length > 0) {
    avgScores.clarity = feedbackData.reduce((sum, f) => sum + f.clarity_score, 0) / feedbackData.length;
    avgScores.confidence = feedbackData.reduce((sum, f) => sum + f.confidence_score, 0) / feedbackData.length;
    avgScores.empathy = feedbackData.reduce((sum, f) => sum + f.empathy_score, 0) / feedbackData.length;
    avgScores.pacing = feedbackData.reduce((sum, f) => sum + f.pacing_score, 0) / feedbackData.length;
  }

  return {
    current_streak: currentStreak,
    total_sessions: sessionsData.length,
    average_scores: avgScores,
    recent_sessions: sessionsData.slice(0, 10),
  };
}
