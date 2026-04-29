import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
  SelectField,
  StepProgress,
  TextField,
} from '@/components/auth/auth-ui';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

const departments = ['Psychology', 'Computer Science', 'Biology', 'Business Administration'];

export default function SignUpInfoScreen() {
  const router = useRouter();
  const { initializing, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentIndex, setDepartmentIndex] = useState<number | null>(null);

  const department = departmentIndex === null ? '' : departments[departmentIndex];

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/home');
    }
  }, [initializing, router, user]);

  function handleContinue() {
    if (!fullName.trim() || !email.trim() || !studentId.trim() || !department) {
      Alert.alert(
        'Missing information',
        'Full name, email, student ID, and department are required.'
      );
      return;
    }

    router.push({
      pathname: '/sign-up/security',
      params: {
        email: email.trim().toLowerCase(),
        faculty: department,
        fullName: fullName.trim(),
        phone: phone.trim(),
        studentId: studentId.trim().toUpperCase(),
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

          <View style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel>STUDENT ID *</FieldLabel>
              <TextField
                autoCapitalize="characters"
                icon={
                  <MaterialCommunityIcons
                    name="card-account-details-outline"
                    size={24}
                    color={Palette.textSoft}
                  />
                }
                onChangeText={setStudentId}
                placeholder="STU-0001"
                value={studentId}
              />
            </View>

            <View style={{ flex: 1 }}>
              <FieldLabel>PHONE optional</FieldLabel>
              <TextField
                icon={<Feather name="phone" size={24} color={Palette.textSoft} />}
                keyboardType="phone-pad"
                onChangeText={setPhone}
                placeholder="+1 555 0100"
                value={phone}
              />
            </View>
          </View>

          <View>
            <FieldLabel>FACULTY / DEPARTMENT *</FieldLabel>
            <SelectField
              icon={<Feather name="briefcase" size={24} color={Palette.textSoft} />}
              onPress={() =>
                setDepartmentIndex((current) =>
                  current === null || current === departments.length - 1 ? 0 : current + 1
                )
              }
              placeholder="Choose your department"
              value={department}
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
