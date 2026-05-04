import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';

const ORDERS_DATA = [
  {
    id: 'ORD-0041',
    status: 'Pending',
    date: '2026-03-10',
    time: 'TBD',
    itemsCount: 1,
  },
  {
    id: 'ORD-0038',
    status: 'Ready for Pickup',
    date: '2026-03-09',
    time: '14:30',
    itemsCount: 1,
  },
  {
    id: 'ORD-0035',
    status: 'Completed',
    date: '2026-03-08',
    time: '10:00',
    itemsCount: 2,
  },
  {
    id: 'ORD-0031',
    status: 'Completed',
    date: '2026-03-07',
    time: '09:15',
    itemsCount: 1,
  }
];

export default function OrdersScreen() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          icon: 'loader',
          color: '#D97706',
          bgColor: '#FEF3C7',
          borderColor: '#FDE68A',
        };
      case 'Ready for Pickup':
        return {
          icon: 'package',
          color: '#2563EB',
          bgColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
      case 'Completed':
        return {
          icon: 'check-circle',
          color: '#059669',
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
        };
      default:
        return {
          icon: 'clock',
          color: '#64748B',
          bgColor: '#F1F5F9',
          borderColor: '#E2E8F0',
        };
    }
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="My Orders" onOpenSidebar={toggleSidebar} />
      
      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.pageTitle}>My Orders</Text>
              <Text style={styles.pageSubtitle}>4 total reservation(s)</Text>
            </View>
            <Pressable 
              style={styles.newOrderButton}
              onPress={() => router.push('/search_medicine')}
            >
              <Text style={styles.newOrderButtonText}>New Order</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Stats Cards Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}>
              <Text style={[styles.statNumber, { color: '#1E293B' }]}>4</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }]}>
              <Text style={[styles.statNumber, { color: '#D97706' }]}>1</Text>
              <Text style={[styles.statLabel, { color: '#D97706' }]}>Pending</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.statNumber, { color: '#2563EB' }]}>1</Text>
              <Text style={[styles.statLabel, { color: '#2563EB' }]}>Ready</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.statNumber, { color: '#059669' }]}>2</Text>
              <Text style={[styles.statLabel, { color: '#059669' }]}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Orders List */}
        <View style={styles.ordersList}>
          {ORDERS_DATA.map((order) => {
            const config = getStatusConfig(order.status);
            
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={[styles.statusIconWrapper, { backgroundColor: config.bgColor }]}>
                  <Feather name={config.icon as any} size={20} color={config.color} />
                </View>
                
                <View style={styles.orderHeaderRow}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <View style={[styles.statusBadge, { borderColor: config.borderColor, backgroundColor: config.bgColor }]}>
                    <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                    <Text style={[styles.statusBadgeText, { color: config.color }]}>
                      {order.status === 'Ready for Pickup' ? 'Ready for Pickup' : order.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetailsRow}>
                  <View style={styles.detailItem}>
                    <Feather name="calendar" size={14} color="#94A3B8" />
                    <Text style={styles.detailText}>{order.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Feather name="clock" size={14} color="#94A3B8" />
                    <Text style={styles.detailText}>{order.time}</Text>
                  </View>
                  <Text style={styles.detailText}>{order.itemsCount} medicine(s)</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Feather name="chevron-down" size={20} color="#94A3B8" />
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
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Palette.textSoft,
    marginTop: 4,
  },
  newOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  newOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
  },
  cardFooter: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
});
