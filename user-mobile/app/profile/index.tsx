import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette } from '@/constants/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAuth } from '@/hooks/use-auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
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

  const initial = user?.displayName?.charAt(0).toUpperCase() || 'U';
  const name = user?.displayName || 'User';
  const email = user?.email || 'user@example.com';

  return (
    <View style={styles.container}>
      <DashboardHeader title="Profile" onOpenSidebar={toggleSidebar} />

      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Hero Section */}
        <LinearGradient
          colors={['#2563EB', '#1D4ED8']}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{initial}</Text>
              <Pressable style={styles.editAvatarBtn}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Verified Member</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Info Cards */}
        <View style={styles.cardsContainer}>
          
          {/* Personal Information */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              <Pressable onPress={() => router.push('/settings' as any)}>
                <Feather name="edit-2" size={16} color="#64748B" />
              </Pressable>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Feather name="user" size={18} color="#94A3B8" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{name}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Feather name="mail" size={18} color="#94A3B8" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Feather name="phone" size={18} color="#94A3B8" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>+1 (555) 123-4567</Text>
              </View>
            </View>
          </View>

          {/* Medical Summary */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Medical Summary</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Feather name="activity" size={18} color="#94A3B8" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Blood Group</Text>
                <Text style={styles.infoValue}>O Positive (O+)</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Feather name="alert-circle" size={18} color="#94A3B8" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Allergies</Text>
                <Text style={styles.infoValue}>Penicillin, Peanuts</Text>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.actionCard}>
            <Pressable style={styles.actionRow} onPress={() => router.push('/settings' as any)}>
              <View style={styles.actionIconBox}>
                <Feather name="settings" size={18} color="#2563EB" />
              </View>
              <Text style={styles.actionText}>Account Settings</Text>
              <Feather name="chevron-right" size={20} color="#CBD5E1" />
            </Pressable>
            
            <View style={styles.dividerLight} />
            
            <Pressable style={styles.actionRow}>
              <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="log-out" size={18} color="#EF4444" />
              </View>
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Sign Out</Text>
              <Feather name="chevron-right" size={20} color="#CBD5E1" />
            </Pressable>
          </View>

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
    paddingBottom: 40,
  },
  heroGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
    position: 'relative',
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E3A8A',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#BFDBFE',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 24,
  },
  infoCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
});
