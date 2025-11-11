# Development Guide

This guide provides detailed technical information for developers working on the AI Conversation Coach app.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Architecture Overview](#architecture-overview)
3. [Code Organization](#code-organization)
4. [State Management](#state-management)
5. [Error Handling](#error-handling)
6. [Testing Strategy](#testing-strategy)
7. [Performance Optimization](#performance-optimization)
8. [Common Issues & Solutions](#common-issues--solutions)
9. [Best Practices](#best-practices)

## Development Environment Setup

### Required Tools

```bash
# Node.js (v18 or higher)
node --version

# Install global dependencies
npm install -g expo-cli supabase

# Install project dependencies
npm install

# Verify TypeScript setup
npx tsc --noEmit
```

### IDE Setup (VS Code Recommended)

**Recommended Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Expo Tools
- Tailwind CSS IntelliSense

**Workspace Settings (`.vscode/settings.json`):**
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*['\"`]([^'\"`]*)['\"`]", "([^'\"`]*)"]
  ]
}
```

### Environment Variables

**Development (`.env`):**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
```

**Production (`.env.production`):**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
```

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              React Native App                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Screens │  │Components│  │  Hooks   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │              │            │
│  ┌────┴─────────────┴──────────────┴─────┐     │
│  │        React Query + API Layer        │     │
│  └────────────────┬──────────────────────┘     │
└───────────────────┼────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│              Supabase Backend                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Auth   │  │PostgreSQL│  │  Storage │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────────────────────────────────┐     │
│  │       Edge Functions (Deno)          │     │
│  │  ┌────────┐ ┌────────┐ ┌────────┐  │     │
│  │  │Whisper │ │Simulate│ │Feedback│  │     │
│  │  │  API   │ │  Reply │ │  Gen   │  │     │
│  │  └────────┘ └────────┘ └────────┘  │     │
│  └──────────────────────────────────────┘     │
└───────────────────┼────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│              OpenAI APIs                         │
│     GPT-4  •  Whisper  •  TTS (optional)       │
└─────────────────────────────────────────────────┘
```

### Data Flow

**Recording & Transcription:**
1. User starts recording → `useTranscription` hook
2. Audio saved as base64 → `AudioRecorder` component
3. Sent to `transcribe-audio` Edge Function
4. Whisper API processes → returns transcript
5. Session updated in database → React Query cache invalidated

**Conversation Simulation:**
1. User sends message → `useConversation` hook
2. Request to `simulate-reply` Edge Function
3. GPT-4 generates AI response in persona
4. Optional TTS generates audio
5. Response added to conversation → UI updates

**Feedback Generation:**
1. User ends session → session marked complete
2. Request to `generate-feedback` Edge Function
3. GPT-4 analyzes full conversation
4. Feedback saved to database
5. User navigates to feedback screen → shows results

## Code Organization

### Component Structure

**Base Components (`src/components/`):**
- **Presentational**: Pure UI components (Button, ChatBubble, Skeleton)
- **Container**: Components with logic (AudioRecorder, FeedbackCard, ScenarioPicker)
- **Composite**: Combine multiple components (ProgressChart, ProgressStats)

**Component Naming Convention:**
```typescript
// ✅ Good
export function ChatBubble({ message }: ChatBubbleProps) { }
export function AudioRecorder({ onStart, onStop }: AudioRecorderProps) { }

// ❌ Bad
export default ({ message }) => { } // No default exports
export const chatBubble = () => { } // Use PascalCase
```

### Hook Patterns

**Custom Hooks (`src/hooks/`):**

All hooks follow the pattern:
1. Accept parameters
2. Use React Query for server state
3. Return data, loading, error, and actions
4. Include TypeScript types

**Example:**
```typescript
export function useScenarios() {
  const query = useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

### Service Layer

**API Service (`src/services/api.ts`):**

All Supabase and Edge Function calls are centralized here:

```typescript
// Pattern for database queries
export async function fetchUserSessions(userId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, scenarios(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Pattern for Edge Function calls
async function callEdgeFunction<T>(
  functionName: string,
  body: any
): Promise<T> {
  // Get auth token
  // Make authenticated request
  // Handle errors
  // Return typed response
}
```

## State Management

### React Query Configuration

**Cache Strategy:**
```typescript
// src/config/react-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Query Keys Convention:**
```typescript
['scenarios'] // List of all scenarios
['scenario', id] // Single scenario
['sessions', userId] // User's sessions
['feedback', sessionId] // Session feedback
['progress', userId] // User progress data
['metrics', userId] // User metrics
```

### Local State

**Component State:**
- Use `useState` for UI-only state
- Use `useRef` for mutable values that don't trigger re-renders
- Use `useMemo` for expensive computations
- Use `useCallback` for function memoization

**Example - Avoiding Stale State:**
```typescript
// ❌ Bad - reads stale state
const handleSubmit = async () => {
  setMessages(prev => [...prev, newMessage]);
  await api.update(messages); // Stale!
};

// ✅ Good - track updated state
const handleSubmit = async () => {
  let updatedMessages: Message[] = [];
  setMessages(prev => {
    updatedMessages = [...prev, newMessage];
    return updatedMessages;
  });
  await api.update(updatedMessages); // Fresh!
};
```

## Error Handling

### Error Handling Strategy

**Levels of Error Handling:**

1. **Component Level**: Catch and show user-friendly errors
2. **Hook Level**: Return error state via React Query
3. **Service Level**: Throw errors with context
4. **Global Level**: Error boundary for crashes

**Component Example:**
```typescript
const handleStartRecording = async () => {
  try {
    await startRecording();
  } catch (error) {
    console.error('Failed to start recording:', error);
    Alert.alert(
      'Microphone Error',
      'Unable to access microphone. Please check app permissions.',
      [{ text: 'OK' }]
    );
  }
};
```

**Service Example:**
```typescript
export async function transcribeAudio(params: TranscribeParams) {
  try {
    const response = await callEdgeFunction<TranscribeResponse>(
      'transcribe-audio',
      params
    );
    return response;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw new Error('Failed to transcribe audio. Please try again.');
  }
}
```

### Common Error Scenarios

**Network Errors:**
```typescript
if (error.message.includes('Failed to fetch')) {
  return ERROR_MESSAGES.NETWORK_ERROR;
}
```

**Auth Errors:**
```typescript
if (error.status === 401) {
  await signOut();
  router.replace('/auth');
  return ERROR_MESSAGES.AUTH_ERROR;
}
```

**Validation Errors:**
```typescript
const validation = validatePassword(password);
if (!validation.isValid) {
  setError(validation.error);
  return;
}
```

## Testing Strategy

### Unit Testing

**Test Files Structure:**
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
└── utils/
    ├── format.ts
    └── __tests__/
        └── format.test.ts
```

**Example Utility Test:**
```typescript
import { formatDuration } from '../format';

describe('formatDuration', () => {
  it('formats seconds correctly', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2m 5s');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatDuration(3665)).toBe('1h 1m 5s');
  });

  it('handles negative values', () => {
    expect(formatDuration(-10)).toBe('0s');
  });
});
```

**Example Hook Test:**
```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('returns null user when not authenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('signs in user successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });
  });
});
```

### Integration Testing

Test user flows end-to-end:

```typescript
describe('Conversation Flow', () => {
  it('completes full conversation session', async () => {
    // 1. User selects scenario
    // 2. Session starts
    // 3. User sends messages
    // 4. AI responds
    // 5. Session ends
    // 6. Feedback generated
    // 7. User views feedback
  });
});
```

### Manual Testing Checklist

**Before Each Release:**
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Select scenario and start session
- [ ] Record audio response
- [ ] Type text response
- [ ] End session and view feedback
- [ ] Share feedback summary
- [ ] View progress charts
- [ ] Check session history
- [ ] Sign out

## Performance Optimization

### React Query Optimizations

**Prefetching:**
```typescript
// Prefetch scenarios on app load
useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
  });
}, []);
```

**Optimistic Updates:**
```typescript
const mutation = useMutation({
  mutationFn: updateSession,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['session', sessionId]);

    // Snapshot previous value
    const previous = queryClient.getQueryData(['session', sessionId]);

    // Optimistically update cache
    queryClient.setQueryData(['session', sessionId], newData);

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['session', sessionId], context?.previous);
  },
});
```

### Component Optimizations

**Memoization:**
```typescript
// Memoize expensive calculations
const chartData = useMemo(() => {
  if (!metrics) return { labels: [], datasets: [] };

  return {
    labels: metrics.map(m => formatDate(m.week_start)),
    datasets: [{
      data: metrics.map(m => m.avg_clarity),
    }],
  };
}, [metrics]);

