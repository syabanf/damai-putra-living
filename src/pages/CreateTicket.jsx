import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

import PermitTypeSelector, { PERMIT_TYPES } from '@/components/permit/PermitTypeSelector';
import StepApplicant from '@/components/permit/StepApplicant';
import StepActivity from '@/components/permit/StepActivity';
import StepDocuments from '@/components/permit/StepDocuments';

const STEPS = ['Permit Type', 'Applicant & Unit', 'Activity Details', 'Documents & Submit'];

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
  const [form, setForm] = useState({ ...EMPTY_FORM, permit_type: preType || '' });

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
    setForm(f => ({ ...EMPTY_FORM, permit_type: type, applicant_name: f.applicant_name, applicant_email: f.applicant_email }));
    setStep(2);
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
    if (step === 3) {
      if (form.permit_type === 'pencairan_deposit') return !!form.description;
      return form.activity_name && form.description && form.activity_date;
    }
    return true;
  };

  const next = () => setStep(s => s + 1);
  const back = () => step > 1 ? setStep(s => s - 1) : navigate(-1);

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
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
          <span className="text-white/60 text-xs font-semibold flex-shrink-0">{step}/{STEPS.length}</span>
        </div>
        {/* Step progress */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < step ? 'bg-white' : 'bg-white/25'}`} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-2 font-medium">{STEPS[step - 1]}</p>
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
                {/* Selected permit badge */}
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

            {/* Step 3: Activity & Work Details */}
            {step === 3 && (
              <div className="space-y-5">
                <StepActivity
                  form={form} set={set}
                  permitType={form.permit_type}
                  uploading={uploading}
                  onUpload={uploadSingle}
                />
                <Button onClick={next} disabled={!canProceed()}
                  className="w-full py-3 text-white rounded-2xl font-semibold"
                  style={{ background: '#1F86C7' }}>
                  Continue to Documents <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}

            {/* Step 4: Documents & Submit */}
            {step === 4 && (
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
                  style={{ background: '#1F86C7' }}>
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