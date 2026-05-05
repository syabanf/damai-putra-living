import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';
import { Search, Star, TrendingUp, Users, Award, ChevronRight, Plus, X, Save } from 'lucide-react';

export default function AdminLoyaltyPoints() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  const { data: pointsRecords = [], isLoading } = useQuery({
    queryKey: ['admin-loyalty-points'],
    queryFn: () => base44.entities.UserPoints.list('-balance', 500),
  });

  const { data: scannedReceipts = [] } = useQuery({
    queryKey: ['admin-receipts'],
    queryFn: () => base44.entities.ScannedReceipt.list('-created_date', 100),
  });

  const { data: rewardClaims = [] } = useQuery({
    queryKey: ['admin-reward-claims'],
    queryFn: () => base44.entities.RewardClaim.list('-created_date', 100),
  });

  const adjustMutation = useMutation({
    mutationFn: async ({ record, delta }) => {
      const newBalance = Math.max(0, (record.balance || 0) + delta);
      return base44.entities.UserPoints.update(record.id, {
        balance: newBalance,
        total_earned: delta > 0 ? (record.total_earned || 0) + delta : record.total_earned,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-loyalty-points'] });
      setShowAdjust(false);
      setAdjustPoints('');
      setAdjustNote('');
    },
  });

  const totalPoints = pointsRecords.reduce((s, r) => s + (r.balance || 0), 0);
  const totalMembers = pointsRecords.length;
  const totalReceipts = scannedReceipts.length;
  const totalClaims = rewardClaims.length;

  const filtered = pointsRecords.filter(r =>
    !search || [r.user_name, r.user_email].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPermitLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">CRM Loyalty Points</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau dan kelola poin loyalitas seluruh member</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Poin Beredar', value: totalPoints.toLocaleString(), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Total Member', value: totalMembers, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Scan Struk', value: totalReceipts, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Reward Diklaim', value: totalClaims, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-800 truncate">{s.value}</p>
              <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email member..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
        </div>
      </div>

      {/* Member Points Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="font-bold text-slate-700">Poin Member</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Tidak ada data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Member', 'Poin Saldo', 'Total Didapat', 'Total Dipakai', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{r.user_name || r.user_email || '-'}</p>
                      <p className="text-xs text-slate-400">{r.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-800">{(r.balance || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{(r.total_earned || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{(r.total_redeemed || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelected(r); setShowAdjust(true); }}
                        className="text-teal-600 hover:text-teal-800 flex items-center gap-1 text-xs font-semibold">
                        Adjust <Plus className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Receipts */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="font-bold text-slate-700">Riwayat Scan Struk Terbaru</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {scannedReceipts.slice(0, 10).map(r => (
            <div key={r.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700 text-sm">{r.user_name || r.user_email}</p>
                <p className="text-xs text-slate-400">#{r.receipt_number} · {r.scan_date ? new Date(r.scan_date).toLocaleDateString('id-ID') : '-'}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  r.status === 'verified' ? 'bg-emerald-50 text-emerald-700' :
                  r.status === 'duplicate' ? 'bg-red-50 text-red-700' :
                  'bg-amber-50 text-amber-700'
                }`}>{r.status}</span>
                {r.points_earned > 0 && (
                  <p className="text-xs text-amber-600 font-semibold mt-0.5">+{r.points_earned} pts</p>
                )}
              </div>
            </div>
          ))}
          {scannedReceipts.length === 0 && (
            <div className="p-8 text-center text-slate-400">Belum ada struk yang di-scan</div>
          )}
        </div>
      </div>

      {/* Adjust Points Modal */}
      {showAdjust && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowAdjust(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-slate-800">Adjust Poin</h2>
              <button onClick={() => setShowAdjust(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div>
                <p className="text-xs text-amber-600 font-semibold">{selected.user_name || selected.user_email}</p>
                <p className="text-lg font-bold text-amber-700">Saldo: {(selected.balance || 0).toLocaleString()} poin</p>
              </div>
            </div>
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Delta Poin (+ untuk tambah, - untuk kurangi)
              </label>
              <input type="number" value={adjustPoints}
                onChange={e => setAdjustPoints(e.target.value)}
                placeholder="e.g. 100 atau -50"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Catatan (opsional)</label>
              <input type="text" value={adjustNote}
                onChange={e => setAdjustNote(e.target.value)}
                placeholder="Alasan penyesuaian..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
            </div>
            <button
              onClick={() => adjustMutation.mutate({ record: selected, delta: parseInt(adjustPoints) || 0 })}
              disabled={!adjustPoints || adjustMutation.isPending}
              className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {adjustMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      )}
    </AdminPermitLayout>
  );
}