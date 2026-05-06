import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from '@firebase/auth';
import { useRouter } from 'expo-router';

import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

function validatePassword(password: string) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? 0 : 1;
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }

    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    });
  };

  async function handleUpdatePassword() {
    if (!user || !user.email) {
      Alert.alert('Unavailable', 'You need to be signed in with an email account to update a password.');
      return;
    }

    const usesPasswordSignIn = user.providerData.some(
      (provider) => provider.providerId === 'password'
    );

    if (!usesPasswordSignIn) {
      Alert.alert(
        'Unavailable',
        'Password changes are currently supported only for email/password accounts.'
      );
      return;
    }

    if (!currentPassword) {
      Alert.alert('Missing password', 'Enter your current password first.');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Weak password',
        'Use at least 8 characters with uppercase, lowercase, a number, and a special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Enter the same new password in both fields.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Password updated', 'Your password has been changed successfully.');
    } catch (error) {
      Alert.alert(
        'Update failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return (
    <View style={styles.container}>
      <DashboardHeader title="Settings" onOpenSidebar={toggleSidebar} />

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>
            Manage your account and system preferences
          </Text>
        </View>

        <View style={styles.navCard}>
          <Pressable style={styles.navItem} onPress={() => router.push('/settings' as any)}>
            <View style={styles.navIconBox}>
              <Feather name="user" size={20} color="#64748B" />
            </View>
            <View style={styles.navTextContainer}>
              <Text style={styles.navTitle}>Profile</Text>
              <Text style={styles.navSubtitle}>Personal information</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push('/settings/notifications' as any)}>
            <View style={styles.navIconBox}>
              <Feather name="bell" size={20} color="#64748B" />
            </View>
            <View style={styles.navTextContainer}>
              <Text style={styles.navTitle}>Notifications</Text>
              <Text style={styles.navSubtitle}>Alert preferences</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>

          <View style={[styles.navItem, styles.navItemActive]}>
            <View style={[styles.navIconBox, styles.navIconBoxActive]}>
              <Feather name="lock" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.navTextContainer}>
              <Text style={[styles.navTitle, styles.navTitleActive]}>Security</Text>
              <Text style={[styles.navSubtitle, styles.navSubtitleActive]}>
                Password & access
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#FFFFFF" />
          </View>

          <Pressable style={styles.navItem} onPress={() => router.push('/settings/appearance' as any)}>
            <View style={styles.navIconBox}>
              <Feather name="image" size={20} color="#64748B" />
            </View>
            <View style={styles.navTextContainer}>
              <Text style={styles.navTitle}>Appearance</Text>
              <Text style={styles.navSubtitle}>UI preferences</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
        </View>

        <View style={styles.securityCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Feather name="lock" size={18} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.cardHeaderTitle}>Security Settings</Text>
              <Text style={styles.cardHeaderSubtitle}>Password & access</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardContent}>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputWithIcon}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    secureTextEntry={!showCurrent}
                  />
                  <Pressable onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
                    <Feather name={showCurrent ? 'eye-off' : 'eye'} size={18} color="#94A3B8" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NEW PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputWithIcon}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password (min. 8 chars)"
                    secureTextEntry={!showNew}
                  />
                  <Pressable onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                    <Feather name={showNew ? 'eye-off' : 'eye'} size={18} color="#94A3B8" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>PASSWORD REQUIREMENTS</Text>

              <View style={styles.requirementItem}>
                <Feather name="check" size={16} color="#10B981" />
                <Text style={styles.requirementText}>At least 8 characters long</Text>
              </View>

              <View style={styles.requirementItem}>
                <Feather name="check" size={16} color="#10B981" />
                <Text style={styles.requirementText}>
                  Contains uppercase & lowercase letters
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Feather name="check" size={16} color="#10B981" />
                <Text style={styles.requirementText}>Contains at least one number</Text>
              </View>

              <View style={styles.requirementItem}>
                <Feather name="check" size={16} color="#10B981" />
                <Text style={styles.requirementText}>
                  Contains at least one special character
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.saveBtnContainer}>
            <Pressable
              style={[styles.saveBtn, isUpdatingPassword && styles.saveBtnDisabled]}
              disabled={isUpdatingPassword}
              onPress={handleUpdatePassword}>
              <Feather name="lock" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {isSidebarOpen ? (
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} slideAnim={slideAnim} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: Palette.textSoft,
    lineHeight: 22,
  },
  navCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#2563EB',
  },
  navIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  navIconBoxActive: {
    backgroundColor: '#3B82F6',
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  navTitleActive: {
    color: '#FFFFFF',
  },
  navSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  navSubtitleActive: {
    color: '#BFDBFE',
  },
  securityCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  cardHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 4,
  },
  cardHeaderSubtitle: {
    fontSize: 14,
    color: Palette.textSoft,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  cardContent: {
    padding: 24,
    paddingBottom: 16,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Palette.text,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWithIcon: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 48,
    fontSize: 15,
    color: Palette.text,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  requirementsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  saveBtnContainer: {
    padding: 24,
    paddingTop: 0,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
