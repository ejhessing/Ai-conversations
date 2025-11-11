import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common filler words to detect
const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally',
  'sort of', 'kind of', 'i mean', 'right', 'okay', 'so', 'well'
];

function analyzeFillerWords(transcript: string): { count: number; details: Array<{ word: string; count: number }> } {
  const lowerTranscript = transcript.toLowerCase();
  const fillerDetails: { [key: string]: number } = {};
  let totalCount = 0;

  FILLER_WORDS.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerTranscript.match(regex);
    if (matches) {
      fillerDetails[filler] = matches.length;
      totalCount += matches.length;
    }
  });

  return {
    count: totalCount,
    details: Object.entries(fillerDetails).map(([word, count]) => ({ word, count }))
  };
}

function calculateWordsPerMinute(transcript: string, durationSeconds: number): number {
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  const minutes = durationSeconds / 60;
  return Math.round(words.length / minutes);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { session_id, user_transcript, ai_transcript, duration_seconds } = await req.json();

    if (!session_id || !user_transcript || duration_seconds === undefined) {
      throw new Error('Missing required fields');
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabaseClient
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found or unauthorized');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Analyze filler words
    const fillerAnalysis = analyzeFillerWords(user_transcript);

    // Calculate words per minute
    const wpm = calculateWordsPerMinute(user_transcript, duration_seconds);

    // Calculate question ratio (percentage of user turns that are questions)
    const userSentences = user_transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const questionCount = (user_transcript.match(/\?/g) || []).length;
    const questionRatio = userSentences.length > 0 ? questionCount / userSentences.length : 0;

    // Use GPT to analyze conversation quality
    const systemPrompt = `You are an expert communication coach analyzing a conversation practice session.

Given the user's transcript and AI's transcript, evaluate the conversation on multiple dimensions and provide structured feedback.

Analyze the following aspects:
1. **Clarity & Brevity**: How clear and concise were their statements?
2. **Confidence**: Did they sound confident and assertive?
3. **Empathy & Active Listening**: Did they acknowledge the other person and show understanding?
4. **Structure**: Was their conversation well-organized with clear points?
5. **Tone**: Was their tone appropriate for the context?

Provide scores (0-10) for clarity, confidence, empathy, and pacing quality.

Also provide:
- A brief summary (2-3 sentences)
- 3 specific things they did well
- 3 specific areas for improvement
- 1 practice drill they should do before their next session

Return your analysis in this exact JSON format:
{
  "clarity_score": 7.5,
  "confidence_score": 6.0,
  "empathy_score": 8.0,
  "pacing_score": 7.0,
  "summary": "Your analysis summary here",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "practice_drill": "Specific drill description",
  "tone_analysis": "Brief tone assessment",
  "structure_quality": "Brief structure assessment"
}`;

    const userPrompt = `**User Transcript:**
${user_transcript}

**AI Transcript:**
${ai_transcript || 'N/A'}

**Additional Metrics:**
- Duration: ${duration_seconds} seconds
- Words per minute: ${wpm}
- Filler word count: ${fillerAnalysis.count}
- Question ratio: ${(questionRatio * 100).toFixed(1)}%

Please analyze this conversation and provide structured feedback.`;

    // Call OpenAI GPT API for analysis
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${gptResponse.status}`);
    }

    const gptData = await gptResponse.json();
    const analysis = JSON.parse(gptData.choices[0]?.message?.content || '{}');

    // Prepare feedback object
    const feedbackData = {
      session_id,
      clarity_score: analysis.clarity_score || 5.0,
      empathy_score: analysis.empathy_score || 5.0,
      confidence_score: analysis.confidence_score || 5.0,
      pacing_score: analysis.pacing_score || 5.0,
      filler_count: fillerAnalysis.count,
      words_per_minute: wpm,
      summary: analysis.summary || 'Feedback analysis completed.',
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      practice_drill: analysis.practice_drill || 'Continue practicing to improve your skills.',
      detailed_analysis: {
        filler_words: fillerAnalysis.details,
        tone_analysis: analysis.tone_analysis || 'N/A',
        structure_quality: analysis.structure_quality || 'N/A',
        question_ratio: parseFloat((questionRatio * 100).toFixed(1)),
        active_listening_score: analysis.empathy_score || 5.0,
      },
    };

    // Insert feedback into database
    const { data: feedback, error: feedbackError } = await supabaseClient
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (feedbackError) {
      console.error('Error inserting feedback:', feedbackError);
      throw new Error('Failed to save feedback');
    }

    // Return feedback
    return new Response(
      JSON.stringify(feedback),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-feedback function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
