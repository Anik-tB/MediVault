import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Toggle states
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

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

          <View style={[styles.navItem, styles.navItemActive]}>
            <View style={[styles.navIconBox, styles.navIconBoxActive]}>
              <Feather name="bell" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.navTextContainer}>
              <Text style={[styles.navTitle, styles.navTitleActive]}>Notifications</Text>
              <Text style={[styles.navSubtitle, styles.navSubtitleActive]}>Alert preferences</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#FFFFFF" />
          </View>

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

        {/* Notifications Settings Card */}
        <View style={styles.notificationsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Feather name="bell" size={18} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.cardHeaderTitle}>Notifications Settings</Text>
              <Text style={styles.cardHeaderSubtitle}>Alert preferences</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardContent}>
            {/* Info Box */}
            <View style={styles.infoBox}>
              <Feather name="bell" size={18} color="#2563EB" />
              <Text style={styles.infoBoxText}>
                Configure which notifications you receive. Changes apply immediately.
              </Text>
            </View>

            {/* Toggle List */}
            <View style={styles.toggleList}>
              {/* Order Alerts */}
              <View style={styles.toggleItem}>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitle}>Order Alerts</Text>
                  <Text style={styles.toggleSubtitle}>Get notified when new orders are placed or updated</Text>
                </View>
                <Switch
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E2E8F0"
                  onValueChange={setOrderAlerts}
                  value={orderAlerts}
                />
              </View>

              <View style={styles.dividerLight} />

              {/* Low Stock Warnings */}
              <View style={styles.toggleItem}>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitle}>Low Stock Warnings</Text>
                  <Text style={styles.toggleSubtitle}>Alert when medicine stock falls below 50 units</Text>
                </View>
                <Switch
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E2E8F0"
                  onValueChange={setLowStock}
                  value={lowStock}
                />
              </View>

              <View style={styles.dividerLight} />

              {/* Expiry Alerts */}
              <View style={styles.toggleItem}>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitle}>Expiry Alerts</Text>
                  <Text style={styles.toggleSubtitle}>Reminder when medicines are expiring within 3 months</Text>
                </View>
                <Switch
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E2E8F0"
                  onValueChange={setExpiryAlerts}
                  value={expiryAlerts}
                />
              </View>

              <View style={styles.dividerLight} />

              {/* Weekly Reports */}
              <View style={styles.toggleItem}>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitle}>Weekly Reports</Text>
                  <Text style={styles.toggleSubtitle}>Receive a weekly summary of inventory and order activity</Text>
                </View>
                <Switch
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E2E8F0"
                  onValueChange={setWeeklyReports}
                  value={weeklyReports}
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.saveBtnContainer}>
            <Pressable style={styles.saveBtn}>
              <Feather name="save" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </Pressable>
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
  notificationsCard: {
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
  dividerLight: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 4,
  },
  cardContent: {
    padding: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 14,
    color: '#1D4ED8', // Darker blue for text readability
    lineHeight: 20,
    fontWeight: '500',
  },
  toggleList: {
    gap: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  saveBtnContainer: {
    padding: 24,
    paddingTop: 0,
    alignItems: 'center', // Center aligned as per mockup for this button
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
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
