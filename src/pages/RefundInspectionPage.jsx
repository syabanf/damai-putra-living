import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Save, ArrowLeft } from 'lucide-react';
import RefundLayout from '@/components/refund/RefundLayout';

const Input = (props) => (
  <input {...props} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
);
const Select = ({ children, ...props }) => (
  <select {...props} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
    {children}
  </select>
);
const Textarea = (props) => (
  <textarea {...props} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
);
const Field = ({ label, children }) => (
  <div><label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>{children}</div>
);

export default function RefundInspectionPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const refundId = urlParams.get('id');

  const { data: req } = useQuery({
    queryKey: ['refund-req-inspect', refundId],
    queryFn: () => appClient.entities.DepositRefundRequest.filter({ id: refundId }).then(r => r[0] ?? null),
    enabled: !!refundId,
  });

  const { data: existing } = useQuery({
    queryKey: ['inspect-existing', refundId],
    queryFn: () => appClient.entities.DepositInspectionClearance.filter({ refund_request_id: refundId }).then(r => r[0] ?? null),
    enabled: !!refundId,
  });

  const [form, setForm] = useState({
    inspection_date: new Date().toISOString().slice(0, 10),
    inspector_name: '',
    inspection_result: 'No Issue',
    damage_found: false,
    damage_description: '',
    deduction_reason: '',
    deduction_amount: 0,
    replacement_cost: 0,
    inspection_notes: '',
    signed_by_customer: false,
    signed_by_inspector: false,
    signed_by_township_head: false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const deposit = req?.original_deposit_amount || 0;
  const finalRefund = deposit - (parseFloat(form.deduction_amount) || 0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...form,
        refund_request_id: refundId,
        deduction_amount: parseFloat(form.deduction_amount) || 0,
        replacement_cost: parseFloat(form.replacement_cost) || 0,
        final_refund_amount: finalRefund,
      };
      if (existing?.id) {
        await appClient.entities.DepositInspectionClearance.update(existing.id, data);
      } else {
        await appClient.entities.DepositInspectionClearance.create(data);
      }
      // Update refund request with deduction and move to next stage
      await appClient.entities.DepositRefundRequest.update(refundId, {
        deduction_amount: parseFloat(form.deduction_amount) || 0,
        approved_refund_amount: finalRefund,
        refund_status: 'Waiting Finance Validation',
      });
      await appClient.entities.RefundActivityLog.create({
        refund_request_id: refundId,
        activity_type: 'Status Changed',
        activity_description: `Inspection completed by ${form.inspector_name}. Result: ${form.inspection_result}. Deduction: IDR ${Number(form.deduction_amount || 0).toLocaleString('id-ID')}`,
        performed_by: form.inspector_name,
        performed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['refund-req', refundId] });
      navigate(`/RefundDetail?id=${refundId}`);
    },
  });

  return (
    <RefundLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/RefundDetail?id=${refundId}`)} className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Inspection Clearance</h1>
            <p className="text-sm text-slate-500">{req?.applicant_name} · {req?.unit_number}</p>
          </div>
        </div>

        {/* Deposit summary */}
        <div className="bg-slate-800 text-white rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-white/50 text-xs">Original Deposit</p>
            <p className="font-bold text-sm">IDR {Number(deposit).toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">Deduction</p>
            <p className="font-bold text-sm text-red-300">-IDR {Number(form.deduction_amount || 0).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-emerald-500/20 rounded-xl p-2">
            <p className="text-white/50 text-xs">Final Refund</p>
            <p className="font-bold text-sm text-emerald-300">IDR {Number(finalRefund).toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700">Inspection Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Inspection Date"><Input type="date" value={form.inspection_date} onChange={e => set('inspection_date', e.target.value)} /></Field>
            <Field label="Inspector Name"><Input value={form.inspector_name} onChange={e => set('inspector_name', e.target.value)} placeholder="Nama inspektor" /></Field>
          </div>
          <Field label="Inspection Result">
            <Select value={form.inspection_result} onChange={e => set('inspection_result', e.target.value)}>
              <option>No Issue</option>
              <option>Minor Deduction</option>
              <option>Major Deduction</option>
              <option>Hold</option>
              <option>Rejected</option>
            </Select>
          </Field>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.damage_found} onChange={e => set('damage_found', e.target.checked)} className="w-4 h-4 accent-red-500" />
            <span className="text-sm text-slate-700">Damage Found</span>
          </label>
          {form.damage_found && (
            <Field label="Damage Description"><Textarea value={form.damage_description} onChange={e => set('damage_description', e.target.value)} /></Field>
          )}
          <Field label="Deduction Reason"><Textarea value={form.deduction_reason} onChange={e => set('deduction_reason', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Deduction Amount (IDR)"><Input type="number" value={form.deduction_amount} onChange={e => set('deduction_amount', e.target.value)} /></Field>
            <Field label="Replacement Cost (IDR)"><Input type="number" value={form.replacement_cost} onChange={e => set('replacement_cost', e.target.value)} /></Field>
          </div>
          <Field label="Inspection Notes"><Textarea value={form.inspection_notes} onChange={e => set('inspection_notes', e.target.value)} /></Field>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Signatures</p>
            <div className="space-y-2">
              {[['signed_by_customer', 'Customer'], ['signed_by_inspector', 'Inspector'], ['signed_by_township_head', 'Township Head']].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm text-slate-700">Signed by {label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => saveMutation.mutate()} disabled={!form.inspector_name || saveMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? 'Saving...' : 'Save & Move to Finance Validation'}
        </button>
      </div>
    </RefundLayout>
  );
}