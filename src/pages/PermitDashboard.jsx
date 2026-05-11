import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileText, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import PermitLayout from '@/components/permit-mgmt/PermitLayout';
import PermitStatusBadge from '@/components/permit-mgmt/PermitStatusBadge';
import { createPageUrl } from '@/utils';

const STATUS_COLORS = {
  'Draft': '#94a3b8', 'Submitted': '#3b82f6', 'Under Review': '#f59e0b',
  'Revision Needed': '#f97316', 'Approved': '#22c55e', 'Rejected': '#ef4444', 'Closed': '#64748b'
};
const PIE_COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#64748b', '#f97316'];

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function PermitDashboard() {
  const navigate = useNavigate();
  const { data: permits = [], isLoading } = useQuery({
    queryKey: ['permits-dashboard'],
    queryFn: () => appClient.entities.PermitApplication.list('-created_date', 200),
  });
  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections-dash'],
    queryFn: () => appClient.entities.Inspection.list('-created_date', 50),
  });

  const stats = useMemo(() => {
    const total = permits.length;
    const pending = permits.filter(p => ['Submitted', 'Under Review'].includes(p.application_status)).length;
    const approved = permits.filter(p => p.application_status === 'Approved').length;
    const revision = permits.filter(p => p.application_status === 'Revision Needed').length;
    const minor = permits.filter(p => p.permit_type === 'Minor Renovation').length;
    const major = permits.filter(p => p.permit_type === 'Major Renovation').length;

    const byStatus = Object.entries(
      permits.reduce((acc, p) => { acc[p.application_status] = (acc[p.application_status] || 0) + 1; return acc; }, {})
    ).map(([name, value]) => ({ name, value }));

    const byType = [
      { name: 'Minor Renovation', value: minor },
      { name: 'Major Renovation', value: major },
    ];

    return { total, pending, approved, revision, byStatus, byType };
  }, [permits]);

  const recent = permits.slice(0, 8);
  const awaitingInspection = inspections.filter(i => i.inspection_result === 'Need Revision' || i.inspection_result === 'Hold');

  return (
    <PermitLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Permit Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of all renovation permit applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Permits" value={stats.total} icon={FileText} color="text-slate-600" sub="All time" />
        <StatCard label="Awaiting Review" value={stats.pending} icon={Clock} color="text-blue-500" sub="Action needed" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="text-green-500" sub="Completed" />
        <StatCard label="Needs Revision" value={stats.revision} icon={AlertTriangle} color="text-orange-500" sub="Follow up" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Permits by Status</h3>
          {isLoading ? <div className="h-48 animate-pulse bg-slate-100 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.byStatus} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.byStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Minor vs Major Renovation</h3>
          {isLoading ? <div className="h-48 animate-pulse bg-slate-100 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={stats.byType} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, value }) => `${value}`}>
                  {stats.byType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Permits */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Recent Submissions</h3>
          <button onClick={() => navigate(createPageUrl('PermitList'))} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Permit No.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Applicant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
                ))
              ) : recent.map(p => (
                <tr key={p.id} onClick={() => navigate(`/PermitDetail?id=${p.id}`)}
                  className="border-b border-slate-50 hover:bg-blue-50/50 cursor-pointer transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-blue-700">{p.permit_number || '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.applicant_name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.cluster_name} {p.block_number}/{p.unit_number}</td>
                  <td className="px-4 py-3"><PermitStatusBadge status={p.permit_type} size="xs" /></td>
                  <td className="px-4 py-3"><PermitStatusBadge status={p.application_status} size="xs" /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{p.submission_date || '—'}</td>
                </tr>
              ))}
              {!isLoading && recent.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No permits yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PermitLayout>
  );
}