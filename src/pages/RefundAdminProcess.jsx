import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';
import {
  Search, Eye, FileText, Check, X, AlertCircle, ArrowLeft,
  Banknote, User, ChevronRight, Send, Clock, CheckCircle, XCircle
} from 'lucide-react';

const STATUS_STYLE = {
  'Draft':                    { bg: '#f1f5f9', color: '#64748b' },
  'Submitted':                { bg: '#eff6ff', color: '#3b82f6' },
  'Under Verification':       { bg: '#fffbeb', color: '#d97706' },
  'Waiting Inspection Result':{ bg: '#fff7ed', color: '#ea580c' },
  'Waiting Finance Validation':{ bg: '#f5f3ff', color: '#7c3aed' },
  'Approved':                 { bg: '#ecfdf5', color: '#059669' },
  'Partially Approved':       { bg: '#f0fdf4', color: '#16a34a' },
  'Rejected':                 { bg: '#fef2f2', color: '#dc2626' },
  'Paid':                     { bg: '#ecfdf5', color: '#047857' },
  'Closed':                   { bg: '#f8fafc', color: '#94a3b8' },
};

const NEXT_STATUSES = {
  'Submitted':                 ['Under Verification', 'Rejected'],
  'Under Verification':        ['Waiting Inspection Result', 'Waiting Finance Validation', 'Rejected'],
  'Waiting Inspection Result': ['Waiting Finance Validation', 'Rejected'],
  'Waiting Finance Validation':['Approved', 'Partially Approved', 'Rejected'],
  'Approved':                  ['Paid', 'Closed'],
  'Partially Approved':        ['Paid', 'Closed'],
};

const STATUS_BTN = (status) => {
  if (status === 'Rejected') return 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100';
  if (status === 'Approved' || status === 'Paid' || status === 'Partially Approved') return 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100';
  return 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100';
};

