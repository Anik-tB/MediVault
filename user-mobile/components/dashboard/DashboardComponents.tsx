import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import type { DashboardSummary, DashboardRecentOrder } from '@/services/dashboard';

const { width, height } = Dimensions.get('window');


// ==========================================
// DashboardHeader.tsx
// ==========================================

interface DashboardHeaderProps {
  onOpenSidebar: () => void;
  title?: string;
}

export function DashboardHeader({ onOpenSidebar, title = 'Dashboard' }: DashboardHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const initial = user?.displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <View style={DashboardHeaderStyles.header}>
      <View style={DashboardHeaderStyles.left}>
        <Pressable onPress={onOpenSidebar} style={DashboardHeaderStyles.iconBtn}>
          <Feather name="menu" size={24} color={Palette.text} />
        </Pressable>
        <Text style={DashboardHeaderStyles.title}>{title}</Text>
      </View>

      <View style={DashboardHeaderStyles.right}>
        <Pressable 
          style={({ pressed }) => [DashboardHeaderStyles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push('/notifications' as any)}
        >
          <Feather name="bell" size={24} color={Palette.textSoft} />
          <View style={DashboardHeaderStyles.badge} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [DashboardHeaderStyles.avatar, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push('/profile' as any)}
        >
          <Text style={DashboardHeaderStyles.avatarText}>{initial}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const DashboardHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Safe area for top notch
    paddingBottom: 20,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSoft,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.text,
  },
  iconBtn: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // Red indicator
    borderWidth: 1,
    borderColor: Palette.surface,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB', // Blue matching screenshot
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Palette.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});

// ==========================================
// WelcomeBanner.tsx
// ==========================================

type WelcomeBannerProps = {
  activeOrders: number;
  cartItems: number;
  isLoading?: boolean;
};

export function WelcomeBanner({
  activeOrders,
  cartItems,
  isLoading = false,
}: WelcomeBannerProps) {
  const { user } = useAuth();
  const router = useRouter();
  const firstName = user?.displayName?.split(' ')[0] || 'User';

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={WelcomeBannerStyles.container}>
      <Text style={WelcomeBannerStyles.date}>{dateString}</Text>
      <Text style={WelcomeBannerStyles.greeting}>Good morning, {firstName}!</Text>
      <Text style={WelcomeBannerStyles.subtitle}>
        {isLoading ? (
          'Loading your latest activity...'
        ) : (
          <>
            You have <Text style={WelcomeBannerStyles.bold}>{activeOrders} active order(s)</Text> and{' '}
            <Text style={WelcomeBannerStyles.bold}>{cartItems} item(s)</Text> in your cart.
          </>
        )}
      </Text>

      <Pressable
        style={({ pressed }) => [WelcomeBannerStyles.button, { opacity: pressed ? 0.8 : 1 }]}
        onPress={() => router.push('/search_medicine')}>
        <Feather name="search" size={18} color="#2563EB" />
        <Text style={WelcomeBannerStyles.buttonText}>Browse Medicines</Text>
      </Pressable>
    </View>
  );
}

const WelcomeBannerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  date: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  greeting: {
    color: Palette.surface,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: '#DBEAFE',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  bold: {
    fontWeight: '700',
    color: Palette.surface,
  },
  button: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
  },
});

// ==========================================
// StatsGrid.tsx
// ==========================================

type StatsGridProps = {
  summary: DashboardSummary;
  isLoading?: boolean;
};

type StatDefinition = {
  icon: React.ComponentProps<typeof Feather>['name'];
  value: number;
  label: string;
  iconColor: string;
  iconBg: string;
};

type StatCardProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  value: string;
  label: string;
  iconColor: string;
  iconBg: string;
};

