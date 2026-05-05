import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { LinearGradient } from 'expo-linear-gradient';

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [activeDensity, setActiveDensity] = useState('Default');

  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? 0 : 1;
    if (!isSidebarOpen) setIsSidebarOpen(true);
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (isSidebarOpen) setIsSidebarOpen(false);
    });
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Settings" onOpenSidebar={toggleSidebar} />

      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>
            Manage your account and system preferences
          </Text>
        </View>

        {/* Navigation Card */}
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

        {/* Appearance Settings Card */}
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
            
            {/* Theme Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>THEME</Text>
              
              <View style={styles.themeOptionsContainer}>
                {/* Light Theme (Active) */}
                <Pressable style={[styles.themeOption, styles.themeOptionActive]}>
                  <View style={styles.themePreviewLight}>
                    <View style={styles.themePreviewLightInner} />
                  </View>
                  <Text style={styles.themeOptionTextActive}>Light</Text>
                  <Feather name="check" size={16} color="#2563EB" style={styles.checkIcon} />
                </Pressable>

                {/* Dark Theme (Inactive) */}
                <View style={styles.themeOption}>
                  <View style={styles.themePreviewDark} />
                  <Text style={styles.themeOptionText}>Dark</Text>
                  <Text style={styles.themeOptionComingSoon}>Coming{'\n'}soon</Text>
                </View>

                {/* System Theme (Inactive) */}
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

            {/* Sidebar Density Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SIDEBAR DENSITY</Text>
              
              <View style={styles.densityOptionsContainer}>
                <Pressable 
                  style={[styles.densityOption, activeDensity === 'Compact' && styles.densityOptionActive]}
                  onPress={() => setActiveDensity('Compact')}
                >
                  <Text style={[styles.densityOptionText, activeDensity === 'Compact' && styles.densityOptionTextActive]}>
                    Compact
                  </Text>
                </Pressable>

                <Pressable 
                  style={[styles.densityOption, activeDensity === 'Default' && styles.densityOptionActive]}
                  onPress={() => setActiveDensity('Default')}
                >
                  <Text style={[styles.densityOptionText, activeDensity === 'Default' && styles.densityOptionTextActive]}>
                    Default
                  </Text>
                </Pressable>

                <Pressable 
                  style={[styles.densityOption, activeDensity === 'Relaxed' && styles.densityOptionActive]}
                  onPress={() => setActiveDensity('Relaxed')}
                >
                  <Text style={[styles.densityOptionText, activeDensity === 'Relaxed' && styles.densityOptionTextActive]}>
                    Relaxed
                  </Text>
                </Pressable>
              </View>
            </View>

          </View>
        </View>

      </ScrollView>

      {isSidebarOpen && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={toggleSidebar} 
          slideAnim={slideAnim} 
        />
      )}
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
    aspectRatio: 0.65, // Adjust for taller boxes
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
    backgroundColor: '#F8FAFC', // Slightly distinct background
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
});
