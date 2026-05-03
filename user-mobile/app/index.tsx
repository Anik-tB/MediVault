import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { View, ActivityIndicator } from 'react-native';
import { Palette } from '@/constants/theme';

export default function RootIndex() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    if (user) {
      router.replace('/dashboard' as any);
    } else {
      router.replace('/login' as any);
    }
  }, [user, initializing]);

  // Show a loading spinner while auth state is being determined
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Palette.background }}>
      <ActivityIndicator size="large" color={Palette.primary} />
    </View>
  );
}
