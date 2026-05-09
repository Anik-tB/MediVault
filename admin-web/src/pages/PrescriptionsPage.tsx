import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { approvePrescription, getPrescriptions, rejectPrescription } from '../services/api';
import type { Prescription, PrescriptionListResponse, RxStatus } from '../types';
import { formatDate, LoadingState, Modal, prescriptionBadge } from '../components/ui';

const statusOptions: { label: string; value: '' | RxStatus }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export function PrescriptionsPage({ notify }: { notify: (message: string, tone?: 'success' | 'error') => void }) {
  const [data, setData] = useState<PrescriptionListResponse | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState<Prescription | null>(null);
  const [rejecting, setRejecting] = useState<Prescription | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getPrescriptions({ search, status });
      setData(response);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to load prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(load, 250);
    return () => window.clearTimeout(id);
  }, [search, status]);

  const approve = async (prescription: Prescription) => {
    try {
      const response = await approvePrescription(prescription.id);
      notify(response.message);
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to approve prescription', 'error');
    }
  };

  const submitReject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rejecting) return;
    try {
      const response = await rejectPrescription(rejecting.id, notes);
      notify(response.message);
      setRejecting(null);
      setNotes('');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to reject prescription', 'error');
    }
  };

  return (
    <>
      <section className="card">
        <div className="modal-header">
          <div>
            <h2>Prescription Review</h2>
            <p className="card-subtitle">Review and validate patient prescription submissions</p>
          </div>
        </div>
        <div className="toolbar">
          <input className="input search-input" placeholder="Search by patient name, email, or Rx ID..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="filter-tabs">
            {statusOptions.map((option) => (
              <button key={option.label} className={`tab-button ${status === option.value ? 'active' : ''}`} type="button" onClick={() => setStatus(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {data ? (
          <div className="page-tabs" style={{ marginBottom: 18 }}>
            <span className="badge neutral">All ({data.stats.total})</span>
            <span className="badge warning">Pending ({data.stats.pending})</span>
            <span className="badge success">Approved ({data.stats.approved})</span>
            <span className="badge danger">Rejected ({data.stats.rejected})</span>
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Loading prescriptions..." /> : (
          <div className="list-stack">
            {data?.prescriptions.length === 0 ? <div className="empty-state"><h3>No prescriptions found</h3><p>Try adjusting your filters.</p></div> : null}
            {data?.prescriptions.map((rx) => (
              <article className="rx-card" key={rx.id}>
                <div className="modal-header" style={{ marginBottom: 0 }}>
                  <div>
                    <strong>{rx.trackingId}</strong> {prescriptionBadge(rx.status)}
                    <p className="card-subtitle">{rx.documentKind} · {rx.patientName} ({rx.patientEmail}) · Submitted: {formatDate(rx.createdAt)}</p>
                  </div>
                  <div className="row-actions">
                    <button className="ghost-button" type="button" onClick={() => setPreview(rx)}>View Document Preview</button>
                    {rx.status === 'pending' ? (
                      <>
                        <button className="danger-button" type="button" onClick={() => setRejecting(rx)}>Reject</button>
                        <button className="primary-button" type="button" onClick={() => approve(rx)}>Approve</button>
                      </>
                    ) : null}
                  </div>
                </div>
                <div>
                  <p className="card-subtitle">Prescribed medicines</p>
                  <strong>{rx.medicines}</strong>
                </div>
                {rx.reviewNotes ? <p className="description">{rx.reviewNotes}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      {preview ? (
        <Modal title="Document Preview" subtitle={preview.fileName} onClose={() => setPreview(null)}>
          <div className="preview-box">
            <div>
              <h3>{preview.fileName}</h3>
              <p>Patient: {preview.patientName}</p>
              <p>Submitted: {formatDate(preview.createdAt)}</p>
              <p>Medicines: {preview.medicines}</p>
              <p>Document preview not available in demo. In production, image/PDF renders here.</p>
              {preview.storageUrl ? <a className="primary-button" href={preview.storageUrl} target="_blank" rel="noreferrer">Open Uploaded File</a> : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {rejecting ? (
        <Modal title={`Reject ${rejecting.trackingId}`} subtitle="Record the reason so the patient can resubmit correctly." onClose={() => setRejecting(null)}>
          <form className="form-grid" onSubmit={submitReject}>
            <div className="field">
              <label>Rejection Notes *</label>
              <textarea className="textarea" required value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Example: Prescription is illegible; signature not visible." />
            </div>
            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={() => setRejecting(null)}>Cancel</button>
              <button className="danger-button" type="submit">Reject Prescription</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
