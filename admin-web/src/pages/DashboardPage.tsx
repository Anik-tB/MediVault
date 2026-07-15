import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import type { AdminDashboard } from '../types';
import { formatDate, formatTime, LoadingState, orderBadge } from '../components/ui';
import { Shield, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export function DashboardPage({ onJump }: { onJump: (page: 'inventory' | 'orders' | 'prescriptions') => void }) {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; day: string; orders: number; prescriptions: number } | null>(null);

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
  const yAxisSteps = 4;
  const stepValue = Math.ceil(maxValue / yAxisSteps) || 1;
  const chartMax = stepValue * yAxisSteps;
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => i * stepValue).reverse();

  const topSellingData = data.topSellingMedicines || [];
  const topSellingMax = Math.max(...topSellingData.map(m => m.soldQuantity), 1);

  // SVG dimensions
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate coordinates for SVG area/line chart
  const pointsOrders = data.weeklyActivity.map((item, index) => ({
    x: paddingX + ((width - paddingX * 2) / (data.weeklyActivity.length - 1)) * index,
    y: height - paddingY - (item.orders / chartMax) * (height - paddingY * 2),
    day: item.day,
    orders: item.orders,
    prescriptions: item.prescriptions
  }));

  const pointsPrescriptions = data.weeklyActivity.map((item, index) => ({
    x: paddingX + ((width - paddingX * 2) / (data.weeklyActivity.length - 1)) * index,
    y: height - paddingY - (item.prescriptions / chartMax) * (height - paddingY * 2),
    day: item.day,
    orders: item.orders,
    prescriptions: item.prescriptions
  }));

  // Format line paths
  const pathOrders = pointsOrders.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const areaOrders = pointsOrders.length > 0 ? `${pathOrders} L ${pointsOrders[pointsOrders.length - 1].x} ${height - paddingY} L ${pointsOrders[0].x} ${height - paddingY} Z` : '';

  const pathPres = pointsPrescriptions.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const areaPres = pointsPrescriptions.length > 0 ? `${pathPres} L ${pointsPrescriptions[pointsPrescriptions.length - 1].x} ${height - paddingY} L ${pointsPrescriptions[0].x} ${height - paddingY} Z` : '';

  const statCards = [
    { icon: <Sparkles size={20} color="var(--primary)" />, value: data.summary.totalMedicines, label: 'Total Medicines', desc: 'Catalog size' },
    { icon: <TrendingUp size={20} color="#0891b2" />, value: data.summary.weeklyOrders, label: 'Weekly Orders', desc: 'Active reservations' },
    { icon: <AlertTriangle size={20} color="var(--warning)" />, value: data.summary.lowStockAlerts, label: 'Low Stock Alerts', desc: 'Reorder suggested' },
    { icon: <Shield size={20} color="var(--danger)" />, value: data.summary.expiringSoon, label: 'Expiring Soon', desc: 'Within 90 days' },
  ];

  return (
    <>
      <section className="stats-grid">
        {statCards.map((card) => (
          <article className="card stat-card" key={card.label} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--surface-muted)', borderRadius: '12px', padding: '12px' }}>{card.icon}</div>
            <div>
              <p className="stat-value" style={{ fontSize: '24px', fontWeight: 850, margin: 0 }}>{card.value}</p>
              <p className="stat-label" style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0', fontWeight: 600 }}>{card.label}</p>
              <small style={{ fontSize: '11px', color: 'var(--soft)' }}>{card.desc}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <div>
              <h2>Weekly Activity</h2>
              <p className="card-subtitle">Orders and prescriptions this week</p>
            </div>
            <div style={{ display: 'flex', gap: 24, textAlign: 'right', paddingRight: 8 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--primary)', lineHeight: 1 }}>{data.summary.weeklyOrders}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 750, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 850, color: '#0891b2', lineHeight: 1 }}>{data.summary.weeklyPrescriptions}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 750, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Rx</div>
              </div>
            </div>
          </div>
          
          <div className="chart-container" style={{ position: 'relative', marginTop: 12 }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
              {/* Gradients definition */}
              <defs>
                <linearGradient id="orders-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="pres-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0891b2" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {yAxisLabels.map((val) => {
                const y = height - paddingY - (val / chartMax) * (height - paddingY * 2);
                return (
                  <g key={val}>
                    <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth={1} />
                    <text x={paddingX - 10} y={y + 4} textAnchor="end" style={{ fontSize: 10, fill: '#64748b', fontWeight: 650 }}>{val}</text>
                  </g>
                );
              })}
              
              {/* Day Labels */}
              {pointsOrders.map((p, idx) => (
                <text key={idx} x={p.x} y={height - 2} textAnchor="middle" style={{ fontSize: 10, fill: '#64748b', fontWeight: 650 }}>{p.day}</text>
              ))}

              {/* Shaded Areas */}
              {areaOrders && <path d={areaOrders} fill="url(#orders-grad)" />}
              {areaPres && <path d={areaPres} fill="url(#pres-grad)" />}

              {/* Lines */}
              {pathOrders && <path d={pathOrders} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" />}
              {pathPres && <path d={pathPres} fill="none" stroke="#0891b2" strokeWidth={2.5} strokeLinecap="round" />}

              {/* Interactive Dots */}
              {pointsOrders.map((p, idx) => (
                <circle 
                  key={`ord-dot-${idx}`} 
                  cx={p.x} 
                  cy={p.y} 
                  r={activeTooltip?.day === p.day ? 6 : 4} 
                  fill="var(--primary)" 
                  stroke="#ffffff" 
                  strokeWidth={2}
                  style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                  onMouseEnter={() => setActiveTooltip(p)}
                  onMouseLeave={() => setActiveTooltip(null)}
                />
              ))}
              {pointsPrescriptions.map((p, idx) => (
                <circle 
                  key={`pres-dot-${idx}`} 
                  cx={p.x} 
                  cy={p.y} 
                  r={activeTooltip?.day === p.day ? 6 : 4} 
                  fill="#0891b2" 
                  stroke="#ffffff" 
                  strokeWidth={2}
                  style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                  onMouseEnter={() => setActiveTooltip(p)}
                  onMouseLeave={() => setActiveTooltip(null)}
                />
              ))}
            </svg>
            
            {/* Tooltip Overlay */}
            {activeTooltip && (
              <div style={{
                position: 'absolute',
                left: `${(activeTooltip.x / width) * 100}%`,
                top: `${(activeTooltip.y / height) * 100 - 32}%`,
                transform: 'translateX(-50%)',
                background: '#0f172a',
                color: '#ffffff',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 10,
                whiteSpace: 'nowrap'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{activeTooltip.day}</div>
                <div>Orders: {activeTooltip.orders}</div>
                <div>Rx Checked: {activeTooltip.prescriptions}</div>
              </div>
            )}
          </div>
          
          <div className="legend" style={{ marginTop: 16 }}>
            <span><i className="dot" style={{ backgroundColor: 'var(--primary)' }} />Orders</span>
            <span><i className="dot secondary" style={{ backgroundColor: '#0891b2' }} />Prescriptions</span>
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

      {topSellingData.length > 0 && (
        <section className="card" style={{ marginTop: 20 }}>
          <div>
            <h2>Top Selling Medicines</h2>
            <p className="card-subtitle">Most frequently purchased medicines</p>
          </div>
          <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
            {topSellingData.map((item) => {
              const percent = (item.soldQuantity / topSellingMax) * 100;
              return (
                <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 50px', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>{item.name}</span>
                  <div style={{ height: '8px', background: 'var(--border-soft)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #0891b2 100%)', borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', textAlign: 'right' }}>{item.soldQuantity}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
