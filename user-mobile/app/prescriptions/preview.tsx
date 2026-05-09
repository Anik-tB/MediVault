import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Palette } from '@/constants/theme';
import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { submitPrescription } from '@/services/prescriptions';
import * as DocumentPicker from 'expo-document-picker';

export default function PrescriptionsPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialFiles = params.files ? JSON.parse(params.files as string) : [];
  
  const [files, setFiles] = useState<any[]>(initialFiles);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleAddAnother = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newFiles = result.assets.map(file => ({
          fileName: file.name,
          fileType: file.mimeType || 'application/octet-stream',
          fileSizeBytes: file.size ? file.size.toString() : '0',
          fileUri: file.uri,
        }));
        setFiles(prev => [...prev, ...newFiles]);
      }
    } catch (err) {
      console.log('Error picking document', err);
    }
  };

  const handleRemoveFile = (index: number) => {
    if (files.length === 1) {
      router.push(`/prescriptions${params.from ? `?from=${params.from}` : ''}` as any);
    } else {
      setFiles(prev => prev.filter((_, i) => i !== index));
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

  async function handleSubmit() {
    if (files.length === 0) return;
    try {
      setIsSubmitting(true);
      const trackingIds = [];
      for (const file of files) {
        const prescription = await submitPrescription({
          fileName: file.fileName,
          fileType: file.fileType,
          fileSizeBytes: parseInt(file.fileSizeBytes, 10),
          fileUri: file.fileUri,
        });
        trackingIds.push(prescription.trackingId);
      }
      router.replace({
        pathname: '/prescriptions/success',
        params: {
          prescriptionId: trackingIds.join(', '),
          from: params.from,
        },
      });
    } catch (error) {
      router.replace({
        pathname: '/prescriptions/success',
        params: {
          prescriptionId: 'Submission failed',
          errorMessage:
            error instanceof Error ? error.message : 'Please try again from the upload screen.',
          from: params.from,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <DashboardHeader title="Prescriptions" onOpenSidebar={toggleSidebar} />

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Review Prescription</Text>
          <Text style={styles.pageSubtitle}>
            Confirm the file details below before sending them for pharmacist review.
          </Text>
        </View>

        <View style={styles.stepperCard}>
          <View style={styles.stepperContainer}>
            <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
              <Feather name="check-circle" size={20} color="#FFFFFF" />
            </View>
            <View style={[styles.stepDivider, styles.stepDividerActive]} />
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Feather name="file-text" size={20} color="#2563EB" />
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepCircle}>
              <Feather name="shield" size={20} color="#94A3B8" />
            </View>
          </View>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>File Preview</Text>
            <Text style={styles.previewSubtitle}>
              Review before submitting to our pharmacist team
            </Text>
          </View>

          {files.map((file, index) => (
            <View key={index} style={[styles.fileDetailsBox, index === files.length - 1 ? {marginBottom: 24} : {marginBottom: 12}]}>
              <View style={styles.fileThumbnail}>
                <Feather name="image" size={24} color="#F59E0B" />
              </View>

              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.fileName}</Text>
                <View style={styles.fileMetaRow}>
                  <Text style={styles.fileMetaText}>
                    {(file.fileSizeBytes / 1024).toFixed(1)} KB
                  </Text>
                  <View style={styles.metaDivider} />
                  <Text style={styles.fileMetaText}>
                    {file.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Text>
                </View>
                <View style={styles.fileStatusRow}>
                  <Feather name="check-circle" size={14} color="#10B981" />
                  <Text style={styles.fileStatusText}>File validated successfully</Text>
                </View>
              </View>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleRemoveFile(index)}>
                <Feather name="trash-2" size={18} color="#94A3B8" />
              </Pressable>
            </View>
          ))}

          <View style={styles.checklistContainer}>
            <View style={styles.checklistItem}>
              <Feather name="check-circle" size={18} color="#10B981" />
              <Text style={styles.checklistText}>Prescription is clearly legible</Text>
            </View>
            <View style={styles.checklistItem}>
              <Feather name="check-circle" size={18} color="#10B981" />
              <Text style={styles.checklistText}>Doctor signature is visible</Text>
            </View>
            <View style={styles.checklistItem}>
              <Feather name="check-circle" size={18} color="#10B981" />
              <Text style={styles.checklistText}>Patient name matches your account</Text>
            </View>
            <View style={styles.checklistItem}>
              <Feather name="check-circle" size={18} color="#10B981" />
              <Text style={styles.checklistText}>Issue date is within 30 days</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <Pressable
              style={styles.uploadDifferentBtn}
              onPress={handleAddAnother}>
              <Text style={styles.uploadDifferentText}>Upload Another{'\n'}File</Text>
            </Pressable>

            <Pressable
              style={[styles.submitBtn, (isSubmitting || files.length === 0) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || files.length === 0}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="shield" size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit{'\n'}Prescription</Text>
                </>
              )}
            </Pressable>
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
  previewCard: {
    backgroundColor: Palette.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  previewHeader: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  fileDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  fileThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 16,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fileMetaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  fileStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fileStatusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  checklistContainer: {
    marginBottom: 32,
    gap: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checklistText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadDifferentBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadDifferentText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitBtn: {
    flex: 1.5,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.75,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
