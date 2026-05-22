export type OrderStatus = 'pending_pickup' | 'ready_for_pickup' | 'completed' | 'rejected';
export type RxStatus = 'pending' | 'approved' | 'rejected';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type Severity = 'mild' | 'moderate' | 'severe';

export type StaffProfile = {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  phone: string;
  department: string;
  role: string;
  isActive: boolean;
  notificationSettings: {
    orderAlerts: boolean;
    lowStockAlerts: boolean;
    expiryAlerts: boolean;
    weeklyReports: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    sidebarDensity: 'compact' | 'default' | 'relaxed';
  };
};

export type DashboardSummary = {
  totalMedicines: number;
  weeklyActivity: number;
  weeklyOrders: number;
  weeklyPrescriptions: number;
  lowStockAlerts: number;
  expiringSoon: number;
  pendingOrders: number;
  pendingPrescriptions: number;
};

export type WeeklyActivity = {
  day: string;
  orders: number;
  prescriptions: number;
};

export type StockAlert = {
  id: number;
  name: string;
  category: string;
  stock: number;
  expiryDate?: string | null;
};

export type RecentOrder = {
  id: number;
  displayId: string;
  patientName: string;
  patientEmail: string;
  medicines: string;
  status: OrderStatus;
  statusLabel: string;
  createdAt: string;
  pickupTime?: string | null;
  itemsCount: number;
  totalAmount: number;
};

export type AdminDashboard = {
  summary: DashboardSummary;
  stockAlerts: StockAlert[];
  recentOrders: RecentOrder[];
  weeklyActivity: WeeklyActivity[];
};

export type Medicine = {
  id: number;
  name: string;
  category: string;
  categoryIcon: string;
  description: string;
  stock: number;
  expiryDate?: string | null;
  rx: boolean;
  certificate: boolean;
  status: StockStatus;
  conflictCount: number;
  price: number;
  doseIntervalDays: number;
};

export type MedicinePayload = {
  name: string;
  category: string;
  description: string;
  stock: number;
  expiryDate: string;
  rx: boolean;
  certificate: boolean;
  price: number;
  doseIntervalDays: number;
};

export type MedicineListResponse = {
  medicines: Medicine[];
  categories: string[];
  stats: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
};

export type OrderItem = {
  id: number;
  medicineId: number;
  name: string;
  quantity: number;
  category: string;
  rx: boolean;
  unitPrice: number;
};

export type Order = RecentOrder & {
  rejectionReason: string;
  totalUnits: number;
  items: OrderItem[];
  prescriptionId?: number;
  prescriptionUrl?: string;
  prescriptionStatus?: string;
};

export type PrescriptionVerificationStatus = 'matched' | 'partial_match' | 'no_match' | 'needs_review';

export type PrescriptionMedicineCheck = {
  orderedName: string;
  present: boolean;
  matchedPrescriptionName: string;
  confidence: number;
  reason: string;
};

export type DetectedPrescriptionMedicine = {
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  notes: string;
};

export type PrescriptionVerificationResult = {
  orderId: number;
  displayId: string;
  prescriptionId: number;
  prescriptionTrackingId: string;
  fileName: string;
  model: string;
  checkedAt: string;
  overallStatus: PrescriptionVerificationStatus;
  confidence: number;
  detectedMedicines: DetectedPrescriptionMedicine[];
  orderedMedicineChecks: PrescriptionMedicineCheck[];
  summary: string;
  safetyNote: string;
};

export type OrderListResponse = {
  orders: Order[];
  stats: {
    total: number;
    pending: number;
    ready: number;
    completed: number;
    rejected: number;
  };
};

export type Prescription = {
  id: number;
  trackingId: string;
  patientName: string;
  patientEmail: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  storageUrl: string;
  documentKind: string;
  medicines: string;
  status: RxStatus;
  rawStatus: string;
  reviewNotes: string;
  reviewedAt?: string | null;
  createdAt: string;
};

export type PrescriptionListResponse = {
  prescriptions: Prescription[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

export type InteractionMedicine = {
  id: number;
  name: string;
};

export type InteractionRule = {
  id: number;
  medicineAId: number;
  medicineAName: string;
  medicineBId: number;
  medicineBName: string;
  severity: Severity;
  clinicalDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type InteractionPayload = {
  medicineAId: number;
  medicineBId: number;
  severity: Severity;
  clinicalDescription: string;
};

export type InteractionListResponse = {
  interactions: InteractionRule[];
  medicines: InteractionMedicine[];
  stats: {
    total: number;
    mild: number;
    moderate: number;
    severe: number;
  };
};
