import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function PrescriptionsScreen() {
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
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Upload Prescription</Text>
          <Text style={styles.pageSubtitle}>
            Submit a valid prescription for Rx medicines — reviewed by our pharmacists
          </Text>
        </View>

        {/* Stepper Card */}
        <View style={styles.stepperCard}>
          <View style={styles.stepperContainer}>
            {/* Step 1 - Active */}
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Feather name="upload-cloud" size={20} color="#2563EB" />
            </View>
            
            {/* Divider */}
            <View style={styles.stepDivider} />
            
            {/* Step 2 - Inactive */}
            <View style={styles.stepCircle}>
              <Feather name="file-text" size={20} color="#94A3B8" />
            </View>
            
            {/* Divider */}
            <View style={styles.stepDivider} />
            
            {/* Step 3 - Inactive */}
            <View style={styles.stepCircle}>
              <Feather name="shield" size={20} color="#94A3B8" />
            </View>
          </View>
        </View>

        {/* Upload Area Card */}
        <View style={styles.uploadCard}>
          <Pressable style={styles.uploadDashedArea} onPress={() => router.push('/prescriptions/preview' as any)}>
            <View style={styles.uploadIconWrapper}>
              <Feather name="upload-cloud" size={32} color="#2563EB" />
            </View>
            <Text style={styles.uploadTitle}>Drag & drop{'\n'}your{'\n'}prescription</Text>
            <Text style={styles.uploadSubtitle}>
              or <Text style={styles.browseText}>browse from your device</Text>
            </Text>

            <View style={styles.uploadInfoRow}>
              <View style={styles.uploadInfoItem}>
                <Feather name="check-circle" size={12} color="#10B981" />
                <Text style={styles.uploadInfoText}>JPG,{'\n'}PNG,{'\n'}PDF</Text>
              </View>
              <View style={styles.uploadInfoItem}>
                <Feather name="clock" size={12} color="#F59E0B" />
                <Text style={styles.uploadInfoText}>Max{'\n'}5 MB</Text>
              </View>
              <View style={styles.uploadInfoItem}>
                <Feather name="shield" size={12} color="#2563EB" />
                <Text style={styles.uploadInfoText}>Secure{'\n'}upload</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Guidelines Card */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>PRESCRIPTION GUIDELINES</Text>
          
          <View style={styles.guidelineItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.guidelineText}>Must be issued by a licensed physician</Text>
          </View>
          
          <View style={styles.guidelineItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.guidelineText}>Document must be within 30 days of issue</Text>
          </View>
          
          <View style={styles.guidelineItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.guidelineText}>Patient name must match your profile</Text>
          </View>
          
          <View style={styles.guidelineItem}>
            <Feather name="alert-circle" size={18} color="#F59E0B" />
            <Text style={styles.guidelineText}>Altered prescriptions will be rejected</Text>
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
    paddingTop: 24,
    paddingBottom: 40,
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
  stepDivider: {
    height: 2,
    flex: 1,
    maxWidth: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  uploadCard: {
    backgroundColor: Palette.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  uploadDashedArea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  uploadIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.text,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  uploadSubtitle: {
    fontSize: 15,
    color: Palette.textSoft,
    marginBottom: 32,
  },
  browseText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  uploadInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  uploadInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadInfoText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  guidelinesCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  guidelinesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  guidelineText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});
