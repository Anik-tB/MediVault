import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { createMedicine, deleteMedicine, getMedicines, updateMedicine } from '../services/api';
import type { Medicine, MedicinePayload, MedicineListResponse } from '../types';
import { formatDate, LoadingState, Modal, stockBadge } from '../components/ui';

const emptyForm: MedicinePayload = {
  name: '',
  category: '',
  description: '',
  stock: 0,
  expiryDate: '',
  rx: false,
  certificate: false,
};

export function InventoryPage({ notify }: { notify: (message: string, tone?: 'success' | 'error') => void }) {
  const [data, setData] = useState<MedicineListResponse | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [isCreating, setCreating] = useState(false);
  const [form, setForm] = useState<MedicinePayload>(emptyForm);
  const [isLoading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getMedicines({ search, status, category });
      setData(response);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to load medicines', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(load, 250);
    return () => window.clearTimeout(id);
  }, [search, status, category]);

  const categories = useMemo(() => data?.categories || [], [data]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (medicine: Medicine) => {
    setEditing(medicine);
    setCreating(false);
    setForm({
      name: medicine.name,
      category: medicine.category,
      description: medicine.description,
      stock: medicine.stock,
      expiryDate: medicine.expiryDate?.slice(0, 10) || '',
      rx: medicine.rx,
      certificate: medicine.certificate,
    });
  };

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = editing
        ? await updateMedicine(editing.id, form)
        : await createMedicine(form);
      notify(response.message);
      closeModal();
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to save medicine', 'error');
    }
  };

  const remove = async (medicine: Medicine) => {
    if (!window.confirm(`Remove ${medicine.name} from inventory?`)) return;
    try {
      const response = await deleteMedicine(medicine.id);
      notify(response.message);
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to delete medicine', 'error');
    }
  };

  const modalOpen = isCreating || Boolean(editing);

  return (
    <>
      <section className="card">
        <div className="modal-header">
          <div>
            <h2>Medicine Inventory</h2>
            <p className="card-subtitle">{data?.stats.total ?? 0} medicines registered</p>
          </div>
          <button className="primary-button" type="button" onClick={openCreate}>Add Medicine</button>
        </div>

        <div className="toolbar">
          <input className="input search-input" placeholder="Search by name or category..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="select" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All Categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="filter-tabs">
            <button className={`tab-button ${status === '' ? 'active' : ''}`} type="button" onClick={() => setStatus('')}>All</button>
            <button className={`tab-button ${status === 'in_stock' ? 'active' : ''}`} type="button" onClick={() => setStatus('in_stock')}>In Stock</button>
            <button className={`tab-button ${status === 'low_stock' ? 'active' : ''}`} type="button" onClick={() => setStatus('low_stock')}>Low Stock</button>
            <button className={`tab-button ${status === 'out_of_stock' ? 'active' : ''}`} type="button" onClick={() => setStatus('out_of_stock')}>Out of Stock</button>
          </div>
        </div>

        {isLoading ? <LoadingState label="Loading inventory..." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td className="name-cell">
                      <strong>{medicine.name} {medicine.rx ? <span className="badge purple">Rx</span> : null} {medicine.conflictCount ? <span className="badge warning">Conflicts</span> : null}</strong>
                      <p className="description">{medicine.description}</p>
                    </td>
                    <td>{medicine.category}</td>
                    <td>{medicine.stock}</td>
                    <td>{formatDate(medicine.expiryDate)}</td>
                    <td>{stockBadge(medicine.status)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="ghost-button" type="button" onClick={() => openEdit(medicine)}>Edit</button>
                        <button className="danger-button" type="button" onClick={() => remove(medicine)}>Delete</button>
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
        <Modal title={editing ? 'Edit Medicine' : 'Add New Medicine'} subtitle={editing ? 'Update the medicine information below.' : 'Fill in the details to add to inventory.'} onClose={closeModal}>
          <form className="form-grid" onSubmit={submit}>
            <div className="form-grid two">
              <div className="field">
                <label>Medicine Name *</label>
                <input className="input" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="field">
                <label>Category *</label>
                <input className="input" required value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              </div>
            </div>
            <div className="form-grid two">
              <div className="field">
                <label>Stock Quantity *</label>
                <input className="input" required type="number" min={0} value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: Number(event.target.value) }))} />
              </div>
              <div className="field">
                <label>Expiry Date *</label>
                <input className="input" required type="date" value={form.expiryDate} onChange={(event) => setForm((current) => ({ ...current, expiryDate: event.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label>Description *</label>
              <textarea className="textarea" required value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.rx} onChange={(event) => setForm((current) => ({ ...current, rx: event.target.checked }))} />
              Prescription Required
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.certificate} onChange={(event) => setForm((current) => ({ ...current, certificate: event.target.checked }))} />
              Mark as conflict-sensitive medicine
            </label>
            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={closeModal}>Cancel</button>
              <button className="primary-button" type="submit">{editing ? 'Save Changes' : 'Add Medicine'}</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
