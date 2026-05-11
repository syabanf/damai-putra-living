import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { PlusCircle, TrendingDown, Clock, CheckCircle2, Banknote, AlertCircle, FileCheck, BarChart3 } from 'lucide-react';
import RefundLayout from '@/components/refund/RefundLayout';
import RefundStatusBadge from '@/components/refund/RefundStatusBadge';

const currency = (n) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;

const StatCard = ({ label, value, sub, color = '#1FB6D5', icon: Icon }) => (
  <div className="rounded-2xl p-4 bg-white border border-slate-100 shadow-sm flex items-start gap-3">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '18' }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function RefundDashboard() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['deposit-refunds'],
    queryFn: () => appClient.entities.DepositRefundRequest.list('-created_date', 200),
  });

  const total = requests.length;
  const pending = requests.filter(r => ['Submitted', 'Under Verification'].includes(r.refund_status)).length;
  const pendingInspection = requests.filter(r => r.refund_status === 'Waiting Inspection Result').length;
  const pendingFinance = requests.filter(r => r.refund_status === 'Waiting Finance Validation').length;
  const approved = requests.filter(r => ['Approved', 'Partially Approved'].includes(r.refund_status)).length;
  const paid = requests.filter(r => r.refund_status === 'Paid').length;
  const totalDeposit = requests.reduce((s, r) => s + (r.original_deposit_amount || 0), 0);
  const totalRefunded = requests.filter(r => r.refund_status === 'Paid').reduce((s, r) => s + (r.approved_refund_amount || 0), 0);
  const totalDeductions = requests.reduce((s, r) => s + (r.deduction_amount || 0), 0);

  const STATUS_GROUPS = [
    { label: 'Draft', count: requests.filter(r => r.refund_status === 'Draft').length, color: '#94a3b8' },
    { label: 'Submitted', count: requests.filter(r => r.refund_status === 'Submitted').length, color: '#3b82f6' },
    { label: 'Under Verification', count: requests.filter(r => r.refund_status === 'Under Verification').length, color: '#d97706' },
    { label: 'Waiting Inspection', count: pendingInspection, color: '#7c3aed' },
    { label: 'Waiting Finance', count: pendingFinance, color: '#ea580c' },
    { label: 'Approved', count: approved, color: '#059669' },
    { label: 'Paid', count: paid, color: '#10b981' },
    { label: 'Rejected', count: requests.filter(r => r.refund_status === 'Rejected').length, color: '#dc2626' },
  ];

  const recent = [...requests].slice(0, 8);

  return (
    <RefundLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Deposit Refund Dashboard</h1>
            <p className="text-sm text-slate-500">Pencairan Deposit — Overview</p>
          </div>
          <Link to="/RefundSubmission"
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
            <PlusCircle className="w-4 h-4" /> New Request
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Requests" value={total} icon={BarChart3} color="#3b82f6" />
          <StatCard label="Pending Verification" value={pending} icon={Clock} color="#d97706" />
          <StatCard label="Approved / Unpaid" value={approved} icon={FileCheck} color="#059669" />
          <StatCard label="Paid" value={paid} icon={CheckCircle2} color="#10b981" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <StatCard label="Total Deposit Value" value={currency(totalDeposit)} icon={Banknote} color="#6366f1" sub="Across all requests" />
          <StatCard label="Total Refunded" value={currency(totalRefunded)} icon={CheckCircle2} color="#059669" sub="Paid to applicants" />
          <StatCard label="Total Deductions" value={currency(totalDeductions)} icon={TrendingDown} color="#dc2626" sub="Damage / admin fees" />
        </div>

        {/* Status distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-700 text-sm mb-4">Status Distribution</h2>
          <div className="space-y-2.5">
            {STATUS_GROUPS.map(sg => (
              <div key={sg.label} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-40 flex-shrink-0">{sg.label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: total ? `${(sg.count / total) * 100}%` : '0%', background: sg.color }} />
                </div>
                <span className="text-xs font-bold text-slate-700 w-6 text-right">{sg.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending actions */}
        {(pendingInspection > 0 || pendingFinance > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Action Required</p>
              {pendingInspection > 0 && <p className="text-amber-700 text-xs mt-0.5">{pendingInspection} request(s) waiting inspection clearance</p>}
              {pendingFinance > 0 && <p className="text-amber-700 text-xs">{pendingFinance} request(s) waiting finance validation</p>}
            </div>
          </div>
        )}

        {/* Recent requests */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 text-sm">Recent Requests</h2>
            <Link to="/RefundList" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
          ) : recent.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No refund requests yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map(r => (
                <Link key={r.id} to={`/RefundDetail?id=${r.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{r.applicant_name}</p>
                    <p className="text-xs text-slate-400">{r.unit_number} · {r.refund_request_number || r.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-700">{currency(r.original_deposit_amount)}</p>
                    <RefundStatusBadge status={r.refund_status} size="xs" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </RefundLayout>
  );
}