import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChatBubble, AudioRecorder, Button } from '@/components';
import { useScenario, useConversation, useTranscription, useAuth } from '@/hooks';

export default function RoleplayScreen() {
  const router = useRouter();
  const { scenarioId } = useLocalSearchParams();
  const { user } = useAuth();
  const { data: scenario, isLoading: scenarioLoading } = useScenario(scenarioId as string);

  const {
    messages,
    sessionId,
    isActive,
    startConversation,
    sendMessage,
    endConversation,
    isLoading: conversationLoading,
  } = useConversation(scenario, user?.id);

  const {
    recordingState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    transcribe,
    transcribing,
  } = useTranscription();

  const [textInput, setTextInput] = useState('');
  const [useVoice, setUseVoice] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleStartSession = () => {
    startConversation();
  };

  const handleSendText = async () => {
    if (!textInput.trim()) return;

    await sendMessage(textInput);
    setTextInput('');
  };

  const handleStopRecording = async () => {
    try {
      const audioUri = await stopRecording();
      if (!audioUri) return;

      // Transcribe audio
      const transcription = await transcribe(audioUri, sessionId || undefined);

      // Send transcribed message
      if (transcription.transcript) {
        await sendMessage(transcription.transcript);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      Alert.alert('Error', 'Failed to process audio. Please try again.');
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you ready to end this practice session and get feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End & Get Feedback',
          onPress: () => {
            endConversation();
            router.push({
              pathname: '/feedback',
              params: { sessionId: sessionId! },
            });
          },
        },
      ]
    );
  };

  if (scenarioLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Loading scenario...</Text>
      </View>
    );
  }

  if (!scenario) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Scenario not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      {/* Header */}
      <View className="bg-primary-500 pt-12 pb-4 px-6">
        <Text className="text-white text-xl font-bold">{scenario.title}</Text>
        <Text className="text-white/80 text-sm">{scenario.persona}</Text>
      </View>

      {!isActive ? (
        /* Pre-Session Info */
        <View className="flex-1 p-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Scenario Goal
            </Text>
            <Text className="text-gray-700 leading-6">{scenario.goal}</Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Context
            </Text>
            <Text className="text-gray-700 leading-6">{scenario.context}</Text>
          </View>

          <View className="mt-auto">
            <Button
              title="Start Conversation"
              onPress={handleStartSession}
              loading={conversationLoading}
              size="large"
            />
          </View>
        </View>
      ) : (
        /* Active Conversation */
        <>
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4 py-4"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}

            {(conversationLoading || transcribing) && (
              <View className="items-center py-4">
                <Text className="text-gray-500">Thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View className="bg-white border-t border-gray-200 p-4">
            {/* Mode Toggle */}
            <View className="flex-row mb-3 bg-gray-100 rounded-xl p-1">
              <Button
                title="Text"
                onPress={() => setUseVoice(false)}
                variant={!useVoice ? 'primary' : 'outline'}
                size="small"
              />
              <View className="w-2" />
              <Button
                title="Voice"
                onPress={() => setUseVoice(true)}
                variant={useVoice ? 'primary' : 'outline'}
                size="small"
              />
            </View>

            {useVoice ? (
              /* Voice Input */
              <View>
                <AudioRecorder
                  recordingState={recordingState}
                  onStart={startRecording}
                  onStop={handleStopRecording}
                  onPause={pauseRecording}
                  onResume={resumeRecording}
                  isTranscribing={transcribing}
                />
              </View>
            ) : (
              /* Text Input */
              <View className="flex-row items-center">
                <TextInput
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder="Type your response..."
                  className="flex-1 bg-gray-100 rounded-xl px-4 py-3 mr-2"
                  multiline
                  maxLength={500}
                />
                <Button
                  title="Send"
                  onPress={handleSendText}
                  disabled={!textInput.trim() || conversationLoading}
                  size="small"
                />
              </View>
            )}

            {/* End Session Button */}
            <View className="mt-3">
              <Button
                title="End Session & Get Feedback"
                onPress={handleEndSession}
                variant="outline"
              />
            </View>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
