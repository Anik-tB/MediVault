import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import type { AdminDashboard } from '../types';
import { formatDate, formatTime, LoadingState, orderBadge } from '../components/ui';

export function DashboardPage({ onJump }: { onJump: (page: 'inventory' | 'orders' | 'prescriptions') => void }) {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getDashboard()
      .then((response) => mounted && setData(response))
      .catch((err) => mounted && setError(err instanceof Error ? err.message : 'Unable to load dashboard'));
    return () => {
      mounted = false;
    };
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!data) return <LoadingState label="Loading dashboard..." />;

  const maxValue = Math.max(...data.weeklyActivity.map((item) => Math.max(item.orders, item.prescriptions)), 1);
  const statCards = [
    { icon: '💊', value: data.summary.totalMedicines, label: 'Total Medicines' },
    { icon: '📈', value: data.summary.weeklyActivity, label: 'Weekly Activity' },
    { icon: '⚠️', value: data.summary.lowStockAlerts, label: 'Low Stock Alerts' },
    { icon: '⏳', value: data.summary.expiringSoon, label: 'Expiring Soon' },
  ];

  return (
    <>
      <section className="stats-grid">
        {statCards.map((card) => (
          <article className="card stat-card" key={card.label}>
            <div className="stat-icon">{card.icon}</div>
            <div>
              <p className="stat-value">{card.value}</p>
              <p className="stat-label">{card.label}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <h2>Weekly Activity</h2>
          <p className="card-subtitle">Orders and prescriptions this week</p>
          <div className="chart" aria-label="Weekly activity chart">
            {data.weeklyActivity.map((item) => (
              <div className="chart-col" key={item.day}>
                <div className="bar-wrap">
                  <span className="bar" style={{ height: `${Math.max((item.orders / maxValue) * 100, 5)}%` }} title={`${item.orders} orders`} />
                  <span className="bar secondary" style={{ height: `${Math.max((item.prescriptions / maxValue) * 100, 5)}%` }} title={`${item.prescriptions} prescriptions`} />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
          <div className="legend">
            <span><i className="dot" />Orders</span>
            <span><i className="dot secondary" />Prescriptions</span>
          </div>
        </article>

        <aside className="card">
          <h2>Stock Alerts</h2>
          <p className="card-subtitle">Medicines needing attention</p>
          <div className="list-stack">
            {data.stockAlerts.length === 0 ? <p className="card-subtitle">No stock alerts right now.</p> : null}
            {data.stockAlerts.map((medicine) => (
              <div className="alert-row" key={medicine.id}>
                <div>
                  <strong>{medicine.name}</strong>
                  <p className="card-subtitle">{medicine.category} · Expires {formatDate(medicine.expiryDate)}</p>
                </div>
                <span className={`badge ${medicine.stock === 0 ? 'danger' : 'warning'}`}>{medicine.stock} left</span>
              </div>
            ))}
          </div>
          <div className="row-actions" style={{ marginTop: 18 }}>
            <button className="primary-button" type="button" onClick={() => onJump('inventory')}>Manage Inventory</button>
            <button className="soft-button" type="button" onClick={() => onJump('orders')}>{data.summary.pendingOrders} pending orders</button>
            <button className="soft-button" type="button" onClick={() => onJump('prescriptions')}>{data.summary.pendingPrescriptions} pending Rx</button>
          </div>
        </aside>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="modal-header">
          <div>
            <h2>Recent Orders</h2>
            <p className="card-subtitle">Latest patient reservations</p>
          </div>
          <button className="ghost-button" type="button" onClick={() => onJump('orders')}>View all</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Patient</th>
                <th>Medicines</th>
                <th>Date</th>
                <th>Pickup</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.displayId}</strong></td>
                  <td>
                    <strong>{order.patientName}</strong>
                    <p className="card-subtitle">{order.patientEmail}</p>
                  </td>
                  <td>{order.medicines}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{formatTime(order.pickupTime)}</td>
                  <td>{orderBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
