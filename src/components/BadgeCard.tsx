import React from 'react';
import { View, Text } from 'react-native';
import type { Badge } from '@/types';

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: string;
  compact?: boolean;
}

/**
 * Badge Card Component
 * Displays a single badge with its details
 */
export function BadgeCard({ badge, earned = false, earnedAt, compact = false }: BadgeCardProps) {
  const getBadgeIcon = () => {
    switch (badge.type) {
      case 'session_count':
        return '🎯';
      case 'streak':
        return '🔥';
      case 'score':
        return '⭐';
      default:
        return '🏆';
    }
  };

  const getBadgeColor = () => {
    if (!earned) return 'bg-gray-200';

    switch (badge.tier) {
      case 'bronze':
        return 'bg-orange-400';
      case 'silver':
        return 'bg-gray-400';
      case 'gold':
        return 'bg-yellow-400';
      case 'platinum':
        return 'bg-purple-400';
      default:
        return 'bg-blue-400';
    }
  };

  if (compact) {
    return (
      <View className={`items-center ${!earned && 'opacity-40'}`}>
        <View
          className={`w-16 h-16 rounded-full ${getBadgeColor()} items-center justify-center shadow-md`}
        >
          <Text className="text-3xl">{getBadgeIcon()}</Text>
        </View>
        <Text className="text-xs font-medium text-gray-700 mt-1 text-center" numberOfLines={2}>
          {badge.name}
        </Text>
      </View>
    );
  }

  return (
    <View className={`bg-white rounded-xl p-4 shadow-sm ${!earned && 'opacity-60'}`}>
      <View className="flex-row items-center mb-3">
        <View
          className={`w-16 h-16 rounded-full ${getBadgeColor()} items-center justify-center shadow-md mr-4`}
        >
          <Text className="text-4xl">{getBadgeIcon()}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{badge.name}</Text>
          <Text className="text-sm text-gray-600">{badge.description}</Text>
        </View>
      </View>

      {/* Requirements */}
      <View className="bg-gray-50 rounded-lg p-3 mb-2">
        <Text className="text-xs font-semibold text-gray-500 mb-1">REQUIREMENT</Text>
        {badge.type === 'session_count' && (
          <Text className="text-sm text-gray-700">
            Complete {badge.required_sessions} practice sessions
          </Text>
        )}
        {badge.type === 'streak' && (
          <Text className="text-sm text-gray-700">
            Maintain a {badge.required_streak}-day practice streak
          </Text>
        )}
        {badge.type === 'score' && (
          <Text className="text-sm text-gray-700">
            Achieve an average score of {badge.required_score}/10
          </Text>
        )}
      </View>

      {/* Earned Status */}
      {earned && earnedAt && (
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-green-600">✓ EARNED</Text>
          <Text className="text-xs text-gray-500">
            {new Date(earnedAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      {!earned && (
        <Text className="text-xs text-gray-400 text-center">Not yet earned</Text>
      )}
    </View>
  );
}

/**
 * Badge Grid Component
 * Displays badges in a grid layout
 */
export function BadgeGrid({
  badges,
  earnedBadgeIds = new Set(),
}: {
  badges: Badge[];
  earnedBadgeIds?: Set<string>;
}) {
  return (
    <View className="flex-row flex-wrap gap-4">
      {badges.map((badge) => (
        <View key={badge.id} className="w-[30%]">
          <BadgeCard badge={badge} earned={earnedBadgeIds.has(badge.id)} compact />
        </View>
      ))}
    </View>
  );
}

/**
 * Badge List Component
 * Displays badges in a list layout with full details
 */
export function BadgeList({
  badges,
  userBadges = [],
}: {
  badges: Badge[];
  userBadges?: Array<{ badge_id: string; earned_at: string }>;
}) {
  const earnedBadgeMap = new Map(userBadges.map((ub) => [ub.badge_id, ub.earned_at]));

  return (
    <View className="space-y-3">
      {badges.map((badge) => {
        const earnedAt = earnedBadgeMap.get(badge.id);
        return (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={!!earnedAt}
            earnedAt={earnedAt}
          />
        );
      })}
    </View>
  );
}

/**
 * Badge Notification Component
 * Shows when a new badge is earned
 */
export function BadgeNotification({ badge }: { badge: Badge }) {
  return (
    <View className="bg-white rounded-2xl p-6 shadow-xl items-center">
      <Text className="text-2xl font-bold text-gray-900 mb-2">🎉 Badge Earned!</Text>

      <View className="w-24 h-24 rounded-full bg-yellow-400 items-center justify-center shadow-lg mb-3">
        <Text className="text-6xl">
          {badge.type === 'session_count' ? '🎯' : badge.type === 'streak' ? '🔥' : '⭐'}
        </Text>
      </View>

      <Text className="text-xl font-bold text-gray-900 mb-1">{badge.name}</Text>
      <Text className="text-sm text-gray-600 text-center">{badge.description}</Text>
    </View>
  );
}
