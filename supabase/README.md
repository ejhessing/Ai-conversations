# Supabase Setup Guide

This directory contains all Supabase-related files including database migrations and Edge Functions.

## Directory Structure

```
supabase/
├── migrations/              # SQL migration files
│   ├── 001_initial_schema.sql
│   └── 002_seed_scenarios.sql
└── functions/               # Edge Functions (Deno)
    ├── transcribe-audio/
    │   └── index.ts
    ├── simulate-reply/
    │   └── index.ts
    └── generate-feedback/
        └── index.ts
```

## Database Setup

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option 2: Manual SQL Execution

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `001_initial_schema.sql`
   - `002_seed_scenarios.sql`

## Edge Functions Setup

### Deploy Functions

```bash
# Deploy individual functions
supabase functions deploy transcribe-audio
supabase functions deploy simulate-reply
supabase functions deploy generate-feedback

# Or deploy all at once
supabase functions deploy
```

### Set Environment Variables

Edge Functions need API keys set as secrets:

```bash
# Required: OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# Optional: ElevenLabs for better TTS
supabase secrets set ELEVENLABS_API_KEY=your-key-here

# Verify secrets
supabase secrets list
```

### Test Functions Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/transcribe-audio' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"audio_base64":"...","session_id":"..."}'
```

## Database Schema Overview

### Core Tables

1. **users** - Extends Supabase auth.users
   - Stores user profile information
   - Auto-created via trigger on signup

2. **scenarios** - Practice scenarios
   - Title, persona, difficulty, context
   - Pre-seeded with 8 scenarios

3. **sessions** - Practice sessions
   - Links user to scenario
   - Stores transcripts and duration

4. **feedback** - AI-generated feedback
   - Scores for clarity, confidence, empathy, pacing
   - Strengths, improvements, practice drills
   - Detailed analysis JSON

5. **metrics** - Weekly aggregated stats
   - Auto-updated via trigger
   - Used for progress tracking

6. **badges & user_badges** - Achievements
   - Pre-seeded badge definitions
   - Tracks earned badges per user

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can only access their own data
- Scenarios and badges are public (read-only)
- Session and feedback access validated via joins

### Database Functions & Triggers

1. **handle_new_user()** - Creates user profile on signup
2. **update_metrics_after_feedback()** - Updates weekly metrics

## Edge Function Details

### 1. transcribe-audio

**Purpose**: Convert speech to text using OpenAI Whisper

**Input**:
```typescript
{
  audio_base64: string;  // Base64 encoded audio (WAV)
  session_id?: string;   // Optional: to update session
}
```

**Output**:
```typescript
{
  transcript: string;
  duration: number;
  words: Array<{ word: string; start: number; end: number }>;
}
```

**OpenAI API Used**: Whisper (whisper-1 model)

### 2. simulate-reply

**Purpose**: Generate AI responses as a conversation persona

**Input**:
```typescript
{
  scenario_id: string;
  conversation_history: Array<{ role: string; content: string }>;
  user_message: string;
}
```

**Output**:
```typescript
{
  ai_message: string;
  audio_url?: string;    // Optional TTS audio
  emotion?: string;
}
```

**OpenAI API Used**: GPT-4 Turbo, optionally TTS/ElevenLabs

**Key Features**:
- Maintains conversation context
- Stays in character based on scenario
- Adjusts difficulty and tone

### 3. generate-feedback

**Purpose**: Analyze conversation and provide coaching feedback

**Input**:
```typescript
{
  session_id: string;
  user_transcript: string;
  ai_transcript: string;
  duration_seconds: number;
}
```

**Output**:
```typescript
{
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
```

**OpenAI API Used**: GPT-4 Turbo with structured JSON output

**Analysis Includes**:
- Filler word detection (um, uh, like, etc.)
- Words per minute calculation
- Question ratio (active listening)
- GPT-4 powered qualitative analysis

## Security Best Practices

1. **API Keys**: Never commit API keys to code
   - Use Supabase secrets for Edge Functions
   - Use environment variables for app config

2. **RLS Policies**: Always verify user authorization
   - Check `auth.uid()` matches resource owner
   - Use `SECURITY DEFINER` for trigger functions

3. **Input Validation**: Sanitize all inputs
   - Edge Functions validate all parameters
   - Database has type constraints and checks

4. **CORS**: Edge Functions include CORS headers
   - Allows requests from app domains
   - Handles preflight OPTIONS requests

## Monitoring & Debugging

### View Function Logs

```bash
# Real-time logs
supabase functions logs transcribe-audio --follow

# Historical logs
supabase functions logs simulate-reply --limit 100
```

### Check Database Performance

```sql
-- View slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor API Usage

- Check OpenAI usage: [platform.openai.com](https://platform.openai.com/usage)
- Check Supabase usage: Project Dashboard → Usage

## Backup & Recovery

### Export Database

```bash
# Full database dump
supabase db dump -f backup.sql

# Schema only
supabase db dump -f schema.sql --schema-only

# Data only
supabase db dump -f data.sql --data-only
```

### Point-in-Time Recovery

Supabase Pro plans include point-in-time recovery. Contact support if needed.

## Scaling Considerations

### Database

- Add indexes for frequently queried fields
- Use materialized views for complex analytics
- Consider partitioning for large tables (sessions, feedback)

### Edge Functions

- Functions auto-scale with Supabase
- Optimize payload sizes
- Cache responses when possible
- Use streaming for large responses

### Storage

- Store audio files in Supabase Storage
- Set lifecycle policies to delete old recordings
- Use CDN for frequently accessed files

## Troubleshooting

### Functions Not Deploying

- Check Deno import syntax (use full URLs)
- Verify secrets are set
- Check function logs for errors

### Database Connection Issues

- Verify project is not paused
- Check connection pooling limits
- Review RLS policies

### Performance Issues

- Add indexes on foreign keys
- Analyze query plans with EXPLAIN
- Consider caching with React Query

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Guide](https://supabase.com/docs/guides/database)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
