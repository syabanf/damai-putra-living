import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, FileCheck, MessageSquare, Wrench, 
  Truck, Calendar, Users, Check, Upload, X, FileText, 
  Clock, User, Building2, AlertCircle, ChevronRight, Shield,
  HardHat, Package, PartyPopper, Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  { 
    id: 'permit', label: 'Digital Permit Application', 
    icon: FileCheck, color: '#8A8076', 
    description: 'Official permit for activities in the property'
  },
  { 
    id: 'complaint', label: 'Lodge a Complaint', 
    icon: MessageSquare, color: '#dc2626',
    description: 'Report an issue to building management'
  },
  { 
    id: 'general_service', label: 'General Service Request', 
    icon: Wrench, color: '#7c3aed',
    description: 'Request maintenance or general assistance'
  },
];

const PERMIT_TYPES = [
  { 
    id: 'renovation', label: 'Renovation / Fit-Out', icon: HardHat,
    description: 'Interior renovation or fit-out works',
    requires: ['work_scope', 'visitor_details', 'num_workers'],
    docs: 'Floor plan, contractor credentials, work schedule'
  },
  { 
    id: 'moving_in', label: 'Move-In Permit', icon: Package,
    description: 'Move furniture and belongings into the unit',
    requires: ['visitor_details'],
    docs: 'Valid ID of movers, vehicle plate number'
  },
  { 
    id: 'moving_out', label: 'Move-Out Permit', icon: Truck,
    description: 'Move furniture and belongings out of the unit',
    requires: ['visitor_details'],
    docs: 'Valid ID of movers, vehicle plate number'
  },
  { 
    id: 'event', label: 'Event / Gathering Permit', icon: PartyPopper,
    description: 'Host an event in common or private areas',
    requires: ['visitor_details', 'num_workers'],
    docs: 'Event brief, expected guest list count'
  },
  { 
    id: 'contractor_access', label: 'Contractor / Vendor Access', icon: Users,
    description: 'Grant access for external contractors or vendors',
    requires: ['visitor_details', 'contractor_company', 'num_workers'],
    docs: 'Contractor ID, company credentials, scope of work'
  },
];

function generateRefNumber(permitType) {
  const typeCode = {
    renovation: 'RNV', moving_in: 'MVI', moving_out: 'MVO',
    event: 'EVT', contractor_access: 'CTR'
  }[permitType] || 'GEN';
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `DP/${typeCode}/${year}/${seq}`;
}

