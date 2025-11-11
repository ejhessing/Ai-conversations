import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import type { ConversationMessage } from '@/types';

interface ChatBubbleProps {
  message: ConversationMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioError, setAudioError] = React.useState(false);

  const isUser = message.role === 'user';

  const playAudio = async () => {
    if (!message.audio_url) return;

    try {
      setAudioError(false);

      if (sound) {
        await sound.unloadAsync().catch(() => {});
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: message.audio_url },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError(true);
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync().catch((error) => {
            console.error('Error unloading audio:', error);
          });
        }
      : undefined;
  }, [sound]);

  return (
    <View
      className={`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary-500 rounded-br-sm'
            : 'bg-gray-200 rounded-bl-sm'
        }`}
      >
        <Text
          className={`text-base ${
            isUser ? 'text-white' : 'text-gray-900'
          }`}
        >
          {message.content}
        </Text>

        {message.audio_url && (
          <TouchableOpacity
            onPress={playAudio}
            className="mt-2 flex-row items-center"
            disabled={audioError}
          >
            <View className={`w-6 h-6 rounded-full ${isUser ? 'bg-white/20' : 'bg-gray-300'} items-center justify-center`}>
              <Text className={isUser ? 'text-white' : 'text-gray-700'}>
                {isPlaying ? '⏸' : audioError ? '✕' : '▶'}
              </Text>
            </View>
            <Text className={`ml-2 text-sm ${isUser ? 'text-white/80' : 'text-gray-600'}`}>
              {isPlaying ? 'Playing...' : audioError ? 'Audio unavailable' : 'Play audio'}
            </Text>
          </TouchableOpacity>
        )}

        <Text
          className={`text-xs mt-1 ${
            isUser ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          {(() => {
            try {
              // Validate timestamp is a valid Date
              const timestamp = message.timestamp instanceof Date
                ? message.timestamp
                : new Date(message.timestamp);

              if (isNaN(timestamp.getTime())) {
                return 'Just now';
              }

              return timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
            } catch {
              return 'Just now';
            }
          })()}
        </Text>
      </View>
    </View>
  );
}
