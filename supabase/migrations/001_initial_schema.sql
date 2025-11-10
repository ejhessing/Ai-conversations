-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenarios table
CREATE TABLE public.scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  persona TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  goal TEXT NOT NULL,
  context TEXT NOT NULL,
  script_seed TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL DEFAULT '',
  ai_transcript TEXT NOT NULL DEFAULT '',
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  clarity_score NUMERIC(3, 1) NOT NULL CHECK (clarity_score >= 0 AND clarity_score <= 10),
  empathy_score NUMERIC(3, 1) NOT NULL CHECK (empathy_score >= 0 AND empathy_score <= 10),
  confidence_score NUMERIC(3, 1) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 10),
  pacing_score NUMERIC(3, 1) NOT NULL CHECK (pacing_score >= 0 AND pacing_score <= 10),
  filler_count INTEGER NOT NULL DEFAULT 0,
  words_per_minute INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  practice_drill TEXT NOT NULL,
  detailed_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics table (aggregated weekly stats)
CREATE TABLE public.metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  avg_clarity NUMERIC(3, 1) DEFAULT 0,
  avg_confidence NUMERIC(3, 1) DEFAULT 0,
  avg_empathy NUMERIC(3, 1) DEFAULT 0,
  avg_filler_rate NUMERIC(5, 2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (earned badges)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX idx_feedback_session_id ON public.feedback(session_id);
CREATE INDEX idx_metrics_user_id ON public.metrics(user_id);
CREATE INDEX idx_metrics_week_start ON public.metrics(week_start DESC);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access feedback for their own sessions
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = feedback.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feedback for own sessions" ON public.feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = feedback.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Users can only access their own metrics
CREATE POLICY "Users can view own metrics" ON public.metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own metrics" ON public.metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON public.metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their earned badges
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Scenarios are public (read-only)
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scenarios are viewable by everyone" ON public.scenarios
  FOR SELECT USING (true);

-- Badges are public (read-only)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are viewable by everyone" ON public.badges
  FOR SELECT USING (true);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update metrics after feedback is created
CREATE OR REPLACE FUNCTION public.update_metrics_after_feedback()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_week_start DATE;
  v_session_duration INTEGER;
BEGIN
  -- Get user_id and duration from session
  SELECT s.user_id, s.duration_seconds, DATE_TRUNC('week', s.created_at)::DATE
  INTO v_user_id, v_session_duration, v_week_start
  FROM public.sessions s
  WHERE s.id = NEW.session_id;

  -- Insert or update metrics
  INSERT INTO public.metrics (
    user_id,
    week_start,
    avg_clarity,
    avg_confidence,
    avg_empathy,
    avg_filler_rate,
    total_sessions,
    total_practice_time
  )
  VALUES (
    v_user_id,
    v_week_start,
    NEW.clarity_score,
    NEW.confidence_score,
    NEW.empathy_score,
    NEW.filler_count,
    1,
    v_session_duration
  )
  ON CONFLICT (user_id, week_start) DO UPDATE SET
    avg_clarity = (metrics.avg_clarity * metrics.total_sessions + NEW.clarity_score) / (metrics.total_sessions + 1),
    avg_confidence = (metrics.avg_confidence * metrics.total_sessions + NEW.confidence_score) / (metrics.total_sessions + 1),
    avg_empathy = (metrics.avg_empathy * metrics.total_sessions + NEW.empathy_score) / (metrics.total_sessions + 1),
    avg_filler_rate = (metrics.avg_filler_rate * metrics.total_sessions + NEW.filler_count) / (metrics.total_sessions + 1),
    total_sessions = metrics.total_sessions + 1,
    total_practice_time = metrics.total_practice_time + v_session_duration;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update metrics
CREATE TRIGGER on_feedback_created
  AFTER INSERT ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_metrics_after_feedback();
