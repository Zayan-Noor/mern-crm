import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import { fetchDashboardStats } from '../api/dashboard.js';

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    n || 0
  );
}

const stageLabel = (s) =>
  ({
    new: 'New',
    contacted: 'Contacted',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    'closed-won': 'Won',
    'closed-lost': 'Lost',
  }[s] || s);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDashboardStats();
        if (!cancelled) setStats(data);
      } catch {
        toast.error('Could not load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData =
    stats &&
    Object.entries(stats.dealsByStage || {}).map(([stage, count]) => ({
      name: stageLabel(stage),
      stage,
      count,
    }));

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Pipeline overview and recent activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-slate-500 text-sm">Total contacts</p>
          <p className="text-3xl font-semibold text-white mt-1">{stats.totalContacts}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-slate-500 text-sm">Pipeline value</p>
          <p className="text-3xl font-semibold text-emerald-400 mt-1">{formatMoney(stats.totalDealsValue)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:col-span-2">
          <p className="text-slate-500 text-sm mb-3">Contacts by status</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.contactsByStatus || {}).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700"
              >
                <span className="capitalize">{k}</span>
                <span className="text-emerald-400 font-semibold">{v}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-medium text-white mb-4">Deals by stage</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
              />
              <Bar dataKey="count" name="Deals" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Recently updated contacts</h2>
          <Link to="/contacts" className="text-sm text-emerald-400 hover:text-emerald-300">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-slate-800">
          {(stats.recentContacts || []).length === 0 && (
            <li className="px-6 py-8 text-center text-slate-500 text-sm">No contacts yet</li>
          )}
          {(stats.recentContacts || []).map((c) => (
            <li key={c._id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
              <Link to={`/contacts/${c._id}`} className="font-medium text-white hover:text-emerald-400">
                {c.name}
              </Link>
              <span className="text-xs text-slate-500 capitalize">{c.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
