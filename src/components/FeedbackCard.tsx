import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/utils/constants';
import type { Feedback } from '@/types';

interface FeedbackCardProps {
  feedback: Feedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success-600';
    if (score >= 6) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-success-100';
    if (score >= 6) return 'bg-warning-100';
    return 'bg-danger-100';
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Summary Card */}
      <View className="m-4 p-6 bg-white rounded-2xl shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Session Feedback
        </Text>
        <Text className="text-gray-600 leading-6">{feedback.summary}</Text>
      </View>

      {/* Scores Grid */}
      <View className="mx-4 mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Your Scores
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <ScoreCard
            label="Clarity"
            score={feedback.clarity_score}
            color={getScoreColor(feedback.clarity_score)}
            bgColor={getScoreBg(feedback.clarity_score)}
          />
          <ScoreCard
            label="Confidence"
            score={feedback.confidence_score}
            color={getScoreColor(feedback.confidence_score)}
            bgColor={getScoreBg(feedback.confidence_score)}
          />
          <ScoreCard
            label="Empathy"
            score={feedback.empathy_score}
            color={getScoreColor(feedback.empathy_score)}
            bgColor={getScoreBg(feedback.empathy_score)}
          />
          <ScoreCard
            label="Pacing"
            score={feedback.pacing_score}
            color={getScoreColor(feedback.pacing_score)}
            bgColor={getScoreBg(feedback.pacing_score)}
          />
        </View>
      </View>

      {/* Metrics */}
      <View className="mx-4 mb-4 p-4 bg-white rounded-2xl shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Quick Stats
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary-500">
              {feedback.words_per_minute}
            </Text>
            <Text className="text-gray-500 text-sm">WPM</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary-500">
              {feedback.filler_count}
            </Text>
            <Text className="text-gray-500 text-sm">Filler Words</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary-500">
              {feedback.detailed_analysis?.question_ratio?.toFixed(1) || '0'}%
            </Text>
            <Text className="text-gray-500 text-sm">Questions</Text>
          </View>
        </View>
      </View>

      {/* Strengths */}
      <View className="mx-4 mb-4 p-4 bg-white rounded-2xl shadow-sm">
        <Text className="text-lg font-semibold text-success-700 mb-3">
          ✓ What You Did Well
        </Text>
        {feedback.strengths.map((strength, index) => (
          <View key={index} className="flex-row mb-2">
            <Text className="text-success-600 mr-2">•</Text>
            <Text className="flex-1 text-gray-700">{strength}</Text>
          </View>
        ))}
      </View>

      {/* Improvements */}
      <View className="mx-4 mb-4 p-4 bg-white rounded-2xl shadow-sm">
        <Text className="text-lg font-semibold text-bronze-700 mb-3">
          ⚡ Areas to Improve
        </Text>
        {feedback.improvements.map((improvement, index) => (
          <View key={index} className="flex-row mb-2">
            <Text className="text-bronze-600 mr-2">•</Text>
            <Text className="flex-1 text-gray-700">{improvement}</Text>
          </View>
        ))}
      </View>

      {/* Practice Drill */}
      <LinearGradient
        colors={[COLORS.primary[500], COLORS.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mx-4 mb-6 p-4 rounded-2xl shadow-sm"
      >
        <Text className="text-lg font-semibold text-white mb-2">
          🎯 Practice Drill
        </Text>
        <Text className="text-white opacity-90 leading-6">
          {feedback.practice_drill}
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}

interface ScoreCardProps {
  label: string;
  score: number;
  color: string;
  bgColor: string;
}

function ScoreCard({ label, score, color, bgColor }: ScoreCardProps) {
  return (
    <View className={`flex-1 min-w-[45%] p-4 ${bgColor} rounded-xl`}>
      <Text className="text-gray-600 text-sm mb-1">{label}</Text>
      <Text className={`text-3xl font-bold ${color}`}>
        {score.toFixed(1)}
      </Text>
      <Text className="text-gray-500 text-xs">out of 10</Text>
    </View>
  );
}
