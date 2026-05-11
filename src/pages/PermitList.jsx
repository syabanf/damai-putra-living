import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Search, Plus, Eye } from 'lucide-react';
import PermitLayout from '@/components/permit-mgmt/PermitLayout';
import PermitStatusBadge from '@/components/permit-mgmt/PermitStatusBadge';
import { createPageUrl } from '@/utils';

const STATUSES = ['All', 'Draft', 'Submitted', 'Under Review', 'Revision Needed', 'Approved', 'Rejected', 'Closed'];
const TYPES = ['All', 'Minor Renovation', 'Major Renovation'];

export default function PermitList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const { data: permits = [], isLoading } = useQuery({
    queryKey: ['permits-list'],
    queryFn: () => appClient.entities.PermitApplication.list('-created_date', 200),
  });

  const filtered = useMemo(() => {
    return permits.filter(p => {
      const matchSearch = !search ||
        p.applicant_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.permit_number?.toLowerCase().includes(search.toLowerCase()) ||
        p.unit_number?.toLowerCase().includes(search.toLowerCase()) ||
        p.cluster_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || p.application_status === statusFilter;
      const matchType = typeFilter === 'All' || p.permit_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [permits, search, statusFilter, typeFilter]);

  return (
    <PermitLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Permits</h1>
          <p className="text-slate-500 text-sm">{filtered.length} of {permits.length} permits</p>
        </div>
        <button onClick={() => navigate(createPageUrl('PermitSubmission'))}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors w-fit">
          <Plus className="w-4 h-4" /> New Application
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, permit number, unit..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Permit No.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Applicant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Property</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Start</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deposit</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-5 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">{p.permit_number || '—'}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800 whitespace-nowrap">{p.applicant_name}</p>
                    <p className="text-xs text-slate-400">{p.phone_number}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-700 whitespace-nowrap">{p.cluster_name} Blok {p.block_number}</p>
                    <p className="text-xs text-slate-400">Unit {p.unit_number} — {p.property_type}</p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap"><PermitStatusBadge status={p.permit_type} size="xs" /></td>
                  <td className="px-4 py-3.5 whitespace-nowrap"><PermitStatusBadge status={p.application_status} size="xs" /></td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">{p.start_date || '—'}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">{p.duration_days ? `${p.duration_days} days` : '—'}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                    {p.deposit_amount ? `Rp ${(p.deposit_amount/1e6).toFixed(1)}M` : '—'}
                    {p.deposit_status && p.deposit_status !== 'Not Required' && (
                      <span className="ml-1 text-xs text-slate-400">({p.deposit_status})</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => navigate(`/PermitDetail?id=${p.id}`)}
                      className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-400">No permits found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PermitLayout>
  );
}