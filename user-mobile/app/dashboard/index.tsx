import React, { useCallback, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Animated, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '@/hooks/use-auth';
import {
  fetchDashboard,
  DashboardRecentOrder,
  DashboardSummary,
} from '@/services/dashboard';
import {
  Sidebar,
  DashboardHeader,
  WelcomeBanner,
  StatsGrid,
  QuickActions,
  RecentOrders,
} from '@/components/dashboard/DashboardComponents';

const emptySummary: DashboardSummary = {
  activeOrders: 0,
  cartItems: 0,
  pendingPrescriptions: 0,
  medicinesAvailable: 0,
};

export default function DashboardScreen() {
  const router = useRouter();
  const { initializing, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>(emptySummary);
  const [recentOrders, setRecentOrders] = useState<DashboardRecentOrder[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!initializing && !user) {
        router.replace('/');
        return () => {
          isActive = false;
        };
      }

      if (!user) {
        return () => {
          isActive = false;
        };
      }

      (async () => {
        try {
          setIsLoadingDashboard(true);
          const dashboard = await fetchDashboard();

          if (!isActive) {
            return;
          }

          setDashboardSummary(dashboard.summary);
          setRecentOrders(dashboard.recentOrders);
          setDashboardError('');
        } catch (error) {
          if (!isActive) {
            return;
          }

          setDashboardError(
            error instanceof Error ? error.message : 'Failed to load dashboard data.'
          );
        } finally {
          if (isActive) {
            setIsLoadingDashboard(false);
          }
        }
      })();

      return () => {
        isActive = false;
      };
    }, [initializing, router, user])
  );

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

  if (initializing || !user) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <DashboardHeader onOpenSidebar={toggleSidebar} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <WelcomeBanner
          activeOrders={dashboardSummary.activeOrders}
          cartItems={dashboardSummary.cartItems}
          isLoading={isLoadingDashboard}
        />

        {dashboardError ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>{dashboardError}</Text>
          </View>
        ) : null}

        <StatsGrid summary={dashboardSummary} isLoading={isLoadingDashboard} />
        <QuickActions />
        <RecentOrders orders={recentOrders} isLoading={isLoadingDashboard} />
      </ScrollView>

      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} slideAnim={slideAnim} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  noticeCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noticeText: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
  },
});
