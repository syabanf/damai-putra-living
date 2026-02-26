import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Upload, FileText, Building2,
  Calendar, Users, Truck, Wrench, CheckCircle, X, AlertCircle, Banknote, Shovel
} from 'lucide-react';
import { Button } from "@/components/ui/button";

/* ─── permit catalogue ─── */
const PERMIT_TYPES = [
  { value: 'izin_kegiatan',      label: 'Izin Kegiatan',        icon: Calendar,  desc: 'Activity & event permit',            color: '#4f86f7', bg: '#ebf0ff' },
  { value: 'renovasi_minor',     label: 'Renovasi Minor',       icon: Wrench,    desc: 'Minor non-structural renovation',    color: '#f97316', bg: '#fff3eb' },
  { value: 'renovasi_mayor',     label: 'Renovasi Mayor',       icon: Wrench,    desc: 'Major structural renovation',        color: '#ef4444', bg: '#fef2f2' },
  { value: 'pembangunan_kavling',label: 'Pembangunan Kavling',   icon: Building2, desc: 'New plot / lot construction',        color: '#8b5cf6', bg: '#f5f3ff' },
  { value: 'galian',             label: 'Izin Galian',          icon: Shovel,    desc: 'Excavation work',                    color: '#92400e', bg: '#fef3c7' },
  { value: 'pindah_masuk',       label: 'Pindah Masuk',         icon: Truck,     desc: 'Move-in permit',                     color: '#10b981', bg: '#ecfdf5' },
  { value: 'pindah_keluar',      label: 'Pindah Keluar',        icon: Truck,     desc: 'Move-out permit',                    color: '#64748b', bg: '#f1f5f9' },
  { value: 'pencairan_deposit',  label: 'Pencairan Deposit',    icon: Banknote,  desc: 'Deposit disbursement request',       color: '#0891b2', bg: '#ecfeff' },
  { value: 'akses_kontraktor',   label: 'Akses Kontraktor',     icon: Users,     desc: 'Contractor / technician access',     color: '#6366f1', bg: '#eef2ff' },
];

