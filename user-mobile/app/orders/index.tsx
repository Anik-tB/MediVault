import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { getOrders, getOrderDetails, cancelOrder } from '@/services/orders';



export default function OrdersScreen() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, ready: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [itemsCache, setItemsCache] = useState<Record<number, any[]>>({});

  const handleToggle = async (orderId: number) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!itemsCache[orderId]) {
      try {
        const items = await getOrderDetails(orderId);
        setItemsCache(prev => ({ ...prev, [orderId]: items }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    setIsCancelling(orderId);
    try {
      await cancelOrder(orderId);
      // Refresh the orders list and stats
      const data = await getOrders();
      setOrders(data.orders);
      setStats(data.stats);
      setExpandedId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrders();
        setOrders(data.orders);
        setStats(data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

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
              <Text style={styles.pageSubtitle}>{stats.total} total reservation(s)</Text>
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
              <Text style={[styles.statNumber, { color: '#1E293B' }]}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }]}>
              <Text style={[styles.statNumber, { color: '#D97706' }]}>{stats.pending}</Text>
              <Text style={[styles.statLabel, { color: '#D97706' }]}>Pending</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.statNumber, { color: '#2563EB' }]}>{stats.ready}</Text>
              <Text style={[styles.statLabel, { color: '#2563EB' }]}>Ready</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.statNumber, { color: '#059669' }]}>{stats.completed}</Text>
              <Text style={[styles.statLabel, { color: '#059669' }]}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Orders List */}
        {isLoading ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : orders.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Feather name="shopping-bag" size={48} color="#CBD5E1" />
            <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 15 }}>No orders yet</Text>
          </View>
        ) : (
        <View style={styles.ordersList}>
          {orders.map((order) => {
            // Map backend status to display label
            const statusLabel =
              order.status === 'pending_pickup' ? 'Pending' :
              order.status === 'ready_for_pickup' ? 'Ready for Pickup' :
              order.status === 'completed' ? 'Completed' : order.status;
            const config = getStatusConfig(statusLabel);
            const date = new Date(order.created_at);
            const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const orderId = `ORD-${String(order.id).padStart(4, '0')}`;

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={[styles.statusIconWrapper, { backgroundColor: config.bgColor }]}>
                  <Feather name={config.icon as any} size={20} color={config.color} />
                </View>
                
                <View style={styles.orderHeaderRow}>
                  <Text style={styles.orderId}>{orderId}</Text>
                  <View style={[styles.statusBadge, { borderColor: config.borderColor, backgroundColor: config.bgColor }]}>
                    <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                    <Text style={[styles.statusBadgeText, { color: config.color }]}>{statusLabel}</Text>
                  </View>
                </View>

                <View style={styles.orderDetailsRow}>
                  <View style={styles.detailItem}>
                    <Feather name="calendar" size={14} color="#94A3B8" />
                    <Text style={styles.detailText}>{dateStr}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Feather name="clock" size={14} color="#94A3B8" />
                    <Text style={styles.detailText}>{timeStr}</Text>
                  </View>
                  <Text style={styles.detailText}>{order.items_count} medicine(s)</Text>
                </View>

                <Pressable style={styles.cardFooter} onPress={() => handleToggle(order.id)}>
                  <Feather
                    name={expandedId === order.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#94A3B8"
                  />
                </Pressable>

                {/* Expanded medicine list */}
                {expandedId === order.id && (
                  <View style={styles.expandedPanel}>
                    {(itemsCache[order.id] || []).map((item: any, idx: number) => (
                      <View key={idx} style={styles.expandedRow}>
                        <Feather name="package" size={14} color="#2563EB" />
                        <Text style={styles.expandedName}>{item.medicine_name}</Text>
                        <Text style={styles.expandedQty}>×{item.quantity}</Text>
                      </View>
                    ))}

                    {order.status === 'pending_pickup' && (
                      <Pressable 
                        style={[styles.cancelButton, isCancelling === order.id && { opacity: 0.7 }]}
                        onPress={() => handleCancelOrder(order.id)}
                        disabled={isCancelling === order.id}
                      >
                        {isCancelling === order.id ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <>
                            <Feather name="trash-2" size={14} color="#EF4444" />
                            <Text style={styles.cancelButtonText}>Cancel Order</Text>
                          </>
                        )}
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
        )}
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
  expandedPanel: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  expandedName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  expandedQty: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
