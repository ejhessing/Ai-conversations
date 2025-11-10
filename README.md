# AI Conversation Coach

A cross-platform React Native app that helps users become more articulate, persuasive, and confident speakers through real-time conversation practice, speech analysis, and personalized feedback powered by AI.

## Features

- 🎙️ **Conversation Roleplay Mode**: Practice with AI personas in realistic scenarios
- 🧠 **Speech Analysis**: Get detailed feedback on clarity, confidence, empathy, and pacing
- 📊 **Progress Tracking**: Track your improvement over time with metrics and charts
- 📚 **Scenario Library**: Multiple practice scenarios from sales calls to job interviews
- 🎧 **Voice & Text Input**: Practice speaking or typing your responses
- 🔐 **Privacy First**: Your data is secure and can be deleted anytime

## Tech Stack

### Frontend
- **React Native** + **Expo** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **NativeWind** (Tailwind CSS) - Styling
- **Expo Router** - File-based navigation
- **React Query** - Server state management
- **Zustand** - Client state management (optional)

### Backend
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Storage
  - Edge Functions (Deno)
  - Row Level Security

### AI Services
- **OpenAI GPT-4** - Conversation simulation & feedback analysis
- **OpenAI Whisper** - Speech-to-text transcription
- **OpenAI TTS / ElevenLabs** - Text-to-speech (optional)

## Project Structure

```
ai-conversation-coach/
├── app/                      # Expo Router pages
│   ├── _layout.tsx          # Root layout with providers
│   ├── index.tsx            # Home screen
│   ├── auth.tsx             # Authentication screen
│   ├── roleplay.tsx         # Roleplay conversation screen
│   ├── feedback.tsx         # Feedback review screen
│   └── profile.tsx          # User profile & stats
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── AudioRecorder.tsx
│   │   ├── FeedbackCard.tsx
│   │   ├── ScenarioPicker.tsx
│   │   └── ProgressChart.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useScenarios.ts
│   │   ├── useConversation.ts
│   │   ├── useTranscription.ts
│   │   └── useFeedback.ts
│   ├── screens/             # Screen components
│   ├── services/            # API service layer
│   │   └── api.ts
│   ├── config/              # Configuration files
│   │   ├── supabase.ts
│   │   └── react-query.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   └── utils/               # Utility functions
├── supabase/
│   ├── migrations/          # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_seed_scenarios.sql
│   └── functions/           # Edge Functions
│       ├── transcribe-audio/
│       ├── simulate-reply/
│       └── generate-feedback/
├── assets/                  # Images, fonts, etc.
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── app.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Supabase CLI: `npm install -g supabase`
- OpenAI API key
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-conversation-coach
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key

#### Run Database Migrations

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

Or manually run the SQL files in the Supabase SQL editor:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_seed_scenarios.sql`

#### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy transcribe-audio
supabase functions deploy simulate-reply
supabase functions deploy generate-feedback

# Set environment secrets
supabase secrets set OPENAI_API_KEY=your-openai-api-key
supabase secrets set ELEVENLABS_API_KEY=your-elevenlabs-key (optional)
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# These are set in Supabase Edge Functions, not needed in app
# OPENAI_API_KEY=sk-...
# ELEVENLABS_API_KEY=...
```

### 4. Run the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

### 5. Create Your First Account

1. Open the app
2. Tap "Sign Up"
3. Enter your email, password, and name
4. Check your email for verification link
5. Sign in and start practicing!

## Database Schema

### Tables

- **users** - User profiles (extends Supabase auth.users)
- **scenarios** - Practice scenario templates
- **sessions** - User practice sessions
- **feedback** - AI-generated feedback per session
- **metrics** - Aggregated weekly performance metrics
- **badges** - Achievement badges
- **user_badges** - Earned badges per user

See `supabase/migrations/001_initial_schema.sql` for full schema.

## API Architecture

### Edge Functions

All AI processing happens in Supabase Edge Functions for security:

1. **transcribe-audio**
   - Input: Base64 audio, session ID
   - Calls: OpenAI Whisper API
   - Output: Transcript with word timestamps

2. **simulate-reply**
   - Input: Scenario ID, conversation history, user message
   - Calls: OpenAI GPT-4 (as persona)
   - Output: AI response + optional audio URL

3. **generate-feedback**
   - Input: Session ID, transcripts, duration
   - Calls: OpenAI GPT-4 (as coach)
   - Output: Detailed feedback with scores and suggestions

### React Query Hooks

- Data fetching is cached and managed by React Query
- Automatic refetching and background updates
- Optimistic updates for better UX

## Key Features Explained

### Conversation Roleplay

1. User selects a scenario (e.g., "Cold Call - Software Sales")
2. AI takes on a persona (e.g., "Skeptical IT Manager")
3. User responds via voice or text
4. AI replies naturally, staying in character
5. Conversation continues until user ends session

### Feedback Analysis

After a session, AI analyzes:
- **Clarity**: How clear and concise were the statements?
- **Confidence**: Did the user sound assertive?
- **Empathy**: Active listening and understanding
- **Pacing**: Words per minute (ideal: 150-170)
- **Filler Words**: Count of "um", "uh", "like", etc.

Feedback includes:
- Scores (0-10) for each dimension
- 3 strengths
- 3 improvements
- 1 practice drill for next session

### Progress Tracking

- **Streak**: Consecutive days with practice
- **Total Sessions**: All completed sessions
- **Average Scores**: Trends over time
- **Weekly Charts**: Visual progress graphs

## Customization

### Adding New Scenarios

Insert into the `scenarios` table:

```sql
INSERT INTO scenarios (title, persona, difficulty, goal, context, script_seed)
VALUES (
  'Your Scenario Title',
  'The persona (e.g., Friendly Customer)',
  'beginner', -- or 'intermediate', 'advanced'
  'What the user should achieve',
  'Context and setup',
  'AI opening line'
);
```

### Modifying Feedback Criteria

Edit `supabase/functions/generate-feedback/index.ts`:
- Adjust scoring prompts
- Add new metrics
- Change filler word list

## Deployment

### Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Supabase Production

- Use production Supabase project
- Set production environment variables
- Enable RLS policies
- Configure custom domain (optional)

## Troubleshooting

### Audio Recording Not Working

- **iOS**: Check microphone permissions in `app.json`
- **Android**: Add `RECORD_AUDIO` permission
- **Simulator**: Use physical device for testing

### Supabase Connection Issues

- Verify `.env` file has correct URL and key
- Check Supabase project is not paused
- Ensure RLS policies allow authenticated access

### OpenAI API Errors

- Verify API key is set in Supabase secrets
- Check API usage limits
- Ensure correct model names (gpt-4-turbo-preview, whisper-1)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: support@aiconversationcoach.com

## Acknowledgments

- OpenAI for GPT-4 and Whisper
- Supabase for backend infrastructure
- Expo for React Native tooling
- All open-source contributors

---

Built with ❤️ for better communication skills