const F = ({ label, required, hint, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const ic = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 transition-all";

const STEPS = ['Permit Type', 'Applicant', 'Activity Details', 'Documents'];

export default function CreateTicket() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preType = urlParams.get('type');

  const [step, setStep] = useState(preType ? 2 : 1);
  const [uploading, setUploading] = useState({});
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    // A. Applicant
    applicant_name: '',
    applicant_role: '',
    applicant_nik: '',
    applicant_phone: '',
    applicant_email: '',
    applicant_address: '',
    // B. Unit
    unit_id: '',
    // C. Permit
    permit_type: preType || '',
    // D. Activity
    activity_name: '',
    description: '',
    activity_date: '',
    activity_end_date: '',
    activity_time: '',
    activity_end_time: '',
    num_workers: '',
    contractor_company: '',
    // E. Renovation
    work_type: '',
    work_scope: '',
    affected_area: '',
    uses_heavy_equipment: false,
    noise_potential: false,
    // F. Deposit
    deposit_required: '',
    deposit_paid: '',
    deposit_payment_date: '',
    deposit_payment_proof_url: '',
    // G. Documents
    document_urls: [],
    // H. Security / Moving
    vehicle_type: '',
    vehicle_plate: '',
    moving_company: '',
    visitor_name: '',
    visitor_phone: '',
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, applicant_name: u.full_name || '', applicant_email: u.email || '' }));
    }).catch(() => {});
  }, []);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const approvedUnits = user ? units.filter(u => u.status === 'approved' && u.user_email === user.email) : [];
  const selectedUnit = approvedUnits.find(u => u.id === form.unit_id);
  const selectedPermit = PERMIT_TYPES.find(p => p.value === form.permit_type);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      navigate(createPageUrl('TicketSubmitted'));
    },
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const uploadFile = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(u => ({ ...u, [field]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (field === 'document_urls') {
      set('document_urls', [...form.document_urls, file_url]);
    } else {
      set(field, file_url);
    }
    setUploading(u => ({ ...u, [field]: false }));
  };

  const handleSubmit = () => {
    const unit = selectedUnit;
    mutation.mutate({
      ...form,
      num_workers: form.num_workers ? Number(form.num_workers) : undefined,
      deposit_required: form.deposit_required ? Number(form.deposit_required) : undefined,
      deposit_paid: form.deposit_paid ? Number(form.deposit_paid) : undefined,
      category: 'permit',
      status: 'open',
      user_email: user?.email,
      user_name: user?.full_name,
      unit_number: unit?.unit_number,
      tower: unit?.tower,
      property_name: unit?.property_name,
    });
  };

  const isMoving = ['pindah_masuk', 'pindah_keluar'].includes(form.permit_type);
  const isConstruction = ['renovasi_minor', 'renovasi_mayor', 'pembangunan_kavling', 'galian'].includes(form.permit_type);
  const isDeposit = form.permit_type === 'pencairan_deposit';

  const UploadBox = ({ field, label, single = false }) => {
    const isLoading = uploading[field];
    const value = single ? form[field] : null;
    return (
      <F label={label}>
        <label className="block cursor-pointer">
          <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => uploadFile(e, field)} disabled={isLoading} />
          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${isLoading ? 'border-stone-300 bg-stone-50' : 'border-slate-200 hover:border-stone-400 hover:bg-stone-50/50'}`}>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Uploading...</span>
              </div>
            ) : value ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Uploaded</span>
              </div>
            ) : (
              <div>
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Tap to upload (JPG, PNG, PDF)</p>
              </div>
            )}
          </div>
        </label>
      </F>
    );
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
            className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-white/50 text-xs">Damai Putra Living</p>
            <h1 className="text-xl font-bold text-white">New Permit Application</h1>
          </div>
          <span className="text-white/60 text-xs font-semibold">{step}/{STEPS.length}</span>
        </div>
        {/* Progress */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < step ? 'bg-white' : 'bg-white/25'}`} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-2 font-medium">{STEPS[step - 1]}</p>
      </div>

      <div className="px-4 py-5">

        {/* ── STEP 1: Permit Type ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">Select the type of permit you want to apply for.</p>
            {PERMIT_TYPES.map(pt => {
              const Icon = pt.icon;
              return (
                <button key={pt.value} onClick={() => { set('permit_type', pt.value); setStep(2); }}
                  className="w-full p-4 rounded-2xl border bg-white/80 flex items-center gap-4 text-left active:scale-[0.98] transition-transform border-slate-200/80 hover:shadow-sm">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: pt.bg }}>
                    <Icon className="w-6 h-6" style={{ color: pt.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{pt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{pt.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              );
            })}
          </motion.div>
        )}

        {/* ── STEP 2: Applicant & Unit ── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {selectedPermit && (
              <div className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: selectedPermit.bg }}>
                <selectedPermit.icon className="w-5 h-5" style={{ color: selectedPermit.color }} />
                <span className="font-semibold text-sm text-slate-700">{selectedPermit.label}</span>
                <button onClick={() => setStep(1)} className="ml-auto text-xs text-slate-400 underline">Change</button>
              </div>
            )}

            {/* A. Applicant */}
            <div className="bg-white/80 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">A. Applicant Information</h3>
              <F label="Full Name" required>
                <input type="text" className={ic} value={form.applicant_name} onChange={e => set('applicant_name', e.target.value)} placeholder="Full legal name" />
              </F>
              <F label="Role / Status" required>
                <select className={ic} value={form.applicant_role} onChange={e => set('applicant_role', e.target.value)}>
                  <option value="">Select role...</option>
                  <option value="owner">Unit Owner</option>
                  <option value="tenant">Tenant</option>
                  <option value="representative">Authorized Representative</option>
                </select>
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="NIK / ID Number" required>
                  <input type="text" className={ic} value={form.applicant_nik} onChange={e => set('applicant_nik', e.target.value)} placeholder="16-digit NIK" />
                </F>
                <F label="Phone Number" required>
                  <input type="tel" className={ic} value={form.applicant_phone} onChange={e => set('applicant_phone', e.target.value)} placeholder="08xx..." />
                </F>
              </div>
              <F label="Email Address" required>
                <input type="email" className={ic} value={form.applicant_email} onChange={e => set('applicant_email', e.target.value)} placeholder="email@example.com" />
              </F>
              <F label="Address (as per ID)" required>
                <textarea className={ic + ' min-h-[70px] resize-none'} value={form.applicant_address} onChange={e => set('applicant_address', e.target.value)} placeholder="Address as stated on your ID card..." />
              </F>
            </div>

            {/* B. Unit */}
            <div className="bg-white/80 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">B. Property / Unit</h3>
              <F label="Select Unit" required>
                <select className={ic} value={form.unit_id} onChange={e => set('unit_id', e.target.value)}>
                  <option value="">Select your unit...</option>
                  {approvedUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.unit_number} – {u.property_name}{u.tower ? ` Tower ${u.tower}` : ''}</option>
                  ))}
                </select>
              </F>
            </div>

            <Button onClick={() => setStep(3)}
              disabled={!form.unit_id || !form.applicant_name || !form.applicant_role || !form.applicant_nik}
              className="w-full py-3 text-white rounded-2xl font-semibold"
              style={{ background: 'linear-gradient(135deg, #8A8076, #5a524e)' }}>
              Continue <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* ── STEP 3: Activity & Work Details ── */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">

            {/* D. Activity */}
            <div className="bg-white/80 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">C. Activity Information</h3>
              <F label="Activity Name" required>
                <input type="text" className={ic} value={form.activity_name} onChange={e => set('activity_name', e.target.value)} placeholder="Name of the activity or work" />
              </F>
              <F label="Description" required>
                <textarea className={ic + ' min-h-[80px] resize-none'} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the activity in detail..." />
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Start Date" required>
                  <input type="date" className={ic} value={form.activity_date} onChange={e => set('activity_date', e.target.value)} />
                </F>
                <F label="End Date" required>
                  <input type="date" className={ic} value={form.activity_end_date} onChange={e => set('activity_end_date', e.target.value)} />
                </F>
                <F label="Start Time" required>
                  <input type="time" className={ic} value={form.activity_time} onChange={e => set('activity_time', e.target.value)} />
                </F>
                <F label="End Time" required>
                  <input type="time" className={ic} value={form.activity_end_time} onChange={e => set('activity_end_time', e.target.value)} />
                </F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Number of Workers">
                  <input type="number" className={ic} value={form.num_workers} onChange={e => set('num_workers', e.target.value)} placeholder="0" />
                </F>
                <F label="Contractor / Vendor">
                  <input type="text" className={ic} value={form.contractor_company} onChange={e => set('contractor_company', e.target.value)} placeholder="Company name" />
                </F>
              </div>
            </div>

            {/* E. Renovation / Construction */}
            {isConstruction && (
              <div className="bg-white/80 rounded-2xl p-4 space-y-4">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">D. Renovation / Construction Details</h3>
                <F label="Work Type" required>
                  <select className={ic} value={form.work_type} onChange={e => set('work_type', e.target.value)}>
                    <option value="">Select type...</option>
                    <option value="struktural">Structural</option>
                    <option value="non_struktural">Non-Structural</option>
                    <option value="mep">MEP (Mechanical / Electrical / Plumbing)</option>
                    <option value="finishing">Finishing</option>
                  </select>
                </F>
                <F label="Work Description" required>
                  <textarea className={ic + ' min-h-[70px] resize-none'} value={form.work_scope} onChange={e => set('work_scope', e.target.value)} placeholder="Detailed scope of construction work..." />
                </F>
                <F label="Affected Area">
                  <input type="text" className={ic} value={form.affected_area} onChange={e => set('affected_area', e.target.value)} placeholder="e.g. Living room, kitchen, facade..." />
                </F>
                <div className="flex gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-stone-600" checked={form.uses_heavy_equipment} onChange={e => set('uses_heavy_equipment', e.target.checked)} />
                    <span className="text-sm text-slate-600">Heavy Equipment</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-stone-600" checked={form.noise_potential} onChange={e => set('noise_potential', e.target.checked)} />
                    <span className="text-sm text-slate-600">Noise Potential</span>
                  </label>
                </div>
              </div>
            )}

            {/* H. Moving / Security */}
            {isMoving && (
              <div className="bg-white/80 rounded-2xl p-4 space-y-4">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">D. Security / Moving Details</h3>
                <F label="Moving Company">
                  <input type="text" className={ic} value={form.moving_company} onChange={e => set('moving_company', e.target.value)} placeholder="Moving company name" />
                </F>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Vehicle Type">
                    <input type="text" className={ic} value={form.vehicle_type} onChange={e => set('vehicle_type', e.target.value)} placeholder="Pickup / Truck..." />
                  </F>
                  <F label="Plate Number">
                    <input type="text" className={ic} value={form.vehicle_plate} onChange={e => set('vehicle_plate', e.target.value)} placeholder="B 1234 XX" />
                  </F>
                </div>
                <F label="PIC Name">
                  <input type="text" className={ic} value={form.visitor_name} onChange={e => set('visitor_name', e.target.value)} />
                </F>
                <F label="PIC Phone">
                  <input type="tel" className={ic} value={form.visitor_phone} onChange={e => set('visitor_phone', e.target.value)} />
                </F>
              </div>
            )}

            {/* F. Deposit */}
            {(isConstruction || isDeposit) && (
              <div className="bg-white/80 rounded-2xl p-4 space-y-4">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">E. Deposit Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Deposit Required (IDR)">
                    <input type="number" className={ic} value={form.deposit_required} onChange={e => set('deposit_required', e.target.value)} placeholder="0" />
                  </F>
                  <F label="Amount Paid (IDR)">
                    <input type="number" className={ic} value={form.deposit_paid} onChange={e => set('deposit_paid', e.target.value)} placeholder="0" />
                  </F>
                </div>
                <F label="Payment Date">
                  <input type="date" className={ic} value={form.deposit_payment_date} onChange={e => set('deposit_payment_date', e.target.value)} />
                </F>
                <UploadBox field="deposit_payment_proof_url" label="Payment Proof" single />
              </div>
            )}

            <Button onClick={() => setStep(4)}
              disabled={!form.activity_date || !form.description || !form.activity_name}
              className="w-full py-3 text-white rounded-2xl font-semibold"
              style={{ background: 'linear-gradient(135deg, #8A8076, #5a524e)' }}>
              Continue to Documents <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* ── STEP 4: Documents & Submit ── */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">

            <div className="bg-white/80 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">F. Required Documents</h3>
              <p className="text-xs text-slate-500">Upload required supporting documents for your permit application.</p>

              {/* ID Card */}
              <F label="ID Card (KTP)">
                <label className="block cursor-pointer">
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => uploadFile(e, 'document_urls')} disabled={uploading['id_card']} />
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-stone-400 hover:bg-stone-50/50 transition-all">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Upload KTP / ID Card</p>
                  </div>
                </label>
              </F>

              {/* Supporting docs */}
              <F label="Supporting Documents">
                <label className="block cursor-pointer">
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => uploadFile(e, 'document_urls')} disabled={uploading['doc']} />
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-stone-400 hover:bg-stone-50/50 transition-all">
                    {uploading['doc'] ? (
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Permit documents, agreements, photos</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF up to 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </F>

              {/* Uploaded files */}
              {form.document_urls.length > 0 && (
                <div className="space-y-2">
                  {form.document_urls.map((url, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                      <FileText className="w-4 h-4 text-stone-500 flex-shrink-0" />
                      <span className="text-xs text-slate-600 flex-1 truncate">Document {i + 1}</span>
                      <button onClick={() => set('document_urls', form.document_urls.filter((_, j) => j !== i))}>
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white/80 rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Application Summary</h3>
              {[
                ['Permit Type', selectedPermit?.label],
                ['Applicant', form.applicant_name],
                ['Role', form.applicant_role],
                ['Unit', selectedUnit?.unit_number],
                ['Property', selectedUnit?.property_name],
                ['Start Date', form.activity_date ? new Date(form.activity_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null],
                ['Documents', `${form.document_urls.length} file(s)`],
              ].map(([k, v]) => v ? (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium text-slate-800">{v}</span>
                </div>
              ) : null)}
            </div>

            <div className="flex gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Your application will be reviewed by Township Management. You will receive status notifications through the app.</p>
            </div>

            <Button onClick={handleSubmit} disabled={mutation.isPending}
              className="w-full py-3 text-white rounded-2xl font-semibold"
              style={{ background: 'linear-gradient(135deg, #8A8076, #5a524e)' }}>
              {mutation.isPending ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <><CheckCircle className="w-5 h-5 mr-2" /> Submit Application</>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}