import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight, ChevronLeft, CheckCircle2, Upload, FileText, ChevronDown, Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import RefundLayout from '@/components/refund/RefundLayout';

const CHECKLIST_ITEMS = [
  { code: 'DOC-01', name: 'Kwitansi pembayaran deposit', required: true },
  { code: 'DOC-02', name: 'Surat permohonan pencairan deposit renovasi / sewa', required: true },
  { code: 'DOC-03', name: 'Copy KTP / ID', required: true },
  { code: 'DOC-04', name: 'Copy buku tabungan', required: true },
  { code: 'DOC-05', name: 'Berita acara pemeriksaan renovasi / pembangunan', required: true },
  { code: 'DOC-06', name: 'Foto pekerjaan sebelum renovasi', required: true },
  { code: 'DOC-07', name: 'Foto pekerjaan sesudah renovasi', required: true },
  { code: 'DOC-08', name: 'Surat kuasa pencairan + copy KTP pemberi/penerima kuasa', required: false },
  { code: 'DOC-09', name: 'Copy perjanjian sewa', required: false },
  { code: 'DOC-10', name: 'Print out kartu kavling / kartu deposit / receivable proof', required: true },
];

const STEPS = ['Permit Info', 'Applicant & Unit', 'Deposit Payment', 'Bank Account', 'Documents', 'Declaration'];

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
);

