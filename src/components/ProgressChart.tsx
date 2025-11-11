import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ProgressChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }[];
  };
  title: string;
  yAxisSuffix?: string;
}

export function ProgressChart({ data, title, yAxisSuffix = '' }: ProgressChartProps) {
  const screenWidth = Dimensions.get('window').width - 32; // 32 for padding

  // Validate data before rendering chart
  const hasValidData = data.labels.length > 0 &&
    data.datasets.length > 0 &&
    data.datasets[0].data.length > 0;

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        {title}
      </Text>

      {hasValidData ? (
        <LineChart
          data={data}
          width={screenWidth - 32}
          height={220}
          yAxisSuffix={yAxisSuffix}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#6366f1',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      ) : (
        <View className="h-[220px] items-center justify-center">
          <Text className="text-gray-500">No data available yet</Text>
        </View>
      )}
    </View>
  );
}

interface ProgressStatsProps {
  currentStreak: number;
  totalSessions: number;
  averageScores: {
    clarity: number;
    confidence: number;
    empathy: number;
    pacing: number;
  };
}

export function ProgressStats({
  currentStreak,
  totalSessions,
  averageScores,
}: ProgressStatsProps) {
  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        Your Progress
      </Text>

      {/* Streak and Sessions */}
      <View className="flex-row justify-around mb-6 pb-6 border-b border-gray-200">
        <View className="items-center">
          <View className="bg-orange-100 w-16 h-16 rounded-full items-center justify-center mb-2">
            <Text className="text-3xl">🔥</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {currentStreak}
          </Text>
          <Text className="text-gray-500 text-sm">Day Streak</Text>
        </View>

        <View className="items-center">
          <View className="bg-primary-100 w-16 h-16 rounded-full items-center justify-center mb-2">
            <Text className="text-3xl">📊</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {totalSessions}
          </Text>
          <Text className="text-gray-500 text-sm">Total Sessions</Text>
        </View>
      </View>

      {/* Average Scores */}
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        Average Scores
      </Text>
      <View className="space-y-3">
        <ScoreBar label="Clarity" score={averageScores.clarity} />
        <ScoreBar label="Confidence" score={averageScores.confidence} />
        <ScoreBar label="Empathy" score={averageScores.empathy} />
        <ScoreBar label="Pacing" score={averageScores.pacing} />
      </View>
    </View>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
}

function ScoreBar({ label, score }: ScoreBarProps) {
  // Handle invalid scores
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const clampedScore = Math.max(0, Math.min(10, validScore)); // Clamp between 0-10

  const percentage = (clampedScore / 10) * 100;
  const barColor =
    clampedScore >= 8 ? 'bg-green-500' : clampedScore >= 6 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <View>
      <View className="flex-row justify-between mb-1">
        <Text className="text-gray-700 font-medium">{label}</Text>
        <Text className="text-gray-900 font-bold">{clampedScore.toFixed(1)}/10</Text>
      </View>
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <View
          className={`h-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
