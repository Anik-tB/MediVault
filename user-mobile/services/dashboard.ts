import { fetchAuthenticatedJson } from './api';

export type DashboardSummary = {
  activeOrders: number;
  cartItems: number;
  pendingPrescriptions: number;
  medicinesAvailable: number;
};

export type DashboardRecentOrder = {
  id: number;
  displayId: string;
  status: string;
  createdAt: string;
  itemsCount: number;
  totalUnits: number;
  itemsLabel: string;
};

type DashboardResponse = {
  summary: DashboardSummary;
  recentOrders: DashboardRecentOrder[];
};

export async function fetchDashboard() {
  return fetchAuthenticatedJson<DashboardResponse>('/dashboard');
}
