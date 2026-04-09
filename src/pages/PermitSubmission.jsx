import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight, ChevronLeft, Check, Upload, AlertCircle } from 'lucide-react';
import PermitLayout from '@/components/permit-mgmt/PermitLayout';
import { createPageUrl } from '@/utils';

const STEPS = ['Applicant', 'Property', 'Work Scope', 'Schedule', 'Documents', 'Compliance', 'Review'];

const MINOR_ITEMS = [
  { name: 'Pengecatan ruang dalam', category: 'Interior' },
  { name: 'Pengecatan ulang bagian luar', category: 'Exterior' },
  { name: 'Penggantian/pemasangan daun pintu dan jendela', category: 'Doors & Windows' },
  { name: 'Pemasangan teralis pintu/jendela', category: 'Doors & Windows' },
  { name: 'Pemasangan interior knock down', category: 'Interior' },
  { name: 'Perbaikan/penggantian plafon', category: 'Interior' },
  { name: 'Penggantian keramik', category: 'Interior' },
  { name: 'Pemasangan papan nama toko', category: 'Exterior' },
  { name: 'Pemasangan groundtank', category: 'MEP' },
  { name: 'Service instalasi ME', category: 'MEP' },
  { name: 'Penataan taman unit', category: 'Landscape' },
  { name: 'Pemasangan pompa air listrik/jetpam', category: 'MEP' },
  { name: 'Perbaikan batu alam', category: 'Exterior' },
  { name: 'Pemasangan grassblock / paving', category: 'Landscape' },
  { name: 'Canopy polycarbonate', category: 'Structure' },
  { name: 'Pemasangan roster', category: 'Exterior' },
];

const MAJOR_ITEMS = [
  { name: 'Bongkar pasang dinding penyekat interior', category: 'Structural' },
  { name: 'Perluasan bangunan ke samping', category: 'Structural' },
  { name: 'Perluasan ke belakang', category: 'Structural' },
  { name: 'Pengurukan tanah', category: 'Civil' },
  { name: 'Pengecoran dak jemur / dak talang', category: 'Structural' },
  { name: 'Pengadaan torn', category: 'MEP' },
  { name: 'Penambahan lantai', category: 'Structural' },
  { name: 'Penambahan ruangan / kamar / gudang', category: 'Structural' },
  { name: 'Polycarbonate gantung', category: 'Structure' },
  { name: 'Pemasangan torn dengan rangka besi', category: 'Structural' },
];

const RULES = [
  'Area taman depan dilarang disemen / di-floor / pengerasan permanen',
  'Fasad depan tidak boleh diubah dari desain yang direkomendasikan developer',
  'Fasad samping harus mengikuti desain rekomendasi developer',
  'Kanopi / pekerjaan tertentu harus mengikuti approval developer',
  'Penyimpangan pekerjaan dapat menyebabkan penahanan deposit dan sanksi',
  'Pencairan deposit harus melalui pengecekan developer',
  'Permit efektif setelah disetujui Head of Township Management',
];

