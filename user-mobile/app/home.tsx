import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import {
  AuthCard,
  AuthHeading,
  AuthScaffold,
  BrandHeader,
  PrimaryButton,
  RoleBanner,
  SecondaryButton,
} from '@/components/auth/auth-ui';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { formatFirebaseError } from '@/services/firebase';

export default function HomeScreen() {
  const router = useRouter();
  const { initializing, signOutUser, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!initializing && !user) {
      router.replace('/');
    }
  }, [initializing, router, user]);

  if (initializing || !user) {
    return (
      <AuthScaffold>
        <BrandHeader />
        <RoleBanner />
        <AuthHeading
          title="Loading your account"
          subtitle="Checking your MediVault session."
        />
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold>
      <BrandHeader />
      <RoleBanner />
      <AuthHeading
        title={`Welcome, ${user.displayName || 'Student'}`}
        subtitle="Firebase authentication is now connected for the mobile app."
      />

      <AuthCard>
        <View style={{ gap: 18 }}>
          <View
            style={{
              backgroundColor: Palette.surfaceMuted,
              borderColor: Palette.borderSoft,
              borderRadius: 24,
              borderWidth: 1,
              gap: 12,
              padding: 20,
            }}>
            <Text
              style={{
                color: Palette.label,
                fontSize: 15,
                fontWeight: '800',
                letterSpacing: 1,
              }}>
              SIGNED IN EMAIL
            </Text>
            <Text style={{ color: Palette.text, fontSize: 18, fontWeight: '700' }}>
              {user.email}
            </Text>
            <Text style={{ color: Palette.textMuted, fontSize: 16, lineHeight: 24 }}>
              Next step is connecting this authenticated user to your backend and PostgreSQL
              profile data.
            </Text>
          </View>

          <PrimaryButton
            icon={<Feather name="activity" size={24} color={Palette.surface} />}
            label="Auth Connected"
            onPress={() =>
              Alert.alert(
                'Firebase Auth Ready',
                'User login is working. Backend profile sync comes next.'
              )
            }
          />

          <SecondaryButton
            disabled={isSigningOut}
            icon={<Feather name="log-out" size={24} color={Palette.label} />}
            label={isSigningOut ? 'Signing out...' : 'Sign out'}
            onPress={async () => {
              try {
                setIsSigningOut(true);
                await signOutUser();
                router.replace('/');
              } catch (error) {
                Alert.alert('Sign out failed', formatFirebaseError(error));
              } finally {
                setIsSigningOut(false);
              }
            }}
          />
        </View>
      </AuthCard>
    </AuthScaffold>
  );
}
