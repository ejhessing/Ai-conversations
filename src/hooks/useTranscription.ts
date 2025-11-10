import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useMutation } from '@tanstack/react-query';
import { transcribeAudio } from '@/services/api';
import type { RecordingState } from '@/types';

export function useTranscription() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Transcription mutation
  const transcribeMutation = useMutation({
    mutationFn: async ({ audioUri, sessionId }: { audioUri: string; sessionId?: string }) => {
      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return transcribeAudio({
        audio_base64: audioBase64,
        session_id: sessionId || '',
      });
    },
  });

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Microphone permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
      });

      // Start duration counter
      const startTime = Date.now();
      durationInterval.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingState(prev => ({ ...prev, duration: elapsed }));
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return null;

      // Stop duration counter
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      recordingRef.current = null;
      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioUri: uri || undefined,
      });

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  };

  const pauseRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.pauseAsync();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      setRecordingState(prev => ({ ...prev, isPaused: true }));
    } catch (error) {
      console.error('Failed to pause recording:', error);
      throw error;
    }
  };

  const resumeRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.startAsync();

      const currentDuration = recordingState.duration;
      const resumeTime = Date.now() - (currentDuration * 1000);

      durationInterval.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - resumeTime) / 1000);
        setRecordingState(prev => ({ ...prev, duration: elapsed }));
      }, 1000);

      setRecordingState(prev => ({ ...prev, isPaused: false }));
    } catch (error) {
      console.error('Failed to resume recording:', error);
      throw error;
    }
  };

  const transcribe = async (audioUri: string, sessionId?: string) => {
    return transcribeMutation.mutateAsync({ audioUri, sessionId });
  };

  return {
    recordingState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    transcribe,
    transcribing: transcribeMutation.isPending,
    transcriptionError: transcribeMutation.error,
  };
}
