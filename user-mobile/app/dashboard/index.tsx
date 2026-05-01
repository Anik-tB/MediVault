import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { Palette } from '@/constants/theme';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentOrders } from '@/components/dashboard/RecentOrders';

export default function DashboardScreen() {
  const router = useRouter();
  const { initializing, user } = useAuth();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!initializing && !user) {
      router.replace('/');
    }
  }, [initializing, router, user]);

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

  if (initializing || !user) {
    return <View style={styles.container} />; // Or a loading spinner
  }

  return (
    <View style={styles.container}>
      <DashboardHeader onOpenSidebar={toggleSidebar} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <WelcomeBanner />
        <StatsGrid />
        <QuickActions />
        <RecentOrders />
      </ScrollView>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={toggleSidebar} 
        slideAnim={slideAnim} 
      />
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
});
