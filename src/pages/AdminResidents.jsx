import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';
import { Search, Home, User, CheckCircle, XCircle, Clock, Building2, ChevronRight } from 'lucide-react';

const STATUS_STYLE = {
  approved: { bg: 'bg-emerald-50 text-emerald-700', label: 'Approved' },
  pending:  { bg: 'bg-amber-50 text-amber-700',    label: 'Pending' },
  rejected: { bg: 'bg-red-50 text-red-700',        label: 'Rejected' },
};

const OWNERSHIP = {
  owner:  { bg: 'bg-blue-50 text-blue-700',  label: 'Owner' },
  tenant: { bg: 'bg-purple-50 text-purple-700', label: 'Tenant' },
};

export default function AdminResidents() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['admin-units'],
    queryFn: () => base44.entities.Unit.list('-created_date', 200),
  });

  const filtered = units.filter(u => {
    const matchSearch = !search || [u.user_name, u.user_email, u.unit_number, u.property_name, u.tower]
      .join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: units.length,
    approved: units.filter(u => u.status === 'approved').length,
    pending: units.filter(u => u.status === 'pending').length,
    rejected: units.filter(u => u.status === 'rejected').length,
  };

  return (
    <AdminPermitLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Data Residents</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola data penghuni dan unit properti terdaftar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Units', value: stats.total, icon: Home, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, email, unit..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none">
          <option value="all">Semua Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Tidak ada data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Resident', 'Properti / Unit', 'Tipe', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.user_name || '-'}</p>
                          <p className="text-xs text-slate-400">{u.user_email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{u.property_name}</p>
                      <p className="text-xs text-slate-400">{[u.tower, u.unit_number].filter(Boolean).join(' · ')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${OWNERSHIP[u.ownership_status]?.bg || 'bg-slate-100 text-slate-600'}`}>
                        {OWNERSHIP[u.ownership_status]?.label || u.ownership_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[u.status]?.bg || 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_STYLE[u.status]?.label || u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(u)}
                        className="text-teal-600 hover:text-teal-800 flex items-center gap-1 text-xs font-semibold">
                        Detail <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-bold text-lg text-slate-800">{selected.user_name || 'No Name'}</h2>
                <p className="text-sm text-slate-400">{selected.user_email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Properti', selected.property_name],
                ['Tower', selected.tower || '-'],
                ['Unit', selected.unit_number],
                ['Tipe Unit', selected.unit_type],
                ['Status Kepemilikan', OWNERSHIP[selected.ownership_status]?.label || selected.ownership_status],
                ['Status Registrasi', STATUS_STYLE[selected.status]?.label || selected.status],
                ['Luas Unit', selected.area_size ? `${selected.area_size} m²` : '-'],
                ['Lantai', selected.floor_number || '-'],
                ['Bedroom', selected.bedroom_count || '-'],
                ['Bathroom', selected.bathroom_count || '-'],
                ['Garasi', selected.garage_count || '-'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-800 text-right">{v || '-'}</span>
                </div>
              ))}
              {selected.ownership_status === 'tenant' && (
                <>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500">Nama Pemilik</span>
                    <span className="font-semibold text-slate-800">{selected.owner_name || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500">Tgl Mulai Sewa</span>
                    <span className="font-semibold text-slate-800">{selected.rent_start_date || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500">Tgl Akhir Sewa</span>
                    <span className="font-semibold text-slate-800">{selected.rent_end_date || '-'}</span>
                  </div>
                </>
              )}
              {selected.rejection_note && (
                <div className="bg-red-50 rounded-xl p-3 mt-2">
                  <p className="text-xs text-red-600 font-semibold">Catatan Penolakan:</p>
                  <p className="text-sm text-red-700 mt-1">{selected.rejection_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPermitLayout>
  );
}