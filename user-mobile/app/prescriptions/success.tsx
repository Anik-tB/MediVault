import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function PrescriptionsSuccessScreen() {
  const router = useRouter();
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

  return (
    <View style={styles.container}>
      <DashboardHeader title="Prescriptions" onOpenSidebar={toggleSidebar} />
      
      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Feather name="check-circle" size={16} color="#059669" />
          <Text style={styles.successBannerText}>Prescription submitted for pharmacist validation!</Text>
        </View>

        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Upload Prescription</Text>
          <Text style={styles.pageSubtitle}>
            Submit a valid prescription for Rx medicines — reviewed by our pharmacists
          </Text>
        </View>

        {/* Stepper Card */}
        <View style={styles.stepperCard}>
          <View style={styles.stepperContainer}>
            {/* Step 1 - Completed */}
            <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
              <Feather name="check-circle" size={20} color="#FFFFFF" />
            </View>
            
            {/* Divider 1 - Active */}
            <View style={[styles.stepDivider, styles.stepDividerActive]} />
            
            {/* Step 2 - Completed */}
            <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
              <Feather name="check-circle" size={20} color="#FFFFFF" />
            </View>
            
            {/* Divider 2 - Active */}
            <View style={[styles.stepDivider, styles.stepDividerActive]} />
            
            {/* Step 3 - Active */}
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Feather name="shield" size={20} color="#2563EB" />
            </View>
          </View>
        </View>

        {/* Success Card */}
        <View style={styles.successCard}>
          <View style={styles.successIconWrapper}>
            <Feather name="shield" size={36} color="#10B981" />
          </View>
          
          <Text style={styles.successTitle}>Prescription Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your prescription has been sent to our pharmacist team for review. You'll be notified within 1-2 business hours.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoIconBox}>
              <Feather name="clock" size={20} color="#2563EB" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoTitle}>Review in progress</Text>
              <Text style={styles.infoSubtitle}>Expected: 1-2 business hours</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <Pressable style={styles.uploadAnotherBtn} onPress={() => router.push('/prescriptions' as any)}>
              <Text style={styles.uploadAnotherText}>Upload{'\n'}Another</Text>
            </Pressable>
            
            <Pressable style={styles.goToOrdersBtn} onPress={() => router.push('/orders' as any)}>
              <Text style={styles.goToOrdersText}>Go to{'\n'}Orders</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
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
    paddingHorizontal: 20,
    paddingTop: 16, // Reduced slightly to accommodate banner
    paddingBottom: 40,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  successBannerText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
  },
  headerSection: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: Palette.textSoft,
    lineHeight: 22,
  },
  stepperCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepCircleActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  stepCircleCompleted: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  stepDivider: {
    height: 2,
    flex: 1,
    maxWidth: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  stepDividerActive: {
    backgroundColor: '#2563EB',
  },
  successCard: {
    backgroundColor: Palette.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 32,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextBox: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  uploadAnotherBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadAnotherText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  goToOrdersBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    flexDirection: 'row',
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  goToOrdersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