export default function CreateTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get('type');
  
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(preselectedType ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showReview, setShowReview] = useState(false);
  
  const [formData, setFormData] = useState({
    category: preselectedType ? 'permit' : '',
    permit_type: preselectedType || '',
    activity_date: '',
    activity_end_date: '',
    activity_time: '',
    activity_end_time: '',
    description: '',
    work_scope: '',
    contractor_company: '',
    num_workers: '',
    visitor_name: '',
    visitor_phone: '',
    visitor_id: '',
    document_urls: []
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const approvedUnit = units.find(u => u.status === 'approved');

  const createTicketMutation = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      navigate(createPageUrl('TicketSubmitted'));
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFiles(prev => [...prev, { name: file.name, url: file_url }]);
      setFormData(prev => ({ ...prev, document_urls: [...prev.document_urls, file_url] }));
    }
    setLoading(false);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, document_urls: prev.document_urls.filter((_, i) => i !== index) }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData({ ...formData, category: categoryId });
    setStep(categoryId === 'permit' ? 2 : 3);
  };

  const handlePermitTypeSelect = (typeId) => {
    setFormData({ ...formData, permit_type: typeId });
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const refNumber = generateRefNumber(formData.permit_type);
    await createTicketMutation.mutateAsync({
      ...formData,
      num_workers: formData.num_workers ? parseInt(formData.num_workers) : undefined,
      reference_number: refNumber,
      unit_id: approvedUnit?.id,
      unit_number: approvedUnit?.unit_number,
      tower: approvedUnit?.tower,
      property_name: approvedUnit?.property_name,
      user_email: user?.email,
      user_name: user?.full_name,
      status: 'open',
      workflow_stage: 'submitted'
    });
  };

  const selectedPermitType = PERMIT_TYPES.find(t => t.id === formData.permit_type);
  const needsVisitorInfo = selectedPermitType?.requires?.includes('visitor_details');
  const needsWorkScope = selectedPermitType?.requires?.includes('work_scope');
  const needsContractorCompany = selectedPermitType?.requires?.includes('contractor_company');
  const needsNumWorkers = selectedPermitType?.requires?.includes('num_workers');

  const progressSteps = formData.category === 'permit' ? 3 : 2;
  const currentProgress = formData.category === 'permit' ? step : (step === 3 ? 2 : 1);

  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-5 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => {
              if (showReview) setShowReview(false);
              else if (step > 1) setStep(step - 1);
              else navigate(-1);
            }}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white">
              {showReview ? 'Review & Submit' : 
               step === 1 ? 'New Request' : 
               step === 2 ? 'Select Permit Type' : 
               'Application Details'}
            </h1>
            <p className="text-xs text-white/50 mt-0.5">
              {approvedUnit ? `Unit ${approvedUnit.unit_number} · ${approvedUnit.property_name}` : 'Permit Application'}
            </p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/20 bg-white/15">
            <Shield className="w-3 h-3 text-white/80" />
            <span className="text-xs font-medium text-white/80">Official</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex gap-1.5">
            {Array.from({ length: progressSteps }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all duration-500"
                style={{ backgroundColor: i < currentProgress ? '#fff' : 'rgba(255,255,255,0.2)' }}
              />
            ))}
          </div>
          <p className="text-xs text-white/40 mt-1.5">
            Step {currentProgress} of {progressSteps}
          </p>
        </div>
      </div>

      <div className="px-5 pb-6 pt-4">
        <AnimatePresence mode="wait">

          {/* Step 1: Category */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-800">What do you need?</h2>
                <p className="text-slate-500 text-sm mt-1">Select the type of request you'd like to submit to building management.</p>
              </div>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="w-full p-4 rounded-2xl border border-slate-200 hover:border-stone-400 hover:bg-stone-50 flex items-center gap-4 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}18` }}>
                    <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{cat.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 2: Permit Type */}
          {step === 2 && formData.category === 'permit' && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-800">Permit Type</h2>
                <p className="text-slate-500 text-sm mt-1">Select the category that best describes your activity.</p>
              </div>

              {PERMIT_TYPES.map((type) => {
                const selected = formData.permit_type === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => handlePermitTypeSelect(type.id)}
                    className="w-full rounded-2xl border-2 transition-all text-left overflow-hidden"
                    style={{ borderColor: selected ? '#8A8076' : '#e2e8f0', backgroundColor: selected ? '#f7f6f5' : '#fff' }}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: selected ? '#8A8076' : '#f1f5f9' }}>
                        <type.icon className="w-5 h-5" style={{ color: selected ? '#fff' : '#64748b' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{type.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{type.description}</p>
                      </div>
                      {selected && <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#8A8076' }} />}
                    </div>
                    {/* Required docs hint */}
                    <div className="px-4 pb-3 flex items-start gap-2">
                      <Info className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-400">{type.docs}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Step 3: Details Form */}
          {step === 3 && !showReview && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 pt-2 pb-36">

              {/* Unit Info Block */}
              {approvedUnit && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4" style={{ color: '#8A8076' }} />
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8A8076' }}>Unit Information</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-slate-400">Unit No.</p>
                      <p className="font-semibold text-slate-800 text-sm">{approvedUnit.unit_number}</p>
                    </div>
                    {approvedUnit.tower && (
                      <div>
                        <p className="text-xs text-slate-400">Tower</p>
                        <p className="font-semibold text-slate-800 text-sm">{approvedUnit.tower}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-400">Property</p>
                      <p className="font-semibold text-slate-800 text-sm truncate">{approvedUnit.property_name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Schedule */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-700">Activity Schedule</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 font-medium">Start Date <span className="text-red-400">*</span></Label>
                    <Input type="date" value={formData.activity_date}
                      onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                      className="h-11 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 font-medium">End Date</Label>
                    <Input type="date" value={formData.activity_end_date}
                      onChange={(e) => setFormData({ ...formData, activity_end_date: e.target.value })}
                      className="h-11 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 font-medium">Start Time</Label>
                    <Input type="time" value={formData.activity_time}
                      onChange={(e) => setFormData({ ...formData, activity_time: e.target.value })}
                      className="h-11 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 font-medium">End Time</Label>
                    <Input type="time" value={formData.activity_end_time}
                      onChange={(e) => setFormData({ ...formData, activity_end_time: e.target.value })}
                      className="h-11 rounded-xl text-sm" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-medium">Purpose / Description <span className="text-red-400">*</span></Label>
                <Textarea
                  placeholder="Provide a clear and detailed description of the activity being requested..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[90px] rounded-xl resize-none text-sm"
                />
              </div>

              {/* Work Scope for renovation */}
              {needsWorkScope && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 font-medium">Scope of Work</Label>
                  <Textarea
                    placeholder="Describe in detail the renovation or construction work to be carried out..."
                    value={formData.work_scope}
                    onChange={(e) => setFormData({ ...formData, work_scope: e.target.value })}
                    className="min-h-[80px] rounded-xl resize-none text-sm"
                  />
                </div>
              )}

              {/* Number of Workers */}
              {needsNumWorkers && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 font-medium">Number of Workers / Guests</Label>
                  <Input
                    type="number" min="1"
                    placeholder="e.g. 3"
                    value={formData.num_workers}
                    onChange={(e) => setFormData({ ...formData, num_workers: e.target.value })}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>
              )}

              {/* Contractor / Visitor Details */}
              {needsVisitorInfo && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pt-1">
                    <User className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-700">
                      {formData.permit_type === 'contractor_access' || formData.permit_type === 'renovation' ? 'Contractor Details' : 'Representative Details'}
                    </p>
                  </div>

                  {needsContractorCompany && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500 font-medium">Company / Organization Name</Label>
                      <Input
                        placeholder="PT. Contractor Indonesia"
                        value={formData.contractor_company}
                        onChange={(e) => setFormData({ ...formData, contractor_company: e.target.value })}
                        className="h-11 rounded-xl text-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 font-medium">Full Name <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="As per ID / KTP"
                      value={formData.visitor_name}
                      onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500 font-medium">Phone Number</Label>
                      <Input type="tel" placeholder="08xxxxxxxxxx"
                        value={formData.visitor_phone}
                        onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                        className="h-11 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500 font-medium">ID / KTP Number</Label>
                      <Input placeholder="16-digit number"
                        value={formData.visitor_id}
                        onChange={(e) => setFormData({ ...formData, visitor_id: e.target.value })}
                        className="h-11 rounded-xl text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Supporting Documents */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-700">Supporting Documents</p>
                </div>

                {selectedPermitType?.docs && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Required: {selectedPermitType.docs}</p>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#8A8076' }} />
                          <span className="text-sm text-slate-700 truncate max-w-[180px]">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(index)} className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="block cursor-pointer">
                  <div className="p-5 border-2 border-dashed border-stone-200 rounded-xl text-center hover:border-stone-400 hover:bg-stone-50 transition-colors">
                    {loading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full mx-auto mb-2" />
                    ) : (
                      <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                    )}
                    <p className="text-slate-600 text-sm font-medium">{loading ? 'Uploading...' : 'Upload Documents'}</p>
                    <p className="text-slate-400 text-xs mt-1">PDF, JPG, PNG (max 10MB each)</p>
                  </div>
                  <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={loading} />
                </label>
              </div>
            </motion.div>
          )}

          {/* Review */}
          {showReview && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 pt-2 pb-36">
              {/* Header notice */}
              <div className="rounded-2xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #8A8076, #5a524e)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Official Permit Application</p>
                    <p className="text-white/70 text-xs">Review before submitting to Building Management</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-white/80 text-xs">Reference will be issued upon submission</span>
                  <span className="font-mono text-xs text-white/60">AUTO-GENERATED</span>
                </div>
              </div>

              {/* Applicant */}
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100" style={{ backgroundColor: '#f7f6f5' }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A8076' }}>Applicant</p>
                </div>
                <div className="p-4 space-y-2">
                  <Row label="Name" value={user?.full_name || '—'} />
                  <Row label="Email" value={user?.email || '—'} />
                  <Row label="Unit" value={`${approvedUnit?.unit_number}${approvedUnit?.tower ? ' · Tower ' + approvedUnit?.tower : ''}`} />
                  <Row label="Property" value={approvedUnit?.property_name} />
                </div>
              </div>

              {/* Permit Details */}
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100" style={{ backgroundColor: '#f7f6f5' }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A8076' }}>Permit Details</p>
                </div>
                <div className="p-4 space-y-2">
                  <Row label="Category" value="Digital Permit Application" />
                  {formData.permit_type && <Row label="Permit Type" value={PERMIT_TYPES.find(t => t.id === formData.permit_type)?.label} />}
                  {formData.activity_date && <Row label="Start Date" value={new Date(formData.activity_date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} />}
                  {formData.activity_end_date && <Row label="End Date" value={new Date(formData.activity_end_date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} />}
                  {formData.activity_time && <Row label="Time" value={`${formData.activity_time}${formData.activity_end_time ? ' – ' + formData.activity_end_time : ''}`} />}
                  {formData.num_workers && <Row label="No. of Workers / Guests" value={formData.num_workers} />}
                </div>
              </div>

              {formData.description && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100" style={{ backgroundColor: '#f7f6f5' }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A8076' }}>Description</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-700 leading-relaxed">{formData.description}</p>
                  </div>
                </div>
              )}

              {formData.visitor_name && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100" style={{ backgroundColor: '#f7f6f5' }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A8076' }}>
                      {needsContractorCompany ? 'Contractor' : 'Representative'}
                    </p>
                  </div>
                  <div className="p-4 space-y-2">
                    {formData.contractor_company && <Row label="Company" value={formData.contractor_company} />}
                    <Row label="Name" value={formData.visitor_name} />
                    {formData.visitor_phone && <Row label="Phone" value={formData.visitor_phone} />}
                    {formData.visitor_id && <Row label="ID Number" value={formData.visitor_id} />}
                  </div>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100" style={{ backgroundColor: '#f7f6f5' }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A8076' }}>Documents ({uploadedFiles.length})</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <FileText className="w-4 h-4" style={{ color: '#8A8076' }} />
                        <p className="text-sm text-slate-700">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400 text-center leading-relaxed px-4">
                By submitting, you confirm all information is accurate and agree to abide by the property's rules and regulations.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      {step === 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 p-5">
          <div className="max-w-md mx-auto">
            <Button
              onClick={() => showReview ? handleSubmit() : setShowReview(true)}
              disabled={loading || !formData.activity_date || !formData.description}
              className="w-full h-13 text-white rounded-2xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 8px 24px rgba(138,128,118,0.35)', height: '52px' }}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : showReview ? (
                <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Submit Official Application</span>
              ) : (
                <span className="flex items-center gap-2">Review Application <ChevronRight className="w-4 h-4" /></span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-slate-400 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-800 font-medium text-right">{value || '—'}</span>
    </div>
  );
}