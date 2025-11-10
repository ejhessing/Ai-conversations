import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FeedbackCard, Button } from '@/components';
import { useFeedback } from '@/hooks';
import { fetchUserSessions } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export default function FeedbackScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();

  const { feedback, isLoading, error, generateFeedback } = useFeedback(sessionId as string);

  // Fetch session details
  const { data: sessions } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return fetchUserSessions(user.id);
    },
    enabled: !!sessionId,
  });

  const session = sessions?.find(s => s.id === sessionId);

  // Generate feedback if not exists
  useEffect(() => {
    const generateIfNeeded = async () => {
      if (!feedback && session && !isLoading) {
        try {
          await generateFeedback({
            session_id: session.id,
            user_transcript: session.transcript,
            ai_transcript: session.ai_transcript,
            duration_seconds: session.duration_seconds || 0,
          });
        } catch (err) {
          console.error('Error generating feedback:', err);
          Alert.alert('Error', 'Failed to generate feedback. Please try again.');
        }
      }
    };

    generateIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, feedback, isLoading]); // generateFeedback is stable from mutation

  const handleGoHome = () => {
    router.push('/');
  };

  const handlePracticeAgain = () => {
    router.push('/');
  };

  if (isLoading || !feedback) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-gray-600">Analyzing your performance...</Text>
        <Text className="mt-2 text-gray-500 text-sm px-8 text-center">
          Our AI is reviewing your conversation to provide personalized feedback
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Error Loading Feedback
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          {error.message || 'Something went wrong. Please try again.'}
        </Text>
        <Button title="Go Home" onPress={handleGoHome} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary-500 pt-12 pb-6 px-6">
        <Text className="text-white text-2xl font-bold">Your Feedback</Text>
        <Text className="text-white/90 text-sm mt-1">
          Review your performance and keep improving
        </Text>
      </View>

      {/* Feedback Content */}
      <FeedbackCard feedback={feedback} />

      {/* Action Buttons */}
      <View className="p-4 bg-white border-t border-gray-200 space-y-2">
        <Button
          title="Practice Another Scenario"
          onPress={handlePracticeAgain}
          size="large"
        />
        <Button
          title="Back to Home"
          onPress={handleGoHome}
          variant="outline"
        />
      </View>
    </View>
  );
}