// Memoize callbacks
const handlePress = useCallback(() => {
  router.push('/roleplay');
}, [router]);
```

**Lazy Loading:**
```typescript
// Lazy load heavy components
const FeedbackCard = lazy(() => import('@/components/FeedbackCard'));

// Use Suspense
<Suspense fallback={<FeedbackCardSkeleton />}>
  <FeedbackCard feedback={feedback} />
</Suspense>
```

### Memory Leak Prevention

**Cleanup in useEffect:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);

  return () => {
    clearInterval(interval);
  };
}, []);
```

**Cleanup Audio Resources:**
```typescript
useEffect(() => {
  return () => {
    if (sound) {
      sound.unloadAsync().catch(console.error);
    }
  };
}, [sound]);
```

## Common Issues & Solutions

### Issue: Stale State in Async Functions

**Problem:**
```typescript
const [messages, setMessages] = useState([]);

const handleSend = async () => {
  setMessages(prev => [...prev, newMessage]);
  await updateSession(messages); // ❌ Stale!
};
```

**Solution:**
```typescript
const handleSend = async () => {
  let updated: Message[] = [];
  setMessages(prev => {
    updated = [...prev, newMessage];
    return updated;
  });
  await updateSession(updated); // ✅ Fresh!
};
```

### Issue: Memory Leaks with Intervals

