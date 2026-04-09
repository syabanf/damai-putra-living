import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, AlertCircle, Search, ChevronDown } from 'lucide-react';
import RefundLayout from '@/components/refund/RefundLayout';
import RefundStatusBadge from '@/components/refund/RefundStatusBadge';

export default function RefundVerification() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  const { data: requests = [] } = useQuery({
    queryKey: ['refund-verification-list'],
    queryFn: () => base44.entities.DepositRefundRequest.filter({ refund_status: 'Submitted' }),
  });
  const { data: underVerif = [] } = useQuery({
    queryKey: ['refund-under-verif'],
    queryFn: () => base44.entities.DepositRefundRequest.filter({ refund_status: 'Under Verification' }),
  });

  const allRequests = [...requests, ...underVerif].filter(r =>
    !search || r.applicant_name?.toLowerCase().includes(search.toLowerCase()) || r.unit_number?.includes(search)
  );

  const { data: docs = [], refetch: refetchDocs } = useQuery({
    queryKey: ['verif-docs', selectedId],
    queryFn: () => base44.entities.RefundDocumentChecklist.filter({ refund_request_id: selectedId }),
    enabled: !!selectedId,
  });

  const selectedReq = allRequests.find(r => r.id === selectedId);

  const updateDocMutation = useMutation({
    mutationFn: ({ docId, status, notes }) =>
      base44.entities.RefundDocumentChecklist.update(docId, { verification_status: status, verifier_notes: notes }),
    onSuccess: () => refetchDocs(),
  });

  const moveToInspection = useMutation({
    mutationFn: async () => {
      await base44.entities.DepositRefundRequest.update(selectedId, { refund_status: 'Waiting Inspection Result' });
      await base44.entities.RefundActivityLog.create({
        refund_request_id: selectedId,
        activity_type: 'Status Changed',
        activity_description: `Documents verified. Moved to Waiting Inspection Result.`,
        performed_by: 'Verificator',
        performed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['refund-verification-list'] });
      qc.invalidateQueries({ queryKey: ['refund-under-verif'] });
      setSelectedId(null);
    },
  });

  const markUnderVerification = useMutation({
    mutationFn: () => base44.entities.DepositRefundRequest.update(selectedId, { refund_status: 'Under Verification' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['refund-verification-list'] }),
  });

  const requiredDocs = docs.filter(d => d.is_required);
  const allUploaded = requiredDocs.every(d => d.is_uploaded);
  const allValid = requiredDocs.every(d => d.verification_status === 'Valid');

  return (
    <RefundLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full">
        {/* Left: request list */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-800">Pending Verification</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none"
              placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          {allRequests.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-8">No pending requests</div>
          ) : (
            <div className="space-y-2">
              {allRequests.map(r => (
                <button key={r.id} onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedId === r.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-800">{r.applicant_name}</p>
                    <RefundStatusBadge status={r.refund_status} size="xs" />
                  </div>
                  <p className="text-xs text-slate-400">{r.unit_number} · {r.refund_request_number}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: document checklist */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedId ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm">
              Select a request to verify
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{selectedReq?.applicant_name}</h3>
                    <p className="text-xs text-slate-400">{selectedReq?.unit_number} · {selectedReq?.refund_request_number}</p>
                  </div>
                  <RefundStatusBadge status={selectedReq?.refund_status} />
                </div>
                {selectedReq?.refund_status === 'Submitted' && (
                  <button onClick={() => markUnderVerification.mutate()}
                    className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
                    Mark as Under Verification
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-700 text-sm">Document Checklist</h3>
                  <span className="text-xs text-slate-500">{docs.filter(d => d.verification_status === 'Valid').length}/{docs.length} verified</span>
                </div>
                {docs.map(doc => (
                  <DocVerifyRow key={doc.id} doc={doc} onUpdate={(status, notes) =>
                    updateDocMutation.mutate({ docId: doc.id, status, notes })} />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => moveToInspection.mutate()}
                  disabled={!allValid || moveToInspection.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition-colors">
                  {moveToInspection.isPending ? 'Processing...' : 'Move to Inspection →'}
                </button>
              </div>
              {!allValid && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> All required documents must be verified as Valid before moving to inspection.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </RefundLayout>
  );
}

function DocVerifyRow({ doc, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(doc.verifier_notes || '');

  const statusColor = {
    Valid: 'bg-green-100 text-green-700',
    Invalid: 'bg-red-100 text-red-700',
    'Need Revision': 'bg-orange-100 text-orange-700',
    Pending: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${doc.is_uploaded ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-800">{doc.checklist_item_name}{doc.is_required && <span className="text-red-500 ml-1 text-xs">*</span>}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor[doc.verification_status] || statusColor.Pending}`}>{doc.verification_status}</span>
        </div>
        <button onClick={() => setOpen(o => !o)} className="p-1 rounded hover:bg-slate-100">
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 p-3 bg-slate-50 space-y-2">
          <input
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none"
            placeholder="Verifier notes..." value={notes} onChange={e => setNotes(e.target.value)}
          />
          <div className="flex gap-2">
            {['Valid', 'Invalid', 'Need Revision'].map(s => (
              <button key={s} onClick={() => onUpdate(s, notes)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                  s === 'Valid' ? 'border-green-300 text-green-700 hover:bg-green-50' :
                  s === 'Invalid' ? 'border-red-300 text-red-700 hover:bg-red-50' :
                  'border-orange-300 text-orange-700 hover:bg-orange-50'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}