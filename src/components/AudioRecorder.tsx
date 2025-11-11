import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/utils/constants';
import type { RecordingState } from '@/types';

interface AudioRecorderProps {
  recordingState: RecordingState;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  isTranscribing?: boolean;
}

export function AudioRecorder({
  recordingState,
  onStart,
  onStop,
  onPause,
  onResume,
  isTranscribing = false,
}: AudioRecorderProps) {
  const { isRecording, isPaused, duration } = recordingState;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isRecording) {
      onStart();
    } else if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  };

  const handleStopPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStop();
  };

  if (isTranscribing) {
    return (
      <View className="items-center justify-center p-6">
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
        <Text className="mt-4 text-gray-600">Transcribing your speech...</Text>
      </View>
    );
  }

  return (
    <View className="items-center p-6 bg-white rounded-2xl shadow-sm">
      {/* Duration Display */}
      {isRecording && (
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-900">
            {formatDuration(duration)}
          </Text>
        </View>
      )}

      {/* Recording Indicator */}
      {isRecording && !isPaused && (
        <View className="flex-row items-center mb-4">
          <View className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2" />
          <Text className="text-red-500 font-medium">Recording</Text>
        </View>
      )}

      {isPaused && (
        <View className="flex-row items-center mb-4">
          <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
          <Text className="text-yellow-600 font-medium">Paused</Text>
        </View>
      )}

      {/* Control Buttons */}
      <View className="flex-row items-center">
        {/* Record/Pause Button */}
        <TouchableOpacity
          onPress={handleRecordPress}
          className={`w-20 h-20 rounded-full items-center justify-center ${
            isRecording && !isPaused
              ? 'bg-yellow-500'
              : 'bg-primary-500'
          } ${isRecording ? 'mr-4' : ''}`}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            !isRecording
              ? 'Start recording'
              : isPaused
              ? 'Resume recording'
              : 'Pause recording'
          }
          accessibilityHint={
            !isRecording
              ? 'Tap to start recording your voice'
              : isPaused
              ? 'Tap to resume recording'
              : 'Tap to pause recording'
          }
        >
          {!isRecording ? (
            <View className="w-6 h-6 rounded-full bg-white" />
          ) : isPaused ? (
            <Text className="text-white text-2xl">▶</Text>
          ) : (
            <View className="flex-row">
              <View className="w-1.5 h-6 bg-white rounded mr-1" />
              <View className="w-1.5 h-6 bg-white rounded" />
            </View>
          )}
        </TouchableOpacity>

        {/* Stop Button (only show when recording) */}
        {isRecording && (
          <TouchableOpacity
            onPress={handleStopPress}
            className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
            accessibilityHint="Tap to finish and save your recording"
          >
            <View className="w-5 h-5 bg-white rounded-sm" />
          </TouchableOpacity>
        )}
      </View>

      {/* Instructions */}
      {!isRecording && (
        <Text className="mt-4 text-gray-500 text-center">
          Tap the button to start recording
        </Text>
      )}

      {isRecording && !isPaused && (
        <Text className="mt-4 text-gray-500 text-center">
          Tap to pause • Tap stop when done
        </Text>
      )}

      {isPaused && (
        <Text className="mt-4 text-gray-500 text-center">
          Tap to resume recording
        </Text>
      )}
    </View>
  );
}
