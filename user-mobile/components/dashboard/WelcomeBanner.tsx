import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';

export function WelcomeBanner() {
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
    <View style={styles.container}>
      <Text style={styles.date}>{dateString}</Text>
      <Text style={styles.greeting}>Good morning, {firstName}! 👋</Text>
      <Text style={styles.subtitle}>
        You have <Text style={styles.bold}>2 active order(s)</Text> and <Text style={styles.bold}>0 item(s)</Text> in your cart.
      </Text>
      
      <Pressable 
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
        onPress={() => router.push('/search_medicine')}
      >
        <Feather name="search" size={18} color="#2563EB" />
        <Text style={styles.buttonText}>Browse Medicines</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2563EB', // Blue matching screenshot
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
    color: '#93C5FD', // Light blue
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
