import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  ProgressChart,
  ProgressChartSkeleton,
  ProgressStatsSkeleton,
  SessionHistorySkeleton,
  BadgeGrid,
} from '@/components';
import { useAuth, useUserProgress, useBadges, useUserBadges } from '@/hooks';
import { fetchUserMetrics } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: progress, isLoading: progressLoading } = useUserProgress(user?.id);
  const { data: badges } = useBadges();
  const { data: userBadges } = useUserBadges(user?.id);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics', user?.id],
    queryFn: () => fetchUserMetrics(user!.id),
    enabled: !!user?.id,
  });

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/auth');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  // Prepare chart data
  const weeklyData = metrics
    ? {
        labels: metrics.slice(0, 6).reverse().map((m) => {
          const date = new Date(m.week_start);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        datasets: [
          {
            data: metrics.slice(0, 6).reverse().map((m) => m.avg_clarity),
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      }
    : { labels: [], datasets: [{ data: [] }] };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary-500 pt-16 pb-8 px-6">
        <Text className="text-white text-3xl font-bold mb-2">Profile</Text>
        <Text className="text-white/90 text-base">{user?.email}</Text>
      </View>

      {/* Stats Overview */}
      <View className="px-4 -mt-6 mb-4">
        {progressLoading ? (
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="flex-row justify-around">
              {[1, 2, 3].map((i) => (
                <View key={i} className="items-center">
                  <View className="mb-1">
                    <View className="bg-gray-300 rounded h-9 w-12" />
                  </View>
                  <View className="bg-gray-300 rounded h-4 w-20 mt-1" />
                </View>
              ))}
            </View>
          </View>
        ) : progress ? (
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-3xl font-bold text-primary-500">
                  {progress.current_streak}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">Day Streak</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-primary-500">
                  {progress.total_sessions}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">Total Sessions</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-primary-500">
                  {progress.average_scores.clarity.toFixed(1)}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">Avg Clarity</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {/* Weekly Progress Chart */}
      <View className="px-4 mb-4">
        {metricsLoading ? (
          <ProgressChartSkeleton />
        ) : metrics && metrics.length > 0 ? (
          <ProgressChart
            data={weeklyData}
            title="Weekly Clarity Trend"
            yAxisSuffix=""
          />
        ) : null}
      </View>

      {/* Recent Sessions */}
      <View className="px-4 mb-4">
        {progressLoading ? (
          <View>
            <SessionHistorySkeleton />
            <SessionHistorySkeleton />
            <SessionHistorySkeleton />
          </View>
        ) : progress && progress.recent_sessions && progress.recent_sessions.length > 0 ? (
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Recent Sessions
            </Text>
            {progress.recent_sessions.slice(0, 5).map((session: any) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => router.push({
                  pathname: '/feedback',
                  params: { sessionId: session.id },
                })}
                className="py-3 border-b border-gray-100"
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Session: ${session.scenarios?.title || 'Practice Session'}`}
                accessibilityHint="Tap to view session details and feedback"
              >
                <Text className="text-gray-900 font-medium mb-1">
                  {session.scenarios?.title || 'Practice Session'}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {new Date(session.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      {/* Badges */}
      {badges && badges.length > 0 && (
        <View className="px-4 mb-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Achievements
              </Text>
              <Text className="text-sm text-gray-500">
                {userBadges?.length || 0}/{badges.length}
              </Text>
            </View>

            <BadgeGrid
              badges={badges}
              earnedBadgeIds={new Set(userBadges?.map(ub => ub.badge_id) || [])}
            />
          </View>
        </View>
      )}

      {/* Account Actions */}
      <View className="px-4 mb-8">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Account
          </Text>

          <TouchableOpacity
            className="py-3 border-b border-gray-100"
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            accessibilityHint="Tap to open app settings"
          >
            <Text className="text-gray-700">Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 border-b border-gray-100"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Privacy Policy"
            accessibilityHint="Tap to view privacy policy"
          >
            <Text className="text-gray-700">Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 border-b border-gray-100"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Terms of Service"
            accessibilityHint="Tap to view terms of service"
          >
            <Text className="text-gray-700">Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            className="py-3"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
            accessibilityHint="Tap to sign out of your account"
          >
            <Text className="text-red-500 font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
