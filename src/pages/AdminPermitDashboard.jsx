import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { appClient } from '@/api/appClient';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  FileText, CheckCircle, Clock, AlertTriangle, ArrowRight,
  Inbox, Wrench, Truck, Building2, Shovel, Users, Banknote, Calendar
} from 'lucide-react';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';

const STATUS_COLORS = {
  draft: '#94a3b8', open: '#3b82f6', under_review: '#f59e0b',
  waiting_approval: '#f97316', in_progress: '#8b5cf6',
  approved: '#22c55e', rejected: '#ef4444',
  inspection_required: '#d97706', completed: '#059669',
  deposit_returned: '#047857', closed: '#64748b',
};

const PERMIT_ICONS = {
  izin_kegiatan: Calendar, renovasi_minor: Wrench, renovasi_mayor: Wrench,
  pembangunan_kavling: Building2, galian: Shovel,
  pindah_masuk: Truck, pindah_keluar: Truck,
  pencairan_deposit: Banknote, akses_kontraktor: Users,
};

const PERMIT_LABELS = {
  izin_kegiatan: 'Izin Kegiatan', renovasi_minor: 'Renovasi Minor', renovasi_mayor: 'Renovasi Mayor',
  pembangunan_kavling: 'Pembangunan Kavling', galian: 'Izin Galian',
  pindah_masuk: 'Pindah Masuk', pindah_keluar: 'Pindah Keluar',
  pencairan_deposit: 'Pencairan Deposit', akses_kontraktor: 'Akses Kontraktor',
};

const STATUS_LABEL = {
  draft: 'Draft', open: 'Submitted', under_review: 'Under Review',
  waiting_approval: 'Waiting Approval', in_progress: 'In Progress',
  approved: 'Approved', rejected: 'Rejected',
  inspection_required: 'Inspection', completed: 'Completed',
  deposit_returned: 'Deposit Returned', closed: 'Closed',
};

function StatCard({ label, value, icon: Icon, colorClass, bgClass, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
          <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminPermitDashboard() {
  const navigate = useNavigate();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => appClient.entities.Ticket.list('-created_date', 300),
  });

  const stats = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter(t => ['open', 'under_review', 'waiting_approval'].includes(t.status)).length;
    const approved = tickets.filter(t => t.status === 'approved').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;

    const byStatus = Object.entries(
      tickets.reduce((acc, t) => {
        const label = STATUS_LABEL[t.status] || t.status;
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const byType = Object.entries(
      tickets.reduce((acc, t) => {
        const label = PERMIT_LABELS[t.permit_type] || t.permit_type || 'Other';
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return { total, pending, approved, inProgress, byStatus, byType };
  }, [tickets]);

  // Pending action = needs admin attention
  const actionNeeded = tickets.filter(t => ['open', 'under_review', 'waiting_approval'].includes(t.status));
  const recent = tickets.slice(0, 6);

  const st = (status) => ({ background: STATUS_COLORS[status] + '22', color: STATUS_COLORS[status] });

  return (
    <AdminPermitLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Digital permit management — all user submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Requests" value={stats.total} icon={FileText} colorClass="text-slate-600" bgClass="bg-slate-100" sub="All time" />
        <StatCard label="Needs Action" value={stats.pending} icon={Clock} colorClass="text-blue-600" bgClass="bg-blue-100" sub="Awaiting review" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle} colorClass="text-green-600" bgClass="bg-green-100" sub="Completed" />
        <StatCard label="In Progress" value={stats.inProgress} icon={AlertTriangle} colorClass="text-purple-600" bgClass="bg-purple-100" sub="Active permits" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Permits by Status</h3>
          {isLoading ? <div className="h-48 animate-pulse bg-slate-100 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.byStatus} margin={{ top: 0, right: 0, bottom: 20, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.byStatus.map((_, i) => <Cell key={i} fill={Object.values(STATUS_COLORS)[i % Object.values(STATUS_COLORS).length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Permits by Type</h3>
          {isLoading ? <div className="h-48 animate-pulse bg-slate-100 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.byType} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Needs Action + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Needs action */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-slate-700 text-sm">Needs Action</h3>
              {actionNeeded.length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{actionNeeded.length}</span>
              )}
            </div>
            <button onClick={() => navigate('/AdminPermitList?filter=pending')} className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {actionNeeded.slice(0, 5).map(t => {
              const Icon = PERMIT_ICONS[t.permit_type] || FileText;
              return (
                <button key={t.id} onClick={() => navigate(`/AdminPermitDetail?id=${t.id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-blue-50/50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.user_name || t.user_email}</p>
                    <p className="text-xs text-slate-400 truncate">{PERMIT_LABELS[t.permit_type]} · Unit {t.unit_number}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={st(t.status)}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </button>
              );
            })}
            {actionNeeded.length === 0 && !isLoading && (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">No pending items</div>
            )}
          </div>
        </div>

        {/* Recent */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700 text-sm">Recent Submissions</h3>
            <button onClick={() => navigate('/AdminPermitList')} className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recent.map(t => {
              const Icon = PERMIT_ICONS[t.permit_type] || FileText;
              return (
                <button key={t.id} onClick={() => navigate(`/AdminPermitDetail?id=${t.id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.user_name || t.user_email}</p>
                    <p className="text-xs text-slate-400 truncate">{PERMIT_LABELS[t.permit_type]} · {t.created_date ? new Date(t.created_date).toLocaleDateString('id-ID') : ''}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={st(t.status)}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </button>
              );
            })}
            {isLoading && Array(4).fill(0).map((_, i) => (
              <div key={i} className="px-5 py-3 flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                  <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPermitLayout>
  );
}