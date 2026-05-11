import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import RefundLayout from '@/components/refund/RefundLayout';

const Input = (props) => (
  <input {...props} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
);
const Textarea = (props) => (
  <textarea {...props} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
);
const Field = ({ label, children }) => (
  <div><label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>{children}</div>
);

export default function RefundFinancePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const refundId = urlParams.get('id');

  const { data: req } = useQuery({
    queryKey: ['refund-finance-req', refundId],
    queryFn: () => appClient.entities.DepositRefundRequest.filter({ id: refundId }).then(r => r[0] ?? null),
    enabled: !!refundId,
  });

  const { data: inspection } = useQuery({
    queryKey: ['refund-finance-inspection', refundId],
    queryFn: () => appClient.entities.DepositInspectionClearance.filter({ refund_request_id: refundId }).then(r => r[0] ?? null),
    enabled: !!refundId,
  });

  const [form, setForm] = useState({
    ledger_reference_number: `LDG/${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`,
    department: 'Finance',
    accounting_period_from: new Date().toISOString().slice(0, 10),
    accounting_period_to: new Date().toISOString().slice(0, 10),
    finance_notes: '',
    payout_date: '',
    final_approved_amount: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async (markAsPaid) => {
      const approvedAmt = parseFloat(form.final_approved_amount) || req?.approved_refund_amount || 0;
      // Create/update ledger record
      await appClient.entities.RefundLedger.create({
        refund_request_id: refundId,
        ledger_reference_number: form.ledger_reference_number,
        customer_name: req?.applicant_name,
        department: form.department,
        accounting_period_from: form.accounting_period_from,
        accounting_period_to: form.accounting_period_to,
        debit_amount: req?.original_deposit_amount || 0,
        credit_amount: approvedAmt,
        balance_amount: (req?.original_deposit_amount || 0) - approvedAmt,
        accounting_status: markAsPaid ? 'Paid' : 'Cleared',
        finance_verification_notes: form.finance_notes,
      });

      const newStatus = markAsPaid ? 'Paid' : 'Approved';
      await appClient.entities.DepositRefundRequest.update(refundId, {
        refund_status: newStatus,
        approved_refund_amount: approvedAmt,
        finance_notes: form.finance_notes,
        payout_date: form.payout_date || null,
      });

      await appClient.entities.RefundActivityLog.create({
        refund_request_id: refundId,
        activity_type: 'Status Changed',
        activity_description: `Finance validation completed. Status: ${newStatus}. Approved refund: IDR ${Number(approvedAmt).toLocaleString('id-ID')}`,
        performed_by: 'Finance Team',
        performed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['refund-finance-req', refundId] });
      navigate(`/RefundDetail?id=${refundId}`);
    },
  });

  const currency = (n) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;

  return (
    <RefundLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/RefundDetail?id=${refundId}`)} className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Finance Validation & Payment</h1>
            <p className="text-sm text-slate-500">{req?.applicant_name} · {req?.unit_number}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-800 text-white rounded-2xl p-5 space-y-3">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Financial Summary</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs">Original Deposit</p>
              <p className="font-bold">{currency(req?.original_deposit_amount)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs">Deduction</p>
              <p className="font-bold text-red-300">-{currency(req?.deduction_amount)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs">Net (After Deduction)</p>
              <p className="font-bold text-emerald-300">{currency(req?.approved_refund_amount)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs">Bank Account</p>
              <p className="font-bold text-sm">{req?.bank_name} {req?.bank_account_number}</p>
              <p className="text-white/60 text-xs">{req?.bank_account_holder_name}</p>
            </div>
          </div>
        </div>

        {/* Inspection result */}
        {inspection && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="font-semibold text-emerald-800 text-sm">Inspection Result: {inspection.inspection_result}</p>
            </div>
            <p className="text-xs text-emerald-700">Inspector: {inspection.inspector_name} · {inspection.inspection_date}</p>
            {inspection.deduction_reason && <p className="text-xs text-emerald-700 mt-1">Deduction reason: {inspection.deduction_reason}</p>}
          </div>
        )}

        {/* Finance form */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700">Finance Validation</h2>
          <Field label="Final Approved Refund Amount (IDR)">
            <Input type="number" value={form.final_approved_amount}
              onChange={e => set('final_approved_amount', e.target.value)}
              placeholder={String(req?.approved_refund_amount || '')} />
          </Field>
          <Field label="Ledger Reference Number">
            <Input value={form.ledger_reference_number} onChange={e => set('ledger_reference_number', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Accounting Period From"><Input type="date" value={form.accounting_period_from} onChange={e => set('accounting_period_from', e.target.value)} /></Field>
            <Field label="Accounting Period To"><Input type="date" value={form.accounting_period_to} onChange={e => set('accounting_period_to', e.target.value)} /></Field>
          </div>
          <Field label="Department"><Input value={form.department} onChange={e => set('department', e.target.value)} /></Field>
          <Field label="Finance Notes"><Textarea value={form.finance_notes} onChange={e => set('finance_notes', e.target.value)} placeholder="Catatan validasi keuangan..." /></Field>
          <Field label="Payout Date (Optional)"><Input type="date" value={form.payout_date} onChange={e => set('payout_date', e.target.value)} /></Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => saveMutation.mutate(false)} disabled={saveMutation.isPending}
            className="py-3 rounded-xl border-2 border-blue-600 text-blue-600 text-sm font-semibold hover:bg-blue-50 disabled:opacity-50 transition-colors">
            Approve (Pending Payment)
          </button>
          <button onClick={() => saveMutation.mutate(true)} disabled={!form.payout_date || saveMutation.isPending}
            className="py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Mark as Paid'}
          </button>
        </div>
        {!form.payout_date && <p className="text-xs text-slate-400 text-center">Set payout date to mark as Paid</p>}
      </div>
    </RefundLayout>
  );
}