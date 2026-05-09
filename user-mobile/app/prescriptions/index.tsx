import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { fetchPrescriptions, Prescription, PrescriptionStats } from '@/services/prescriptions';

function formatPrescriptionStatus(status: string) {
  if (status === 'submitted') {
    return {
      label: 'Pending Review',
      backgroundColor: '#FEF3C7',
      textColor: '#B45309',
      dotColor: '#F59E0B',
    };
  }

  if (status === 'approved') {
    return {
      label: 'Approved',
      backgroundColor: '#D1FAE5',
      textColor: '#047857',
      dotColor: '#10B981',
    };
  }

  if (status === 'rejected') {
    return {
      label: 'Rejected',
      backgroundColor: '#FEE2E2',
      textColor: '#B91C1C',
      dotColor: '#EF4444',
    };
  }

  return {
    label: 'Under Review',
    backgroundColor: '#EDE9FE',
    textColor: '#6D28D9',
    dotColor: '#8B5CF6',
  };
}

const emptyStats: PrescriptionStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

import * as DocumentPicker from 'expo-document-picker';

export default function PrescriptionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { initializing, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [stats, setStats] = useState<PrescriptionStats>(emptyStats);
  const [loadError, setLoadError] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files = result.assets.map(file => ({
          fileName: file.name,
          fileType: file.mimeType || 'application/octet-stream',
          fileSizeBytes: file.size ? file.size.toString() : '0',
          fileUri: file.uri,
        }));
        
        router.push({
          pathname: '/prescriptions/preview',
          params: {
            files: JSON.stringify(files),
            from: params.from as string,
          }
        });
      }
    } catch (err) {
      console.log('Error picking document', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!initializing && !user) {
        router.replace('/');
        return () => {
          isActive = false;
        };
      }

      if (!user) {
        return () => {
          isActive = false;
        };
      }

      (async () => {
        try {
          const data = await fetchPrescriptions();

          if (!isActive) {
            return;
          }

          setPrescriptions(data.prescriptions);
          setStats(data.stats);
          setLoadError('');
        } catch (error) {
          if (!isActive) {
            return;
          }

          setPrescriptions([]);
          setStats(emptyStats);
          setLoadError(
            error instanceof Error ? error.message : 'Failed to load prescription history.'
          );
        }
      })();

      return () => {
        isActive = false;
      };
    }, [initializing, router, user])
  );

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

  if (initializing || !user) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <DashboardHeader title="Prescriptions" onOpenSidebar={toggleSidebar} />

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Upload Prescription</Text>
          <Text style={styles.pageSubtitle}>
            Submit a valid prescription for Rx medicines and keep your recent submissions in one
            place.
          </Text>
        </View>

        <View style={styles.stepperCard}>
          <View style={styles.stepperContainer}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Feather name="upload-cloud" size={20} color="#2563EB" />
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepCircle}>
              <Feather name="file-text" size={20} color="#94A3B8" />
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepCircle}>
              <Feather name="shield" size={20} color="#94A3B8" />
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard label="Pending" value={stats.pending} accentColor="#F59E0B" />
          <SummaryCard label="Approved" value={stats.approved} accentColor="#10B981" />
          <SummaryCard label="Rejected" value={stats.rejected} accentColor="#EF4444" />
        </View>

        <View style={styles.uploadCard}>
          <Pressable
            style={styles.uploadDashedArea}
            onPress={handlePickDocument}>
            <View style={styles.uploadIconWrapper}>
              <Feather name="upload-cloud" size={32} color="#2563EB" />
            </View>
            <Text style={styles.uploadTitle}>Prepare{'\n'}your{'\n'}prescription</Text>
            <Text style={styles.uploadSubtitle}>
              Continue to the review step before submitting
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
                <Text style={styles.uploadInfoText}>Secure{'\n'}submit</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {loadError ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>{loadError}</Text>
          </View>
        ) : null}

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>RECENT SUBMISSIONS</Text>

          {prescriptions.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Feather name="file-text" size={22} color="#CBD5E1" />
              <Text style={styles.emptyHistoryText}>No prescriptions submitted yet</Text>
            </View>
          ) : (
            prescriptions.slice(0, 3).map((prescription, index) => {
              const status = formatPrescriptionStatus(prescription.status);
              const createdAt = new Date(prescription.createdAt).toLocaleDateString('en-CA');

              return (
                <View
                  key={prescription.id}
                  style={[
                    styles.historyRow,
                    index !== Math.min(prescriptions.length, 3) - 1 && styles.historyRowBorder,
                  ]}>
                  <View style={styles.historyIcon}>
                    <Feather name="image" size={18} color="#2563EB" />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyName}>{prescription.fileName}</Text>
                    <Text style={styles.historyMeta}>
                      {prescription.trackingId} | {createdAt}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.dotColor }]} />
                    <Text style={[styles.statusText, { color: status.textColor }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>PRESCRIPTION GUIDELINES</Text>

          <View style={styles.guidelineItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.guidelineText}>Must be issued by a licensed physician</Text>
          </View>

          <View style={styles.guidelineItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.guidelineText}>Document should be recent and clearly visible</Text>
          </View>

          <View style={styles.guidelineItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.guidelineText}>Patient name should match your account</Text>
          </View>

          <View style={styles.guidelineItem}>
            <Feather name="alert-circle" size={18} color="#F59E0B" />
            <Text style={styles.guidelineText}>Altered prescriptions will be rejected</Text>
          </View>
        </View>
      </ScrollView>

      {isSidebarOpen ? (
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} slideAnim={slideAnim} />
      ) : null}
    </View>
  );
}

function SummaryCard({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: number;
  accentColor: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color: accentColor }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
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
    marginBottom: 16,
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
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
    textAlign: 'center',
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
  noticeCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
  },
  noticeText: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
  },
  historyCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 16,
  },
  emptyHistory: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
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