**Problem:**
```typescript
useEffect(() => {
  setInterval(() => {
    setDuration(prev => prev + 1);
  }, 1000);
  // ❌ No cleanup!
}, []);
```

**Solution:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setDuration(prev => prev + 1);
  }, 1000);

  return () => clearInterval(interval); // ✅ Cleanup
}, []);
```

### Issue: React Query Not Refetching

**Problem:**
```typescript
const { data } = useQuery({
  queryKey: ['sessions'],
  queryFn: fetchSessions,
  // Missing enabled flag when dependency not ready
});
```

**Solution:**
```typescript
const { data } = useQuery({
  queryKey: ['sessions', userId],
  queryFn: () => fetchSessions(userId!),
  enabled: !!userId, // ✅ Wait for userId
});
```

### Issue: Audio Not Playing on iOS

**Problem:** Missing audio session configuration

**Solution:**
```typescript
import { Audio } from 'expo-av';

await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
});
```

## Best Practices

### TypeScript

1. **Always use explicit types for function parameters**
   ```typescript
   // ✅ Good
   function handleSubmit(data: FormData): Promise<void> { }

   // ❌ Bad
   function handleSubmit(data) { }
   ```

2. **Use type guards for runtime checks**
   ```typescript
   function isValidScore(value: unknown): value is number {
     return typeof value === 'number' && !isNaN(value);
   }
   ```

3. **Prefer interfaces for objects, types for unions**
   ```typescript
   interface User {
     id: string;
     name: string;
   }

   type Status = 'idle' | 'loading' | 'success' | 'error';
   ```

### React Patterns

1. **Extract complex JSX into components**
2. **Use early returns for loading/error states**
3. **Keep components focused on single responsibility**
4. **Avoid prop drilling - use context or lift state up**

### Security

1. **Never expose API keys in frontend code**
2. **Always use RLS policies in Supabase**
3. **Validate user input before API calls**
4. **Sanitize data before display**

### Accessibility

1. **Add accessibility labels to interactive elements**
   ```typescript
   <TouchableOpacity
     accessibilityLabel="Start practice session"
     accessibilityRole="button"
   >
   ```

2. **Use semantic HTML-like components**
3. **Ensure sufficient color contrast**
4. **Support screen readers**

## Git Workflow

### Branch Naming

```
feature/add-export-functionality
bugfix/fix-stale-state-issue
hotfix/critical-auth-bug
refactor/reorganize-components
```

### Commit Messages

```
feat: Add feedback export to markdown
fix: Resolve stale state in conversation hook
refactor: Extract utility functions
docs: Update setup instructions
test: Add tests for format utilities
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with atomic commits
3. Run tests: `npm test`
4. Check types: `npx tsc --noEmit`
5. Format code: `npm run format`
6. Push and create PR
7. Wait for review and CI checks
8. Merge after approval

## Debugging Tips

### React Query Devtools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to root layout
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Supabase Debugging

```typescript
// Enable query logging
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('user_id', userId);

console.log('Query:', { data, error });
```

### Network Debugging

**Expo Debugging:**
```bash
# Enable network inspector
npx expo start --devClient

# View logs
npx expo logs
```

**Flipper Integration:**
- Network inspector
- React DevTools
- Database browser

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Questions or Issues?**

Open an issue on GitHub or contact the development team.
