/**
 * Application constants
 */

// Speech Analysis Constants
export const SPEECH_METRICS = {
  OPTIMAL_WPM_MIN: 150,
  OPTIMAL_WPM_MAX: 170,
  SLOW_WPM_MAX: 120,
  FAST_WPM_MIN: 180,
  MIN_DURATION_SECONDS: 10,
  MAX_RECORDING_DURATION: 900, // 15 minutes
} as const;

// Score Thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 8,
  GOOD: 6,
  FAIR: 4,
  POOR: 0,
} as const;

// Filler Words List
export const FILLER_WORDS = [
  'um',
  'uh',
  'like',
  'you know',
  'actually',
  'basically',
  'literally',
  'sort of',
  'kind of',
  'i mean',
  'right',
  'okay',
  'so',
  'well',
] as const;

// Session Limits
export const SESSION_LIMITS = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_MESSAGES_PER_SESSION: 100,
  MAX_SESSIONS_DISPLAY: 50,
  MAX_WEEKS_METRICS: 12,
} as const;

// Badge Requirements
export const BADGE_REQUIREMENTS = {
  FIRST_STEPS: 1,
  CONVERSATIONALIST: 10,
  MARATHON_SPEAKER: 50,
  WEEK_WARRIOR: 7,
  MONTHLY_MASTER: 30,
  CLARITY_EXPERT: 5,
  FILLER_SLAYER: 1,
  EMPATHY_EXPERT: 3,
  CONFIDENCE_KING: 5,
  SPEED_SPEAKER: 3,
} as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

// Difficulty Colors (for UI)
export const DIFFICULTY_COLORS = {
  beginner: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-500',
  },
  intermediate: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-500',
  },
  advanced: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-500',
  },
} as const;

// Score Colors (for UI)
export const SCORE_COLORS = {
  excellent: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    bar: 'bg-green-500',
  },
  good: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    bar: 'bg-yellow-500',
  },
  fair: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    bar: 'bg-orange-500',
  },
  poor: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    bar: 'bg-red-500',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please sign in again.',
  PERMISSION_DENIED: 'Permission denied. Please check app permissions.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  SESSION_NOT_FOUND: 'Session not found.',
  SCENARIO_NOT_FOUND: 'Scenario not found.',
  MICROPHONE_PERMISSION: 'Microphone access is required for voice recording.',
  TRANSCRIPTION_FAILED: 'Failed to transcribe audio. Please try again.',
  FEEDBACK_GENERATION_FAILED: 'Failed to generate feedback. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SESSION_COMPLETED: 'Great job! Your session is complete.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
} as const;

// App Metadata
export const APP_INFO = {
  NAME: 'AI Conversation Coach',
  VERSION: '1.0.0',
  DESCRIPTION: 'Practice speaking with confidence and get instant feedback',
  SUPPORT_EMAIL: 'support@aiconversationcoach.com',
  GITHUB_URL: 'https://github.com/yourusername/ai-conversation-coach',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: '@user_preferences',
  ONBOARDING_COMPLETED: '@onboarding_completed',
  LAST_SESSION_ID: '@last_session_id',
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  MAX_DATA_POINTS: 10,
  DEFAULT_DECIMAL_PLACES: 1,
  DEFAULT_HEIGHT: 220,
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 5000,
  BACKOFF_MULTIPLIER: 2,
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,
  BIT_DEPTH: 16,
  CHANNELS: 1,
  FORMAT: 'wav',
} as const;

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/.+/,
} as const;
