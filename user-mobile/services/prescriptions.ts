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
};

export async function fetchPrescriptions() {
  return fetchAuthenticatedJson<PrescriptionsResponse>('/prescriptions');
}

export async function submitPrescription(payload: SubmitPrescriptionInput) {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On Web, we must fetch the blob from the blob URL and append it
    const response = await fetch(payload.fileUri);
    const blob = await response.blob();
    formData.append('prescription', blob, payload.fileName);
  } else {
    // On Native, we can pass the object with the uri
    formData.append('prescription', {
      uri: payload.fileUri,
      name: payload.fileName,
      type: payload.fileType,
    } as any);
  }

  const response = await fetchAuthenticatedJson<CreatePrescriptionResponse>('/prescriptions', {
    method: 'POST',
    body: formData,
  });

  return response.prescription;
}
