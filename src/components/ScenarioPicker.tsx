import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { Scenario } from '@/types';

interface ScenarioPickerProps {
  scenarios: Scenario[];
  selectedScenario?: Scenario;
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioPicker({
  scenarios,
  selectedScenario,
  onSelect,
}: ScenarioPickerProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'intermediate':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'advanced':
        return { bg: 'bg-red-100', text: 'text-red-700' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Scenario
        </Text>
        <Text className="text-gray-600 mb-6">
          Select a conversation scenario to practice
        </Text>

        <View className="space-y-3">
          {scenarios.map((scenario) => {
            const isSelected = selectedScenario?.id === scenario.id;
            const difficultyStyle = getDifficultyColor(scenario.difficulty);

            return (
              <TouchableOpacity
                key={scenario.id}
                onPress={() => onSelect(scenario)}
                className={`p-4 rounded-2xl border-2 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white'
                }`}
                activeOpacity={0.7}
              >
                {/* Header */}
                <View className="flex-row justify-between items-start mb-2">
                  <Text
                    className={`flex-1 text-lg font-semibold ${
                      isSelected ? 'text-primary-700' : 'text-gray-900'
                    }`}
                  >
                    {scenario.title}
                  </Text>
                  <View className={`px-3 py-1 rounded-full ${difficultyStyle.bg}`}>
                    <Text className={`text-xs font-medium ${difficultyStyle.text}`}>
                      {getDifficultyLabel(scenario.difficulty)}
                    </Text>
                  </View>
                </View>

                {/* Persona */}
                <View className="flex-row items-center mb-2">
                  <Text className="text-gray-500 text-sm mr-2">Role:</Text>
                  <Text className="text-gray-700 font-medium text-sm">
                    {scenario.persona}
                  </Text>
                </View>

                {/* Context */}
                <Text className="text-gray-600 text-sm mb-2 leading-5">
                  {scenario.context}
                </Text>

                {/* Goal */}
                <View className="flex-row items-start mt-2">
                  <Text className="text-primary-600 text-sm mr-1">🎯</Text>
                  <Text className="flex-1 text-gray-700 text-sm">
                    Goal: {scenario.goal}
                  </Text>
                </View>

                {isSelected && (
                  <View className="mt-3 pt-3 border-t border-primary-200">
                    <Text className="text-primary-600 font-medium text-sm">
                      ✓ Selected
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
