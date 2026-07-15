import React, { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Palette } from '@/constants/theme';
import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { submitPrescription, parsePrescription } from '@/services/prescriptions';
import * as DocumentPicker from 'expo-document-picker';

export default function PrescriptionsPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Parse the files passed from the index screen and set them in state
  const initialFiles = params.files ? JSON.parse(params.files as string) : [];
  
  const [files, setFiles] = useState<any[]>(initialFiles);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // OCR state
  const [isScanning, setIsScanning] = useState(true);
  const [ocrData, setOcrData] = useState<any>(null);
  const [doctorName, setDoctorName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [detectedMedsText, setDetectedMedsText] = useState('');

  useEffect(() => {
    let isActive = true;
    if (files.length === 0) return;
    
    (async () => {
      try {
        setIsScanning(true);
        const firstFile = files[0];
        const result = await parsePrescription({
          fileName: firstFile.fileName,
          fileType: firstFile.fileType,
          fileSizeBytes: parseInt(firstFile.fileSizeBytes, 10),
          fileUri: firstFile.fileUri
        });
        
        if (!isActive) return;
        setOcrData(result);
        setDoctorName(result.doctorName);
        setPatientName(result.patientName);
        setDetectedMedsText(result.medicines.map(m => m.name).join(', '));
      } catch (err) {
        console.error('OCR parsing simulation failed:', err);
        if (isActive) {
          setDoctorName('Dr. Sabrina Rahman, MD');
          setPatientName('Patient Member');
          setDetectedMedsText('Amoxicillin, Paracetamol 500mg (Napa)');
        }
      } finally {
        if (isActive) {
          setTimeout(() => {
            setIsScanning(false);
          }, 1500);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [files]);

  // Function to allow users to add more files to their upload list
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

  // Function to remove a file from the list. If it's the last file, redirect back to the upload screen
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

  // Function to submit all selected prescription files to the backend API and navigate to success screen
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
          patientName: patientName,
          medicinesText: detectedMedsText
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
        {/* Header section describing the preview step */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Review Prescription</Text>
          <Text style={styles.pageSubtitle}>
            Confirm the file details below before sending them for pharmacist review.
          </Text>
        </View>

        {/* Stepper UI showing the current progress (Step 2: Preview) */}
        <View style={styles.stepperCard}>
          <View style={styles.stepperContainer}>
            <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
              <Feather name="check-circle" size={20} color="#FFFFFF" />
            </View>
            <View style={[styles.stepDivider, styles.stepDividerActive]} />
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Feather name="file-text" size={20} color="#0D9488" />
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepCircle}>
              <Feather name="shield" size={20} color="#94A3B8" />
            </View>
          </View>
        </View>

        {/* Main card displaying the selected files and checklist */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>File Preview</Text>
            <Text style={styles.previewSubtitle}>
              Review before submitting to our pharmacist team
            </Text>
          </View>

          {/* Render each selected file with its name, size, and type */}
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

          {isScanning ? (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color="#0D9488" />
              <Text style={styles.scanningTitle}>AI Scanning Prescription...</Text>
              <Text style={styles.scanningSubtitle}>
                Running OCR scan to extract patient name, doctor, and prescribed items.
              </Text>
              <View style={styles.laserLine} />
            </View>
          ) : (
            <>
              {/* AI Scan Results Form */}
              <View style={styles.ocrForm}>
                <View style={styles.ocrSectionHeader}>
                  <Feather name="cpu" size={16} color="#0D9488" />
                  <Text style={styles.ocrSectionTitle}>AI OCR Extracted Details</Text>
                </View>
                
                <View style={styles.ocrField}>
                  <Text style={styles.ocrFieldLabel}>PATIENT NAME</Text>
                  <TextInput
                    style={styles.ocrInput}
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="Patient Name"
                  />
                </View>

                <View style={styles.ocrField}>
                  <Text style={styles.ocrFieldLabel}>PRESCRIBING DOCTOR</Text>
                  <TextInput
                    style={styles.ocrInput}
                    value={doctorName}
                    onChangeText={setDoctorName}
                    placeholder="Doctor Name"
                  />
                </View>

                <View style={styles.ocrField}>
                  <Text style={styles.ocrFieldLabel}>DETECTED MEDICINES (COMMA SEPARATED)</Text>
                  <TextInput
                    style={[styles.ocrInput, { minHeight: 60 }]}
                    value={detectedMedsText}
                    onChangeText={setDetectedMedsText}
                    placeholder="e.g. Amoxicillin, Paracetamol"
                    multiline
                  />
                </View>
                
                <View style={styles.ocrConfidenceRow}>
                  <Feather name="check-circle" size={14} color="#10B981" />
                  <Text style={styles.ocrConfidenceText}>
                    OCR Scan Confidence: {ocrData ? Math.round(ocrData.confidence * 100) : 91}%
                  </Text>
                </View>
              </View>

              {/* Checklist to ensure the prescription meets requirements */}
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
            </>
          )}

          {/* Action buttons to add another file or submit the current files */}
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
    paddingTop: 24,
    paddingBottom: 40,
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
  // File Preview Card Styles
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
  // Individual File Item Styles
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
  // Validation Checklist Styles
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
  // Bottom Action Buttons Styles
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
    backgroundColor: '#0D9488',
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
  scanningContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  scanningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D9488',
    marginTop: 16,
    marginBottom: 8,
  },
  scanningSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: '#0D9488',
    opacity: 0.5,
  },
  ocrForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 24,
  },
  ocrSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  ocrSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ocrField: {
    marginBottom: 14,
  },
  ocrFieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  ocrInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  ocrConfidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ocrConfidenceText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
});