export function StatsGrid({ summary, isLoading = false }: StatsGridProps) {
  const cards: StatDefinition[] = [
    {
      icon: 'clock',
      value: summary.activeOrders,
      label: 'Active Orders',
      iconColor: '#F59E0B',
      iconBg: '#FEF3C7',
    },
    {
      icon: 'shopping-cart',
      value: summary.cartItems,
      label: 'Cart Items',
      iconColor: '#3B82F6',
      iconBg: '#DBEAFE',
    },
    {
      icon: 'file-text',
      value: summary.pendingPrescriptions,
      label: 'Pending Rx',
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
    },
    {
      icon: 'package',
      value: summary.medicinesAvailable,
      label: 'Medicines Available',
      iconColor: '#10B981',
      iconBg: '#D1FAE5',
    },
  ];

  return (
    <View style={StatsGridStyles.container}>
      {cards.map((card) => (
        <StatCard
          key={card.label}
          icon={card.icon}
          value={isLoading ? '...' : String(card.value)}
          label={card.label}
          iconColor={card.iconColor}
          iconBg={card.iconBg}
        />
      ))}
    </View>
  );
}

function StatCard({ icon, value, label, iconColor, iconBg }: StatCardProps) {
  return (
    <View style={StatsGridStyles.card}>
      <View style={StatsGridStyles.cardInner}>
        <View style={[StatsGridStyles.iconWrapper, { backgroundColor: iconBg }]}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        <Text style={StatsGridStyles.value}>{value}</Text>
        <Text style={StatsGridStyles.label}>{label}</Text>
      </View>
    </View>
  );
}

const StatsGridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginTop: 20,
  },
  card: {
    width: '50%',
    padding: 6,
  },
  cardInner: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: Palette.textMuted,
    fontWeight: '500',
  },
});

// ==========================================
// QuickActions.tsx
// ==========================================

export function QuickActions() {
  const router = useRouter();
  return (
    <View style={QuickActionsStyles.container}>
      <Text style={QuickActionsStyles.sectionTitle}>Quick Actions</Text>
      <Text style={QuickActionsStyles.sectionSubtitle}>Common operations</Text>

      <View style={QuickActionsStyles.buttonsList}>
        <ActionButton
          icon="search"
          title="Search Medicines"
          subtitle="Browse formulary"
          bgColor="#2563EB" // Blue
          onPress={() => router.push('/search_medicine')}
        />
        <ActionButton
          icon="shopping-cart"
          title="View My Cart"
          subtitle="0 item(s)"
          bgColor="#0D9488" // Teal
          onPress={() => router.push('/cart')}
        />
        <ActionButton
          icon="upload"
          title="Upload Prescription"
          subtitle="Submit Rx document"
          bgColor="#8B5CF6" // Purple
          onPress={() => router.push('/prescriptions' as any)}
        />
        <ActionButton
          icon="clock"
          title="Order History"
          subtitle="4 total"
          bgColor="#334155" // Dark Gray
          onPress={() => router.push('/orders')}
        />
      </View>
    </View>
  );
}

function ActionButton({ icon, title, subtitle, bgColor, onPress }: any) {
  return (
    <Pressable
      style={({ pressed }) => [
        QuickActionsStyles.actionBtn, 
        { backgroundColor: bgColor, opacity: pressed ? 0.8 : 1 }
      ]}
      onPress={onPress}
    >
      <Feather name={icon} size={22} color={Palette.surface} />
      <View style={QuickActionsStyles.btnTextContainer}>
        <Text style={QuickActionsStyles.btnTitle}>{title}</Text>
        <Text style={QuickActionsStyles.btnSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="arrow-right" size={18} color={Palette.surface} style={QuickActionsStyles.arrow} />
    </Pressable>
  );
}

const QuickActionsStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 32,
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
    marginBottom: 16,
  },
  buttonsList: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  btnTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  btnTitle: {
    color: Palette.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  btnSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    opacity: 0.8,
  },
});

// ==========================================
// RecentOrders.tsx
// ==========================================

type RecentOrdersProps = {
  orders: DashboardRecentOrder[];
  isLoading?: boolean;
};