function ChecklistPanel({ requestId }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['refund-checklist', requestId],
    queryFn: () => base44.entities.RefundDocumentChecklist.filter({ refund_request_id: requestId }),
    enabled: !!requestId,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RefundDocumentChecklist.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['refund-checklist', requestId] }),
  });

  if (items.length === 0) return <p className="text-slate-400 text-sm text-center py-6">Tidak ada checklist dokumen</p>;

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.id} className={`rounded-xl border p-3 ${
          item.verification_status === 'Valid' ? 'border-emerald-200 bg-emerald-50' :
          item.verification_status === 'Invalid' ? 'border-red-200 bg-red-50' :
          item.verification_status === 'Need Revision' ? 'border-amber-200 bg-amber-50' :
          'border-slate-200 bg-white'
        }`}>
          <div className="flex items-start gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
            <p className="text-xs font-medium text-slate-700 flex-1 leading-relaxed">
              {item.checklist_item_name}
              {item.is_required && <span className="text-red-500 ml-1">*</span>}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              {item.is_uploaded && item.uploaded_file ? (
                <a href={item.uploaded_file} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Lihat Dokumen
                </a>
              ) : item.is_uploaded ? (
                <span className="text-xs text-emerald-600">✓ Uploaded</span>
              ) : (
                <span className="text-xs text-slate-400 italic">Belum diupload</span>
              )}
            </div>
            <div className="flex gap-1.5">
              {[
                { status: 'Valid', icon: Check, active: 'bg-emerald-500 text-white', hover: 'hover:bg-emerald-100' },
                { status: 'Need Revision', icon: AlertCircle, active: 'bg-amber-500 text-white', hover: 'hover:bg-amber-100' },
                { status: 'Invalid', icon: X, active: 'bg-red-500 text-white', hover: 'hover:bg-red-100' },
              ].map(({ status, icon: Icon, active, hover }) => (
                <button key={status} onClick={() => updateMutation.mutate({ id: item.id, data: { verification_status: status } })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${item.verification_status === status ? active : `bg-slate-100 text-slate-500 ${hover}`}`}>
                  <Icon className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RequestDetail({ request, onClose }) {
  const qc = useQueryClient();
  const [verifierNotes, setVerifierNotes] = useState(request.verifier_notes || '');
  const [approvedAmount, setApprovedAmount] = useState(request.approved_refund_amount || '');
  const [deductionAmount, setDeductionAmount] = useState(request.deduction_amount || '');

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.DepositRefundRequest.update(request.id, data),
    onSuccess: async (_, vars) => {
      // Log activity
      await base44.entities.RefundActivityLog.create({
        refund_request_id: request.id,
        activity_type: 'Status Changed',
        activity_description: `Status diubah ke ${vars.refund_status || request.refund_status} oleh admin. ${verifierNotes ? 'Catatan: ' + verifierNotes : ''}`,
        performed_by: 'Admin',
        performed_at: new Date().toISOString(),
      }).catch(() => {});
      qc.invalidateQueries({ queryKey: ['refund-requests-admin'] });
      onClose();
    },
  });

  const saveNotesMutation = useMutation({
    mutationFn: () => base44.entities.DepositRefundRequest.update(request.id, {
      verifier_notes: verifierNotes,
      approved_refund_amount: approvedAmount ? Number(approvedAmount) : undefined,
      deduction_amount: deductionAmount ? Number(deductionAmount) : undefined,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['refund-requests-admin'] }),
  });

  const nextStatuses = NEXT_STATUSES[request.refund_status] || [];
  const st = STATUS_STYLE[request.refund_status] || STATUS_STYLE['Draft'];
  const currency = n => n ? `IDR ${Number(n).toLocaleString('id-ID')}` : '—';
  const Row = ({ l, v }) => v ? (
    <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{l}</span>
      <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%]">{v}</span>
    </div>
  ) : null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onClose} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-slate-800">{request.applicant_name}</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{request.refund_status}</span>
          </div>
          <p className="text-slate-500 text-sm">{request.refund_request_number} · {request.refund_type}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: info + checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Informasi Pemohon</h3>
            </div>
            <Row l="Nama Pemohon" v={request.applicant_name} />
            <Row l="Nomor KTP" v={request.ktp_number} />
            <Row l="Telepon" v={request.phone_number} />
            <Row l="Unit" v={`${request.cluster_name || ''} ${request.block_number || ''} ${request.unit_number}`.trim()} />
            <Row l="Jenis Refund" v={request.refund_type} />
            <Row l="Alasan" v={request.refund_reason} />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Banknote className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Detail Keuangan &amp; Rekening</h3>
            </div>
            <Row l="Deposit Awal" v={currency(request.original_deposit_amount)} />
            <Row l="Potongan" v={currency(request.deduction_amount)} />
            <Row l="Disetujui" v={currency(request.approved_refund_amount)} />
            <div className="border-t border-slate-100 mt-2 pt-2">
              <Row l="Bank" v={request.bank_name} />
              <Row l="Nomor Rekening" v={request.bank_account_number} />
              <Row l="Pemilik Rekening" v={request.bank_account_holder_name} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <FileText className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Checklist Dokumen</h3>
            </div>
            <ChecklistPanel requestId={request.id} />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          {/* Status timeline */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4">Status Pengajuan</h3>
            <div className="space-y-2">
              {['Submitted', 'Under Verification', 'Waiting Inspection Result', 'Waiting Finance Validation', 'Approved', 'Paid'].map(s => {
                const cfg = STATUS_STYLE[s] || {};
                const isActive = request.refund_status === s;
                return (
                  <div key={s} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all`}
                    style={isActive ? { background: cfg.color, color: '#fff' } : { background: '#f8fafc', color: '#94a3b8' }}>
                    {isActive ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0" />}
                    {s}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Tindakan Admin</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Jumlah Disetujui (IDR)</label>
              <input type="number" placeholder="Jumlah refund yang disetujui"
                value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Potongan (IDR)</label>
              <input type="number" placeholder="Jumlah potongan jika ada"
                value={deductionAmount} onChange={e => setDeductionAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Catatan Verifikator</label>
              <textarea value={verifierNotes} onChange={e => setVerifierNotes(e.target.value)}
                placeholder="Catatan internal..." rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <button onClick={() => saveNotesMutation.mutate()}
              disabled={saveNotesMutation.isPending}
              className="w-full py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              {saveNotesMutation.isPending ? 'Menyimpan...' : '💾 Simpan Catatan'}
            </button>

            {nextStatuses.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500">Update Status</label>
                <div className="space-y-2">
                  {nextStatuses.map(status => (
                    <button key={status}
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({
                        refund_status: status,
                        verifier_notes: verifierNotes,
                        approved_refund_amount: approvedAmount ? Number(approvedAmount) : undefined,
                        deduction_amount: deductionAmount ? Number(deductionAmount) : undefined,
                      })}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${STATUS_BTN(status)}`}>
                      {updateMutation.isPending ? 'Menyimpan...' : status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RefundAdminProcess() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['refund-requests-admin'],
    queryFn: () => base44.entities.DepositRefundRequest.list('-created_date', 200),
  });

  const statuses = ['All', 'Submitted', 'Under Verification', 'Waiting Inspection Result', 'Waiting Finance Validation', 'Approved', 'Partially Approved', 'Paid', 'Rejected', 'Closed'];

  const filtered = requests.filter(r => {
    const matchStatus = filterStatus === 'All' || r.refund_status === filterStatus;
    const matchSearch = !search ||
      r.applicant_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.refund_request_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.unit_number?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stBadge = (status) => STATUS_STYLE[status] || STATUS_STYLE['Draft'];
  const currency = n => n ? `IDR ${Number(n).toLocaleString('id-ID')}` : '—';

  if (selectedRequest) {
    return (
      <AdminPermitLayout>
        <RequestDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      </AdminPermitLayout>
    );
  }

  return (
    <AdminPermitLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Refund Deposit</h1>
          <p className="text-slate-500 text-sm">{filtered.length} pengajuan pencairan deposit</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Cari nama, nomor pengajuan, unit…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'Semua Status' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">No. Pengajuan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pemohon</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Jenis</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deposit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tanggal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-5 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.map(r => {
                const st = stBadge(r.refund_status);
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-emerald-700 whitespace-nowrap">{r.refund_request_number || '—'}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 whitespace-nowrap">{r.applicant_name}</p>
                      <p className="text-xs text-slate-400">{r.phone_number}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{`${r.cluster_name || ''} ${r.block_number || ''} ${r.unit_number}`.trim()}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">{r.refund_type}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">{currency(r.original_deposit_amount)}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: st.bg, color: st.color }}>
                        {r.refund_status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {r.created_date ? new Date(r.created_date).toLocaleDateString('id-ID') : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setSelectedRequest(r)}
                        className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">Tidak ada pengajuan refund</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPermitLayout>
  );
}