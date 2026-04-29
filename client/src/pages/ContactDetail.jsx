import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addNote, deleteContact, fetchContact, updateContact } from '../api/contacts.js';
import { fetchDeals } from '../api/deals.js';

const STATUSES = ['lead', 'contacted', 'qualified', 'customer', 'lost'];

function StatusBadge({ status }) {
  const colors = {
    lead: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    contacted: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    qualified: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    customer: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    lost: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize border ${colors[status] || ''}`}
    >
      {status}
    </span>
  );
}

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [c, allDeals] = await Promise.all([fetchContact(id), fetchDeals()]);
        if (cancelled) return;
        setContact(c);
        setForm({
          name: c.name || '',
          email: c.email || '',
          phone: c.phone || '',
          company: c.company || '',
          status: c.status || 'lead',
        });
        setDeals(
          allDeals.filter((d) => {
            const cid = d.contact?._id ?? d.contact;
            return cid != null && String(cid) === String(id);
          })
        );
      } catch {
        toast.error('Contact not found');
        navigate('/contacts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  async function handleSave() {
    if (!contact) return;
    setSaving(true);
    try {
      const updated = await updateContact(id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        status: form.status,
      });
      setContact(updated);
      toast.success('Contact saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const updated = await addNote(id, noteText.trim());
      setContact(updated);
      setNoteText('');
      toast.success('Note added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add note');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this contact and unlink deals still point here — delete deals from Deals view first if needed. Continue?')) return;
    try {
      await deleteContact(id);
      toast.success('Contact deleted');
      navigate('/contacts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const notes = [...(contact?.notes || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (loading || !contact) {
    return (
      <div className="animate-pulse space-y-4 max-w-3xl">
        <div className="h-8 bg-slate-800 rounded w-1/2" />
        <div className="h-40 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/contacts" className="text-sm text-emerald-400 hover:text-emerald-300 mb-2 inline-block">
            ← Contacts
          </Link>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3 flex-wrap">
            {contact.name}
            <StatusBadge status={contact.status} />
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <h2 className="text-lg font-medium text-white">Details</h2>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Company</label>
            <input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm capitalize"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {contact.assignedTo && (
            <p className="text-sm text-slate-500">
              Assigned to:{' '}
              <span className="text-slate-300">{contact.assignedTo.name || contact.assignedTo.email}</span>
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-medium text-white mb-4">Deals</h2>
            {deals.length === 0 ? (
              <p className="text-slate-500 text-sm">No deals linked yet.</p>
            ) : (
              <ul className="space-y-3">
                {deals.map((d) => (
                  <li
                    key={d._id}
                    className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                  >
                    <span className="text-white font-medium">{d.title}</span>
                    <span className="text-emerald-400 text-sm">
                      {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(d.value)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/deals" className="inline-block mt-4 text-sm text-emerald-400 hover:text-emerald-300">
              Open kanban →
            </Link>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-medium text-white mb-4">Notes</h2>
            <form onSubmit={handleAddNote} className="flex gap-2 mb-6">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note…"
                className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm"
              >
                Add
              </button>
            </form>
            <ul className="space-y-4">
              {notes.length === 0 && <li className="text-slate-500 text-sm">No notes yet.</li>}
              {notes.map((n) => (
                <li key={n._id} className="border-l-2 border-emerald-500/40 pl-4">
                  <p className="text-slate-200 text-sm whitespace-pre-wrap">{n.text}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {n.createdBy?.name || 'User'} · {new Date(n.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
