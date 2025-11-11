import React, { useEffect } from 'react';
import { View, Text, Alert, Share, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FeedbackCard, Button, FeedbackCardSkeleton, toast } from '@/components';
import { useFeedback, useCheckBadges, useAuth } from '@/hooks';
import { fetchUserSessions } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { generateFeedbackSummary, generateMarkdownReport } from '@/utils';

export default function FeedbackScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  const { user } = useAuth();

  const { feedback, isLoading, error, generateFeedback } = useFeedback(sessionId as string);
  const checkBadgesMutation = useCheckBadges();

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

  // Check for newly earned badges after feedback is loaded
  useEffect(() => {
    const checkBadges = async () => {
      if (feedback && user?.id && !checkBadgesMutation.isPending) {
        try {
          const newBadges = await checkBadgesMutation.mutateAsync(user.id);
          if (newBadges && newBadges.length > 0) {
            // Show toast for each new badge
            newBadges.forEach((badge: any) => {
              toast.success(`🎉 Badge earned: ${badge.name}!`, 5000);
            });
          }
        } catch (err) {
          console.error('Error checking badges:', err);
        }
      }
    };

    checkBadges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, user?.id]); // checkBadgesMutation is stable

  const handleGoHome = () => {
    router.push('/');
  };

  const handlePracticeAgain = () => {
    router.push('/');
  };

  const handleShare = async () => {
    if (!feedback) return;

    try {
      const summary = generateFeedbackSummary(feedback, session);

      await Share.share({
        message: summary,
        title: 'My AI Conversation Coach Feedback',
      });
    } catch (error) {
      console.error('Error sharing feedback:', error);
      // Share was cancelled or failed, don't show error alert
    }
  };

  const handleExportDetailed = async () => {
    if (!feedback) return;

    try {
      const report = generateMarkdownReport(feedback, session);

      await Share.share({
        message: report,
        title: 'Detailed Feedback Report',
      });
    } catch (error) {
      console.error('Error exporting detailed report:', error);
    }
  };

  if (isLoading || !feedback) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-primary-500 pt-12 pb-6 px-6">
          <Text className="text-white text-2xl font-bold">Your Feedback</Text>
          <Text className="text-white/90 text-sm mt-1">
            Analyzing your performance...
          </Text>
        </View>

        {/* Skeleton */}
        <ScrollView>
          <FeedbackCardSkeleton />
        </ScrollView>
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
        <View className="flex-row gap-2 mb-2">
          <View className="flex-1">
            <Button
              title="Share Summary"
              onPress={handleShare}
              variant="outline"
              size="medium"
            />
          </View>
          <View className="flex-1">
            <Button
              title="Export Full Report"
              onPress={handleExportDetailed}
              variant="outline"
              size="medium"
            />
          </View>
        </View>
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
