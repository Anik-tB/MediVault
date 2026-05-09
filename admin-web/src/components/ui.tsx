import type { ReactNode } from 'react';
import type { OrderStatus, RxStatus, Severity, StockStatus } from '../types';

export function Badge({ tone = 'neutral', children }: { tone?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral'; children: ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function stockBadge(status: StockStatus) {
  if (status === 'in_stock') return <Badge tone="success">In Stock</Badge>;
  if (status === 'low_stock') return <Badge tone="warning">Low Stock</Badge>;
  return <Badge tone="danger">Out of Stock</Badge>;
}

export function orderBadge(status: OrderStatus) {
  if (status === 'completed') return <Badge tone="success">Completed</Badge>;
  if (status === 'ready_for_pickup') return <Badge tone="primary">Ready for Pickup</Badge>;
  if (status === 'rejected') return <Badge tone="danger">Rejected</Badge>;
  return <Badge tone="warning">Pending</Badge>;
}

export function prescriptionBadge(status: RxStatus) {
  if (status === 'approved') return <Badge tone="success">Approved</Badge>;
  if (status === 'rejected') return <Badge tone="danger">Rejected</Badge>;
  return <Badge tone="warning">Pending</Badge>;
}

export function severityBadge(severity: Severity) {
  if (severity === 'severe') return <Badge tone="danger">Severe</Badge>;
  if (severity === 'moderate') return <Badge tone="warning">Moderate</Badge>;
  return <Badge tone="success">Mild</Badge>;
}

export function formatDate(value?: string | null) {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value?: string | null) {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(value?: string | null) {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return <div className="loading">{label}</div>;
}

export function Modal({ title, subtitle, children, onClose }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>Close</button>
        </header>
        {children}
      </section>
    </div>
  );
}
