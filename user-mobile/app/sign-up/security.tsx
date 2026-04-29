import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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

function readParam(value: string | string[] | undefined, fallback = '') {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default function SignUpSecurityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const fullName = readParam(params.fullName, 'Sayem');
  const email = readParam(params.email, 'gahhy@gmail.com');
  const faculty = readParam(params.faculty, 'Psychology');
  const initial = fullName.charAt(0).toUpperCase() || 'S';

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
          name={fullName}
          onEdit={() => router.back()}
          subtitle={`${email} - ${faculty}`}
        />

        <View style={{ gap: 18, marginTop: 16 }}>
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
            icon={<Feather name="user-plus" size={24} color={Palette.surface} />}
            label="Create My Account"
            onPress={() => {
              if (!acceptedTerms) {
                Alert.alert(
                  'Terms required',
                  'Please agree to the terms before creating the account.'
                );
                return;
              }

              if (password !== confirmPassword) {
                Alert.alert(
                  'Passwords do not match',
                  'Enter the same password in both fields.'
                );
                return;
              }

              Alert.alert(
                'Prototype ready',
                'Frontend account flow is complete. Backend signup can be connected next.'
              );
            }}
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
