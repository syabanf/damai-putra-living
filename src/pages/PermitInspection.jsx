import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Plus, Search, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import PermitLayout from '@/components/permit-mgmt/PermitLayout';

function InspectionModal({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    application_id: '', inspection_date: new Date().toISOString().split('T')[0],
    inspector_name: '', inspection_type: 'Progress Check',
    site_condition: '', issue_found: '', issue_severity: 'None',
    corrective_action: '', follow_up_deadline: '',
    inspection_result: 'Pass', notes: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { data: permits = [] } = useQuery({
    queryKey: ['permits-for-inspection'],
    queryFn: () => appClient.entities.PermitApplication.list('-created_date', 100),
  });

  const mutation = useMutation({
    mutationFn: () => appClient.entities.Inspection.create({ ...form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-inspections'] }); onClose(); },
  });

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const Field = ({ label, children }) => <div><label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>{children}</div>;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">New Inspection Report</h3>
        <div className="space-y-3">
          <Field label="Permit Application">
            <select className={inputCls} value={form.application_id} onChange={e => set('application_id', e.target.value)}>
              <option value="">Select permit...</option>
              {permits.map(p => <option key={p.id} value={p.id}>{p.permit_number} — {p.applicant_name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inspection Date"><input className={inputCls} type="date" value={form.inspection_date} onChange={e => set('inspection_date', e.target.value)} /></Field>
            <Field label="Inspector Name"><input className={inputCls} value={form.inspector_name} onChange={e => set('inspector_name', e.target.value)} /></Field>
            <Field label="Inspection Type">
              <select className={inputCls} value={form.inspection_type} onChange={e => set('inspection_type', e.target.value)}>
                {['Initial Check', 'Progress Check', 'Final Check', 'Deposit Release Check'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Result">
              <select className={inputCls} value={form.inspection_result} onChange={e => set('inspection_result', e.target.value)}>
                {['Pass', 'Need Revision', 'Hold', 'Failed'].map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Site Condition"><input className={inputCls} value={form.site_condition} onChange={e => set('site_condition', e.target.value)} /></Field>
          <Field label="Issue Found"><textarea className={inputCls} rows={2} value={form.issue_found} onChange={e => set('issue_found', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Issue Severity">
              <select className={inputCls} value={form.issue_severity} onChange={e => set('issue_severity', e.target.value)}>
                {['None', 'Minor', 'Moderate', 'Critical'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Follow-up Deadline"><input className={inputCls} type="date" value={form.follow_up_deadline} onChange={e => set('follow_up_deadline', e.target.value)} /></Field>
          </div>
          <Field label="Corrective Action"><textarea className={inputCls} rows={2} value={form.corrective_action} onChange={e => set('corrective_action', e.target.value)} /></Field>
          <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></Field>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.application_id}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Save Inspection'}
          </button>
        </div>
      </div>
    </div>
  );
}

const RESULT_ICON = {
  Pass: <CheckCircle className="w-4 h-4 text-green-500" />,
  Failed: <XCircle className="w-4 h-4 text-red-500" />,
  Hold: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  'Need Revision': <AlertTriangle className="w-4 h-4 text-yellow-500" />,
};

export default function PermitInspection() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['all-inspections'],
    queryFn: () => appClient.entities.Inspection.list('-created_date', 200),
  });

  const { data: permits = [] } = useQuery({
    queryKey: ['permits-for-insp'],
    queryFn: () => appClient.entities.PermitApplication.list('-created_date', 200),
  });

  const getPermit = (id) => permits.find(p => p.id === id);

  const filtered = inspections.filter(i => {
    const p = getPermit(i.application_id);
    const matchSearch = !search || p?.applicant_name?.toLowerCase().includes(search.toLowerCase()) || p?.permit_number?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || i.inspection_type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <PermitLayout>
      {showModal && <InspectionModal onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inspections</h1>
          <p className="text-slate-500 text-sm">{filtered.length} inspection records</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> New Inspection
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by permit or applicant..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {['All', 'Initial Check', 'Progress Check', 'Final Check', 'Deposit Release Check'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Permit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Inspector</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Severity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Result</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              )) : filtered.map(ins => {
                const p = getPermit(ins.application_id);
                return (
                  <tr key={ins.id} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-xs font-bold text-blue-700">{p?.permit_number || ins.application_id.slice(-6)}</p>
                      <p className="text-xs text-slate-400">{p?.applicant_name}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs whitespace-nowrap">{ins.inspection_date}</td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{ins.inspection_type}</td>
                    <td className="px-4 py-3.5 text-slate-600">{ins.inspector_name}</td>
                    <td className="px-4 py-3.5">
                      {ins.issue_severity && ins.issue_severity !== 'None' && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ins.issue_severity === 'Critical' ? 'bg-red-100 text-red-700' : ins.issue_severity === 'Moderate' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {ins.issue_severity}
                        </span>
                      )}
                      {ins.issue_severity === 'None' && <span className="text-xs text-slate-300">None</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {RESULT_ICON[ins.inspection_result]}
                        <span className="text-xs font-semibold text-slate-700">{ins.inspection_result}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {p && <button onClick={() => navigate(`/PermitDetail?id=${p.id}`)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"><Eye className="w-4 h-4" /></button>}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No inspections found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PermitLayout>
  );
}