function getDisplayStatus(status: string) {
  if (status === 'pending_pickup') {
    return 'Pending';
  }

  if (status === 'ready_for_pickup') {
    return 'Ready for Pickup';
  }

  if (status === 'completed') {
    return 'Completed';
  }

  return status;
}

export function RecentOrders({ orders, isLoading = false }: RecentOrdersProps) {
  const router = useRouter();

  return (
    <View style={RecentOrdersStyles.container}>
      <View style={RecentOrdersStyles.headerRow}>
        <View>
          <Text style={RecentOrdersStyles.sectionTitle}>My Recent Orders</Text>
          <Text style={RecentOrdersStyles.sectionSubtitle}>Your latest reservations</Text>
        </View>
        <Pressable
          style={({ pressed }) => [RecentOrdersStyles.viewAllBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push('/orders')}>
          <Text style={RecentOrdersStyles.viewAllText}>View all</Text>
          <Feather name="arrow-right" size={14} color="#2563EB" />
        </Pressable>
      </View>

      <View style={RecentOrdersStyles.listContainer}>
        {isLoading ? (
          <View style={RecentOrdersStyles.emptyState}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={RecentOrdersStyles.emptyText}>Loading recent orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={RecentOrdersStyles.emptyState}>
            <Feather name="shopping-bag" size={24} color="#CBD5E1" />
            <Text style={RecentOrdersStyles.emptyText}>No recent orders yet</Text>
          </View>
        ) : (
          orders.map((order, index) => {
            const displayStatus = getDisplayStatus(order.status);
            const dateText = new Date(order.createdAt).toLocaleDateString('en-CA');

            return (
              <View
                key={order.id}
                style={[RecentOrdersStyles.orderItem, index !== orders.length - 1 && RecentOrdersStyles.borderBottom]}>
                <View style={RecentOrdersStyles.iconContainer}>
                  {displayStatus === 'Pending' ? (
                    <Feather name="loader" size={20} color="#F59E0B" />
                  ) : null}
                  {displayStatus === 'Ready for Pickup' ? (
                    <Feather name="package" size={20} color="#3B82F6" />
                  ) : null}
                  {displayStatus === 'Completed' ? (
                    <Feather name="check-circle" size={20} color="#10B981" />
                  ) : null}
                </View>

                <View style={RecentOrdersStyles.orderDetails}>
                  <View style={RecentOrdersStyles.orderHeaderRow}>
                    <Text style={RecentOrdersStyles.orderId}>{order.displayId}</Text>
                    <StatusBadge status={displayStatus} />
                  </View>
                  <Text style={RecentOrdersStyles.orderMeta} numberOfLines={1}>
                    {order.itemsLabel} | {dateText}
                  </Text>
                </View>
              </View>
            );
          })
        )}
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
    <View style={[RecentOrdersStyles.badge, { backgroundColor: bgColor }]}>
      <View style={[RecentOrdersStyles.dot, { backgroundColor: dotColor }]} />
      <Text style={[RecentOrdersStyles.badgeText, { color: textColor }]}>{status}</Text>
    </View>
  );
}

const RecentOrdersStyles = StyleSheet.create({
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
  emptyState: {
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: Palette.textMuted,
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

// ==========================================
// Sidebar.tsx
// ==========================================



interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
}

export function Sidebar({ isOpen, onClose, slideAnim }: SidebarProps) {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <View style={SidebarStyles.overlay}>
      <Pressable style={SidebarStyles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          SidebarStyles.sidebarContainer,
          {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-width * 0.8, 0],
                }),
              },
            ],
          },
        ]}>

        {/* Header */}
        <View style={SidebarStyles.header}>
          <View style={SidebarStyles.logoRow}>
            <View style={SidebarStyles.logoCircle}>
              <Feather name="activity" size={20} color={Palette.surface} />
            </View>
            <View>
              <Text style={SidebarStyles.logoTitle}>MediVault</Text>
              <Text style={SidebarStyles.logoSubtitle}>DISPENSARY</Text>
            </View>
          </View>
          <Pressable onPress={onClose} style={SidebarStyles.closeBtn}>
            <Feather name="x" size={24} color={Palette.surface} />
          </Pressable>
        </View>

        <Pressable style={SidebarStyles.portalBtn}>
          <Feather name="user" size={18} color={Palette.surface} />
          <Text style={SidebarStyles.portalText}>PATIENT PORTAL</Text>
        </Pressable>

        <Text style={SidebarStyles.navHeader}>NAVIGATION</Text>

        <View style={SidebarStyles.navLinks}>
          <NavItem
            icon="grid"
            label="Dashboard"
            active={pathname === '/dashboard'}
            onPress={() => { router.push('/dashboard'); onClose(); }}
          />
          <NavItem
            icon="search"
            label="Search Medicines"
            active={pathname === '/search_medicine'}
            onPress={() => { router.push('/search_medicine'); onClose(); }}
          />
          <NavItem
            icon="shopping-cart"
            label="My Cart"
            active={pathname === '/cart'}
            onPress={() => { router.push('/cart'); onClose(); }}
          />
          <NavItem
            icon="clock"
            label="My Orders"
            active={pathname === '/orders'}
            onPress={() => { router.push('/orders'); onClose(); }}
          />
          <NavItem
            icon="upload"
            label="Prescriptions"
            active={pathname === '/prescriptions'}
            onPress={() => { router.push('/prescriptions' as any); onClose(); }}
          />
          <NavItem
            icon="settings"
            label="Settings"
            active={pathname === '/settings'}
            onPress={() => { router.push('/settings' as any); onClose(); }}
          />
        </View>

        <View style={{ flex: 1 }} />

        {/* User Footer */}
        <View style={SidebarStyles.footer}>
          <View style={SidebarStyles.userInfo}>
            <View style={SidebarStyles.avatar}>
              <Text style={SidebarStyles.avatarText}>{user?.displayName?.charAt(0) || 'U'}</Text>
            </View>
            <View>
              <Text style={SidebarStyles.userName} numberOfLines={1}>{user?.displayName || 'User'}</Text>
              <Text style={SidebarStyles.userEmail} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>

          <Pressable style={SidebarStyles.signOutBtn} onPress={signOutUser}>
            <Feather name="log-out" size={18} color="#94A3B8" />
            <Text style={SidebarStyles.signOutText}>Sign Out</Text>
            <View style={{ flex: 1 }} />
            <Feather name="arrow-right" size={16} color="#94A3B8" />
          </Pressable>
        </View>

      </Animated.View>
    </View>
  );
}

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onPress?: () => void;
}

