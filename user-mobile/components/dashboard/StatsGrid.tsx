import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';

export function StatsGrid() {
  return (
    <View style={styles.container}>
      <StatCard 
        icon="clock" 
        value="2" 
        label="Active Orders" 
        iconColor="#F59E0B" // Orange
        iconBg="#FEF3C7" 
      />
      <StatCard 
        icon="shopping-cart" 
        value="0" 
        label="Cart Items" 
        iconColor="#3B82F6" // Blue
        iconBg="#DBEAFE" 
      />
      <StatCard 
        icon="file-text" 
        value="2" 
        label="Pending Rx" 
        iconColor="#8B5CF6" // Purple
        iconBg="#EDE9FE" 
      />
      <StatCard 
        icon="link" 
        value="7" 
        label="Medicines Available" 
        iconColor="#10B981" // Green
        iconBg="#D1FAE5" 
      />
    </View>
  );
}

function StatCard({ icon, value, label, iconColor, iconBg }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>
        <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14, // 20 minus half of gap
    marginTop: 20,
  },
  card: {
    width: '50%',
    padding: 6, // creates a 12px gap between cards
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
