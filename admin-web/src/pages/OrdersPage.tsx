import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { approveOrder, getOrders, markOrderPickedUp, rejectOrder, verifyOrderPrescription } from '../services/api';
import type { Order, OrderListResponse, OrderStatus, PrescriptionVerificationResult, PrescriptionVerificationStatus } from '../types';
import { formatDate, formatDateTime, formatTime, LoadingState, Modal, orderBadge } from '../components/ui';

const statusOptions: { label: string; value: '' | OrderStatus }[] = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'pending_pickup' },
  { label: 'Ready for Pickup', value: 'ready_for_pickup' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
];

const verificationLabels: Record<PrescriptionVerificationStatus, string> = {
  matched: 'Matched',
  partial_match: 'Partial Match',
  no_match: 'No Match',
  needs_review: 'Needs Review',
};

const verificationTones: Record<PrescriptionVerificationStatus, string> = {
  matched: 'success',
  partial_match: 'warning',
  no_match: 'danger',
  needs_review: 'warning',
};

function confidencePercent(value: number) {
  const normalized = Math.min(Math.max(Number(value || 0), 0), 1);
  return `${Math.round(normalized * 100)}%`;
}

export function OrdersPage({ notify, onJump }: { notify: (message: string, tone?: 'success' | 'error') => void; onJump: (page: 'prescriptions', search?: string) => void }) {
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verification, setVerification] = useState<PrescriptionVerificationResult | null>(null);
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setVerifying] = useState(false);
  const [approvingOrder, setApprovingOrder] = useState<Order | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [pickupTime, setPickupTime] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getOrders({ search, status });
      setData(response);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(load, 250);
    return () => window.clearTimeout(id);
  }, [search, status]);

  const approve = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!approvingOrder) return;
    try {
      const response = await approveOrder(approvingOrder.id, pickupTime);
      notify(response.message);
      setApprovingOrder(null);
      setPickupTime('');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to approve order', 'error');
    }
  };

  const reject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rejectingOrder) return;
    try {
      const response = await rejectOrder(rejectingOrder.id, reason);
      notify(response.message);
      setRejectingOrder(null);
      setReason('');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to reject order', 'error');
    }
  };

  const pickup = async (order: Order) => {
    try {
      const response = await markOrderPickedUp(order.id);
      notify(response.message);
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to mark picked up', 'error');
    }
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setVerification(null);
    setVerificationError('');
  };

  const runPrescriptionCheck = async () => {
    if (!selectedOrder) return;
    setVerifying(true);
    setVerificationError('');
    try {
      const result = await verifyOrderPrescription(selectedOrder.id);
      setVerification(result);
      notify('Gemini prescription check complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to verify prescription';
      setVerificationError(message);
      notify(message, 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <section className="card">
        <div className="modal-header">
          <div>
            <h2>Orders Management</h2>
            <p className="card-subtitle">Review, approve, or reject patient medicine reservations</p>
          </div>
        </div>
        <div className="toolbar">
          <input className="input search-input" placeholder="Search by order ID, patient name, or email..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="filter-tabs">
            {statusOptions.map((option) => (
              <button key={option.label} className={`tab-button ${status === option.value ? 'active' : ''}`} type="button" onClick={() => setStatus(option.value)}>{option.label}</button>
            ))}
          </div>
        </div>
        {data ? (
          <div className="page-tabs" style={{ marginBottom: 18 }}>
            <span className="badge neutral">{data.stats.total} total</span>
            <span className="badge warning">{data.stats.pending} pending</span>
            <span className="badge primary">{data.stats.ready} ready</span>
            <span className="badge success">{data.stats.completed} completed</span>
            <span className="badge danger">{data.stats.rejected} rejected</span>
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Loading orders..." /> : (
          <div className="list-stack">
            {data?.orders.length === 0 ? <div className="empty-state"><h3>No orders found</h3><p>Try adjusting your filters.</p></div> : null}
            {data?.orders.map((order) => (
              <article className="order-row" key={order.id}>
                <div className="modal-header" style={{ marginBottom: 0 }}>
                  <div>
                    <strong>{order.displayId}</strong> {orderBadge(order.status)}
                    <p className="card-subtitle">{order.patientName} · {order.patientEmail}</p>
                  </div>
                  <div className="row-actions">
                    <button className="ghost-button" type="button" onClick={() => openDetails(order)}>Details</button>
                    {order.status === 'pending_pickup' ? (
                      <>
                        <button className="danger-button" type="button" onClick={() => setRejectingOrder(order)}>Reject</button>
                        <button className="primary-button" type="button" onClick={() => setApprovingOrder(order)}>Approve</button>
                      </>
                    ) : null}
                    {order.status === 'ready_for_pickup' ? (
                      <button className="success-button" type="button" onClick={() => pickup(order)}>Mark as Picked Up</button>
                    ) : null}
                  </div>
                </div>
                <div className="page-tabs">
                  <span className="badge neutral">{formatDate(order.createdAt)}</span>
                  <span className="badge neutral">Pickup: {formatTime(order.pickupTime)}</span>
                  <span className="badge neutral">{order.itemsCount} med(s)</span>
                  <span className="badge success">Total: ৳ {Number(order.totalAmount || 0).toFixed(2)}</span>
                </div>
                <p className="description">{order.medicines}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedOrder ? (
        <Modal title={`${selectedOrder.displayId} ordered medicines`} subtitle={`${selectedOrder.patientName} · ${selectedOrder.patientEmail}`} onClose={() => setSelectedOrder(null)}>
          <div className="list-stack">
            {selectedOrder.items.map((item) => (
              <div className="alert-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p className="card-subtitle">{item.category} {item.rx ? '· Rx Required' : ''}</p>
                </div>
                <span className="badge neutral">× {item.quantity} units</span>
                <span className="badge neutral">৳ {(Number(item.unitPrice || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <p className="card-subtitle">Created: {formatDateTime(selectedOrder.createdAt)} · Pickup: {formatDateTime(selectedOrder.pickupTime)}</p>
            
            {selectedOrder.prescriptionUrl ? (
              <div className="alert-box info" style={{ marginTop: 16 }}>
                <div className="modal-header" style={{ padding: 0, border: 'none', marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>Linked Prescription</h4>
                  <span className={`badge ${selectedOrder.prescriptionStatus === 'approved' ? 'success' : selectedOrder.prescriptionStatus === 'rejected' ? 'danger' : 'warning'}`}>
                    {selectedOrder.prescriptionStatus?.replace('_', ' ') || 'Pending Review'}
                  </span>
                </div>
                <p className="description" style={{ marginBottom: 12 }}>Admin must review this prescription before final approval.</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a 
                    href={selectedOrder.prescriptionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="soft-button"
                    style={{ flex: '1 1 160px', textDecoration: 'none', justifyContent: 'center' }}
                  >
                    View File
                  </a>
                  <button 
                    className="primary-button"
                    style={{ flex: '1 1 160px' }}
                    onClick={() => onJump('prescriptions', `RX-${String(selectedOrder.prescriptionId).padStart(4, '0')}`)}
                  >
                    Go to Review Page
                  </button>
                  <button
                    className="warning-button"
                    type="button"
                    style={{ flex: '1 1 160px' }}
                    onClick={runPrescriptionCheck}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Checking...' : 'Gemini Check'}
                  </button>
                </div>
              </div>
            ) : selectedOrder.items.some(i => i.rx) ? (
              <div className="alert-box danger" style={{ marginTop: 16 }}>
                <h4>Missing Prescription</h4>
                <p className="description">This order contains Rx medicines but no prescription was linked!</p>
              </div>
            ) : null}

            {verificationError ? <div className="error-box">{verificationError}</div> : null}
            {isVerifying ? <LoadingState label="Checking prescription..." /> : null}
            {verification ? (
              <div className="verification-panel">
                <div className="modal-header" style={{ marginBottom: 10 }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px' }}>Gemini Prescription Check</h4>
                    <p className="card-subtitle" style={{ margin: 0 }}>{verification.summary}</p>
                  </div>
                  <span className={`badge ${verificationTones[verification.overallStatus]}`}>
                    {verificationLabels[verification.overallStatus]} · {confidencePercent(verification.confidence)}
                  </span>
                </div>

                <div className="verification-list">
                  {verification.orderedMedicineChecks.map((check) => (
                    <div className="verification-row" key={check.orderedName}>
                      <div>
                        <strong>{check.orderedName}</strong>
                        <p className="card-subtitle" style={{ margin: '4px 0 0' }}>
                          {check.matchedPrescriptionName || 'No prescription match'} · {check.reason}
                        </p>
                      </div>
                      <span className={`badge ${check.present ? 'success' : 'danger'}`}>
                        {check.present ? 'Present' : 'Missing'} · {confidencePercent(check.confidence)}
                      </span>
                    </div>
                  ))}
                </div>

                {verification.detectedMedicines.length ? (
                  <p className="description" style={{ maxWidth: '100%', marginBottom: 0 }}>
                    Detected: {verification.detectedMedicines.map((medicine) => medicine.name).join(', ')}
                  </p>
                ) : null}
                <p className="card-subtitle" style={{ margin: '10px 0 0' }}>{verification.safetyNote}</p>
              </div>
            ) : null}

            <div className="modal-header" style={{ marginTop: 16 }}>
              <h3>Total Amount</h3>
              <h3 className="success-text">৳ {Number(selectedOrder.totalAmount || 0).toFixed(2)}</h3>
            </div>
          </div>
        </Modal>
      ) : null}

      {approvingOrder ? (
        <Modal title={`Approve ${approvingOrder.displayId}`} subtitle="Set pickup time to approve." onClose={() => setApprovingOrder(null)}>
          <form className="form-grid" onSubmit={approve}>
            <div className="field">
              <label>Pickup Time</label>
              <input className="input" type="datetime-local" required value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={() => setApprovingOrder(null)}>Cancel</button>
              <button className="primary-button" type="submit">Confirm Approval</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {rejectingOrder ? (
        <Modal title={`Reject ${rejectingOrder.displayId}`} subtitle="Add an optional reason for audit history." onClose={() => setRejectingOrder(null)}>
          <form className="form-grid" onSubmit={reject}>
            <div className="field">
              <label>Reason</label>
              <textarea className="textarea" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for rejection..." />
            </div>
            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={() => setRejectingOrder(null)}>Cancel</button>
              <button className="danger-button" type="submit">Reject Order</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