function NavItem({ icon, label, active = false, onPress }: NavItemProps) {
  return (
    <Pressable style={[SidebarStyles.navItem, active && SidebarStyles.navItemActive]} onPress={onPress}>
      <Feather name={icon} size={20} color={active ? Palette.surface : '#94A3B8'} />
      <Text style={[SidebarStyles.navItemText, active && SidebarStyles.navItemTextActive]}>{label}</Text>
      {active && <Feather name="chevron-right" size={18} color={Palette.surface} style={{ marginLeft: 'auto' }} />}
    </Pressable>
  );
}

const SidebarStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sidebarContainer: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: '#1E40AF', // Deep blue from screenshot
    paddingTop: 50,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    color: Palette.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  logoSubtitle: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 8,
  },
  portalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 30,
  },
  portalText: {
    color: Palette.surface,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  navHeader: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  navLinks: {
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 16,
  },
  navItemActive: {
    backgroundColor: '#3B82F6',
  },
  navItemText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
  },
  navItemTextActive: {
    color: Palette.surface,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 40,
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Palette.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  userName: {
    color: Palette.surface,
    fontSize: 15,
    fontWeight: '600',
  },
  userEmail: {
    color: '#93C5FD',
    fontSize: 12,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2563EB',
    gap: 12,
  },
  signOutText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});