const DrawerSelect = ({ value, onChange, options, placeholder = 'Select...' }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 flex items-center justify-between text-left">
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle className="text-base">{placeholder}</DrawerTitle></DrawerHeader>
          <div className="px-4 pb-6 space-y-1 overflow-y-auto max-h-[60vh]">
            {options.map(o => (
              <button key={o.value} type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors"
                style={o.value === value ? { background: '#eff6ff', color: '#1e40af' } : { color: '#334155' }}>
                {o.label}
                {o.value === value && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

const Textarea = (props) => (
  <textarea {...props} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
);

export default function RefundSubmission() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    refund_type: 'Renovation Deposit',
    applicant_name: '', owner_name: '', ktp_name: '', ktp_number: '',
    phone_number: '', cluster_name: '', block_number: '', unit_number: '',
    refund_reason: '', original_deposit_amount: '', related_permit_number: '',
    bank_name: '', bank_account_number: '', bank_account_holder_name: '',
    payout_method: 'Bank Transfer', applicant_notes: '',
    request_date: new Date().toISOString().slice(0, 10),
  });
  const [docChecks, setDocChecks] = useState(
    CHECKLIST_ITEMS.map(item => ({ ...item, is_uploaded: false }))
  );
  const [declared, setDeclared] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const createMutation = useMutation({
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['deposit-refunds'] });
      const prev = qc.getQueryData(['deposit-refunds']);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['deposit-refunds'], ctx.prev);
    },
    mutationFn: async () => {
      const num = `RFD/${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`;
      const req = await base44.entities.DepositRefundRequest.create({
        ...form,
        refund_request_number: num,
        refund_status: 'Submitted',
        original_deposit_amount: parseFloat(form.original_deposit_amount) || 0,
        deduction_amount: 0,
        user_email: (await base44.auth.me())?.email,
      });
      // Create checklist records
      await Promise.all(CHECKLIST_ITEMS.map(item =>
        base44.entities.RefundDocumentChecklist.create({
          refund_request_id: req.id,
          checklist_item_code: item.code,
          checklist_item_name: item.name,
          is_required: item.required,
          is_uploaded: false,
          verification_status: 'Pending',
        })
      ));
      // Create initial workflow stages
      const stages = [
        { stage: 'Applicant Submission', role: 'Applicant', order: 1, status: 'Approved' },
        { stage: 'Verificator / Admin Check', role: 'Verificator', order: 2, status: 'Pending' },
        { stage: 'Inspection Validation', role: 'Inspector', order: 3, status: 'Pending' },
        { stage: 'Township / Head Approval', role: 'Township Head', order: 4, status: 'Pending' },
        { stage: 'Finance Validation', role: 'Finance', order: 5, status: 'Pending' },
        { stage: 'Payment Confirmation', role: 'Finance', order: 6, status: 'Pending' },
      ];
      await Promise.all(stages.map(s =>
        base44.entities.RefundApprovalWorkflow.create({
          refund_request_id: req.id,
          approval_stage: s.stage,
          approver_role: s.role,
          approval_status: s.status,
          sequence_order: s.order,
        })
      ));
      // Log
      await base44.entities.RefundActivityLog.create({
        refund_request_id: req.id,
        activity_type: 'Submitted',
        activity_description: `Refund request ${num} submitted by ${form.applicant_name}`,
        performed_by: form.applicant_name,
        performed_at: new Date().toISOString(),
      });
      return req;
    },
    onSuccess: (req) => {
      qc.invalidateQueries({ queryKey: ['deposit-refunds'] });
      navigate(`/RefundDetail?id=${req.id}`);
    },
  });

  const canNext = () => {
    if (step === 0) return form.refund_type && form.related_permit_number;
    if (step === 1) return form.applicant_name && form.unit_number && form.ktp_number;
    if (step === 2) return form.original_deposit_amount;
    if (step === 3) return form.bank_name && form.bank_account_number && form.bank_account_holder_name;
    if (step === 5) return declared;
    return true;
  };

  return (
    <RefundLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">New Refund Request</h1>
          <p className="text-sm text-slate-500">Permohonan Pencairan Deposit</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < step ? 'bg-blue-600 border-blue-600 text-white' :
                i === step ? 'border-blue-600 text-blue-600' : 'border-slate-200 text-slate-400'
              }`}>{i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}</div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-sm font-semibold text-slate-700">{STEPS[step]}</p>

        {/* Step content */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">

          {step === 0 && (
            <>
              <Field label="Refund Type" required>
                <DrawerSelect value={form.refund_type} onChange={v => set('refund_type', v)}
                  placeholder="Select refund type..."
                  options={[
                    { value: 'Renovation Deposit', label: 'Renovation Deposit' },
                    { value: 'Rental Deposit', label: 'Rental Deposit' },
                    { value: 'Other', label: 'Other' },
                  ]} />
              </Field>
              <Field label="Related Permit Number" required>
                <Input value={form.related_permit_number} onChange={e => set('related_permit_number', e.target.value)} placeholder="DP/RNV-MIN/2026/001" />
              </Field>
              <Field label="Request Date" required>
                <Input type="date" value={form.request_date} onChange={e => set('request_date', e.target.value)} />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Applicant Name" required>
                  <Input value={form.applicant_name} onChange={e => set('applicant_name', e.target.value)} />
                </Field>
                <Field label="Owner Name">
                  <Input value={form.owner_name} onChange={e => set('owner_name', e.target.value)} />
                </Field>
                <Field label="KTP Name" required>
                  <Input value={form.ktp_name} onChange={e => set('ktp_name', e.target.value)} />
                </Field>
                <Field label="KTP Number" required>
                  <Input value={form.ktp_number} onChange={e => set('ktp_number', e.target.value)} />
                </Field>
                <Field label="Phone Number">
                  <Input value={form.phone_number} onChange={e => set('phone_number', e.target.value)} />
                </Field>
                <Field label="Cluster Name">
                  <Input value={form.cluster_name} onChange={e => set('cluster_name', e.target.value)} />
                </Field>
                <Field label="Block Number">
                  <Input value={form.block_number} onChange={e => set('block_number', e.target.value)} />
                </Field>
                <Field label="Unit Number" required>
                  <Input value={form.unit_number} onChange={e => set('unit_number', e.target.value)} />
                </Field>
              </div>
              <Field label="Reason for Refund">
                <Textarea value={form.refund_reason} onChange={e => set('refund_reason', e.target.value)} placeholder="Describe why the deposit should be refunded..." />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Original Deposit Amount (IDR)" required>
                <Input type="number" value={form.original_deposit_amount} onChange={e => set('original_deposit_amount', e.target.value)} placeholder="5000000" />
              </Field>
              <Field label="Applicant Notes">
                <Textarea value={form.applicant_notes} onChange={e => set('applicant_notes', e.target.value)} placeholder="Additional information..." />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Bank Name" required>
                <Input value={form.bank_name} onChange={e => set('bank_name', e.target.value)} placeholder="BCA / BNI / Mandiri / BRI..." />
              </Field>
              <Field label="Account Number" required>
                <Input value={form.bank_account_number} onChange={e => set('bank_account_number', e.target.value)} />
              </Field>
              <Field label="Account Holder Name" required>
                <Input value={form.bank_account_holder_name} onChange={e => set('bank_account_holder_name', e.target.value)} />
              </Field>
              <Field label="Payout Method">
                <DrawerSelect value={form.payout_method} onChange={v => set('payout_method', v)}
                  placeholder="Select payout method..."
                  options={[
                    { value: 'Bank Transfer', label: 'Bank Transfer' },
                    { value: 'Cash', label: 'Cash' },
                    { value: 'Other', label: 'Other' },
                  ]} />
              </Field>
            </>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Check documents you will provide. Required items are marked with *</p>
              {docChecks.map((doc, i) => (
                <label key={doc.code} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" checked={doc.is_uploaded}
                    onChange={e => setDocChecks(d => d.map((x, j) => j === i ? { ...x, is_uploaded: e.target.checked } : x))}
                    className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{doc.name}{doc.required && <span className="text-red-500 ml-1">*</span>}</p>
                    <p className="text-xs text-slate-400">{doc.code}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-1">
                <p className="font-bold">Review & Confirm</p>
                <p>Applicant: <span className="font-semibold">{form.applicant_name}</span></p>
                <p>Unit: <span className="font-semibold">{form.cluster_name} {form.block_number}/{form.unit_number}</span></p>
                <p>Deposit Amount: <span className="font-semibold">IDR {Number(form.original_deposit_amount || 0).toLocaleString('id-ID')}</span></p>
                <p>Bank: <span className="font-semibold">{form.bank_name} — {form.bank_account_number}</span></p>
                <p>Account Holder: <span className="font-semibold">{form.bank_account_holder_name}</span></p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={declared} onChange={e => setDeclared(e.target.checked)} className="w-4 h-4 mt-0.5 accent-blue-600" />
                <span className="text-sm text-slate-700">Saya menyatakan bahwa seluruh informasi yang disampaikan adalah benar dan saya bertanggung jawab penuh atas kebenaran data tersebut.</span>
              </label>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : createMutation.mutate()}
            disabled={!canNext() || createMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {createMutation.isPending ? 'Submitting...' : step < STEPS.length - 1 ? <><span>Next</span><ChevronRight className="w-4 h-4" /></> : 'Submit Request'}
          </button>
        </div>
      </div>
    </RefundLayout>
  );
}