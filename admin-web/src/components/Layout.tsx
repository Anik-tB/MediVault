import { useState, type ReactNode } from 'react';
import { LayoutDashboard, Package, ShoppingCart, FileText, ShieldAlert, Settings, LogOut, Menu } from 'lucide-react';
import type { StaffProfile } from '../types';

export type PageKey = 'dashboard' | 'inventory' | 'orders' | 'prescriptions' | 'interactions' | 'settings';

const navItems: { key: PageKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'inventory', label: 'Inventory', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'prescriptions', label: 'Prescriptions', icon: FileText },
  { key: 'interactions', label: 'Drug Interactions', icon: ShieldAlert },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function Layout({
  activePage,
  children,
  onNavigate,
  onSignOut,
  staff,
  title,
  subtitle,
}: {
  activePage: PageKey;
  children: ReactNode;
  onNavigate: (page: PageKey) => void;
  onSignOut: () => void;
  staff: StaffProfile;
  title: string;
  subtitle: string;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const initials = staff.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const navigate = (page: PageKey) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand-mark">✚</div>
          <div className="sidebar-brand-text">
            <h2>MediVault</h2>
            <p>Dispensary</p>
          </div>
        </div>
        <p className="sidebar-section-title">Pharmacist Portal Navigation</p>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-button ${activePage === item.key ? 'active' : ''}`}
              type="button"
              onClick={() => navigate(item.key)}
            >
              <item.icon size={18} className="nav-icon" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-top">
            <div className="avatar">{initials || 'DA'}</div>
            <div>
              <strong>{staff.fullName}</strong>
              <small>{staff.email}</small>
            </div>
          </div>
          <small>{staff.role}</small>
          <button className="ghost-button signout" type="button" onClick={onSignOut}>
            <LogOut size={14} style={{ marginRight: 6 }} />
            Sign Out
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="page-title">
            <button className="ghost-button mobile-menu" type="button" onClick={() => setSidebarOpen(true)}>Menu</button>
            <div className="breadcrumb">Pharmacist Dashboard · MediVault</div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="header-actions">
            <div className="avatar">{initials || 'DA'}</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
