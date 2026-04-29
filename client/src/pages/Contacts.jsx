import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchContacts } from '../api/contacts.js';

const STATUSES = ['', 'lead', 'contacted', 'qualified', 'customer', 'lost'];

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
      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize border ${colors[status] || 'bg-slate-700 text-slate-300'}`}
    >
      {status}
    </span>
  );
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => {
    const p = {};
    if (search.trim()) p.search = search.trim();
    if (status) p.status = status;
    return p;
  }, [search, status]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchContacts(params);
        if (!cancelled) setContacts(data);
      } catch {
        toast.error('Failed to load contacts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Contacts</h1>
          <p className="text-slate-500 text-sm mt-1">Search and filter your pipeline</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search name, email, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 sm:w-48"
        >
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Company</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No contacts match your filters
                  </td>
                </tr>
              )}
              {!loading &&
                contacts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/50 cursor-pointer group">
                    <td className="px-4 py-3">
                      <Link
                        to={`/contacts/${c._id}`}
                        className="font-medium text-white group-hover:text-emerald-400 transition-colors"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{c.company || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{c.phone || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
