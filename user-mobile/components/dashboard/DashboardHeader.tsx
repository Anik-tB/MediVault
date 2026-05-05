import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';

interface DashboardHeaderProps {
  onOpenSidebar: () => void;
  title?: string;
}

export function DashboardHeader({ onOpenSidebar, title = 'Dashboard' }: DashboardHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const initial = user?.displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Pressable onPress={onOpenSidebar} style={styles.iconBtn}>
          <Feather name="menu" size={24} color={Palette.text} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.right}>
        <Pressable style={styles.iconBtn}>
          <Feather name="bell" size={24} color={Palette.textSoft} />
          <View style={styles.badge} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.avatar, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push('/profile' as any)}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
