import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';

const MOCK_ORDERS = [
  { id: 'ORD-0041', status: 'Pending', items: 'Amoxicillin', date: '2026-03-10' },
  { id: 'ORD-0038', status: 'Ready for Pickup', items: 'Ibuprofen', date: '2026-03-09' },
  { id: 'ORD-0035', status: 'Completed', items: 'Aspirin, Cetirizine', date: '2026-03-08' },
  { id: 'ORD-0031', status: 'Completed', items: 'Metformin', date: '2026-03-07' },
];

export function RecentOrders() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>My Recent Orders</Text>
          <Text style={styles.sectionSubtitle}>Your latest reservations</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [styles.viewAllBtn, { opacity: pressed ? 0.7 : 1 }]} 
          onPress={() => router.push('/orders')}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <Feather name="arrow-right" size={14} color="#2563EB" />
        </Pressable>
      </View>

      <View style={styles.listContainer}>
        {MOCK_ORDERS.map((order, index) => (
          <View key={order.id} style={[styles.orderItem, index !== MOCK_ORDERS.length - 1 && styles.borderBottom]}>
            <View style={styles.iconContainer}>
              {order.status === 'Pending' && <Feather name="loader" size={20} color="#F59E0B" />}
              {order.status === 'Ready for Pickup' && <Feather name="package" size={20} color="#3B82F6" />}
              {order.status === 'Completed' && <Feather name="check-circle" size={20} color="#10B981" />}
            </View>
            
            <View style={styles.orderDetails}>
              <View style={styles.orderHeaderRow}>
                <Text style={styles.orderId}>{order.id}</Text>
                <StatusBadge status={order.status} />
              </View>
              <Text style={styles.orderMeta}>{order.items} · {order.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bgColor = '#F1F5F9';
  let textColor = '#64748B';
  let dotColor = '#94A3B8';

  if (status === 'Pending') {
    bgColor = '#FEF3C7';
    textColor = '#B45309';
    dotColor = '#F59E0B';
  } else if (status === 'Ready for Pickup') {
    bgColor = '#DBEAFE';
    textColor = '#1D4ED8';
    dotColor = '#3B82F6';
  } else if (status === 'Completed') {
    bgColor = '#D1FAE5';
    textColor = '#047857';
    dotColor = '#10B981';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.badgeText, { color: textColor }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    overflow: 'hidden',
  },
  orderItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSoft,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  orderDetails: {
    flex: 1,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  orderMeta: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
