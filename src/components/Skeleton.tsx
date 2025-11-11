import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
}

/**
 * Base skeleton loader component with pulse animation
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-gray-300 ${className}`}
      style={[
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton for scenario cards on home screen
 */
export function ScenarioCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
      <View className="flex-row items-center mb-4">
        <Skeleton width={48} height={48} borderRadius={24} className="mr-3" />
        <View className="flex-1">
          <Skeleton width="60%" height={20} className="mb-2" />
          <Skeleton width="40%" height={16} />
        </View>
      </View>

      <Skeleton width="100%" height={16} className="mb-2" />
      <Skeleton width="90%" height={16} className="mb-4" />

      <View className="flex-row gap-2 mb-4">
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={70} height={24} borderRadius={12} />
      </View>

      <Skeleton width="100%" height={44} borderRadius={22} />
    </View>
  );
}

/**
 * Skeleton for feedback card
 */
export function FeedbackCardSkeleton() {
  return (
    <View className="flex-1 p-4">
      {/* Scores Section */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <Skeleton width={120} height={24} className="mb-4" />

        <View className="flex-row justify-around mb-6">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="items-center">
              <Skeleton width={60} height={60} borderRadius={30} className="mb-2" />
              <Skeleton width={50} height={16} />
            </View>
          ))}
        </View>

        <Skeleton width="100%" height={20} className="mb-2" />
        <Skeleton width="100%" height={20} className="mb-2" />
        <Skeleton width="80%" height={20} />
      </View>

      {/* Metrics Section */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <Skeleton width={100} height={20} className="mb-4" />
        <Skeleton width="100%" height={16} className="mb-2" />
        <Skeleton width="90%" height={16} className="mb-2" />
        <Skeleton width="85%" height={16} />
      </View>

      {/* Strengths Section */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <Skeleton width={150} height={20} className="mb-4" />
        <Skeleton width="100%" height={16} className="mb-2" />
        <Skeleton width="95%" height={16} className="mb-2" />
        <Skeleton width="90%" height={16} />
      </View>

      {/* Improvements Section */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <Skeleton width={140} height={20} className="mb-4" />
        <Skeleton width="100%" height={16} className="mb-2" />
        <Skeleton width="93%" height={16} className="mb-2" />
        <Skeleton width="88%" height={16} />
      </View>
    </View>
  );
}

/**
 * Skeleton for progress chart
 */
export function ProgressChartSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      <Skeleton width={150} height={20} className="mb-3" />
      <Skeleton width="100%" height={220} borderRadius={16} />
    </View>
  );
}

/**
 * Skeleton for progress stats
 */
export function ProgressStatsSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
      <Skeleton width={120} height={24} className="mb-4" />

      {/* Streak and Sessions */}
      <View className="flex-row justify-around mb-6 pb-6 border-b border-gray-200">
        <View className="items-center">
          <Skeleton width={64} height={64} borderRadius={32} className="mb-2" />
          <Skeleton width={40} height={28} className="mb-1" />
          <Skeleton width={70} height={16} />
        </View>

        <View className="items-center">
          <Skeleton width={64} height={64} borderRadius={32} className="mb-2" />
          <Skeleton width={40} height={28} className="mb-1" />
          <Skeleton width={90} height={16} />
        </View>
      </View>

      {/* Average Scores */}
      <Skeleton width={130} height={20} className="mb-3" />
      <View className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <View key={i}>
            <View className="flex-row justify-between mb-1">
              <Skeleton width={80} height={16} />
              <Skeleton width={50} height={16} />
            </View>
            <Skeleton width="100%" height={8} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Skeleton for session history item
 */
export function SessionHistorySkeleton() {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <Skeleton width={150} height={18} />
        <Skeleton width={80} height={16} />
      </View>

      <View className="flex-row items-center mb-3">
        <Skeleton width={60} height={14} className="mr-4" />
        <Skeleton width={70} height={14} />
      </View>

      <View className="flex-row justify-between">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="items-center">
            <Skeleton width={40} height={12} className="mb-1" />
            <Skeleton width={50} height={16} />
          </View>
        ))}
      </View>
    </View>
  );
}
