import { Feather } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from '@firebase/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import {
  AuthCard,
  AuthHeading,
  AuthScaffold,
  BrandHeader,
  CopyrightNotice,
  FieldLabel,
  FooterPrompt,
  LegalCheckbox,
  PrimaryButton,
  ProfileSummaryCard,
  RoleBanner,
  SecondaryButton,
  StepProgress,
  TextField,
} from '@/components/auth/auth-ui';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { formatFirebaseError, getFirebaseAuth } from '@/services/firebase';

function readParam(value: string | string[] | undefined, fallback = '') {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default function SignUpSecurityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { configError, hasFirebaseConfig, initializing, user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const fullName = readParam(params.fullName);
  const email = readParam(params.email);
  const faculty = readParam(params.faculty);
  const displayName = fullName || 'Your profile';
  const displaySubtitle = [email, faculty].filter(Boolean).join(' - ') || 'Complete step 1 first';
  const initial = fullName.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/home');
    }
  }, [initializing, router, user]);

  async function handleCreateAccount() {
    if (!hasFirebaseConfig) {
      Alert.alert('Firebase config missing', configError ?? 'Firebase Auth is not configured yet.');
      return;
    }

    if (!fullName || !email) {
      Alert.alert('Missing details', 'Go back and complete step 1 before creating the account.');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Terms required', 'Please agree to the terms before creating the account.');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Weak password', 'Use a password with at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Enter the same password in both fields.');
      return;
    }

    try {
      setIsCreatingAccount(true);
      const result = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim().toLowerCase(),
        password
      );
      await updateProfile(result.user, { displayName: fullName.trim() });
      router.replace('/home');
    } catch (error) {
      Alert.alert('Account creation failed', formatFirebaseError(error));
    } finally {
      setIsCreatingAccount(false);
    }
  }

  return (
    <AuthScaffold>
      <BrandHeader />
      <RoleBanner />
      <StepProgress currentStep={2} />
      <AuthHeading
        title="Secure your account"
        subtitle="Step 2 of 2 - Set a strong password"
      />

      <AuthCard>
        <ProfileSummaryCard
          initial={initial}
          name={displayName}
          onEdit={() => router.back()}
          subtitle={displaySubtitle}
        />

        <View style={{ gap: 18, marginTop: 16 }}>
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
            <FieldLabel>PASSWORD *</FieldLabel>
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Feather name="lock" size={24} color={Palette.textSoft} />}
              onChangeText={setPassword}
              placeholder="Create a strong password"
              secureTextEntry={!showPassword}
              textContentType="newPassword"
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

          <View>
            <FieldLabel>CONFIRM PASSWORD *</FieldLabel>
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Feather name="lock" size={24} color={Palette.textSoft} />}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirmPassword}
              textContentType="newPassword"
              trailing={
                <Pressable onPress={() => setShowConfirmPassword((value) => !value)}>
                  <Feather
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={Palette.textSoft}
                  />
                </Pressable>
              }
              value={confirmPassword}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <LegalCheckbox
              checked={acceptedTerms}
              onPress={() => setAcceptedTerms((value) => !value)}
            />
            <Text
              style={{
                color: Palette.label,
                flex: 1,
                fontSize: 17,
                lineHeight: 24,
              }}>
              I agree to the{' '}
              <Text style={{ color: Palette.primary, fontWeight: '800' }}>Terms of Service</Text>{' '}
              and <Text style={{ color: Palette.primary, fontWeight: '800' }}>Privacy Policy</Text>
              . Patient data is handled in accordance with HIPAA guidelines.
            </Text>
          </View>

          <PrimaryButton
            disabled={isCreatingAccount}
            icon={<Feather name="user-plus" size={24} color={Palette.surface} />}
            label={isCreatingAccount ? 'Creating account...' : 'Create My Account'}
            onPress={handleCreateAccount}
            style={{ marginTop: 6 }}
          />

          <SecondaryButton
            icon={<Feather name="arrow-left" size={24} color={Palette.label} />}
            label="Back"
            onPress={() => router.back()}
          />
        </View>
      </AuthCard>

      <FooterPrompt
        actionLabel="Sign in instead"
        onPress={() => router.replace('/')}
        prompt="Already have an account?"
      />
      <CopyrightNotice />
    </AuthScaffold>
  );
}
