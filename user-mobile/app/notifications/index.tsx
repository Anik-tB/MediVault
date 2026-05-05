import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';

// Mock Data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'order',
    title: 'Order Ready for Pickup',
    message: 'Your order ORD-0038 (Ibuprofen) is now ready to be picked up at the counter.',
    time: '10 mins ago',
    unread: true,
  },
  {
    id: '2',
    type: 'prescription',
    title: 'Prescription Validated',
    message: 'Your recent prescription upload has been reviewed and approved by our pharmacist.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: '3',
    type: 'system',
    title: 'Welcome to MediVault!',
    message: 'We are glad to have you. Explore our catalog of medications and easily manage your prescriptions.',
    time: '1 day ago',
    unread: false,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Profile Incomplete',
    message: 'Please complete your medical summary in the profile section for better medication recommendations.',
    time: '2 days ago',
    unread: false,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

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

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'order':
        return { name: 'package', color: '#10B981', bgColor: '#D1FAE5' }; // Emerald
      case 'prescription':
        return { name: 'file-text', color: '#8B5CF6', bgColor: '#EDE9FE' }; // Violet
      case 'system':
        return { name: 'info', color: '#3B82F6', bgColor: '#DBEAFE' }; // Blue
      case 'alert':
        return { name: 'alert-triangle', color: '#F59E0B', bgColor: '#FEF3C7' }; // Amber
      default:
        return { name: 'bell', color: '#64748B', bgColor: '#F1F5F9' }; // Slate
    }
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Notifications" onOpenSidebar={toggleSidebar} />

      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.pageTitle}>Notifications</Text>
            <Text style={styles.pageSubtitle}>
              You have {notifications.filter(n => n.unread).length} unread messages
            </Text>
          </View>
          
          <Pressable 
            onPress={markAllAsRead} 
            style={({ pressed }) => [styles.markReadBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="check" size={16} color="#2563EB" />
            <Text style={styles.markReadText}>Mark all as read</Text>
          </Pressable>
        </View>

        <View style={styles.notificationsList}>
          {notifications.map((noti) => {
            const iconConfig = getIconConfig(noti.type);
            
            return (
              <View 
                key={noti.id} 
                style={[
                  styles.notificationCard, 
                  noti.unread && styles.notificationCardUnread
                ]}
              >
                {/* Unread Indicator Dot */}
                {noti.unread && <View style={styles.unreadDot} />}

                <View style={[styles.iconBox, { backgroundColor: iconConfig.bgColor }]}>
                  <Feather name={iconConfig.name as any} size={20} color={iconConfig.color} />
                </View>
                
                <View style={styles.textContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notiTitle, noti.unread && styles.notiTitleUnread]}>
                      {noti.title}
                    </Text>
                    <Text style={styles.notiTime}>{noti.time}</Text>
                  </View>
                  <Text style={styles.notiMessage} numberOfLines={2}>
                    {noti.message}
                  </Text>
                </View>
              </View>
            );
          })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Palette.textSoft,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  markReadText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Palette.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  notificationCardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingRight: 12, // Space for the unread dot
  },
  notiTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  notiTitleUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  notiTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
  },
  notiMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
