import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components';
import { useAuth } from '@/hooks';

export default function AuthScreen() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
        Alert.alert(
          'Success',
          'Account created! Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => setIsSignUp(false) }]
        );
      } else {
        await signInWithEmail(email, password);
        router.replace('/');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Header */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl">🎙️</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            AI Conversation Coach
          </Text>
          <Text className="text-gray-600 text-center">
            Practice speaking with confidence and get instant feedback
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>

          {isSignUp && (
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                className="bg-gray-100 rounded-xl px-4 py-3"
                autoCapitalize="words"
              />
            </View>
          )}

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              className="bg-gray-100 rounded-xl px-4 py-3"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              className="bg-gray-100 rounded-xl px-4 py-3"
              secureTextEntry
            />
          </View>

          <Button
            title={isSignUp ? 'Sign Up' : 'Sign In'}
            onPress={handleAuth}
            loading={loading}
            size="large"
          />

          {/* Toggle Sign In/Sign Up */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <Text
              onPress={() => setIsSignUp(!isSignUp)}
              className="text-primary-500 font-semibold"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </View>
        </View>

        {/* Features List */}
        <View className="mt-8">
          <FeatureItem
            icon="🎯"
            text="Practice real-world conversation scenarios"
          />
          <FeatureItem
            icon="📊"
            text="Get detailed feedback on your performance"
          />
          <FeatureItem
            icon="🚀"
            text="Track your progress and improvement over time"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center mb-3">
      <Text className="text-2xl mr-3">{icon}</Text>
      <Text className="text-gray-600">{text}</Text>
    </View>
  );
}
