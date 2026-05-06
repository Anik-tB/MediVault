import React, { useEffect, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';

import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { Palette } from '@/constants/theme';
import { fetchUserSettings, updateAppearanceSettings } from '@/services/profile';

type ThemeOption = 'light' | 'dark' | 'system';
type DensityOption = 'compact' | 'default' | 'relaxed';

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [activeTheme, setActiveTheme] = useState<ThemeOption>('light');
  const [activeDensity, setActiveDensity] = useState<DensityOption>('default');

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        setIsLoading(true);
        const settings = await fetchUserSettings();

        if (!isActive) {
          return;
        }

        setActiveTheme(settings.appearance.theme);
        setActiveDensity(settings.appearance.sidebarDensity);
        setLoadError('');
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Failed to load appearance settings.');
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
    try {
      setIsSaving(true);
      await updateAppearanceSettings({
        theme: activeTheme,
        sidebarDensity: activeDensity,
      });
      Alert.alert('Appearance saved', 'Your appearance settings have been updated.');
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsSaving(false);
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

          <View style={[styles.navItem, styles.navItemActive]}>
            <View style={[styles.navIconBox, styles.navIconBoxActive]}>
              <Feather name="aperture" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.navTextContainer}>
              <Text style={[styles.navTitle, styles.navTitleActive]}>Appearance</Text>
              <Text style={[styles.navSubtitle, styles.navSubtitleActive]}>UI preferences</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.appearanceCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Feather name="aperture" size={18} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.cardHeaderTitle}>Appearance Settings</Text>
              <Text style={styles.cardHeaderSubtitle}>UI preferences</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardContent}>
            {loadError ? (
              <View style={styles.noticeBox}>
                <Feather name="alert-circle" size={16} color="#B45309" />
                <Text style={styles.noticeText}>{loadError}</Text>
              </View>
            ) : null}

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading appearance settings...</Text>
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>THEME</Text>

                  <View style={styles.themeOptionsContainer}>
                    <Pressable
                      style={[
                        styles.themeOption,
                        activeTheme === 'light' && styles.themeOptionActive,
                      ]}
                      onPress={() => setActiveTheme('light')}>
                      <View style={styles.themePreviewLight}>
                        <View style={styles.themePreviewLightInner} />
                      </View>
                      <Text
                        style={
                          activeTheme === 'light'
                            ? styles.themeOptionTextActive
                            : styles.themeOptionText
                        }>
                        Light
                      </Text>
                      {activeTheme === 'light' ? (
                        <Feather name="check" size={16} color="#2563EB" style={styles.checkIcon} />
                      ) : null}
                    </Pressable>

                    <View style={styles.themeOption}>
                      <View style={styles.themePreviewDark} />
                      <Text style={styles.themeOptionText}>Dark</Text>
                      <Text style={styles.themeOptionComingSoon}>Coming{'\n'}soon</Text>
                    </View>

                    <View style={styles.themeOption}>
                      <LinearGradient
                        colors={['#E2E8F0', '#94A3B8']}
                        style={styles.themePreviewSystem}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <Text style={styles.themeOptionText}>System</Text>
                      <Text style={styles.themeOptionComingSoon}>Coming{'\n'}soon</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.dividerLight} />

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>SIDEBAR DENSITY</Text>

                  <View style={styles.densityOptionsContainer}>
                    <Pressable
                      style={[
                        styles.densityOption,
                        activeDensity === 'compact' && styles.densityOptionActive,
                      ]}
                      onPress={() => setActiveDensity('compact')}>
                      <Text
                        style={[
                          styles.densityOptionText,
                          activeDensity === 'compact' && styles.densityOptionTextActive,
                        ]}>
                        Compact
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.densityOption,
                        activeDensity === 'default' && styles.densityOptionActive,
                      ]}
                      onPress={() => setActiveDensity('default')}>
                      <Text
                        style={[
                          styles.densityOptionText,
                          activeDensity === 'default' && styles.densityOptionTextActive,
                        ]}>
                        Default
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.densityOption,
                        activeDensity === 'relaxed' && styles.densityOptionActive,
                      ]}
                      onPress={() => setActiveDensity('relaxed')}>
                      <Text
                        style={[
                          styles.densityOptionText,
                          activeDensity === 'relaxed' && styles.densityOptionTextActive,
                        ]}>
                        Relaxed
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.saveBtnContainer}>
            <Pressable
              style={[styles.saveBtn, (isSaving || isLoading) && styles.saveBtnDisabled]}
              disabled={isSaving || isLoading}
              onPress={handleSave}>
              <Feather name="save" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {isSaving ? 'Saving...' : 'Save Appearance'}
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
  appearanceCard: {
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
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 16,
  },
  noticeText: {
    flex: 1,
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  themeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    aspectRatio: 0.65,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  themeOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFC',
  },
  themePreviewLight: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  themePreviewLightInner: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#EFF6FF',
  },
  themePreviewDark: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#94A3B8',
    marginBottom: 16,
  },
  themePreviewSystem: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 16,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
  },
  themeOptionTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },
  themeOptionComingSoon: {
    fontSize: 11,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  checkIcon: {
    marginTop: 8,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 24,
  },
  densityOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  densityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  densityOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  densityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  densityOptionTextActive: {
    color: '#FFFFFF',
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
    width: '100%',
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
