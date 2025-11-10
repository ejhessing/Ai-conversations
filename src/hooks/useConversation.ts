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

    // Track updated messages to avoid stale state
    let updatedMessages: ConversationMessage[] = [];
    setMessages((prev) => {
      updatedMessages = [...prev, userMessage];
      return updatedMessages;
    });

    try {
      // Get AI response
      const response = await simulateReplyMutation.mutateAsync(content);

      // Update local messages with AI response (mutation already does this, but we track it)
      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: response.ai_message,
        timestamp: new Date(),
        audio_url: response.audio_url,
      };
      updatedMessages = [...updatedMessages, aiMessage];

      // Update session with complete transcript including new messages
      if (sessionId) {
        const userTranscript = updatedMessages
          .filter(m => m.role === 'user')
          .map(m => m.content)
          .join('\n');

        const aiTranscript = updatedMessages
          .filter(m => m.role === 'ai')
          .map(m => m.content)
          .join('\n');

        try {
          await updateSession(sessionId, {
            transcript: userTranscript,
            ai_transcript: aiTranscript,
          });
        } catch (updateError) {
          console.error('Failed to update session transcript:', updateError);
          // Don't throw - this is not critical to user experience
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error; // Re-throw so caller can handle
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
