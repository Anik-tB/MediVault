import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

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
  StepProgress,
  TextField,
} from '@/components/auth/auth-ui';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function SignUpInfoScreen() {
  const router = useRouter();
  const { initializing, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!initializing && user) {
      // @ts-ignore - Expo router types might not have updated yet
      router.replace('/dashboard');
    }
  }, [initializing, router, user]);

  function handleContinue() {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert(
        'Missing information',
        'Full name and email are required.'
      );
      return;
    }

    router.push({
      pathname: '/sign-up/security',
      params: {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        phone: phone.trim(),
      },
    });
  }

  return (
    <AuthScaffold>
      <BrandHeader />
      <RoleBanner />
      <StepProgress currentStep={1} />
      <AuthHeading
        title="Create your account"
        subtitle="Step 1 of 2 - Enter your personal details"
      />

      <AuthCard>
        <View style={{ gap: 18 }}>
          <View>
            <FieldLabel>FULL NAME *</FieldLabel>
            <TextField
              autoCapitalize="words"
              icon={<Feather name="user" size={24} color={Palette.textSoft} />}
              onChangeText={setFullName}
              placeholder="e.g. Anik"
              value={fullName}
            />
          </View>

          <View>
            <FieldLabel>EMAIL ADDRESS *</FieldLabel>
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Feather name="mail" size={24} color={Palette.textSoft} />}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@university.edu"
              value={email}
            />
          </View>

          <View>
            <FieldLabel>PHONE optional</FieldLabel>
            <TextField
              icon={<Feather name="phone" size={24} color={Palette.textSoft} />}
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder="+880 1..."
              value={phone}
            />
          </View>

          <PrimaryButton
            icon={<Feather name="arrow-right" size={24} color={Palette.surface} />}
            label="Continue to Security"
            onPress={handleContinue}
            style={{ marginTop: 12 }}
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
