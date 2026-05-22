import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './use-auth';
import { fetchNotifications, markAllNotificationsAsRead, Notification } from '@/services/notifications';
import { Palette } from '@/constants/theme';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const knownIds = useRef<Set<string>>(new Set());

  // Toast State
  const [toastNotif, setToastNotif] = useState<Notification | null>(null);
  const toastAnim = useRef(new Animated.Value(-150)).current;

  const showToast = useCallback((notif: Notification) => {
    setToastNotif(notif);
    Animated.spring(toastAnim, {
      toValue: 60, // Slide down from top
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastNotif(null));
    }, 4000);
  }, [toastAnim]);

  const loadNotifications = useCallback(async (showPopup = true) => {
    if (!user) return;
    try {
      const data = await fetchNotifications();
      const notifs = data.notifications || [];
      setNotifications(notifs);

      const unread = notifs.filter(n => !n.is_read);
      setUnreadCount(unread.length);

      // Check for new notifications
      if (showPopup && knownIds.current.size > 0) {
        const newUnread = unread.filter(n => !knownIds.current.has(n.id));
        if (newUnread.length > 0) {
          showToast(newUnread[0]);
        }
      }

      const idSet = new Set<string>();
      notifs.forEach(n => idSet.add(n.id));
      knownIds.current = idSet;

    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) {
      loadNotifications(false); // initial load, no popup
      const interval = setInterval(() => loadNotifications(true), 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      knownIds.current.clear();
    }
  }, [user, loadNotifications]);

  const refreshNotifications = async () => {
    await loadNotifications(false);
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, refreshNotifications, markAllAsRead }}>
      {children}
      {toastNotif && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
          <Pressable 
            style={styles.toastContent}
            onPress={() => {
               Animated.timing(toastAnim, {
                 toValue: -150, duration: 200, useNativeDriver: true
               }).start(() => {
                 setToastNotif(null);
                 router.push('/notifications' as any);
               });
            }}
          >
            <View style={styles.iconCircle}>
              <Feather name="bell" size={20} color="#2563EB" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.toastTitle}>{toastNotif.title}</Text>
              <Text style={styles.toastMessage} numberOfLines={2}>{toastNotif.message}</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </NotificationsContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toastContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  toastMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
