import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

import PermitTypeSelector, { PERMIT_TYPES } from '@/components/permit/PermitTypeSelector';
import StepApplicant from '@/components/permit/StepApplicant';
import StepActivity from '@/components/permit/StepActivity';
import StepDocuments from '@/components/permit/StepDocuments';

const RENOVATION_TYPES = ['renovasi_minor', 'renovasi_mayor'];

const MINOR_ITEMS = [
  { name: 'Pengecatan ruang dalam', category: 'Interior' },
  { name: 'Pengecatan ulang bagian luar', category: 'Eksterior' },
  { name: 'Penggantian/pemasangan daun pintu dan jendela', category: 'Pintu & Jendela' },
  { name: 'Pemasangan teralis pintu/jendela', category: 'Pintu & Jendela' },
  { name: 'Pemasangan interior knock down', category: 'Interior' },
  { name: 'Perbaikan/penggantian plafon', category: 'Interior' },
  { name: 'Penggantian keramik', category: 'Interior' },
  { name: 'Pemasangan papan nama toko', category: 'Eksterior' },
  { name: 'Pemasangan groundtank', category: 'MEP' },
  { name: 'Service instalasi ME', category: 'MEP' },
  { name: 'Penataan taman unit', category: 'Landscape' },
  { name: 'Pemasangan pompa air listrik/jetpam', category: 'MEP' },
  { name: 'Perbaikan batu alam', category: 'Eksterior' },
  { name: 'Pemasangan grassblock / paving', category: 'Landscape' },
  { name: 'Canopy polycarbonate', category: 'Struktur' },
  { name: 'Pemasangan roster', category: 'Eksterior' },
];

const MAJOR_ITEMS = [
  { name: 'Bongkar pasang dinding penyekat interior', category: 'Struktural' },
  { name: 'Perluasan bangunan ke samping', category: 'Struktural' },
  { name: 'Perluasan ke belakang', category: 'Struktural' },
  { name: 'Pengurukan tanah', category: 'Sipil' },
  { name: 'Pengecoran dak jemur / dak talang', category: 'Struktural' },
  { name: 'Pengadaan torn', category: 'MEP' },
  { name: 'Penambahan lantai', category: 'Struktural' },
  { name: 'Penambahan ruangan / kamar / gudang', category: 'Struktural' },
  { name: 'Polycarbonate gantung', category: 'Struktur' },
  { name: 'Pemasangan torn dengan rangka besi', category: 'Struktural' },
];

const STEPS_NORMAL = ['Permit Type', 'Applicant & Unit', 'Activity Details', 'Documents & Submit'];
const STEPS_RENOVATION = ['Permit Type', 'Applicant & Unit', 'Work Scope', 'Activity Details', 'Documents & Submit'];

const STEPS = STEPS_NORMAL; // updated dynamically

const EMPTY_FORM = {
  // A. Applicant
  applicant_name: '', applicant_role: '', applicant_nik: '',
  applicant_phone: '', applicant_email: '', applicant_address: '',
  // B. Unit
  unit_id: '',
  // C. Permit type (set in step 1)
  permit_type: '',
  // D. Activity
  activity_name: '', description: '', activity_category: '',
  activity_date: '', activity_end_date: '', activity_time: '', activity_end_time: '',
  num_workers: '', contractor_company: '',
  // E. Renovation
  work_type: '', work_scope: '', affected_area: '',
  uses_heavy_equipment: false, noise_potential: false,
  // F. Deposit
  deposit_required: '', deposit_paid: '', deposit_payment_date: '',
  deposit_payment_proof_url: '',
  // G. Documents
  document_urls: [], named_docs: {},
  // H. Moving
  vehicle_type: '', vehicle_plate: '', moving_company: '',
  visitor_name: '', visitor_phone: '',
};

