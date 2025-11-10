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

  const isUser = message.role === 'user';

  const playAudio = async () => {
    if (!message.audio_url) return;

    try {
      if (sound) {
        await sound.unloadAsync();
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
    }
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
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
          >
            <View className={`w-6 h-6 rounded-full ${isUser ? 'bg-white/20' : 'bg-gray-300'} items-center justify-center`}>
              <Text className={isUser ? 'text-white' : 'text-gray-700'}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
            </View>
            <Text className={`ml-2 text-sm ${isUser ? 'text-white/80' : 'text-gray-600'}`}>
              {isPlaying ? 'Playing...' : 'Play audio'}
            </Text>
          </TouchableOpacity>
        )}

        <Text
          className={`text-xs mt-1 ${
            isUser ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}
