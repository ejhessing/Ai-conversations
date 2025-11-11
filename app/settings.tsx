import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, toast } from '@/components';
import { useAuth } from '@/hooks';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [practiceReminders, setPracticeReminders] = useState(true);

  const handleSaveSettings = () => {
    // TODO: Save settings to backend or local storage
    toast.success('Settings saved successfully');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all locally cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing
            toast.success('Cache cleared');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type DELETE to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: async () => {
                    // TODO: Implement account deletion
                    toast.error('Account deletion not yet implemented');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary-500 pt-16 pb-8 px-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-white text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">Settings</Text>
      </View>

      {/* Account Info */}
      <View className="px-4 -mt-6 mb-4">
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-sm text-gray-500 mb-1">Logged in as</Text>
          <Text className="text-lg font-semibold text-gray-900">{user?.email}</Text>
        </View>
      </View>

      {/* Notifications */}
      <View className="px-4 mb-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Notifications
          </Text>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-1 mr-3">
              <Text className="text-gray-900 font-medium">Push Notifications</Text>
              <Text className="text-sm text-gray-500">
                Receive updates and reminders
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>

          <View className="flex-row justify-between items-center py-3">
            <View className="flex-1 mr-3">
              <Text className="text-gray-900 font-medium">Practice Reminders</Text>
              <Text className="text-sm text-gray-500">
                Daily reminders to practice
              </Text>
            </View>
            <Switch
              value={practiceReminders}
              onValueChange={setPracticeReminders}
              disabled={!notificationsEnabled}
            />
          </View>
        </View>
      </View>

      {/* Audio Settings */}
      <View className="px-4 mb-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Audio
          </Text>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-1 mr-3">
              <Text className="text-gray-900 font-medium">Sound Effects</Text>
              <Text className="text-sm text-gray-500">
                Play sounds for interactions
              </Text>
            </View>
            <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
          </View>

          <View className="flex-row justify-between items-center py-3">
            <View className="flex-1 mr-3">
              <Text className="text-gray-900 font-medium">Auto-play AI Responses</Text>
              <Text className="text-sm text-gray-500">
                Automatically play AI voice responses
              </Text>
            </View>
            <Switch value={autoPlayAudio} onValueChange={setAutoPlayAudio} />
          </View>
        </View>
      </View>

      {/* Data & Privacy */}
      <View className="px-4 mb-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Data & Privacy
          </Text>

          <TouchableOpacity className="py-3 border-b border-gray-100">
            <Text className="text-gray-900 font-medium">Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity className="py-3 border-b border-gray-100">
            <Text className="text-gray-900 font-medium">Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 border-b border-gray-100"
            onPress={handleClearCache}
          >
            <Text className="text-gray-900 font-medium">Clear Cache</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Free up storage space
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="py-3" onPress={handleDeleteAccount}>
            <Text className="text-red-500 font-medium">Delete Account</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Permanently delete your account and data
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View className="px-4 mb-8">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            About
          </Text>

          <View className="py-3 border-b border-gray-100">
            <Text className="text-gray-900 font-medium">Version</Text>
            <Text className="text-sm text-gray-500 mt-1">1.0.0</Text>
          </View>

          <TouchableOpacity className="py-3 border-b border-gray-100">
            <Text className="text-gray-900 font-medium">Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity className="py-3">
            <Text className="text-gray-900 font-medium">Rate Us</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <View className="px-4 pb-8">
        <Button
          title="Save Settings"
          onPress={handleSaveSettings}
          size="large"
        />
      </View>
    </ScrollView>
  );
}
