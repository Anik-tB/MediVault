import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchUserProfile, UserProfile } from '@/services/profile';

function capitalizeRole(role: string) {
  if (!role) {
    return 'Verified Member';
  }

  return `${role.charAt(0).toUpperCase()}${role.slice(1)} Account`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          setIsLoading(true);
          const nextProfile = await fetchUserProfile();

          if (!isActive) {
            return;
          }

          setProfile(nextProfile);
          setLoadError('');
        } catch (error) {
          if (!isActive) {
            return;
          }

          setLoadError(error instanceof Error ? error.message : 'Failed to load profile.');
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOutUser();
      router.replace('/login' as any);
    } catch (error) {
      Alert.alert(
        'Sign out failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  const name = profile?.fullName || user?.displayName || 'User';
  const email = profile?.email || user?.email || 'user@example.com';
  const initial = name.charAt(0).toUpperCase() || 'U';
  const phone = profile?.phone || 'Not added yet';
  const department = profile?.department || 'Not added yet';
  const bloodGroup = profile?.bloodGroup || 'Not added yet';
  const allergies = profile?.allergies || 'None listed';
  const roleLabel = capitalizeRole(profile?.role || 'user');

  return (
    <View style={styles.container}>
      <DashboardHeader title="Profile" onOpenSidebar={toggleSidebar} />

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#2563EB', '#1D4ED8']}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.heroContent}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{initial}</Text>
              <Pressable style={styles.editAvatarBtn}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.cardsContainer}>
          {loadError ? (
            <View style={styles.noticeCard}>
              <Feather name="alert-circle" size={16} color="#B45309" />
              <Text style={styles.noticeText}>{loadError}</Text>
            </View>
          ) : null}

          {isLoading && !profile ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
          ) : (
            <>
              <View style={styles.infoCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Personal Information</Text>
                  <Pressable onPress={() => router.push('/settings' as any)}>
                    <Feather name="edit-2" size={16} color="#64748B" />
                  </Pressable>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Feather name="user" size={18} color="#94A3B8" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Full Name</Text>
                    <Text style={styles.infoValue}>{name}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="mail" size={18} color="#94A3B8" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Email Address</Text>
                    <Text style={styles.infoValue}>{email}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="phone" size={18} color="#94A3B8" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{phone}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="briefcase" size={18} color="#94A3B8" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Department</Text>
                    <Text style={styles.infoValue}>{department}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Medical Summary</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Feather name="activity" size={18} color="#94A3B8" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Blood Group</Text>
                    <Text style={styles.infoValue}>{bloodGroup}</Text>
                  </View>
                </View>

                <View style={[styles.infoRow, styles.infoRowLast]}>
                  <Feather name="alert-circle" size={18} color="#94A3B8" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Allergies</Text>
                    <Text style={styles.infoValue}>{allergies}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionCard}>
                <Pressable
                  style={styles.actionRow}
                  onPress={() => router.push('/settings' as any)}>
                  <View style={styles.actionIconBox}>
                    <Feather name="settings" size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.actionText}>Account Settings</Text>
                  <Feather name="chevron-right" size={20} color="#CBD5E1" />
                </Pressable>

                <View style={styles.dividerLight} />

                <Pressable style={styles.actionRow} onPress={handleSignOut}>
                  <View style={[styles.actionIconBox, styles.actionIconDanger]}>
                    <Feather name="log-out" size={18} color="#EF4444" />
                  </View>
                  <Text style={[styles.actionText, styles.actionTextDanger]}>
                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                  </Text>
                  <Feather name="chevron-right" size={20} color="#CBD5E1" />
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
    paddingBottom: 40,
  },
  heroGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
    position: 'relative',
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E3A8A',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 15,
    color: '#BFDBFE',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 24,
  },
  noticeCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
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
  loadingCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconDanger: {
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  actionTextDanger: {
    color: '#EF4444',
  },
});
