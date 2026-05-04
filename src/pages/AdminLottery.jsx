import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';
import RouletteWheel from '@/components/lottery/RouletteWheel';
import {
  Plus, Trash2, Edit2, Gift, Users, Trophy, Eye, ChevronDown, ChevronUp, X, Check
} from 'lucide-react';

const DEFAULT_COLORS = ['#FF6B6B','#4ECDC4','#FFE66D','#A8E6CF','#FF8B94','#6C5CE7','#FD79A8','#00CEC9','#FDCB6E','#E17055','#74B9FF','#55EFC4'];

function PrizeEditor({ prizes, onChange }) {
  const add = () => onChange([...prizes, { label: 'Hadiah Baru', color: DEFAULT_COLORS[prizes.length % DEFAULT_COLORS.length], description: '' }]);
  const remove = (i) => onChange(prizes.filter((_, idx) => idx !== i));
  const update = (i, field, val) => onChange(prizes.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  return (
    <div className="space-y-2">
      {prizes.map((p, i) => (
        <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
          <input type="color" value={p.color || '#1FB6D5'} onChange={e => update(i, 'color', e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5 bg-white" />
          <input value={p.label} onChange={e => update(i, 'label', e.target.value)}
            placeholder="Nama hadiah" className="flex-1 h-8 px-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <input value={p.description} onChange={e => update(i, 'description', e.target.value)}
            placeholder="Keterangan" className="flex-1 h-8 px-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <button onClick={() => remove(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-teal-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Tambah Hadiah
      </button>
    </div>
  );
}

function LotteryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', points_per_entry: 100, max_entries_per_user: 3,
    start_date: '', end_date: '', is_active: true, image_url: '', prizes: [
      { label: 'Hadiah Utama', color: '#FFE66D', description: 'Grand prize!' },
      { label: 'Hadiah 2', color: '#4ECDC4', description: '' },
      { label: 'Coba Lagi', color: '#FF6B6B', description: '' },
    ],
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Judul Undian *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Misal: Lucky Draw Agustus 2026" className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Poin Per Undian</label>
          <input type="number" value={form.points_per_entry} onChange={e => setForm(f => ({ ...f, points_per_entry: Number(e.target.value) }))}
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Maks. Undian Per User</label>
          <input type="number" value={form.max_entries_per_user} onChange={e => setForm(f => ({ ...f, max_entries_per_user: Number(e.target.value) }))}
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Image URL (opsional)</label>
          <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            placeholder="https://..." className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Tanggal Mulai</label>
          <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Tanggal Selesai</label>
          <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">Deskripsi</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={2} placeholder="Deskripsi undian..."
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400" />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-600">Status Aktif</label>
        <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
          className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-teal-500' : 'bg-slate-300'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Hadiah Roulette</label>
        <PrizeEditor prizes={form.prizes || []} onChange={prizes => setForm(f => ({ ...f, prizes }))} />
      </div>
      {/* Preview */}
      {form.prizes?.length > 0 && (
        <div className="flex justify-center pt-2">
          <div>
            <p className="text-xs text-center text-slate-400 mb-3">Preview Roulette</p>
            <RouletteWheel prizes={form.prizes} disabled={true} />
          </div>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.title}
          className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50">Simpan</button>
      </div>
    </div>
  );
}

function EntriesPanel({ lottery }) {
  const { data: entries = [] } = useQuery({
    queryKey: ['lottery-entries', lottery.id],
    queryFn: () => base44.entities.LotteryEntry.filter({ lottery_id: lottery.id }),
    enabled: !!lottery.id,
  });
  const qc = useQueryClient();
  const announceMutation = useMutation({
    mutationFn: ({ winnerId, winnerName, winnerEmail, winnerPrize }) =>
      base44.entities.Lottery.update(lottery.id, {
        winner_announced: true, winner_name: winnerName, winner_email: winnerEmail, winner_prize: winnerPrize,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lotteries-admin'] }),
  });

  if (entries.length === 0) return <p className="text-slate-400 text-sm text-center py-6">Belum ada peserta</p>;

  const pickWinner = () => {
    const idx = Math.floor(Math.random() * entries.length);
    const winner = entries[idx];
    announceMutation.mutate({ winnerName: winner.user_name, winnerEmail: winner.user_email, winnerPrize: winner.spin_result || 'Hadiah Utama' });
  };

  return (
    <div>
      {lottery.winner_announced && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Pemenang</p>
            <p className="font-bold text-amber-800">{lottery.winner_name}</p>
            <p className="text-xs text-amber-600">{lottery.winner_prize}</p>
          </div>
        </div>
      )}
      {!lottery.winner_announced && (
        <button onClick={pickWinner} disabled={announceMutation.isPending}
          className="w-full mb-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4" /> {announceMutation.isPending ? 'Memilih...' : 'Pilih Pemenang Acak'}
        </button>
      )}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {entries.map((e, i) => (
          <div key={e.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{e.user_name || e.user_email}</p>
              <p className="text-xs text-slate-400">{e.spin_result || '—'} · {e.points_spent} poin</p>
            </div>
            <p className="text-[10px] text-slate-400 flex-shrink-0">
              {e.entry_date ? new Date(e.entry_date).toLocaleDateString('id-ID') : '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLottery() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activePanel, setActivePanel] = useState({});

  const { data: lotteries = [], isLoading } = useQuery({
    queryKey: ['lotteries-admin'],
    queryFn: () => base44.entities.Lottery.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Lottery.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lotteries-admin'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lottery.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lotteries-admin'] }); setEditItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Lottery.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lotteries-admin'] }),
  });

  const toggleActive = (lottery) =>
    updateMutation.mutate({ id: lottery.id, data: { is_active: !lottery.is_active } });

  return (
    <AdminPermitLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Undian & Roulette</h1>
          <p className="text-slate-500 text-sm">{lotteries.length} undian terdaftar</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
          <Plus className="w-4 h-4" /> Buat Undian
        </button>
      </div>

      {/* Create / Edit Form */}
      {(showForm || editItem) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800">{editItem ? 'Edit Undian' : 'Buat Undian Baru'}</h2>
            <button onClick={() => { setShowForm(false); setEditItem(null); }} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4 text-slate-500" /></button>
          </div>
          <LotteryForm
            initial={editItem}
            onSave={(data) => editItem ? updateMutation.mutate({ id: editItem.id, data }) : createMutation.mutate(data)}
            onCancel={() => { setShowForm(false); setEditItem(null); }}
          />
        </div>
      )}

      {/* Lottery List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200" />)
        ) : lotteries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <Gift className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada undian. Buat yang pertama!</p>
          </div>
        ) : lotteries.map(lottery => (
          <div key={lottery.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                {lottery.image_url ? (
                  <img src={lottery.image_url} alt={lottery.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-7 h-7 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-800">{lottery.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lottery.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {lottery.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    {lottery.winner_announced && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">🏆 Selesai</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2 line-clamp-1">{lottery.description || 'Tidak ada deskripsi'}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>⭐ {lottery.points_per_entry} poin/spin</span>
                    <span>🎯 Maks {lottery.max_entries_per_user}x/user</span>
                    <span>🎁 {lottery.prizes?.length || 0} hadiah</span>
                    {lottery.end_date && <span>📅 s/d {new Date(lottery.end_date).toLocaleDateString('id-ID')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(lottery)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${lottery.is_active ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}>
                    {lottery.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button onClick={() => setEditItem(lottery)} className="p-2 hover:bg-slate-100 rounded-xl"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                  <button onClick={() => { if (window.confirm('Hapus undian ini?')) deleteMutation.mutate(lottery.id); }}
                    className="p-2 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  <button onClick={() => setExpandedId(id => id === lottery.id ? null : lottery.id)}
                    className="p-2 hover:bg-slate-100 rounded-xl">
                    {expandedId === lottery.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>
            </div>

            {expandedId === lottery.id && (
              <div className="border-t border-slate-100">
                <div className="flex border-b border-slate-100">
                  {['prizes', 'entries', 'roulette'].map(tab => (
                    <button key={tab} onClick={() => setActivePanel(p => ({ ...p, [lottery.id]: tab }))}
                      className={`flex-1 py-2.5 text-xs font-semibold transition-colors capitalize ${(activePanel[lottery.id] || 'prizes') === tab ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}>
                      {tab === 'prizes' ? '🎁 Hadiah' : tab === 'entries' ? '👥 Peserta' : '🎡 Roulette'}
                    </button>
                  ))}
                </div>
                <div className="p-5">
                  {(activePanel[lottery.id] || 'prizes') === 'prizes' && (
                    <div>
                      {(lottery.prizes || []).length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-4">Belum ada hadiah</p>
                      ) : (
                        <div className="space-y-2">
                          {(lottery.prizes || []).map((p, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                              <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: p.color || '#1FB6D5' }} />
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{p.label}</p>
                                {p.description && <p className="text-xs text-slate-400">{p.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {(activePanel[lottery.id] || 'prizes') === 'entries' && <EntriesPanel lottery={lottery} />}
                  {(activePanel[lottery.id] || 'prizes') === 'roulette' && (
                    <div className="flex justify-center py-4">
                      <RouletteWheel prizes={lottery.prizes || []} disabled={false} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminPermitLayout>
  );
}