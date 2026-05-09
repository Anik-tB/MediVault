import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createInteraction, deleteInteraction, getInteractions, updateInteraction } from '../services/api';
import type { InteractionListResponse, InteractionPayload, InteractionRule } from '../types';
import { LoadingState, Modal, severityBadge } from '../components/ui';

const emptyForm: InteractionPayload = {
  medicineAId: 0,
  medicineBId: 0,
  severity: 'mild',
  clinicalDescription: '',
};

export function InteractionsPage({ notify }: { notify: (message: string, tone?: 'success' | 'error') => void }) {
  const [data, setData] = useState<InteractionListResponse | null>(null);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [editing, setEditing] = useState<InteractionRule | null>(null);
  const [isCreating, setCreating] = useState(false);
  const [form, setForm] = useState<InteractionPayload>(emptyForm);
  const [isLoading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getInteractions({ search, severity });
      setData(response);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to load interactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(load, 250);
    return () => window.clearTimeout(id);
  }, [search, severity]);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ ...emptyForm, medicineAId: data?.medicines[0]?.id || 0, medicineBId: data?.medicines[1]?.id || 0 });
  };

  const openEdit = (rule: InteractionRule) => {
    setCreating(false);
    setEditing(rule);
    setForm({
      medicineAId: rule.medicineAId,
      medicineBId: rule.medicineBId,
      severity: rule.severity,
      clinicalDescription: rule.clinicalDescription,
    });
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = editing
        ? await updateInteraction(editing.id, form)
        : await createInteraction(form);
      notify(response.message);
      closeModal();
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to save interaction rule', 'error');
    }
  };

  const remove = async (rule: InteractionRule) => {
    if (!window.confirm(`Delete interaction rule for ${rule.medicineAName} and ${rule.medicineBName}?`)) return;
    try {
      const response = await deleteInteraction(rule.id);
      notify(response.message);
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to delete interaction rule', 'error');
    }
  };

  const modalOpen = isCreating || Boolean(editing);

  return (
    <>
      <section className="card">
        <div className="modal-header">
          <div>
            <h2>Drug Interactions</h2>
            <p className="card-subtitle">Manage medicine conflict rules to protect patient safety</p>
          </div>
          <button className="primary-button" type="button" onClick={openCreate}>Add Interaction Rule</button>
        </div>

        <div className="card compact" style={{ marginBottom: 18 }}>
          <strong>Clinical Safety System</strong>
          <p className="card-subtitle">Drug interaction rules are automatically enforced during patient checkout. Severe interactions will block the reservation until resolved.</p>
        </div>

        <div className="toolbar">
          <input className="input search-input" placeholder="Search by medicine name or description..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="filter-tabs">
            <button className={`tab-button ${severity === '' ? 'active' : ''}`} type="button" onClick={() => setSeverity('')}>All</button>
            <button className={`tab-button ${severity === 'mild' ? 'active' : ''}`} type="button" onClick={() => setSeverity('mild')}>Mild</button>
            <button className={`tab-button ${severity === 'moderate' ? 'active' : ''}`} type="button" onClick={() => setSeverity('moderate')}>Moderate</button>
            <button className={`tab-button ${severity === 'severe' ? 'active' : ''}`} type="button" onClick={() => setSeverity('severe')}>Severe</button>
          </div>
        </div>

        {data ? (
          <div className="page-tabs" style={{ marginBottom: 18 }}>
            <span className="badge neutral">{data.stats.total} total</span>
            <span className="badge success">{data.stats.mild} mild</span>
            <span className="badge warning">{data.stats.moderate} moderate</span>
            <span className="badge danger">{data.stats.severe} severe</span>
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Loading interaction rules..." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Interaction Pair</th>
                  <th>Severity</th>
                  <th>Clinical Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.interactions.map((rule) => (
                  <tr key={rule.id}>
                    <td><strong>{rule.medicineAName}</strong><br /><strong>{rule.medicineBName}</strong></td>
                    <td>{severityBadge(rule.severity)}</td>
                    <td><p className="description">{rule.clinicalDescription}</p></td>
                    <td>
                      <div className="row-actions">
                        <button className="ghost-button" type="button" onClick={() => openEdit(rule)}>Edit</button>
                        <button className="danger-button" type="button" onClick={() => remove(rule)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen ? (
        <Modal title={editing ? 'Edit Interaction Rule' : 'Add Interaction Rule'} subtitle="Define which medicine combination is clinically unsafe." onClose={closeModal}>
          <form className="form-grid" onSubmit={submit}>
            <div className="form-grid two">
              <div className="field">
                <label>Medicine A *</label>
                <select className="select" value={form.medicineAId} onChange={(event) => setForm((current) => ({ ...current, medicineAId: Number(event.target.value) }))}>
                  {data?.medicines.map((medicine) => <option key={medicine.id} value={medicine.id}>{medicine.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Medicine B *</label>
                <select className="select" value={form.medicineBId} onChange={(event) => setForm((current) => ({ ...current, medicineBId: Number(event.target.value) }))}>
                  {data?.medicines.map((medicine) => <option key={medicine.id} value={medicine.id}>{medicine.name}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Severity Level *</label>
              <select className="select" value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value as InteractionPayload['severity'] }))}>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            <div className="field">
              <label>Clinical Description *</label>
              <textarea className="textarea" required value={form.clinicalDescription} onChange={(event) => setForm((current) => ({ ...current, clinicalDescription: event.target.value }))} placeholder="Describe the clinical interaction and its effects on the patient..." />
            </div>
            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={closeModal}>Cancel</button>
              <button className="primary-button" type="submit">Save Rule</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
