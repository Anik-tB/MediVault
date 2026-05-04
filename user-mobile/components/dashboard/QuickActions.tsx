import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';

export function QuickActions() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <Text style={styles.sectionSubtitle}>Common operations</Text>

      <View style={styles.buttonsList}>
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
        />
        <ActionButton
          icon="clock"
          title="Order History"
          subtitle="4 total"
          bgColor="#334155" // Dark Gray
        />
      </View>
    </View>
  );
}

function ActionButton({ icon, title, subtitle, bgColor, onPress }: any) {
  return (
    <Pressable
      style={[styles.actionBtn, { backgroundColor: bgColor }]}
      onPress={onPress}
    >
      <Feather name={icon} size={22} color={Palette.surface} />
      <View style={styles.btnTextContainer}>
        <Text style={styles.btnTitle}>{title}</Text>
        <Text style={styles.btnSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="arrow-right" size={18} color={Palette.surface} style={styles.arrow} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