export default function CreateTicket() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preType = urlParams.get('type');

  const [step, setStep] = useState(preType ? 2 : 1);
  const [uploading, setUploading] = useState({});
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, permit_type: preType || '', selected_work_items: [] });

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

  const isRenovation = RENOVATION_TYPES.includes(form.permit_type);
  const activeSteps = isRenovation ? STEPS_RENOVATION : STEPS_NORMAL;
  const totalSteps = activeSteps.length;

  const mutation = useMutation({
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['tickets'] });
      const prev = qc.getQueryData(['tickets', user?.email]);
      // Optimistically show an empty placeholder so the list feels instant
      qc.setQueryData(['tickets', user?.email], (old = []) => [
        { id: '__optimistic__', permit_type: form.permit_type, status: 'open', created_date: new Date().toISOString(), unit_number: form.unit_number || '' },
        ...old,
      ]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tickets', user?.email], ctx.prev);
    },
    mutationFn: async (data) => {
      const ticket = await base44.entities.Ticket.create(data);
      // If renovation type, create linked PermitApplication + WorkItems + ActivityLog
      if (isRenovation) {
        const existingPermits = await base44.entities.PermitApplication.list('-created_date', 1);
        const permitNum = `DP/RNV-${form.permit_type === 'renovasi_minor' ? 'MIN' : 'MAJ'}/${new Date().getFullYear()}/${String(existingPermits.length + 1).padStart(3, '0')}`;
        await base44.entities.PermitApplication.create({
          permit_number: permitNum,
          permit_type: form.permit_type === 'renovasi_minor' ? 'Minor Renovation' : 'Major Renovation',
          application_status: 'Submitted',
          submission_date: new Date().toISOString().split('T')[0],
          applicant_name: data.user_name || user?.full_name,
          phone_number: data.applicant_phone || '',
          email: data.user_email || user?.email,
          cluster_name: selectedUnit?.property_name || '',
          unit_number: data.unit_number || '',
          renovation_description: data.description || '',
          work_scope_summary: data.work_scope || '',
          start_date: data.activity_date || '',
          end_date: data.activity_end_date || '',
          duration_days: data.activity_date && data.activity_end_date
            ? Math.max(0, (new Date(data.activity_end_date) - new Date(data.activity_date)) / 86400000)
            : null,
          contractor_name: data.contractor_company || '',
          num_workers: data.num_workers || null,
          deposit_amount: data.deposit_required || null,
          deposit_status: data.deposit_required ? 'Pending Payment' : 'Not Required',
          user_email: user?.email,
        });
        // Create work items
        if (form.selected_work_items.length > 0) {
          await base44.entities.WorkItem.bulkCreate(
            form.selected_work_items.map(item => ({
              application_id: ticket.id,
              work_item_name: item.name,
              work_category: item.category,
              work_item_type: MAJOR_ITEMS.some(m => m.name === item.name) ? 'Major' : 'Minor',
              selected_by_applicant: true,
              review_status: 'Pending',
            }))
          );
        }
        // Activity log
        await base44.entities.ActivityLog.create({
          application_id: ticket.id,
          activity_type: 'Submitted',
          activity_description: `Permit ${permitNum} submitted via mobile app`,
          performed_by: user?.full_name || user?.email,
          performed_at: new Date().toISOString(),
        });
      }
      return ticket;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      navigate(createPageUrl('TicketSubmitted'));
    },
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* Upload single file, store URL */
  const uploadSingle = async (e, uploadKey, formField) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(u => ({ ...u, [uploadKey]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, [formField]: file_url }));
    setUploading(u => ({ ...u, [uploadKey]: false }));
  };

  /* Upload named doc, store in named_docs + document_urls */
  const uploadNamedDoc = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(u => ({ ...u, [key]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({
      ...f,
      named_docs: { ...f.named_docs, [key]: file_url },
      document_urls: [...f.document_urls, file_url],
    }));
    setUploading(u => ({ ...u, [key]: false }));
  };

  const handlePermitSelect = (type) => {
    setForm(f => ({ ...EMPTY_FORM, permit_type: type, applicant_name: f.applicant_name, applicant_email: f.applicant_email, selected_work_items: [] }));
    setStep(2);
  };

  const toggleWorkItem = (item) => {
    setForm(f => {
      const exists = f.selected_work_items.some(i => i.name === item.name);
      return {
        ...f,
        selected_work_items: exists
          ? f.selected_work_items.filter(i => i.name !== item.name)
          : [...f.selected_work_items, item],
      };
    });
  };

  const handleSubmit = () => {
    mutation.mutate({
      ...form,
      num_workers: form.num_workers ? Number(form.num_workers) : undefined,
      deposit_required: form.deposit_required ? Number(form.deposit_required) : undefined,
      deposit_paid: form.deposit_paid ? Number(form.deposit_paid) : undefined,
      category: 'permit',
      status: 'open',
      workflow_stage: 'submitted',
      user_email: user?.email,
      user_name: user?.full_name,
      unit_number: selectedUnit?.unit_number,
      tower: selectedUnit?.tower,
      property_name: selectedUnit?.property_name,
    });
  };

  /* Validation per step */
  const canProceed = () => {
    if (step === 2) return form.unit_id && form.applicant_name && form.applicant_role && form.applicant_nik;
    if (isRenovation && step === 3) return true; // work scope optional
    const activityStep = isRenovation ? 4 : 3;
    if (step === activityStep) {
      if (form.permit_type === 'pencairan_deposit') return !!form.description;
      return form.activity_name && form.description && form.activity_date;
    }
    return true;
  };

  const next = () => setStep(s => s + 1);
  const back = () => step > 1 ? setStep(s => s - 1) : navigate(-1);

  return (
    <div className="min-h-screen pb-40" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={back}
            className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-xs">Damai Putra Living</p>
            <h1 className="text-xl font-bold text-white truncate">
              {step === 1 ? 'New Permit Application' : selectedPermit?.label || 'New Permit'}
            </h1>
          </div>
          <span className="text-white/60 text-xs font-semibold flex-shrink-0">{step}/{totalSteps}</span>
        </div>
        {/* Step progress */}
        <div className="flex gap-1">
          {activeSteps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < step ? 'bg-white' : 'bg-white/25'}`} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-2 font-medium">{activeSteps[step - 1]}</p>
      </div>

      <div className="px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}>

            {/* Step 1: Permit Type */}
            {step === 1 && (
              <PermitTypeSelector onSelect={handlePermitSelect} />
            )}

            {/* Step 2: Applicant & Unit */}
            {step === 2 && (
              <div className="space-y-5">
                {selectedPermit && (
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: selectedPermit.bg }}>
                    <selectedPermit.icon className="w-5 h-5" style={{ color: selectedPermit.color }} />
                    <span className="font-semibold text-sm text-slate-700">{selectedPermit.label}</span>
                    <button onClick={() => setStep(1)} className="ml-auto text-xs text-slate-400 underline">Change</button>
                  </div>
                )}
                <StepApplicant form={form} set={set} approvedUnits={approvedUnits} />
                <Button onClick={next} disabled={!canProceed()}
                  className="w-full py-3 text-white rounded-2xl font-semibold"
                  style={{ background: 'linear-gradient(135deg, #1FB6D5, #169ab5)' }}>
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}

            {/* Step 3: Work Scope (renovation only) */}
            {isRenovation && step === 3 && (
              <div className="space-y-4">
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(138,127,115,0.08)' }}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Pilih Lingkup Pekerjaan</p>
                  {form.permit_type === 'renovasi_mayor' && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">Pekerjaan Mayor / Struktural</p>
                      <div className="space-y-2">
                        {MAJOR_ITEMS.map(item => (
                          <label key={item.name} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.selected_work_items.some(i => i.name === item.name) ? 'border-purple-400 bg-purple-50' : 'border-slate-200 bg-white'}`}>
                            <input type="checkbox" checked={form.selected_work_items.some(i => i.name === item.name)} onChange={() => toggleWorkItem(item)} className="mt-0.5 accent-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-slate-800 leading-tight">{item.name}</p>
                              <p className="text-xs text-slate-400">{item.category}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-sky-700 mb-2 uppercase tracking-wide">Pekerjaan Minor / Non-Struktural</p>
                    <div className="space-y-2">
                      {MINOR_ITEMS.map(item => (
                        <label key={item.name} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.selected_work_items.some(i => i.name === item.name) ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                          <input type="checkbox" checked={form.selected_work_items.some(i => i.name === item.name)} onChange={() => toggleWorkItem(item)} className="mt-0.5 accent-sky-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-800 leading-tight">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.category}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {form.selected_work_items.length > 0 && (
                  <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-700">{form.selected_work_items.length} pekerjaan dipilih</p>
                    <p className="text-xs text-emerald-600 mt-0.5 line-clamp-2">{form.selected_work_items.map(i => i.name).join(' · ')}</p>
                  </div>
                )}
                <Button onClick={next}
                  className="w-full py-3 text-white rounded-2xl font-semibold"
                  style={{ background: 'linear-gradient(135deg, #1FB6D5, #169ab5)' }}>
                  Lanjut ke Detail Aktivitas <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}

            {/* Step 3 (normal) or Step 4 (renovation): Activity & Work Details */}
            {((!isRenovation && step === 3) || (isRenovation && step === 4)) && (
              <div className="space-y-5">
                <StepActivity
                  form={form} set={set}
                  permitType={form.permit_type}
                  uploading={uploading}
                  onUpload={uploadSingle}
                />
                <Button onClick={next} disabled={!canProceed()}
                  className="w-full py-3 text-white rounded-2xl font-semibold"
                  style={{ background: 'linear-gradient(135deg, #1FB6D5, #169ab5)' }}>
                  Lanjut ke Dokumen <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}

            {/* Step 4 (normal) or Step 5 (renovation): Documents & Submit */}
            {((!isRenovation && step === 4) || (isRenovation && step === 5)) && (
              <div className="space-y-5">
                <StepDocuments
                  form={form} set={set}
                  permitType={form.permit_type}
                  uploading={uploading}
                  onUploadMulti={uploadNamedDoc}
                  selectedUnit={selectedUnit}
                  selectedPermit={selectedPermit}
                  user={user}
                />
                <Button onClick={handleSubmit} disabled={mutation.isPending}
                  className="w-full py-3 text-white rounded-2xl font-semibold"
                  style={{ background: 'linear-gradient(135deg, #1FB6D5, #169ab5)' }}>
                  {mutation.isPending ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <><CheckCircle className="w-5 h-5 mr-2" /> Submit Application</>
                  )}
                </Button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}