const Field = ({ label, required, children }) => (
  <div>
    <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800";

function genPermitNumber(type, count) {
  const code = type === 'Major Renovation' ? 'MAJ' : 'MIN';
  const year = new Date().getFullYear();
  return `DP/RNV-${code}/${year}/${String(count + 1).padStart(3, '0')}`;
}

export default function PermitSubmission() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    permit_type: 'Minor Renovation',
    applicant_name: '', owner_name: '', phone_number: '', email: '', address: '',
    cluster_name: '', block_number: '', unit_number: '', property_type: 'Rumah',
    renovation_description: '', work_scope_summary: '', notes_from_applicant: '',
    start_date: '', end_date: '', contractor_name: '', contractor_phone: '', num_workers: '',
    deposit_amount: '', deposit_status: 'Pending Payment',
    selected_minor: [], selected_major: [],
    acknowledged_rules: false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const duration = form.start_date && form.end_date
    ? Math.max(0, (new Date(form.end_date) - new Date(form.start_date)) / 86400000)
    : null;

  const toggleMinor = (name) => set('selected_minor', form.selected_minor.includes(name)
    ? form.selected_minor.filter(x => x !== name) : [...form.selected_minor, name]);
  const toggleMajor = (name) => set('selected_major', form.selected_major.includes(name)
    ? form.selected_major.filter(x => x !== name) : [...form.selected_major, name]);

  const hasMajorItems = form.selected_major.length > 0;
  const effectiveType = hasMajorItems ? 'Major Renovation' : form.permit_type;

  const mutation = useMutation({
    mutationFn: async () => {
      const existing = await base44.entities.PermitApplication.list('-created_date', 1);
      const permit_number = genPermitNumber(effectiveType, existing.length);
      const application = await base44.entities.PermitApplication.create({
        permit_number,
        permit_type: effectiveType,
        application_status: 'Submitted',
        submission_date: new Date().toISOString().split('T')[0],
        applicant_name: form.applicant_name,
        owner_name: form.owner_name,
        phone_number: form.phone_number,
        email: form.email,
        address: form.address,
        cluster_name: form.cluster_name,
        block_number: form.block_number,
        unit_number: form.unit_number,
        property_type: form.property_type,
        renovation_description: form.renovation_description,
        work_scope_summary: form.work_scope_summary,
        notes_from_applicant: form.notes_from_applicant,
        start_date: form.start_date,
        end_date: form.end_date,
        duration_days: duration,
        contractor_name: form.contractor_name,
        contractor_phone: form.contractor_phone,
        num_workers: form.num_workers ? Number(form.num_workers) : null,
        deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
        deposit_status: form.deposit_amount ? 'Pending Payment' : 'Not Required',
      });
      // Create work items
      const allItems = [
        ...form.selected_minor.map(name => ({ application_id: application.id, work_item_name: name, work_item_type: 'Minor', selected_by_applicant: true, review_status: 'Pending' })),
        ...form.selected_major.map(name => ({ application_id: application.id, work_item_name: name, work_item_type: 'Major', selected_by_applicant: true, review_status: 'Pending' })),
      ];
      if (allItems.length) await base44.entities.WorkItem.bulkCreate(allItems);
      // Activity log
      await base44.entities.ActivityLog.create({
        application_id: application.id,
        activity_type: 'Submitted',
        activity_description: `Permit application ${permit_number} submitted`,
        performed_by: form.applicant_name,
        performed_at: new Date().toISOString(),
      });
      return application;
    },
    onSuccess: (app) => {
      qc.invalidateQueries({ queryKey: ['permits-list'] });
      qc.invalidateQueries({ queryKey: ['permits-dashboard'] });
      navigate(`/PermitDetail?id=${app.id}`);
    },
  });

  const steps = [
    // Step 0: Applicant
    <div key={0} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Applicant Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Applicant Name" required><input className={inputCls} value={form.applicant_name} onChange={e => set('applicant_name', e.target.value)} placeholder="Full name" /></Field>
        <Field label="Property Owner Name" required><input className={inputCls} value={form.owner_name} onChange={e => set('owner_name', e.target.value)} placeholder="Owner name" /></Field>
        <Field label="Phone Number" required><input className={inputCls} value={form.phone_number} onChange={e => set('phone_number', e.target.value)} placeholder="08xx-xxxx-xxxx" /></Field>
        <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></Field>
        <Field label="Address" required><input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" /></Field>
        <Field label="Contractor Name"><input className={inputCls} value={form.contractor_name} onChange={e => set('contractor_name', e.target.value)} placeholder="If using contractor" /></Field>
        <Field label="Contractor Phone"><input className={inputCls} value={form.contractor_phone} onChange={e => set('contractor_phone', e.target.value)} /></Field>
        <Field label="Number of Workers"><input className={inputCls} type="number" value={form.num_workers} onChange={e => set('num_workers', e.target.value)} /></Field>
      </div>
    </div>,

    // Step 1: Property
    <div key={1} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Property / Unit Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Cluster Name" required><input className={inputCls} value={form.cluster_name} onChange={e => set('cluster_name', e.target.value)} placeholder="e.g. Serenia" /></Field>
        <Field label="Block Number" required><input className={inputCls} value={form.block_number} onChange={e => set('block_number', e.target.value)} placeholder="e.g. B" /></Field>
        <Field label="Unit Number" required><input className={inputCls} value={form.unit_number} onChange={e => set('unit_number', e.target.value)} placeholder="e.g. 12" /></Field>
        <Field label="Property Type">
          <select className={inputCls} value={form.property_type} onChange={e => set('property_type', e.target.value)}>
            {['Rumah', 'Ruko', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Renovation Description" required>
        <textarea className={inputCls} rows={3} value={form.renovation_description} onChange={e => set('renovation_description', e.target.value)} placeholder="Describe what you plan to renovate..." />
      </Field>
    </div>,

    // Step 2: Work Scope
    <div key={2} className="space-y-5">
      <h2 className="text-lg font-bold text-slate-800">Renovation Work Checklist</h2>
      {hasMajorItems && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-purple-700">Major renovation items detected — this application will be classified as <strong>Major Renovation</strong></p>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-sky-700 mb-3 uppercase tracking-wide">Minor Renovation Items</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MINOR_ITEMS.map(item => (
            <label key={item.name} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.selected_minor.includes(item.name) ? 'border-sky-400 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <input type="checkbox" checked={form.selected_minor.includes(item.name)} onChange={() => toggleMinor(item.name)} className="mt-0.5 accent-sky-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400">{item.category}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wide">Major Renovation Items</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MAJOR_ITEMS.map(item => (
            <label key={item.name} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.selected_major.includes(item.name) ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <input type="checkbox" checked={form.selected_major.includes(item.name)} onChange={() => toggleMajor(item.name)} className="mt-0.5 accent-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400">{item.category}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      <Field label="Work Scope Summary">
        <textarea className={inputCls} rows={3} value={form.work_scope_summary} onChange={e => set('work_scope_summary', e.target.value)} placeholder="Brief summary of all planned work..." />
      </Field>
    </div>,

    // Step 3: Schedule
    <div key={3} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Project Schedule</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Start Date" required><input className={inputCls} type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} /></Field>
        <Field label="End Date" required><input className={inputCls} type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} /></Field>
      </div>
      {duration !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-semibold">Calculated Duration: <span className="text-blue-900">{duration} days</span></p>
        </div>
      )}
      <Field label="Deposit Amount (Rp)">
        <input className={inputCls} type="number" value={form.deposit_amount} onChange={e => set('deposit_amount', e.target.value)} placeholder="e.g. 5000000" />
      </Field>
      <Field label="Notes">
        <textarea className={inputCls} rows={3} value={form.notes_from_applicant} onChange={e => set('notes_from_applicant', e.target.value)} placeholder="Any additional notes..." />
      </Field>
    </div>,

    // Step 4: Documents
    <div key={4} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Supporting Documents</h2>
      <p className="text-sm text-slate-500">Upload supporting documents after submission via the Permit Detail page.</p>
      <div className={`border-2 border-dashed rounded-2xl p-8 text-center ${effectiveType === 'Major Renovation' ? 'border-purple-300 bg-purple-50' : 'border-slate-200 bg-slate-50'}`}>
        <Upload className={`w-10 h-10 mx-auto mb-3 ${effectiveType === 'Major Renovation' ? 'text-purple-400' : 'text-slate-300'}`} />
        <p className="text-sm font-semibold text-slate-600">Required documents for {effectiveType}</p>
        <ul className="text-xs text-slate-400 mt-2 space-y-1">
          <li>• KTP / ID Applicant</li>
          <li>• Proof of Ownership</li>
          {effectiveType === 'Major Renovation' && <li className="text-purple-600 font-medium">• Design Drawing (Mandatory)</li>}
          {effectiveType === 'Major Renovation' && <li className="text-purple-600 font-medium">• IMB / Building Permit (if required)</li>}
        </ul>
      </div>
    </div>,

    // Step 5: Compliance
    <div key={5} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Compliance Acknowledgement</h2>
      <div className="space-y-3">
        {RULES.map((rule, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{rule}</p>
          </div>
        ))}
      </div>
      <label className="flex items-start gap-3 p-4 bg-slate-50 border-2 border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
        <input type="checkbox" checked={form.acknowledged_rules} onChange={e => set('acknowledged_rules', e.target.checked)} className="mt-0.5 accent-blue-600 w-4 h-4" />
        <p className="text-sm font-semibold text-slate-700">I acknowledge and agree to all the above regulations and understand the consequences of non-compliance.</p>
      </label>
    </div>,

    // Step 6: Review
    <div key={6} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Final Review</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          ['Permit Type', effectiveType], ['Applicant', form.applicant_name], ['Owner', form.owner_name],
          ['Phone', form.phone_number], ['Property', `${form.cluster_name} Blok ${form.block_number} / ${form.unit_number}`],
          ['Type', form.property_type], ['Start Date', form.start_date], ['End Date', form.end_date],
          ['Duration', duration ? `${duration} days` : '—'],
          ['Minor Items', form.selected_minor.length], ['Major Items', form.selected_major.length],
          ['Deposit', form.deposit_amount ? `Rp ${Number(form.deposit_amount).toLocaleString('id-ID')}` : 'Not set'],
        ].map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400">{k}</p>
            <p className="text-sm font-semibold text-slate-800">{v || '—'}</p>
          </div>
        ))}
      </div>
      {!form.acknowledged_rules && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">Please go back and acknowledge the compliance rules.</p>
        </div>
      )}
    </div>,
  ];

  return (
    <PermitLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">New Permit Application</h1>
          <p className="text-slate-500 text-sm mt-1">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${i === step ? 'bg-blue-600 text-white' : i < step ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 min-w-[12px] ${i < step ? 'bg-green-400' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          {steps[step]}
        </div>

        <div className="flex justify-between gap-3">
          <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.acknowledged_rules}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
              {mutation.isPending ? 'Submitting...' : <><Check className="w-4 h-4" /> Submit Application</>}
            </button>
          )}
        </div>
      </div>
    </PermitLayout>
  );
}