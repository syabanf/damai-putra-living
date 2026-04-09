import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, PlusCircle, Filter } from 'lucide-react';
import RefundLayout from '@/components/refund/RefundLayout';
import RefundStatusBadge from '@/components/refund/RefundStatusBadge';

const currency = (n) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;

const STATUSES = ['All', 'Draft', 'Submitted', 'Under Verification', 'Waiting Inspection Result', 'Waiting Finance Validation', 'Approved', 'Partially Approved', 'Paid', 'Rejected', 'Closed'];

export default function RefundList() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['deposit-refunds-list'],
    queryFn: () => base44.entities.DepositRefundRequest.list('-created_date', 500),
  });

  const filtered = useMemo(() => {
    let list = requests;
    if (filterStatus !== 'All') list = list.filter(r => r.refund_status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.applicant_name?.toLowerCase().includes(q) ||
        r.unit_number?.toLowerCase().includes(q) ||
        r.refund_request_number?.toLowerCase().includes(q) ||
        r.cluster_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, filterStatus, search]);

  return (
    <RefundLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">All Refund Requests</h1>
            <p className="text-sm text-slate-500">{filtered.length} records</p>
          </div>
          <Link to="/RefundSubmission"
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
            <PlusCircle className="w-4 h-4" /> New
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search name, unit, request no..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none appearance-none"
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">No requests found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Request No.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Applicant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Unit</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Type</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Deposit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Deduction</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/RefundDetail?id=${r.id}`}>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.refund_request_number || r.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{r.applicant_name}</td>
                      <td className="px-4 py-3 text-slate-500">{r.cluster_name} {r.block_number}/{r.unit_number}</td>
                      <td className="px-4 py-3 text-slate-500">{r.refund_type}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700">{currency(r.original_deposit_amount)}</td>
                      <td className="px-4 py-3 text-right text-red-600">{r.deduction_amount > 0 ? `-${currency(r.deduction_amount)}` : '—'}</td>
                      <td className="px-4 py-3"><RefundStatusBadge status={r.refund_status} /></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{r.request_date || r.created_date?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RefundLayout>
  );
}