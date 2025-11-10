import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScenarioPicker, Button, ProgressStats } from '@/components';
import { useScenarios, useAuth, useUserProgress } from '@/hooks';
import type { Scenario } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: scenarios, isLoading: scenariosLoading } = useScenarios();
  const { data: progress, isLoading: progressLoading } = useUserProgress(user?.id);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | undefined>();

  const handleStartPractice = () => {
    if (!selectedScenario) return;
    router.push({
      pathname: '/roleplay',
      params: { scenarioId: selectedScenario.id },
    });
  };

  if (scenariosLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-gray-600">Loading scenarios...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-primary-500 pt-16 pb-8 px-6">
          <Text className="text-white text-3xl font-bold mb-2">
            AI Conversation Coach
          </Text>
          <Text className="text-white/90 text-base">
            Practice speaking with confidence
          </Text>
        </View>

        {/* Progress Stats */}
        {progress && !progressLoading && (
          <View className="px-4 -mt-6 mb-4">
            <ProgressStats
              currentStreak={progress.current_streak}
              totalSessions={progress.total_sessions}
              averageScores={progress.average_scores}
            />
          </View>
        )}

        {/* Scenario Picker */}
        <View className="mb-4">
          {scenarios && scenarios.length > 0 ? (
            <ScenarioPicker
              scenarios={scenarios}
              selectedScenario={selectedScenario}
              onSelect={setSelectedScenario}
            />
          ) : (
            <View className="p-6 items-center">
              <Text className="text-gray-500">No scenarios available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Start Button (Fixed at bottom) */}
      {selectedScenario && (
        <View className="p-4 bg-white border-t border-gray-200">
          <Button
            title="Start Practice Session"
            onPress={handleStartPractice}
            size="large"
          />
        </View>
      )}
    </View>
  );
}
