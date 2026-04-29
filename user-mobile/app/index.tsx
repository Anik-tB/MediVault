import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  PrimaryButton,
  RoleBanner,
  TextField,
  authStyles,
} from '@/components/auth/auth-ui';
import { Palette } from '@/constants/theme';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
              <Pressable onPress={() => Alert.alert('Prototype', 'Forgot password flow can be added next.')}>
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
            icon={<Feather name="log-in" size={24} color={Palette.surface} />}
            label="Sign in to MediVault"
            onPress={() => Alert.alert('Prototype', 'Sign-in UI is ready. Backend login can be connected next.')}
            style={{ marginTop: 12 }}
          />
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
