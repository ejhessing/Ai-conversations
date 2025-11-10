import '../global.css';
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/react-query';
import { useAuth } from '@/hooks';
import { View, ActivityIndicator } from 'react-native';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to auth if not authenticated
      router.replace('/auth');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/');
    }
    // router is stable from expo-router useRouter hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </QueryClientProvider>
  );
}
