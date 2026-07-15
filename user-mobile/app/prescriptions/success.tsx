import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Palette } from '@/constants/theme';
import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { reserveForPickup } from '@/services/orders';

function readParam(value: string | string[] | undefined, fallback = '') {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default function PrescriptionsSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const prescriptionId = readParam(params.prescriptionId, 'Pending');
  const errorMessage = readParam(params.errorMessage);
  const from = readParam(params.from);
  const isErrorState = Boolean(errorMessage);

  const [isReserving, setIsReserving] = useState(false);
  const [isOrderReserved, setIsOrderReserved] = useState(false);
  const [reserveError, setReserveError] = useState('');

  // Function to reserve the prescription for pickup if it was uploaded from the cart
  const handleReserve = async () => {
    try {
      setIsReserving(true);
      setReserveError('');
      await reserveForPickup();
      setIsOrderReserved(true);
    } catch (err: any) {
      setReserveError(err.message || 'Failed to reserve pickup. Please try again.');
    } finally {
      setIsReserving(false);
    }
  };

  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? 0 : 1;
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }

    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    });
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Prescriptions" onOpenSidebar={toggleSidebar} />

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Top Banner showing success or error state */}
        <View style={[styles.successBanner, isErrorState && styles.errorBanner]}>
          <Feather
            name={isErrorState ? 'alert-circle' : 'check-circle'}
            size={16}
            color={isErrorState ? '#B91C1C' : '#059669'}
          />
          <Text style={[styles.successBannerText, isErrorState && styles.errorBannerText]}>
            {isErrorState
              ? 'Prescription submission could not be completed.'
              : 'Prescription submitted for pharmacist validation!'}
          </Text>
        </View>

        {/* Page Header describing the outcome */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>
            {isErrorState ? 'Prescription Not Submitted' : 'Prescription Submitted'}
          </Text>
          <Text style={styles.pageSubtitle}>
            {isErrorState
              ? 'Return to the upload step and try again.'
              : 'Your prescription is now stored in your account for future order checks.'}
          </Text>
        </View>

        {/* Stepper UI showing the final progress (Step 3: Success) */}
        <View style={styles.stepperCard}>
          <View style={styles.stepperContainer}>
            <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
              <Feather name="check-circle" size={20} color="#FFFFFF" />
            </View>
            <View style={[styles.stepDivider, styles.stepDividerActive]} />
            <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
              <Feather name="check-circle" size={20} color="#FFFFFF" />
            </View>
            <View style={[styles.stepDivider, styles.stepDividerActive]} />
            <View
              style={[
                styles.stepCircle,
                isErrorState ? styles.stepCircleError : styles.stepCircleActive,
              ]}>
              <Feather
                name={isErrorState ? 'alert-circle' : 'shield'}
                size={20}
                color={isErrorState ? '#B91C1C' : '#0D9488'}
              />
            </View>
          </View>
        </View>

        {/* Main Card showing status, tracking info, and action buttons */}
        <View style={styles.successCard}>
          <View
            style={[
              styles.successIconWrapper,
              isErrorState && styles.successIconWrapperError,
            ]}>
            <Feather
              name={isErrorState ? 'alert-circle' : 'shield'}
              size={36}
              color={isErrorState ? '#EF4444' : '#10B981'}
            />
          </View>

          <Text style={styles.successTitle}>
            {isErrorState ? 'Submission Failed' : isOrderReserved ? 'Order Confirmed!' : 'Prescription Stored'}
          </Text>
          <Text style={styles.successSubtitle}>
            {isErrorState
              ? errorMessage
              : isOrderReserved
              ? 'Your pickup order has been successfully placed and is pending preparation.'
              : 'Your prescription has been recorded and can now be referenced during future pickup reservations.'}
          </Text>

          {/* Info Box showing the tracking reference ID or next steps */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconBox}>
              <Feather
                name={isErrorState ? 'info' : 'hash'}
                size={20}
                color={isErrorState ? '#EF4444' : '#0D9488'}
              />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoTitle}>
                {isErrorState ? 'What to do next' : 'Tracking reference'}
              </Text>
              <Text style={styles.infoSubtitle}>
                {isErrorState ? 'Check the preview step and submit again.' : prescriptionId}
              </Text>
            </View>
          </View>

          {reserveError ? (
            <Text style={{color: '#EF4444', textAlign: 'center', marginBottom: 16}}>{reserveError}</Text>
          ) : null}

          {/* Bottom buttons to upload another, reserve, or go to orders */}
          <View style={styles.actionButtonsRow}>
            {from !== 'cart' && !isErrorState && !isOrderReserved ? (
              <>
                <Pressable
                  style={styles.uploadAnotherBtn}
                  onPress={() => router.push('/prescriptions' as any)}>
                  <Text style={styles.uploadAnotherText}>Upload Another</Text>
                </Pressable>

                <Pressable
                  style={[styles.goToOrdersBtn, isReserving && {opacity: 0.7}]}
                  onPress={handleReserve}
                  disabled={isReserving}>
                  {isReserving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.goToOrdersText}>Reserve for Pickup</Text>
                      <Feather name="arrow-right" size={16} color="#FFFFFF" />
                    </>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                {!isOrderReserved && (
                  <Pressable
                    style={styles.uploadAnotherBtn}
                    onPress={() => router.push('/prescriptions' as any)}>
                    <Text style={styles.uploadAnotherText}>
                      {isErrorState ? 'Try Again' : 'Upload Another'}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={[styles.goToOrdersBtn, isOrderReserved && {width: '100%'}]}
                  onPress={() => router.push((from === 'cart' ? '/cart?prescriptionUploaded=true' : '/orders') as any)}>
                  <Text style={styles.goToOrdersText}>{from === 'cart' ? 'Return to Cart' : 'Go to Orders'}</Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" />
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {isSidebarOpen ? (
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} slideAnim={slideAnim} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Layout Styles
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  // Top Alert Banner Styles
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
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  successBannerText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
  },
  errorBannerText: {
    color: '#B91C1C',
  },
  // Header Section Styles
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
  // Stepper Progress UI Styles
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
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  stepCircleCompleted: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  stepCircleError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  stepDivider: {
    height: 2,
    flex: 1,
    maxWidth: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  stepDividerActive: {
    backgroundColor: '#0D9488',
  },
  // Main Success/Error Card Styles
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
  successIconWrapperError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
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
  // Tracking Info Box Styles
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
    backgroundColor: '#F0FDFA',
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
  // Bottom Action Buttons Styles
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
    backgroundColor: '#0D9488',
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
