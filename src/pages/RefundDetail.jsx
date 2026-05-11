import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Banknote, ClipboardList, History, Shield, User } from 'lucide-react';
import RefundLayout from '@/components/refund/RefundLayout';
import RefundStatusBadge from '@/components/refund/RefundStatusBadge';

const currency = (n) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;
const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

const Row = ({ label, value }) => value ? (
  <div className="flex justify-between items-start py-2 border-b border-slate-50 last:border-0">
    <span className="text-slate-500 text-sm flex-shrink-0">{label}</span>
    <span className="text-slate-800 font-medium text-sm text-right ml-4">{value}</span>
  </div>
) : null;

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
      {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

const TABS = [
  { key: 'overview', label: 'Overview', icon: FileText },
  { key: 'documents', label: 'Documents', icon: ClipboardList },
  { key: 'inspection', label: 'Inspection', icon: Shield },
  { key: 'approvals', label: 'Approvals', icon: CheckCircle },
  { key: 'finance', label: 'Finance', icon: Banknote },
  { key: 'log', label: 'Log', icon: History },
];

const APPROVAL_ICON = {
  Approved: { Icon: CheckCircle, cls: 'text-green-500 bg-green-50' },
  Rejected: { Icon: XCircle, cls: 'text-red-500 bg-red-50' },
  Pending: { Icon: Clock, cls: 'text-slate-400 bg-slate-50' },
  'Revision Needed': { Icon: Clock, cls: 'text-orange-400 bg-orange-50' },
};

export default function RefundDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const [tab, setTab] = useState('overview');

  const { data: req, isLoading } = useQuery({
    queryKey: ['refund-req', id],
    queryFn: () => appClient.entities.DepositRefundRequest.filter({ id }).then(r => r[0] ?? null),
    enabled: !!id,
  });
  const { data: docs = [] } = useQuery({
    queryKey: ['refund-docs', id],
    queryFn: () => appClient.entities.RefundDocumentChecklist.filter({ refund_request_id: id }),
    enabled: !!id,
  });
  const { data: inspection } = useQuery({
    queryKey: ['refund-inspection', id],
    queryFn: () => appClient.entities.DepositInspectionClearance.filter({ refund_request_id: id }).then(r => r[0] ?? null),
    enabled: !!id,
  });
  const { data: approvals = [] } = useQuery({
    queryKey: ['refund-approvals', id],
    queryFn: () => appClient.entities.RefundApprovalWorkflow.filter({ refund_request_id: id }),
    enabled: !!id,
  });
  const { data: ledger } = useQuery({
    queryKey: ['refund-ledger', id],
    queryFn: () => appClient.entities.RefundLedger.filter({ refund_request_id: id }).then(r => r[0] ?? null),
    enabled: !!id,
  });
  const { data: logs = [] } = useQuery({
    queryKey: ['refund-logs', id],
    queryFn: () => appClient.entities.RefundActivityLog.filter({ refund_request_id: id }),
    enabled: !!id,
  });

  if (isLoading) return (
    <RefundLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div></RefundLayout>
  );
  if (!req) return (
    <RefundLayout><div className="text-center text-slate-400 py-16">Request not found.<br /><Link to="/RefundList" className="text-blue-600 text-sm">Back to list</Link></div></RefundLayout>
  );

  const netRefund = (req.original_deposit_amount || 0) - (req.deduction_amount || 0);
  const docsUploaded = docs.filter(d => d.is_uploaded).length;
  const docsTotal = docs.length;
  const docsVerified = docs.filter(d => d.verification_status === 'Valid').length;

  return (
    <RefundLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-slate-800 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-3 mb-4">
            <button onClick={() => navigate('/RefundList')} className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <p className="text-white/50 text-xs">{req.refund_request_number}</p>
              <h1 className="text-lg font-bold">{req.applicant_name}</h1>
              <p className="text-white/60 text-xs">{req.cluster_name} {req.block_number}/{req.unit_number}</p>
            </div>
            <RefundStatusBadge status={req.refund_status} />
          </div>
          {/* Financial summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white/60 text-[10px]">Original Deposit</p>
              <p className="text-white font-bold text-sm">{currency(req.original_deposit_amount)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white/60 text-[10px]">Deduction</p>
              <p className="text-red-300 font-bold text-sm">-{currency(req.deduction_amount)}</p>
            </div>
            <div className="bg-emerald-500/20 rounded-xl p-3 text-center border border-emerald-400/30">
              <p className="text-white/60 text-[10px]">Net Refund</p>
              <p className="text-emerald-300 font-bold text-sm">{currency(req.approved_refund_amount || netRefund)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                tab === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-4">
            <Section title="Applicant Information" icon={User}>
              <Row label="Applicant" value={req.applicant_name} />
              <Row label="Owner" value={req.owner_name} />
              <Row label="KTP Name" value={req.ktp_name} />
              <Row label="KTP Number" value={req.ktp_number} />
              <Row label="Phone" value={req.phone_number} />
              <Row label="Refund Type" value={req.refund_type} />
              <Row label="Request Date" value={fmt(req.request_date)} />
              <Row label="Permit No." value={req.related_permit_number} />
            </Section>
            <Section title="Bank Account" icon={Banknote}>
              <Row label="Bank" value={req.bank_name} />
              <Row label="Account No." value={req.bank_account_number} />
              <Row label="Account Holder" value={req.bank_account_holder_name} />
              <Row label="Payout Method" value={req.payout_method} />
              <Row label="Payout Date" value={fmt(req.payout_date)} />
            </Section>
            {req.refund_reason && (
              <Section title="Refund Reason" icon={FileText}>
                <p className="text-sm text-slate-700">{req.refund_reason}</p>
              </Section>
            )}
          </div>
        )}

        {tab === 'documents' && (
          <Section title="Document Checklist" icon={ClipboardList}>
            <div className="flex gap-3 text-xs text-slate-500 mb-3">
              <span>{docsUploaded}/{docsTotal} uploaded</span>
              <span>·</span>
              <span>{docsVerified} verified</span>
            </div>
            <div className="space-y-2">
              {docs.map(doc => (
                <div key={doc.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  doc.verification_status === 'Valid' ? 'border-green-200 bg-green-50' :
                  doc.verification_status === 'Invalid' ? 'border-red-200 bg-red-50' :
                  doc.verification_status === 'Need Revision' ? 'border-orange-200 bg-orange-50' :
                  'border-slate-200 bg-white'
                }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    doc.is_uploaded ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                  }`}>
                    {doc.is_uploaded && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{doc.checklist_item_name}{doc.is_required && <span className="text-red-500 ml-1 text-xs">*</span>}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        doc.verification_status === 'Valid' ? 'bg-green-100 text-green-700' :
                        doc.verification_status === 'Invalid' ? 'bg-red-100 text-red-700' :
                        doc.verification_status === 'Need Revision' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>{doc.verification_status}</span>
                      {doc.verifier_notes && <span className="text-xs text-slate-500 italic">{doc.verifier_notes}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {tab === 'inspection' && (
          inspection ? (
            <Section title="Inspection Clearance" icon={Shield}>
              <Row label="Inspection Date" value={fmt(inspection.inspection_date)} />
              <Row label="Inspector" value={inspection.inspector_name} />
              <Row label="Result" value={inspection.inspection_result} />
              <Row label="Damage Found" value={inspection.damage_found ? 'Yes' : 'No'} />
              <Row label="Damage Description" value={inspection.damage_description} />
              <Row label="Deduction Reason" value={inspection.deduction_reason} />
              <Row label="Deduction Amount" value={inspection.deduction_amount ? currency(inspection.deduction_amount) : null} />
              <Row label="Replacement Cost" value={inspection.replacement_cost ? currency(inspection.replacement_cost) : null} />
              <Row label="Final Refund" value={inspection.final_refund_amount ? currency(inspection.final_refund_amount) : null} />
              <Row label="Notes" value={inspection.inspection_notes} />
              <div className="mt-3 flex gap-4 text-xs text-slate-600">
                <span className={inspection.signed_by_customer ? 'text-green-600 font-semibold' : 'text-slate-400'}>✓ Customer</span>
                <span className={inspection.signed_by_inspector ? 'text-green-600 font-semibold' : 'text-slate-400'}>✓ Inspector</span>
                <span className={inspection.signed_by_township_head ? 'text-green-600 font-semibold' : 'text-slate-400'}>✓ Township Head</span>
              </div>
            </Section>
          ) : (
            <div className="text-center text-slate-400 text-sm py-10 bg-white rounded-2xl border border-slate-100">No inspection record yet</div>
          )
        )}

        {tab === 'approvals' && (
          <Section title="Approval Timeline" icon={CheckCircle}>
            <div className="space-y-3">
              {[...approvals].sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0)).map((appr, i) => {
                const cfg = APPROVAL_ICON[appr.approval_status] || APPROVAL_ICON.Pending;
                const { Icon, cls } = cfg;
                return (
                  <div key={i} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cls.split(' ')[1]}`}>
                      <Icon className={`w-4 h-4 ${cls.split(' ')[0]}`} />
                    </div>
                    <div className="flex-1 pb-3 border-b border-slate-100 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">{appr.approval_stage}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls.split(' ')[1]} ${cls.split(' ')[0]}`}>{appr.approval_status}</span>
                      </div>
                      {appr.approver_name && <p className="text-xs text-slate-500">By: {appr.approver_name}</p>}
                      {appr.approval_date && <p className="text-xs text-slate-400">{new Date(appr.approval_date).toLocaleDateString('id-ID')}</p>}
                      {appr.approval_notes && <p className="text-xs text-slate-500 italic mt-1">"{appr.approval_notes}"</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {tab === 'finance' && (
          <div className="space-y-4">
            {ledger ? (
              <Section title="Ledger / Receivable" icon={Banknote}>
                <Row label="Ledger Ref" value={ledger.ledger_reference_number} />
                <Row label="Customer" value={ledger.customer_name} />
                <Row label="Department" value={ledger.department} />
                <Row label="Period" value={`${fmt(ledger.accounting_period_from)} – ${fmt(ledger.accounting_period_to)}`} />
                <Row label="Debit" value={currency(ledger.debit_amount)} />
                <Row label="Credit" value={currency(ledger.credit_amount)} />
                <Row label="Balance" value={currency(ledger.balance_amount)} />
                <Row label="Accounting Status" value={ledger.accounting_status} />
                <Row label="Finance Notes" value={ledger.finance_verification_notes} />
              </Section>
            ) : (
              <div className="text-center text-slate-400 text-sm py-10 bg-white rounded-2xl border border-slate-100">No ledger record yet</div>
            )}
            <Section title="Finance Notes" icon={FileText}>
              {req.finance_notes ? <p className="text-sm text-slate-700">{req.finance_notes}</p> : <p className="text-sm text-slate-400">No finance notes</p>}
            </Section>
          </div>
        )}

        {tab === 'log' && (
          <Section title="Activity Log" icon={History}>
            {logs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {[...logs].sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at)).map(log => (
                  <div key={log.id} className="flex gap-2.5 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-sm text-slate-800">{log.activity_description}</p>
                      <p className="text-xs text-slate-400">{log.performed_by} · {log.performed_at ? new Date(log.performed_at).toLocaleString('id-ID') : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        <div className="flex gap-3">
          <Link to="/RefundVerification" className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Verify Documents
          </Link>
          <Link to={`/RefundInspectionPage?id=${id}`} className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Inspection
          </Link>
          <Link to={`/RefundFinancePage?id=${id}`} className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
            Finance
          </Link>
        </div>
      </div>
    </RefundLayout>
  );
}