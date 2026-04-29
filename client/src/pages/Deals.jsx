import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { fetchContacts } from '../api/contacts.js';
import { createDeal, fetchDeals, updateDeal } from '../api/deals.js';

const STAGES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed-won', label: 'Closed won' },
  { id: 'closed-lost', label: 'Closed lost' },
];

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    n || 0
  );
}

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    value: '',
    contact: '',
    stage: 'new',
    expectedCloseDate: '',
  });

  const load = useCallback(async () => {
    try {
      const [d, c] = await Promise.all([fetchDeals(), fetchContacts()]);
      setDeals(d);
      setContacts(c);
    } catch {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byStage = useMemo(() => {
    const map = {};
    STAGES.forEach((s) => {
      map[s.id] = [];
    });
    deals.forEach((deal) => {
      const stage = deal.stage || 'new';
      if (!map[stage]) map[stage] = [];
      map[stage].push(deal);
    });
    return map;
  }, [deals]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (destination.droppableId === source.droppableId) return;

    try {
      await updateDeal(draggableId, { stage: destination.droppableId });
      setDeals((prev) =>
        prev.map((d) => (d._id === draggableId ? { ...d, stage: destination.droppableId } : d))
      );
      toast.success('Deal moved');
    } catch {
      toast.error('Could not update stage');
      load();
    }
  };

  async function handleCreateDeal(e) {
    e.preventDefault();
    if (!newDeal.title.trim() || !newDeal.contact) {
      toast.error('Title and contact are required');
      return;
    }
    setCreating(true);
    try {
      const deal = await createDeal({
        title: newDeal.title.trim(),
        value: Number(newDeal.value) || 0,
        contact: newDeal.contact,
        stage: newDeal.stage || 'new',
        expectedCloseDate: newDeal.expectedCloseDate || undefined,
      });
      setDeals((prev) => [deal, ...prev]);
      toast.success('Deal created');
      setModalOpen(false);
      setNewDeal({
        title: '',
        value: '',
        contact: '',
        stage: 'new',
        expectedCloseDate: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create deal');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-64 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Deals</h1>
          <p className="text-slate-500 text-sm mt-1">Drag cards between stages to update the pipeline</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium"
        >
          New deal
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 min-h-[420px]">
          {STAGES.map((col) => (
            <div key={col.id} className="flex-shrink-0 w-72 flex flex-col rounded-xl border border-slate-800 bg-slate-900/40">
              <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">{col.label}</span>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                  {byStage[col.id]?.length ?? 0}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 space-y-2 min-h-[120px] rounded-b-xl transition-colors ${
                      snapshot.isDraggingOver ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    {(byStage[col.id] || []).map((deal, index) => (
                      <Draggable key={deal._id} draggableId={String(deal._id)} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`rounded-lg border border-slate-700 bg-slate-800/80 p-3 shadow-sm ${
                              dragSnapshot.isDragging ? 'ring-2 ring-emerald-500/50 shadow-lg' : ''
                            }`}
                          >
                            <p className="font-medium text-white text-sm">{deal.title}</p>
                            <p className="text-emerald-400 text-sm mt-1">{formatMoney(deal.value)}</p>
                            <p className="text-slate-500 text-xs mt-2 truncate">
                              {deal.contact?.name || 'Contact'}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => !creating && setModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">New deal</h2>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Title</label>
                <input
                  required
                  value={newDeal.title}
                  onChange={(e) => setNewDeal((n) => ({ ...n, title: e.target.value }))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Value (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal((n) => ({ ...n, value: e.target.value }))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Contact</label>
                <select
                  required
                  value={newDeal.contact}
                  onChange={(e) => setNewDeal((n) => ({ ...n, contact: e.target.value }))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"
                >
                  <option value="">Select contact</option>
                  {contacts.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Stage</label>
                <select
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal((n) => ({ ...n, stage: e.target.value }))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm capitalize"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Expected close</label>
                <input
                  type="date"
                  value={newDeal.expectedCloseDate}
                  onChange={(e) => setNewDeal((n) => ({ ...n, expectedCloseDate: e.target.value }))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
