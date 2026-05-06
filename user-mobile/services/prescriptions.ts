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
  storageUrl?: string;
};

export async function fetchPrescriptions() {
  return fetchAuthenticatedJson<PrescriptionsResponse>('/prescriptions');
}

export async function submitPrescription(payload: SubmitPrescriptionInput) {
  const response = await fetchAuthenticatedJson<CreatePrescriptionResponse>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.prescription;
}
