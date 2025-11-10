import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { simulateReply, createSession, updateSession } from '@/services/api';
import type { ConversationMessage, Scenario } from '@/types';

export function useConversation(scenario: Scenario | undefined, userId: string | undefined) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: () => {
      if (!scenario?.id || !userId) throw new Error('Missing scenario or user');
      return createSession(scenario.id, userId);
    },
    onSuccess: (session) => {
      setSessionId(session.id);
      // Add initial AI message from scenario
      if (scenario?.script_seed) {
        const initialMessage: ConversationMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: scenario.script_seed,
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
      }
      setIsActive(true);
    },
  });

  // Simulate AI reply mutation
  const simulateReplyMutation = useMutation({
    mutationFn: (userMessage: string) => {
      if (!scenario?.id) throw new Error('Missing scenario');
      return simulateReply({
        scenario_id: scenario.id,
        conversation_history: messages,
        user_message: userMessage,
      });
    },
    onSuccess: (response) => {
      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: response.ai_message,
        timestamp: new Date(),
        audio_url: response.audio_url,
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
  });

  const startConversation = () => {
    if (!scenario || !userId) return;
    createSessionMutation.mutate();
  };

  const sendMessage = async (content: string) => {
    if (!isActive || !content.trim()) return;

    // Add user message
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Get AI response
    await simulateReplyMutation.mutateAsync(content);

    // Update session with new transcript
    if (sessionId) {
      const userTranscript = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n') + '\n' + content;

      const aiTranscript = messages
        .filter(m => m.role === 'ai')
        .map(m => m.content)
        .join('\n');

      await updateSession(sessionId, {
        transcript: userTranscript,
        ai_transcript: aiTranscript,
      });
    }
  };

  const endConversation = () => {
    setIsActive(false);
  };

  const resetConversation = () => {
    setMessages([]);
    setSessionId(null);
    setIsActive(false);
  };

  return {
    messages,
    sessionId,
    isActive,
    startConversation,
    sendMessage,
    endConversation,
    resetConversation,
    isLoading: createSessionMutation.isPending || simulateReplyMutation.isPending,
    error: createSessionMutation.error || simulateReplyMutation.error,
  };
}
