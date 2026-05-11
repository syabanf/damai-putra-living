import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { appClient } from '@/api/appClient';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye } from 'lucide-react';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';

const STATUS_COLORS = {
  draft: '#94a3b8', open: '#3b82f6', under_review: '#f59e0b',
  waiting_approval: '#f97316', in_progress: '#8b5cf6',
  approved: '#22c55e', rejected: '#ef4444',
  inspection_required: '#d97706', completed: '#059669',
  deposit_returned: '#047857', closed: '#64748b',
};

const STATUS_LABEL = {
  draft: 'Draft', open: 'Submitted', under_review: 'Under Review',
  waiting_approval: 'Waiting Approval', in_progress: 'In Progress',
  approved: 'Approved', rejected: 'Rejected',
  inspection_required: 'Inspection', completed: 'Completed',
  deposit_returned: 'Deposit Returned', closed: 'Closed',
};

const PERMIT_LABELS = {
  izin_kegiatan: 'Izin Kegiatan', renovasi_minor: 'Renovasi Minor', renovasi_mayor: 'Renovasi Mayor',
  pembangunan_kavling: 'Pembangunan Kavling', galian: 'Izin Galian',
  pindah_masuk: 'Pindah Masuk', pindah_keluar: 'Pindah Keluar',
  pencairan_deposit: 'Pencairan Deposit', akses_kontraktor: 'Akses Kontraktor',
};

const STATUS_OPTIONS = ['All', 'open', 'under_review', 'waiting_approval', 'in_progress', 'approved', 'rejected', 'completed', 'closed'];
const TYPE_OPTIONS = ['All', ...Object.keys(PERMIT_LABELS)];

export default function AdminPermitList() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterParam === 'pending' ? 'open' : 'All');
  const [typeFilter, setTypeFilter] = useState('All');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets-list'],
    queryFn: () => appClient.entities.Ticket.list('-created_date', 300),
  });

  const filtered = useMemo(() => tickets.filter(t => {
    const matchSearch = !search ||
      t.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      t.unit_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.reference_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchType = typeFilter === 'All' || t.permit_type === typeFilter;
    return matchSearch && matchStatus && matchType;
  }), [tickets, search, statusFilter, typeFilter]);

  const stBadge = (status) => ({ background: STATUS_COLORS[status] + '22', color: STATUS_COLORS[status] });

  return (
    <AdminPermitLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Permit Requests</h1>
          <p className="text-slate-500 text-sm">{filtered.length} of {tickets.length} requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, email, unit, ref…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : STATUS_LABEL[s]}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : PERMIT_LABELS[t]}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Applicant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Permit Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.map(t => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">{t.reference_number || '—'}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800 whitespace-nowrap">{t.user_name || '—'}</p>
                    <p className="text-xs text-slate-400">{t.user_email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-700 whitespace-nowrap">Unit {t.unit_number}</p>
                    {t.tower && <p className="text-xs text-slate-400">{t.tower}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold text-slate-700">{PERMIT_LABELS[t.permit_type] || t.permit_type}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={stBadge(t.status)}>
                      {STATUS_LABEL[t.status] || t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                    {t.created_date ? new Date(t.created_date).toLocaleDateString('id-ID') : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => navigate(`/AdminPermitDetail?id=${t.id}`)}
                      className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No permits found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPermitLayout>
  );
}