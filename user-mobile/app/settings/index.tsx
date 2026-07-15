import { Feather } from '@expo/vector-icons';
import { updateProfile as updateFirebaseProfile } from '@firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchUserProfile, updateUserProfile, UserProfile } from '@/services/profile';

function applyProfileToForm(nextProfile: UserProfile, setForm: {
  setProfile: (value: UserProfile) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  setDepartment: (value: string) => void;
  setBloodGroup: (value: string) => void;
  setAllergies: (value: string) => void;
}) {
  setForm.setProfile(nextProfile);
  setForm.setFirstName(nextProfile.firstName);
  setForm.setLastName(nextProfile.lastName);
  setForm.setEmail(nextProfile.email);
  setForm.setPhone(nextProfile.phone);
  setForm.setDepartment(nextProfile.department);
  setForm.setBloodGroup(nextProfile.bloodGroup);
  setForm.setAllergies(nextProfile.allergies);
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        setIsLoading(true);
        const nextProfile = await fetchUserProfile();

        if (!isActive) {
          return;
        }

        applyProfileToForm(nextProfile, {
          setProfile,
          setFirstName,
          setLastName,
          setEmail,
          setPhone,
          setDepartment,
          setBloodGroup,
          setAllergies,
        });
        setLoadError('');
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Failed to load profile settings.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

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

  async function handleSave() {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const fullName = [trimmedFirstName, trimmedLastName].filter(Boolean).join(' ').trim();

    if (!fullName) {
      Alert.alert('Missing name', 'Please enter at least a first name before saving.');
      return;
    }

    try {
      setIsSaving(true);

      if (user && fullName !== (user.displayName || '').trim()) {
        await updateFirebaseProfile(user, { displayName: fullName });
      }

      const updatedProfile = await updateUserProfile({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        phone,
        department,
        bloodGroup,
        allergies,
      });

      applyProfileToForm(updatedProfile, {
        setProfile,
        setFirstName,
        setLastName,
        setEmail,
        setPhone,
        setDepartment,
        setBloodGroup,
        setAllergies,
      });

      Alert.alert('Settings saved', 'Your profile information has been updated.');
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  const displayName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ').trim() || 'User';
  const initial = displayName.charAt(0).toUpperCase() || 'U';
  const roleLabel = profile?.role === 'admin' ? 'Administrator' : 'Member Account';

  return (
    <View style={styles.container}>
      <DashboardHeader title="Settings" onOpenSidebar={toggleSidebar} />

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>Manage your account and system preferences</Text>
        </View>

        <View style={styles.navCard}>
          <View style={[styles.navItem, styles.navItemActive]}>
            <View style={[styles.navIconBox, styles.navIconBoxActive]}>
              <Feather name="user" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.navTextContainer}>
              <Text style={[styles.navTitle, styles.navTitleActive]}>Profile</Text>
              <Text style={[styles.navSubtitle, styles.navSubtitleActive]}>
                Personal information
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#FFFFFF" />
          </View>

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

          <Pressable style={styles.navItem} onPress={() => router.push('/settings/security' as any)}>
            <View style={styles.navIconBox}>
              <Feather name="lock" size={20} color="#64748B" />
            </View>
            <View style={styles.navTextContainer}>
              <Text style={styles.navTitle}>Security</Text>
              <Text style={styles.navSubtitle}>Password & access</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>

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

        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Feather name="user" size={18} color="#0D9488" />
            </View>
            <View>
              <Text style={styles.cardHeaderTitle}>Profile Settings</Text>
              <Text style={styles.cardHeaderSubtitle}>Personal information</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {loadError ? (
            <View style={styles.noticeBox}>
              <Feather name="alert-circle" size={16} color="#B45309" />
              <Text style={styles.noticeText}>{loadError}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D9488" />
              <Text style={styles.loadingText}>Loading profile settings...</Text>
            </View>
          ) : (
            <>
              <View style={styles.userInfoSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.cameraBadge}>
                    <Feather name="camera" size={12} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{displayName}</Text>
                  <Text style={styles.userRole}>{roleLabel}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Synced</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FIRST NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>LAST NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={email}
                    editable={false}
                    selectTextOnFocus={false}
                    placeholder="Email Address"
                  />
                  <Text style={styles.helperText}>Email is managed by your sign-in provider.</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Phone Number"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DEPARTMENT</Text>
                  <TextInput
                    style={styles.input}
                    value={department}
                    onChangeText={setDepartment}
                    placeholder="Department"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BLOOD GROUP</Text>
                  <TextInput
                    style={styles.input}
                    value={bloodGroup}
                    onChangeText={setBloodGroup}
                    placeholder="e.g. O+"
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ALLERGIES</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    value={allergies}
                    onChangeText={setAllergies}
                    placeholder="List any known allergies"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.saveBtnContainer}>
                <Pressable
                  style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                  disabled={isSaving}
                  onPress={handleSave}>
                  <Feather name="save" size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
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
    backgroundColor: '#0D9488',
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
    backgroundColor: '#14B8A6',
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
    color: '#CCFBF1',
  },
  profileCard: {
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
    backgroundColor: '#F0FDFA',
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
  noticeBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  noticeText: {
    flex: 1,
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#06B6D4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#0D9488',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Palette.textSoft,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
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
    minHeight: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Palette.text,
  },
  inputDisabled: {
    color: '#94A3B8',
  },
  inputMultiline: {
    minHeight: 108,
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  saveBtnContainer: {
    padding: 24,
    paddingTop: 0,
    alignItems: 'flex-end',
  },
  saveBtn: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
