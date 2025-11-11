# Contributing to AI Conversation Coach

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Submitting Changes](#submitting-changes)
7. [Bug Reports](#bug-reports)
8. [Feature Requests](#feature-requests)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other unethical or unprofessional conduct

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Development Environment:**
   - Node.js 18+
   - npm or yarn
   - Git
   - Expo CLI
   - Supabase CLI (for backend changes)

2. **Accounts:**
   - GitHub account
   - Supabase account (for testing)
   - OpenAI API access (for AI features)

3. **Knowledge:**
   - React Native fundamentals
   - TypeScript basics
   - Git workflow
   - Understanding of the project architecture (see DEVELOPMENT.md)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-conversation-coach.git
   cd ai-conversation-coach
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ai-conversation-coach.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

### Set Up Development Environment

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Configure your `.env` file with your Supabase credentials

3. Run the development server:
   ```bash
   npm start
   ```

## Development Process

### Workflow

1. **Create an Issue First**
   - For bugs: Describe the issue, steps to reproduce, expected vs actual behavior
   - For features: Explain the use case, proposed solution, and alternatives considered

2. **Get Assignment**
   - Wait for maintainer approval before starting work
   - Comment on the issue to get assigned

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes**
   - Write code following our standards
   - Add tests for new functionality
   - Update documentation as needed

5. **Commit Often**
   - Make atomic commits with clear messages
   - Follow commit message conventions

6. **Stay Synced**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

7. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or updates

**Examples:**
```
feature/add-voice-recording
bugfix/fix-authentication-redirect
refactor/extract-api-layer
docs/update-setup-guide
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependency updates

**Examples:**
```
feat(conversation): Add audio recording support

Implemented audio recording using expo-av with proper
cleanup and error handling. Includes recording duration
display and pause/resume functionality.

Closes #123

---

fix(auth): Resolve stale state in useConversation hook

Fixed bug where session transcripts were reading stale
message state. Now tracks updated messages in local
variable during state updates.

Fixes #456

---

docs(setup): Update Supabase configuration steps

Added detailed steps for Edge Function deployment and
environment variable configuration.
```

## Coding Standards

### TypeScript

**Type Safety:**
```typescript
// ✅ Good - explicit types
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function updateProfile(user: UserProfile): Promise<void> {
  // ...
}

// ❌ Bad - implicit any
function updateProfile(user) {
  // ...
}
```

**Null Checks:**
```typescript
// ✅ Good - proper null checking
if (!user) {
  throw new Error('User not found');
}
const userName = user.name;

// ❌ Bad - non-null assertion
const userName = user!.name;
```

### React/React Native

**Components:**
```typescript
// ✅ Good - functional component with types
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
}

export function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

// ❌ Bad - default export, no types
export default ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{title}</Text>
  </TouchableOpacity>
);
```

**Hooks:**
```typescript
// ✅ Good - proper dependency array
useEffect(() => {
  fetchData(userId);
}, [userId]); // Include all dependencies

// ❌ Bad - missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency
```

**Error Handling:**
```typescript
// ✅ Good - comprehensive error handling
const handleSubmit = async () => {
  try {
    await submitForm(data);
  } catch (error) {
    console.error('Form submission failed:', error);
    Alert.alert('Error', 'Failed to submit form. Please try again.');
  }
};

// ❌ Bad - no error handling
const handleSubmit = async () => {
  await submitForm(data);
};
```

### File Organization

**Component Files:**
```typescript
// ComponentName.tsx

import React from 'react';
import { View, Text } from 'react-native';

// Types at the top
interface ComponentNameProps {
  // ...
}

// Helper functions (can be extracted to utils if reused)
function helperFunction() {
  // ...
}

// Main component
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Hooks
  const [state, setState] = useState();

  // Event handlers
  const handleEvent = () => {
    // ...
  };

  // Render
  return (
    <View>
      <Text>Content</Text>
    </View>
  );
}
```

**Import Order:**
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text, TouchableOpacity } from 'react-native';

// 3. Third-party imports
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

// 4. Local imports (absolute paths)
import { Button, ChatBubble } from '@/components';
import { useAuth } from '@/hooks';
import type { User } from '@/types';

// 5. Relative imports
import { helperFunction } from './utils';
```

