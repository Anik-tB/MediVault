import { useEffect, useMemo, useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { InteractionsPage } from './pages/InteractionsPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Layout, type PageKey } from './components/Layout';
import { clearStoredToken, getMe, getStoredToken, logout } from './services/api';
import { firebaseSignOut } from './services/firebase';
import type { StaffProfile } from './types';
import './styles.css';

const titles: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Admin Dashboard',
    subtitle: `Welcome back · ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
  },
  inventory: {
    title: 'Inventory',
    subtitle: 'Monitor stock levels, expiry dates, and medicine metadata',
  },
  orders: {
    title: 'Orders',
    subtitle: 'Review, approve, or reject patient medicine reservations',
  },
  prescriptions: {
    title: 'Prescriptions',
    subtitle: 'Validate patient prescription submissions and status history',
  },
  interactions: {
    title: 'Drug Interactions',
    subtitle: 'Manage medicine conflict rules to protect patient safety',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage your account and system preferences',
  },
};

type Toast = { message: string; tone: 'success' | 'error' } | null;

export default function App() {
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [page, setPage] = useState<PageKey>('dashboard');
  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  const [isCheckingSession, setCheckingSession] = useState(Boolean(getStoredToken()));
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!getStoredToken()) return;

    getMe()
      .then((response) => setStaff(response.staff))
      .catch(() => clearStoredToken())
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const notify = (message: string, tone: 'success' | 'error' = 'success') => setToast({ message, tone });

  const activeTitle = useMemo(() => titles[page], [page]);

  const signOut = async () => {
    await Promise.allSettled([logout(), firebaseSignOut()]);
    setStaff(null);
    setPage('dashboard');
  };

  const jumpToPrescriptions = (page: 'prescriptions', search?: string) => {
    if (search) setPrescriptionSearch(search);
    setPage(page);
  };

  if (isCheckingSession) {
    return <div className="loading">Restoring staff session...</div>;
  }

  if (!staff) {
    return <AuthPage onAuthenticated={setStaff} />;
  }

  return (
    <>
      <Layout activePage={page} onNavigate={setPage} onSignOut={signOut} staff={staff} title={activeTitle.title} subtitle={activeTitle.subtitle}>
        {page === 'dashboard' ? <DashboardPage onJump={setPage} /> : null}
        {page === 'inventory' ? <InventoryPage notify={notify} /> : null}
        {page === 'orders' ? <OrdersPage notify={notify} onJump={jumpToPrescriptions} /> : null}
        {page === 'prescriptions' ? <PrescriptionsPage notify={notify} initialSearch={prescriptionSearch} /> : null}
        {page === 'interactions' ? <InteractionsPage notify={notify} /> : null}
        {page === 'settings' ? <SettingsPage staff={staff} onStaffChange={setStaff} notify={notify} /> : null}
      </Layout>
      {toast ? <div className={`toast ${toast.tone === 'error' ? 'error' : ''}`}>{toast.message}</div> : null}
    </>
  );
}
