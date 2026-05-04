import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

const { width, height } = Dimensions.get('window');

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
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.sidebarContainer,
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
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Feather name="activity" size={20} color={Palette.surface} />
            </View>
            <View>
              <Text style={styles.logoTitle}>MediVault</Text>
              <Text style={styles.logoSubtitle}>DISPENSARY</Text>
            </View>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={24} color={Palette.surface} />
          </Pressable>
        </View>

        <Pressable style={styles.portalBtn}>
          <Feather name="user" size={18} color={Palette.surface} />
          <Text style={styles.portalText}>PATIENT PORTAL</Text>
        </Pressable>

        <Text style={styles.navHeader}>NAVIGATION</Text>

        <View style={styles.navLinks}>
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
          <NavItem icon="settings" label="Settings" onPress={() => {}} />
        </View>

        <View style={{ flex: 1 }} />

        {/* User Footer */}
        <View style={styles.footer}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.userName} numberOfLines={1}>{user?.displayName || 'User'}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>

          <Pressable style={styles.signOutBtn} onPress={signOutUser}>
            <Feather name="log-out" size={18} color="#94A3B8" />
            <Text style={styles.signOutText}>Sign Out</Text>
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
    <Pressable style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
      <Feather name={icon} size={20} color={active ? Palette.surface : '#94A3B8'} />
      <Text style={[styles.navItemText, active && styles.navItemTextActive]}>{label}</Text>
      {active && <Feather name="chevron-right" size={18} color={Palette.surface} style={{ marginLeft: 'auto' }} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