### Styling

**NativeWind/Tailwind:**
```typescript
// ✅ Good - semantic class names
<View className="flex-1 bg-gray-50 p-4">
  <Text className="text-xl font-bold text-gray-900 mb-2">
    Title
  </Text>
</View>

// ❌ Bad - inline styles when Tailwind classes exist
<View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 16 }}>
  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
    Title
  </Text>
</View>
```

**Conditional Styling:**
```typescript
// ✅ Good - template literals for dynamic classes
<View className={`p-4 rounded-lg ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}>

// ❌ Bad - complex conditional logic in className
<View className={isActive && isSelected ? 'bg-blue-500' : isActive ? 'bg-blue-300' : 'bg-gray-200'}>
```

## Testing Requirements

### Unit Tests

All new features must include unit tests.

**Test File Location:**
```
src/
├── utils/
│   ├── format.ts
│   └── __tests__/
│       └── format.test.ts
```

**Test Coverage:**
- Aim for >80% code coverage
- Test edge cases and error scenarios
- Mock external dependencies

**Example:**
```typescript
import { formatDuration } from '../format';

describe('formatDuration', () => {
  it('handles zero seconds', () => {
    expect(formatDuration(0)).toBe('0s');
  });

  it('handles negative values', () => {
    expect(formatDuration(-10)).toBe('0s');
  });

  it('formats complex durations', () => {
    expect(formatDuration(3665)).toBe('1h 1m 5s');
  });
});
```

### Integration Tests

For significant features, add integration tests:

```typescript
describe('Authentication Flow', () => {
  it('signs up and signs in user successfully', async () => {
    // Test full authentication flow
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Submitting Changes

### Pull Request Process

1. **Ensure Quality:**
   - [ ] All tests pass: `npm test`
   - [ ] No TypeScript errors: `npx tsc --noEmit`
   - [ ] Code is formatted: `npm run format`
   - [ ] Linter passes: `npm run lint`

2. **Update Documentation:**
   - [ ] Update README if needed
   - [ ] Add/update JSDoc comments
   - [ ] Update CHANGELOG.md

3. **Create Pull Request:**
   - Use a clear, descriptive title
   - Reference related issues
   - Provide detailed description
   - Add screenshots/videos for UI changes

4. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Related Issue
   Closes #123

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Manually tested on iOS
   - [ ] Manually tested on Android

   ## Screenshots
   (if applicable)

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed code
   - [ ] Commented complex code
   - [ ] Updated documentation
   - [ ] No new warnings
   - [ ] Added tests
   - [ ] All tests pass
   ```

### Code Review Process

1. **Maintainer Review:**
   - Code quality and standards
   - Test coverage
   - Documentation
   - Performance implications

2. **Address Feedback:**
   - Respond to review comments
   - Make requested changes
   - Push updates to same branch

3. **Approval and Merge:**
   - Requires 1-2 approvals
   - CI checks must pass
   - Conflicts must be resolved

## Bug Reports

### Before Reporting

1. Check existing issues
2. Verify it's not a known issue
3. Reproduce consistently
4. Test on latest version

### Bug Report Template

```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Tap on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
If applicable

**Environment:**
- Device: [iPhone 14 / Pixel 6]
- OS: [iOS 16.5 / Android 13]
- App Version: [1.2.3]

**Additional Context:**
Any other relevant information
```

## Feature Requests

### Proposal Template

```markdown
**Feature Description:**
Clear description of the feature

**Problem Statement:**
What problem does this solve?

**Proposed Solution:**
How should it work?

**Alternatives Considered:**
Other approaches you've thought about

**Additional Context:**
Mockups, examples, references

**Implementation Plan:**
If you have ideas on how to implement
```

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to AI Conversation Coach! 🎉

## Questions?

- Open a discussion on GitHub
- Contact maintainers
- Check the DEVELOPMENT.md guide

---

Happy coding!
