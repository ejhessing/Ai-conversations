import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { scenario_id, conversation_history, user_message } = await req.json();

    if (!scenario_id || !user_message) {
      throw new Error('Missing required fields: scenario_id, user_message');
    }

    // Fetch scenario details
    const { data: scenario, error: scenarioError } = await supabaseClient
      .from('scenarios')
      .select('*')
      .eq('id', scenario_id)
      .single();

    if (scenarioError || !scenario) {
      throw new Error('Scenario not found');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build conversation context for GPT
    const systemPrompt = `You are a realistic human playing the role of a ${scenario.persona} in the following scenario: ${scenario.context}

Your goal as the ${scenario.persona} is to respond naturally and authentically to the user's statements.

Key guidelines:
- Stay in character as the ${scenario.persona}
- Respond conversationally and naturally (2-4 sentences)
- Match the difficulty level: ${scenario.difficulty}
- Be realistic - show appropriate skepticism, curiosity, or enthusiasm based on what the user says
- Don't be overly helpful or make things too easy
- Ask follow-up questions when appropriate
- Show emotions and personality

Remember: You are a real person in this scenario, not an AI assistant. Respond as that person would.`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: scenario.script_seed },
    ];

    // Add conversation history
    if (conversation_history && Array.isArray(conversation_history)) {
      conversation_history.forEach((msg: any) => {
        if (msg.role === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'ai') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: user_message });

    // Call OpenAI GPT API
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: messages,
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${gptResponse.status}`);
    }

    const gptData = await gptResponse.json();
    const aiMessage = gptData.choices[0]?.message?.content || 'I understand. Please continue.';

    // Optional: Generate TTS audio if ElevenLabs API key is available
    let audioUrl = undefined;
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

    if (elevenlabsApiKey) {
      try {
        // Generate speech with ElevenLabs
        const ttsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenlabsApiKey,
          },
          body: JSON.stringify({
            text: aiMessage,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        });

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
        }
      } catch (ttsError) {
        console.error('TTS generation failed:', ttsError);
        // Continue without audio
      }
    }

    // Return AI response
    return new Response(
      JSON.stringify({
        ai_message: aiMessage,
        audio_url: audioUrl,
        emotion: 'neutral', // Could be enhanced with sentiment analysis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in simulate-reply function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
