import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { getOrders, getOrderDetails, cancelOrder } from '@/services/orders';



const TimelineStep = ({ title, desc, isDone, isActive, isLast }: { title: string; desc: string; isDone: boolean; isActive: boolean; isLast: boolean }) => {
  return (
    <View style={{ flexDirection: 'row', minHeight: 45 }}>
      <View style={{ alignItems: 'center', marginRight: 12 }}>
        <View style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: isDone ? '#0D9488' : '#FFFFFF',
          borderWidth: 2,
          borderColor: isDone ? '#0D9488' : isActive ? '#0D9488' : '#CBD5E1',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {isDone && <Feather name="check" size={10} color="#FFFFFF" />}
        </View>
        {!isLast && <View style={{ width: 2, flex: 1, backgroundColor: isDone ? '#0D9488' : '#E2E8F0', marginVertical: 2 }} />}
      </View>
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: isDone || isActive ? '#0F172A' : '#94A3B8' }}>{title}</Text>
        <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{desc}</Text>
      </View>
    </View>
  );
};

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
      case 'Preparing':
        return {
          icon: 'activity',
          color: '#8B5CF6',
          bgColor: '#F5F3FF',
          borderColor: '#DDD6FE',
        };
      case 'Ready for Pickup':
        return {
          icon: 'package',
          color: '#0D9488',
          bgColor: '#F0FDFA',
          borderColor: '#CCFBF1',
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
            <View style={[styles.statCard, { borderColor: '#CCFBF1', backgroundColor: '#F0FDFA' }]}>
              <Text style={[styles.statNumber, { color: '#0D9488' }]}>{stats.ready}</Text>
              <Text style={[styles.statLabel, { color: '#0D9488' }]}>Ready</Text>
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
            <ActivityIndicator size="large" color="#0D9488" />
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
              order.status === 'preparing' ? 'Preparing' :
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
                  <Text style={styles.totalAmount}>৳ {Number(order.total_amount || 0).toFixed(2)}</Text>
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
                        <Feather name="package" size={14} color="#0D9488" />
                        <Text style={styles.expandedName}>{item.medicine_name}</Text>
                        <Text style={styles.expandedPrice}>৳ {Number(item.unit_price || 0).toFixed(2)}</Text>
                        <Text style={styles.expandedQty}>×{item.quantity}</Text>
                      </View>
                    ))}

                    {/* Visual Status Timeline Tracker */}
                    <View style={{ marginVertical: 18, padding: 16, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Order Status Tracker</Text>
                      
                      <TimelineStep 
                        title="Order Placed" 
                        desc="Your reservation has been received." 
                        isDone={true} 
                        isActive={order.status === 'pending_pickup'} 
                        isLast={false} 
                      />
                      
                      <TimelineStep 
                        title="Dispensary Preparing" 
                        desc="Our pharmacist is preparing your items." 
                        isDone={['preparing', 'ready_for_pickup', 'completed'].includes(order.status)} 
                        isActive={order.status === 'preparing'} 
                        isLast={false} 
                      />
                      
                      <TimelineStep 
                        title="Ready for Collection" 
                        desc="Items are ready to pick up at the counter." 
                        isDone={['ready_for_pickup', 'completed'].includes(order.status)} 
                        isActive={order.status === 'ready_for_pickup'} 
                        isLast={false} 
                      />
                      
                      <TimelineStep 
                        title="Picked Up & Completed" 
                        desc="Order has been collected and finalized." 
                        isDone={order.status === 'completed'} 
                        isActive={order.status === 'completed'} 
                        isLast={true} 
                      />
                    </View>

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
    backgroundColor: '#0D9488',
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
    color: '#0D9488',
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
    color: '#0D9488',
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
    fontSize: 13,
    fontWeight: '700',
  },
  totalAmount: {
    marginLeft: 'auto',
    fontSize: 18,
    fontWeight: '900',
    color: Palette.primary,
  },
  expandedPrice: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 8,
  },
});
