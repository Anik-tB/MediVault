import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getSettings, updateAppearance, updateNotifications, updatePassword, updateProfile } from '../services/api';
import type { StaffProfile } from '../types';
import { LoadingState } from '../components/ui';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance';

export function SettingsPage({ staff, onStaffChange, notify }: { staff: StaffProfile; onStaffChange: (staff: StaffProfile) => void; notify: (message: string, tone?: 'success' | 'error') => void }) {
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [currentStaff, setCurrentStaff] = useState(staff);
  const [profile, setProfile] = useState({ fullName: staff.fullName, phone: staff.phone, department: staff.department });
  const [notifications, setNotifications] = useState(staff.notificationSettings);
  const [appearance, setAppearance] = useState(staff.appearance);
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((response) => {
        setCurrentStaff(response.staff);
        onStaffChange(response.staff);
        setProfile({ fullName: response.staff.fullName, phone: response.staff.phone, department: response.staff.department });
        setNotifications(response.staff.notificationSettings);
        setAppearance(response.staff.appearance);
      })
      .catch((err) => notify(err instanceof Error ? err.message : 'Unable to load settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await updateProfile(profile);
      setCurrentStaff(response.staff);
      onStaffChange(response.staff);
      notify(response.message);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to save profile', 'error');
    }
  };

  const saveNotifications = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await updateNotifications(notifications);
      setCurrentStaff(response.staff);
      onStaffChange(response.staff);
      notify(response.message);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to save notifications', 'error');
    }
  };

  const saveAppearance = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await updateAppearance(appearance);
      setCurrentStaff(response.staff);
      onStaffChange(response.staff);
      notify(response.message);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to save appearance', 'error');
    }
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      notify('New passwords do not match', 'error');
      return;
    }
    try {
      const response = await updatePassword({ currentPassword: password.currentPassword, newPassword: password.newPassword });
      notify(response.message);
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to update password', 'error');
    }
  };

  const tabs: { key: SettingsTab; label: string; detail: string }[] = [
    { key: 'profile', label: 'Profile', detail: 'Personal information' },
    { key: 'notifications', label: 'Notifications', detail: 'Alert preferences' },
    { key: 'security', label: 'Security', detail: 'Password & access' },
    { key: 'appearance', label: 'Appearance', detail: 'UI preferences' },
  ];

  if (isLoading) return <LoadingState label="Loading settings..." />;

  return (
    <section className="settings-grid">
      <aside className="card settings-nav">
        {tabs.map((item) => (
          <button key={item.key} className={`tab-button ${tab === item.key ? 'active' : ''}`} type="button" onClick={() => setTab(item.key)}>
            <strong>{item.label}</strong><br />
            <small>{item.detail}</small>
          </button>
        ))}
      </aside>

      <article className="card">
        {tab === 'profile' ? (
          <form className="form-grid" onSubmit={saveProfile}>
            <div className="modal-header">
              <div>
                <h2>Profile Settings</h2>
                <p className="card-subtitle">Personal information</p>
              </div>
              <span className="badge success">Active</span>
            </div>
            <div className="alert-row">
              <div>
                <strong>{currentStaff.fullName}</strong>
                <p className="card-subtitle">{currentStaff.role}</p>
              </div>
              <div className="avatar">{currentStaff.fullName.slice(0, 1).toUpperCase()}</div>
            </div>
            <div className="form-grid two">
              <div className="field">
                <label>Full Name</label>
                <input className="input" value={profile.fullName} onChange={(event) => setProfile((value) => ({ ...value, fullName: event.target.value }))} />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input className="input" value={currentStaff.email} disabled />
              </div>
            </div>
            <div className="form-grid two">
              <div className="field">
                <label>Phone Number</label>
                <input className="input" value={profile.phone} onChange={(event) => setProfile((value) => ({ ...value, phone: event.target.value }))} />
              </div>
              <div className="field">
                <label>Department</label>
                <input className="input" value={profile.department} onChange={(event) => setProfile((value) => ({ ...value, department: event.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="primary-button" type="submit">Save Changes</button>
            </div>
          </form>
        ) : null}

        {tab === 'notifications' ? (
          <form className="form-grid" onSubmit={saveNotifications}>
            <div>
              <h2>Notification Settings</h2>
              <p className="card-subtitle">Configure which notifications you receive. Changes apply immediately.</p>
            </div>
            {Object.entries({
              orderAlerts: 'Order Alerts · Get notified when new orders are placed or updated',
              lowStockAlerts: 'Low Stock Warnings · Alert when medicine stock falls below 50 units',
              expiryAlerts: 'Expiry Alerts · Reminder when medicines are expiring within 3 months',
              weeklyReports: 'Weekly Reports · Receive a weekly summary of inventory and order activity',
            }).map(([key, label]) => (
              <label className="switch-row" key={key}>
                <input type="checkbox" checked={notifications[key as keyof typeof notifications]} onChange={(event) => setNotifications((value) => ({ ...value, [key]: event.target.checked }))} />
                {label}
              </label>
            ))}
            <div className="modal-actions">
              <button className="primary-button" type="submit">Save Preferences</button>
            </div>
          </form>
        ) : null}

        {tab === 'security' ? (
          <form className="form-grid" onSubmit={savePassword}>
            <div>
              <h2>Security Settings</h2>
              <p className="card-subtitle">Password & access</p>
            </div>
            <div className="field">
              <label>Current Password</label>
              <input className="input" type="password" value={password.currentPassword} onChange={(event) => setPassword((value) => ({ ...value, currentPassword: event.target.value }))} />
            </div>
            <div className="form-grid two">
              <div className="field">
                <label>New Password</label>
                <input className="input" type="password" minLength={8} value={password.newPassword} onChange={(event) => setPassword((value) => ({ ...value, newPassword: event.target.value }))} />
              </div>
              <div className="field">
                <label>Confirm New Password</label>
                <input className="input" type="password" minLength={8} value={password.confirmPassword} onChange={(event) => setPassword((value) => ({ ...value, confirmPassword: event.target.value }))} />
              </div>
            </div>
            <div className="card compact">
              <strong>Password Requirements</strong>
              <p className="card-subtitle">At least 8 characters, with uppercase/lowercase letters, one number, and a special character recommended.</p>
            </div>
            <div className="modal-actions">
              <button className="primary-button" type="submit">Update Password</button>
            </div>
          </form>
        ) : null}

        {tab === 'appearance' ? (
          <form className="form-grid" onSubmit={saveAppearance}>
            <div>
              <h2>Appearance Settings</h2>
              <p className="card-subtitle">UI preferences</p>
            </div>
            <div className="field">
              <label>Theme</label>
              <select className="select" value={appearance.theme} onChange={(event) => setAppearance((value) => ({ ...value, theme: event.target.value as StaffProfile['appearance']['theme'] }))}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="field">
              <label>Sidebar Density</label>
              <select className="select" value={appearance.sidebarDensity} onChange={(event) => setAppearance((value) => ({ ...value, sidebarDensity: event.target.value as StaffProfile['appearance']['sidebarDensity'] }))}>
                <option value="compact">Compact</option>
                <option value="default">Default</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="primary-button" type="submit">Save Appearance</button>
            </div>
          </form>
        ) : null}
      </article>
    </section>
  );
}
