import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '@firebase/auth';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';

import {
  AuthCard,
  AuthHeading,
  AuthScaffold,
  BrandHeader,
  CopyrightNotice,
  FieldLabel,
  FooterPrompt,
  PrimaryButton,
  RoleBanner,
  SecondaryButton,
  TextField,
  authStyles,
} from '@/components/auth/auth-ui';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import {
  formatFirebaseError,
  getFirebaseAuth,
  getMissingGoogleClientKeys,
  googleAuthConfig,
} from '@/services/firebase';
import { syncUserProfile } from '@/services/api';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const { configError, hasFirebaseConfig, initializing, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const appScheme = Constants.expoConfig?.scheme;
  const redirectScheme = Array.isArray(appScheme) ? appScheme[0] : appScheme || 'medivaultuser';
  const isExpoGo =
    Platform.OS !== 'web' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const missingGoogleClientKeys = getMissingGoogleClientKeys(Platform.OS);
  const hasGoogleConfig = missingGoogleClientKeys.length === 0;
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest(
    {
      androidClientId: googleAuthConfig.androidClientId || 'missing-android-client-id',
      iosClientId:
        googleAuthConfig.iosClientId ||
        googleAuthConfig.webClientId ||
        'missing-ios-client-id',
      selectAccount: true,
      webClientId: googleAuthConfig.webClientId || 'missing-web-client-id',
    },
    {
      path: 'oauthredirect',
      scheme: redirectScheme,
    }
  );

  useEffect(() => {
    if (!initializing && user) {
      // @ts-ignore - Expo router types might not have updated yet
      router.replace('/dashboard');
    }
  }, [initializing, router, user]);

  useEffect(() => {
    if (googleResponse?.type !== 'success') {
      if (googleResponse?.type === 'cancel' || googleResponse?.type === 'dismiss') {
        setIsGoogleSigningIn(false);
      }
      return;
    }

    const idToken = googleResponse.params.id_token || googleResponse.authentication?.idToken;

    if (!idToken) {
      Alert.alert('Google sign in failed', 'Google did not return an ID token for Firebase.');
      setIsGoogleSigningIn(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(getFirebaseAuth(), credential);
        // Sync the Google user's profile into PostgreSQL
        try {
          await syncUserProfile();
        } catch (syncError) {
          console.warn('Profile sync failed (Google native):', syncError);
        }
        if (active) {
          // @ts-ignore - Expo router types might not have updated yet
          router.replace('/dashboard');
        }
      } catch (error) {
        if (active) {
          Alert.alert('Google sign in failed', formatFirebaseError(error));
        }
      } finally {
        if (active) {
          setIsGoogleSigningIn(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [googleResponse, router]);

  async function handleSignIn() {
    if (!hasFirebaseConfig) {
      Alert.alert('Firebase config missing', configError ?? 'Firebase Auth is not configured yet.');
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert('Missing information', 'Enter both email and password to sign in.');
      return;
    }

    try {
      setIsSigningIn(true);
      await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim().toLowerCase(),
        password
      );
      try {
        await syncUserProfile();
      } catch (syncError) {
        console.warn('Profile sync failed:', syncError);
      }
      // @ts-ignore - Expo router types might not have updated yet
      router.replace('/dashboard');
    } catch (error) {
      Alert.alert('Sign in failed', formatFirebaseError(error));
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleForgotPassword() {
    if (!hasFirebaseConfig) {
      Alert.alert('Firebase config missing', configError ?? 'Firebase Auth is not configured yet.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Email required', 'Enter your email first, then tap Forgot password.');
      return;
    }

    try {
      setIsSendingReset(true);
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim().toLowerCase());
      Alert.alert('Reset email sent', 'Check your inbox for a password reset link.');
    } catch (error) {
      Alert.alert('Reset failed', formatFirebaseError(error));
    } finally {
      setIsSendingReset(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!hasFirebaseConfig) {
      Alert.alert('Firebase config missing', configError ?? 'Firebase Auth is not configured yet.');
      return;
    }

    if (Platform.OS === 'web') {
      try {
        setIsGoogleSigningIn(true);
        const provider = new GoogleAuthProvider();
        await signInWithPopup(getFirebaseAuth(), provider);
        try {
          await syncUserProfile();
        } catch (syncError) {
          console.warn('Profile sync failed:', syncError);
        }
        // @ts-ignore - Expo router types might not have updated yet
        router.replace('/dashboard');
      } catch (error) {
        Alert.alert('Google sign in failed', formatFirebaseError(error));
      } finally {
        setIsGoogleSigningIn(false);
      }
      return;
    }

    if (isExpoGo) {
      Alert.alert(
        'Development build required',
        'Google sign-in cannot be tested inside Expo Go. Use a development build or Android Studio build for this flow.'
      );
      return;
    }

    if (!hasGoogleConfig) {
      Alert.alert(
        'Google config missing',
        `Add ${missingGoogleClientKeys.join(', ')} to user-mobile/.env.local and restart Expo.`
      );
      return;
    }

    if (!googleRequest) {
      Alert.alert('Google sign in unavailable', 'The Google sign-in request is still loading.');
      return;
    }

    try {
      setIsGoogleSigningIn(true);
      const result = await promptGoogleAsync();
      if (result.type !== 'success') {
        setIsGoogleSigningIn(false);
      }
    } catch (error) {
      setIsGoogleSigningIn(false);
      Alert.alert('Google sign in failed', formatFirebaseError(error));
    }
  }

  return (
    <AuthScaffold>
      <BrandHeader />
      <RoleBanner />
      <AuthHeading
        title="Welcome back"
        subtitle="Sign in to manage your prescriptions and orders."
      />

      <AuthCard>
        <View style={{ gap: 18 }}>
          {!hasFirebaseConfig ? (
            <View
              style={{
                backgroundColor: '#FFF4E8',
                borderColor: '#FFD7A8',
                borderRadius: 20,
                borderWidth: 1,
                padding: 16,
              }}>
              <Text style={{ color: '#8A4C02', fontSize: 15, lineHeight: 22 }}>
                Firebase is not configured yet. Add your values to `user-mobile/.env` or
                `user-mobile/.env.local`, then restart Expo.
              </Text>
            </View>
          ) : null}

          <View>
            <FieldLabel>EMAIL ADDRESS</FieldLabel>
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Feather name="mail" size={24} color={Palette.textSoft} />}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="user@medivault.com"
              textContentType="emailAddress"
              value={email}
            />
          </View>

          <View>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
              <FieldLabel>PASSWORD</FieldLabel>
              <Pressable disabled={isSendingReset} onPress={handleForgotPassword}>
                <Text style={authStyles.inlineLink}>Forgot password?</Text>
              </Pressable>
            </View>
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Feather name="lock" size={24} color={Palette.textSoft} />}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              textContentType="password"
              trailing={
                <Pressable onPress={() => setShowPassword((value) => !value)}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={Palette.textSoft}
                  />
                </Pressable>
              }
              value={password}
            />
          </View>

          <PrimaryButton
            disabled={isSigningIn}
            icon={<Feather name="log-in" size={24} color={Palette.surface} />}
            label={isSigningIn ? 'Signing in...' : 'Sign in to MediVault'}
            onPress={handleSignIn}
            style={{ marginTop: 12 }}
          />

          <SecondaryButton
            disabled={isGoogleSigningIn || !googleRequest}
            icon={<MaterialCommunityIcons name="google" size={24} color={Palette.label} />}
            label={isGoogleSigningIn ? 'Opening Google...' : 'Continue with Google'}
            onPress={handleGoogleSignIn}
          />

          {isExpoGo ? (
            <Text
              style={{
                color: Palette.textMuted,
                fontSize: 14,
                lineHeight: 22,
                textAlign: 'center',
              }}>
              Google sign-in needs a development build on Android. Expo Go can still be used for
              email/password auth.
            </Text>
          ) : null}

          {!hasGoogleConfig ? (
            <Text
              style={{
                color: Palette.textMuted,
                fontSize: 14,
                lineHeight: 22,
                textAlign: 'center',
              }}>
              Add {missingGoogleClientKeys.join(', ')} to your local env file to enable Google
              login on this platform.
            </Text>
          ) : null}
        </View>
      </AuthCard>

      <FooterPrompt
        actionLabel="Create account"
        onPress={() => router.push('/sign-up')}
        prompt="Don't have an account?"
      />
      <CopyrightNotice />
    </AuthScaffold>
  );
}
