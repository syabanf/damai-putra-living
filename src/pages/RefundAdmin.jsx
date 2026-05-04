import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, FileText, User,
  ChevronDown, ChevronUp, Check, X, AlertCircle, Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_STYLE = {
  'Draft':                   { bg: '#f1f5f9', color: '#64748b' },
  'Submitted':               { bg: '#eff6ff', color: '#3b82f6' },
  'Under Verification':      { bg: '#fffbeb', color: '#d97706' },
  'Waiting Inspection Result':{ bg: '#fff7ed', color: '#ea580c' },
  'Waiting Finance Validation':{ bg: '#f5f3ff', color: '#7c3aed' },
  'Approved':                { bg: '#ecfdf5', color: '#059669' },
  'Partially Approved':      { bg: '#f0fdf4', color: '#16a34a' },
  'Rejected':                { bg: '#fef2f2', color: '#dc2626' },
  'Paid':                    { bg: '#ecfdf5', color: '#047857' },
  'Closed':                  { bg: '#f8fafc', color: '#94a3b8' },
};

const NEXT_STATUSES = {
  'Submitted': ['Under Verification', 'Rejected'],
  'Under Verification': ['Waiting Inspection Result', 'Waiting Finance Validation', 'Rejected'],
  'Waiting Inspection Result': ['Waiting Finance Validation', 'Rejected'],
  'Waiting Finance Validation': ['Approved', 'Partially Approved', 'Rejected'],
  'Approved': ['Paid', 'Closed'],
  'Partially Approved': ['Paid', 'Closed'],
};

function RefundCard({ request, onOpen }) {
  const st = STATUS_STYLE[request.refund_status] || STATUS_STYLE['Draft'];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="bg-white rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ boxShadow: '0 2px 16px rgba(15,61,76,0.08)', border: '1px solid rgba(15,61,76,0.06)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0f4f6' }}>
          <Banknote className="w-5 h-5" style={{ color: '#0F3D4C' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm">{request.applicant_name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{request.refund_request_number} · Unit {request.unit_number}</p>
          <p className="text-xs text-slate-400">{request.refund_type}</p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: st.bg, color: st.color }}>{request.refund_status}</span>
      </div>
    </motion.div>
  );
}

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

  const toggle = (item, status) => {
    updateMutation.mutate({ id: item.id, data: { verification_status: status } });
  };

  if (items.length === 0) return <p className="text-slate-400 text-sm text-center py-4">Tidak ada checklist</p>;

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
            <div className="flex items-center gap-1.5">
              {item.is_uploaded ? (
                item.uploaded_file ? (
                  <a href={item.uploaded_file} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Lihat Dokumen
                  </a>
                ) : <span className="text-xs text-emerald-600">✓ Uploaded</span>
              ) : (
                <span className="text-xs text-slate-400 italic">Belum diupload</span>
              )}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => toggle(item, 'Valid')}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${item.verification_status === 'Valid' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100'}`}>
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => toggle(item, 'Need Revision')}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${item.verification_status === 'Need Revision' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-amber-100'}`}>
                <AlertCircle className="w-3 h-3" />
              </button>
              <button onClick={() => toggle(item, 'Invalid')}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${item.verification_status === 'Invalid' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-red-100'}`}>
                <X className="w-3 h-3" />
              </button>
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

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.DepositRefundRequest.update(request.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['refund-requests'] });
      onClose();
    },
  });

  const nextStatuses = NEXT_STATUSES[request.refund_status] || [];
  const st = STATUS_STYLE[request.refund_status] || STATUS_STYLE['Draft'];
  const currency = n => n ? `IDR ${Number(n).toLocaleString('id-ID')}` : '-';

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-slate-800">{request.applicant_name}</p>
          <p className="text-xs text-slate-500">{request.refund_request_number}</p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: st.bg, color: st.color }}>{request.refund_status}</span>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-100">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Informasi Pemohon</p>
        {[
          ['Nama', request.applicant_name],
          ['KTP', request.ktp_number],
          ['Telepon', request.phone_number],
          ['Unit', `${request.cluster_name || ''} ${request.block_number || ''} ${request.unit_number}`],
          ['Jenis Refund', request.refund_type],
          ['Deposit Awal', currency(request.original_deposit_amount)],
          ['Bank', request.bank_name],
          ['No. Rekening', request.bank_account_number],
          ['Pemilik Rek.', request.bank_account_holder_name],
        ].filter(([, v]) => v).map(([l, v]) => (
          <div key={l} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
            <span className="text-xs text-slate-500">{l}</span>
            <span className="text-xs font-semibold text-slate-800">{v}</span>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Checklist Dokumen</p>
        <ChecklistPanel requestId={request.id} />
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tindakan Verifikator</p>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-600 font-medium">Jumlah Disetujui (IDR)</label>
          <input type="number" placeholder="Jumlah refund yang disetujui" value={approvedAmount}
            onChange={e => setApprovedAmount(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-600 font-medium">Catatan Verifikator</label>
          <textarea value={verifierNotes} onChange={e => setVerifierNotes(e.target.value)}
            placeholder="Catatan internal..."
            className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>

        {nextStatuses.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-slate-600 font-medium">Update Status</label>
            <div className="grid grid-cols-2 gap-2">
              {nextStatuses.map(status => (
                <button key={status}
                  onClick={() => updateMutation.mutate({
                    refund_status: status,
                    verifier_notes: verifierNotes,
                    approved_refund_amount: approvedAmount ? Number(approvedAmount) : undefined,
                  })}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    status === 'Rejected' ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100' :
                    status.includes('Approved') || status === 'Paid' ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' :
                    'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  }`}>
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function RefundAdmin() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['refund-requests'],
    queryFn: () => base44.entities.DepositRefundRequest.list('-created_date'),
  });

  const statuses = ['all', 'Submitted', 'Under Verification', 'Waiting Inspection Result', 'Waiting Finance Validation', 'Approved', 'Paid', 'Rejected'];

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.refund_status === filterStatus);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Refund Deposit</h1>
            <p className="text-xs text-white/50">{requests.length} total pengajuan</p>
          </div>
        </div>
        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {statuses.map(s => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
              style={filterStatus === s
                ? { background: '#ffffff', color: '#0F3D4C' }
                : { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
              {s === 'all' ? 'Semua' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {selectedRequest ? (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RequestDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="bg-white/50 rounded-2xl p-5 animate-pulse h-20" />)
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Tidak ada pengajuan</p>
                </div>
              ) : (
                filtered.map(req => (
                  <RefundCard key={req.id} request={req} onOpen={() => setSelectedRequest(req)} />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}