import { Platform } from 'react-native';

import { fetchAuthenticatedJson } from './api';

export type Prescription = {
  id: number;
  trackingId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  storageUrl: string;
  status: string;
  reviewNotes: string;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  usableForOrders: boolean;
};

export type PrescriptionStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

type PrescriptionsResponse = {
  prescriptions: Prescription[];
  stats: PrescriptionStats;
};

type CreatePrescriptionResponse = {
  message: string;
  prescription: Prescription;
};

export type SubmitPrescriptionInput = {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  fileUri: string;
  patientName?: string;
  patientEmail?: string;
  medicinesText?: string;
};

export type ParsePrescriptionInput = {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  fileUri: string;
};

export type ParsedPrescriptionResult = {
  success: boolean;
  doctorName: string;
  patientName: string;
  prescriptionDate: string;
  confidence: number;
  medicines: Array<{
    name: string;
    rx: boolean;
    confidence: number;
    dosage: string;
    duration: string;
  }>;
};

export async function fetchPrescriptions() {
  return fetchAuthenticatedJson<PrescriptionsResponse>('/prescriptions');
}

export async function parsePrescription(payload: ParsePrescriptionInput): Promise<ParsedPrescriptionResult> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(payload.fileUri);
    const blob = await response.blob();
    formData.append('prescription', blob, payload.fileName);
  } else {
    formData.append('prescription', {
      uri: payload.fileUri,
      name: payload.fileName,
      type: payload.fileType,
    } as any);
  }

  return fetchAuthenticatedJson<ParsedPrescriptionResult>('/prescriptions/parse', {
    method: 'POST',
    body: formData,
  });
}

export async function submitPrescription(payload: SubmitPrescriptionInput) {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(payload.fileUri);
    const blob = await response.blob();
    formData.append('prescription', blob, payload.fileName);
  } else {
    formData.append('prescription', {
      uri: payload.fileUri,
      name: payload.fileName,
      type: payload.fileType,
    } as any);
  }

  if (payload.patientName) formData.append('patientName', payload.patientName);
  if (payload.patientEmail) formData.append('patientEmail', payload.patientEmail);
  if (payload.medicinesText) formData.append('medicinesText', payload.medicinesText);

  const response = await fetchAuthenticatedJson<CreatePrescriptionResponse>('/prescriptions', {
    method: 'POST',
    body: formData,
  });

  return response.prescription;
}
