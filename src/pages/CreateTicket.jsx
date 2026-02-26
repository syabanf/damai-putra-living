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
  HardHat, Package, PartyPopper, Info, Phone, CreditCard, Hash
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ── Constants ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'permit',          label: 'Permohonan Izin',      icon: FileCheck,     color: '#8A8076', description: 'Ajukan izin resmi kegiatan, renovasi, pindah, dll.' },
  { id: 'complaint',       label: 'Pengaduan / Keluhan',  icon: MessageSquare, color: '#dc2626', description: 'Laporkan masalah kepada manajemen gedung' },
  { id: 'general_service', label: 'Permintaan Layanan',   icon: Wrench,        color: '#7c3aed', description: 'Permintaan pemeliharaan atau bantuan umum' },
];

const PERMIT_TYPES = [
  { id: 'izin_kegiatan',       label: 'Izin Kegiatan',            code: 'IZIN-05', icon: PartyPopper, description: 'Surat Permohonan Izin Kegiatan di area properti',       requires: ['visitor_details', 'num_workers'],                                      docs: 'KTP pemohon, proposal kegiatan',                             deposit: false },
  { id: 'renovasi_minor',      label: 'Izin Renovasi Minor',      code: 'IZIN-03', icon: HardHat,     description: 'Surat Permohonan Ijin Kerja Renovasi Minor',           requires: ['work_scope', 'visitor_details', 'contractor_company', 'num_workers'],   docs: 'KTP pemohon, gambar kerja, surat pernyataan tetangga',        deposit: false },
  { id: 'renovasi_mayor',      label: 'Izin Renovasi Mayor',      code: 'IZIN-04', icon: HardHat,     description: 'Surat Permohonan Ijin Kerja Renovasi Mayor',           requires: ['work_scope', 'visitor_details', 'contractor_company', 'num_workers'],   docs: 'KTP, IMB, gambar kerja, surat pernyataan tetangga, deposit',  deposit: true  },
  { id: 'pembangunan_kavling', label: 'Izin Pembangunan Kavling', code: 'IZIN-02', icon: HardHat,     description: 'Ketentuan Izin Pembangunan Kavling',                    requires: ['work_scope', 'visitor_details', 'contractor_company', 'num_workers'],   docs: 'KTP, IMB, gambar rencana bangun, surat pernyataan tetangga',  deposit: true  },
  { id: 'galian',              label: 'Izin Galian',              code: 'IZIN-19', icon: HardHat,     description: 'Berita Acara Pemeriksaan Galian',                       requires: ['work_scope', 'visitor_details', 'contractor_company', 'num_workers'],   docs: 'KTP, gambar rencana galian, surat izin kontraktor',           deposit: false },
  { id: 'pindah_masuk',        label: 'Izin Pindah Masuk',        code: 'IZIN-15', icon: Package,     description: 'Form Bantuan Keamanan Untuk Masuk',                     requires: ['visitor_details', 'moving_info'],                                      docs: 'KTP pemohon, plat nomor kendaraan',                           deposit: false },
  { id: 'pindah_keluar',       label: 'Izin Pindah Keluar',       code: 'IZIN-16', icon: Truck,       description: 'Form Bantuan Keamanan Untuk Keluar',                    requires: ['visitor_details', 'moving_info'],                                      docs: 'KTP pemohon, plat nomor kendaraan',                           deposit: false },
  { id: 'pencairan_deposit',   label: 'Pencairan Deposit',        code: 'IZIN-11', icon: CreditCard,  description: 'Surat Permohonan Pencairan Deposit Renovasi',            requires: [],                                                                      docs: 'Bukti pembayaran deposit, berita acara pemeriksaan',          deposit: false },
  { id: 'akses_kontraktor',    label: 'Akses Kontraktor / Vendor',code: 'IZIN-15', icon: Users,       description: 'Form Bantuan Keamanan untuk akses kontraktor/vendor',   requires: ['visitor_details', 'contractor_company', 'num_workers'],                docs: 'KTP kontraktor, surat tugas perusahaan, plat nomor',          deposit: false },
];

function generateRefNumber(permitType) {
  const codeMap = {
    izin_kegiatan: 'IZIN-05', renovasi_minor: 'IZIN-03', renovasi_mayor: 'IZIN-04',
    pembangunan_kavling: 'IZIN-02', galian: 'IZIN-19', pindah_masuk: 'IZIN-15',
    pindah_keluar: 'IZIN-16', pencairan_deposit: 'IZIN-11', akses_kontraktor: 'IZIN-15',
  };
  const code = codeMap[permitType] || 'IZIN';
  const year = new Date().getFullYear();
  const seq  = Math.floor(Math.random() * 9000) + 1000;
  return `DP/${code}/${year}/${seq}`;
}

const INITIAL_FORM = {
  category: '', permit_type: '',
  // applicant extra
  applicant_role: '', applicant_nik: '', applicant_phone: '',
  // activity
  activity_date: '', activity_end_date: '', activity_time: '', activity_end_time: '',
  description: '', work_scope: '', work_type: '', affected_area: '',
  uses_heavy_equipment: false, noise_potential: false,
  contractor_company: '', num_workers: '',
  // visitor/representative
  visitor_name: '', visitor_phone: '', visitor_id: '',
  // moving
  vehicle_type: '', vehicle_plate: '', moving_company: '',
  // deposit
  deposit_required: '', deposit_payment_date: '', deposit_payment_proof_url: '',
  document_urls: [],
};

// ── Component ─────────────────────────────────────────────────
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
    ...INITIAL_FORM,
    category: preselectedType ? 'permit' : '',
    permit_type: preselectedType || '',
  });

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

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

  const set = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

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
      workflow_stage: 'submitted',
    });
  };

  const selectedPermitType   = PERMIT_TYPES.find(t => t.id === formData.permit_type);
  const needsVisitorInfo     = selectedPermitType?.requires?.includes('visitor_details');
  const needsWorkScope       = selectedPermitType?.requires?.includes('work_scope');
  const needsContractorCo    = selectedPermitType?.requires?.includes('contractor_company');
  const needsNumWorkers      = selectedPermitType?.requires?.includes('num_workers');
  const needsMovingInfo      = selectedPermitType?.requires?.includes('moving_info');
  const needsDeposit         = selectedPermitType?.deposit;

  const progressSteps  = formData.category === 'permit' ? 3 : 2;
  const currentProgress = formData.category === 'permit' ? step : (step === 3 ? 2 : 1);

  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-5 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => { if (showReview) setShowReview(false); else if (step > 1) setStep(step - 1); else navigate(-1); }}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white">
              {showReview ? 'Review & Submit' : step === 1 ? 'Permohonan Baru' : step === 2 ? 'Pilih Jenis Izin' : 'Detail Permohonan'}
            </h1>
            <p className="text-xs text-white/50 mt-0.5">
              {approvedUnit ? `Unit ${approvedUnit.unit_number} · ${approvedUnit.property_name}` : 'Damai Putra Group'}
            </p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/20 bg-white/15">
            <Shield className="w-3 h-3 text-white/80" />
            <span className="text-xs font-medium text-white/80">Official</span>
          </div>
        </div>
        <div>
          <div className="flex gap-1.5">
            {Array.from({ length: progressSteps }).map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
                style={{ backgroundColor: i < currentProgress ? '#fff' : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
          <p className="text-xs text-white/40 mt-1.5">Langkah {currentProgress} dari {progressSteps}</p>
        </div>
      </div>

      <div className="px-5 pb-6 pt-4">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Category ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-800">Apa yang Anda butuhkan?</h2>
                <p className="text-slate-500 text-sm mt-1">Pilih jenis permohonan yang ingin diajukan.</p>
              </div>
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => handleCategorySelect(cat.id)}
                  className="w-full p-4 rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-sm hover:bg-white/90 flex items-center gap-4 transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}18` }}>
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

          {/* ── Step 2: Permit Type ── */}
          {step === 2 && formData.category === 'permit' && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-800">Jenis Izin</h2>
                <p className="text-slate-500 text-sm mt-1">Pilih jenis izin yang sesuai dengan kegiatan Anda.</p>
              </div>
              {PERMIT_TYPES.map((type) => {
                const selected = formData.permit_type === type.id;
                return (
                  <button key={type.id} onClick={() => handlePermitTypeSelect(type.id)}
                    className="w-full rounded-2xl border-2 transition-all text-left overflow-hidden backdrop-blur-xl"
                    style={{ borderColor: selected ? '#8A8076' : 'rgba(255,255,255,0.8)', backgroundColor: selected ? 'rgba(138,128,118,0.08)' : 'rgba(255,255,255,0.7)' }}>
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: selected ? '#8A8076' : '#f1f5f9' }}>
                        <type.icon className="w-5 h-5" style={{ color: selected ? '#fff' : '#64748b' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800 text-sm">{type.label}</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500">{type.code}</span>
                          {type.deposit && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600">Deposit</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{type.description}</p>
                      </div>
                      {selected && <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#8A8076' }} />}
                    </div>
                    <div className="px-4 pb-3 flex items-start gap-2">
                      <Info className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-400">{type.docs}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* ── Step 3: Details ── */}
          {step === 3 && !showReview && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 pt-2 pb-36">

              {/* A. Applicant Info */}
              <Section title="A. Data Pemohon" icon={User}>
                <div className="space-y-3">
                  <Field label="Nama Lengkap" required>
                    <Input value={user?.full_name || ''} readOnly className="h-11 rounded-xl text-sm bg-stone-50" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Email">
                      <Input value={user?.email || ''} readOnly className="h-11 rounded-xl text-sm bg-stone-50" />
                    </Field>
                    <Field label="Status Pemohon" required>
                      <select value={formData.applicant_role} onChange={(e) => set('applicant_role', e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm text-slate-700">
                        <option value="">Pilih...</option>
                        <option value="owner">Pemilik Unit</option>
                        <option value="tenant">Tenant</option>
                        <option value="authorized">Kuasa</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="NIK / No. Identitas">
                      <Input placeholder="16 digit NIK" value={formData.applicant_nik} onChange={(e) => set('applicant_nik', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                    <Field label="No. Telepon">
                      <Input type="tel" placeholder="08xxxxxxxxxx" value={formData.applicant_phone} onChange={(e) => set('applicant_phone', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                  </div>
                </div>
              </Section>

              {/* B. Unit Info */}
              {approvedUnit && (
                <Section title="B. Informasi Unit" icon={Building2}>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-slate-400">No. Unit</p>
                      <p className="font-semibold text-slate-800 text-sm">{approvedUnit.unit_number}</p>
                    </div>
                    {approvedUnit.tower && (
                      <div>
                        <p className="text-xs text-slate-400">Tower</p>
                        <p className="font-semibold text-slate-800 text-sm">{approvedUnit.tower}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-400">Properti</p>
                      <p className="font-semibold text-slate-800 text-sm truncate">{approvedUnit.property_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <p className="font-semibold text-slate-800 text-sm capitalize">{approvedUnit.ownership_status}</p>
                    </div>
                  </div>
                </Section>
              )}

              {/* D. Activity Schedule */}
              <Section title="D. Jadwal Kegiatan" icon={Calendar}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tanggal Mulai" required>
                    <Input type="date" value={formData.activity_date} onChange={(e) => set('activity_date', e.target.value)} className="h-11 rounded-xl text-sm" />
                  </Field>
                  <Field label="Tanggal Selesai">
                    <Input type="date" value={formData.activity_end_date} onChange={(e) => set('activity_end_date', e.target.value)} className="h-11 rounded-xl text-sm" />
                  </Field>
                  <Field label="Jam Mulai">
                    <Input type="time" value={formData.activity_time} onChange={(e) => set('activity_time', e.target.value)} className="h-11 rounded-xl text-sm" />
                  </Field>
                  <Field label="Jam Selesai">
                    <Input type="time" value={formData.activity_end_time} onChange={(e) => set('activity_end_time', e.target.value)} className="h-11 rounded-xl text-sm" />
                  </Field>
                </div>
                <Field label="Tujuan / Deskripsi Kegiatan" required>
                  <Textarea placeholder="Jelaskan secara rinci kegiatan yang akan dilakukan..." value={formData.description}
                    onChange={(e) => set('description', e.target.value)} className="min-h-[90px] rounded-xl resize-none text-sm" />
                </Field>
              </Section>

              {/* E. Renovation / Construction Details */}
              {needsWorkScope && (
                <Section title="E. Detail Pekerjaan" icon={HardHat}>
                  <Field label="Ruang Lingkup Pekerjaan" required>
                    <Textarea placeholder="Jelaskan detail pekerjaan renovasi/pembangunan yang akan dilakukan..." value={formData.work_scope}
                      onChange={(e) => set('work_scope', e.target.value)} className="min-h-[80px] rounded-xl resize-none text-sm" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Jenis Pekerjaan">
                      <select value={formData.work_type} onChange={(e) => set('work_type', e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm text-slate-700">
                        <option value="">Pilih...</option>
                        <option value="struktural">Struktural</option>
                        <option value="non_struktural">Non-Struktural</option>
                        <option value="mep">MEP (Mekanikal/Elektrikal/Plumbing)</option>
                        <option value="fasad">Fasad / Eksterior</option>
                        <option value="interior">Interior</option>
                      </select>
                    </Field>
                    <Field label="Area Terdampak">
                      <Input placeholder="cth. Dapur, Kamar Tidur" value={formData.affected_area}
                        onChange={(e) => set('affected_area', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.uses_heavy_equipment} onChange={(e) => set('uses_heavy_equipment', e.target.checked)}
                        className="w-4 h-4 accent-stone-600" />
                      <span className="text-xs text-slate-600">Alat Berat</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.noise_potential} onChange={(e) => set('noise_potential', e.target.checked)}
                        className="w-4 h-4 accent-stone-600" />
                      <span className="text-xs text-slate-600">Potensi Kebisingan</span>
                    </label>
                  </div>
                </Section>
              )}

              {/* Workers */}
              {needsNumWorkers && (
                <Field label="Jumlah Pekerja / Tamu">
                  <Input type="number" min="1" placeholder="cth. 3" value={formData.num_workers}
                    onChange={(e) => set('num_workers', e.target.value)} className="h-11 rounded-xl text-sm" />
                </Field>
              )}

              {/* Contractor / Visitor */}
              {needsVisitorInfo && (
                <Section title={needsContractorCo ? 'Data Kontraktor / Vendor' : 'Data Perwakilan'} icon={User}>
                  {needsContractorCo && (
                    <Field label="Nama Perusahaan / Organisasi">
                      <Input placeholder="PT. Kontraktor Indonesia" value={formData.contractor_company}
                        onChange={(e) => set('contractor_company', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                  )}
                  <Field label="Nama Lengkap" required>
                    <Input placeholder="Sesuai KTP" value={formData.visitor_name}
                      onChange={(e) => set('visitor_name', e.target.value)} className="h-11 rounded-xl text-sm" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="No. Telepon">
                      <Input type="tel" placeholder="08xxxxxxxxxx" value={formData.visitor_phone}
                        onChange={(e) => set('visitor_phone', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                    <Field label="No. KTP">
                      <Input placeholder="16 digit" value={formData.visitor_id}
                        onChange={(e) => set('visitor_id', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                  </div>
                </Section>
              )}

              {/* H. Security / Moving Info */}
              {needsMovingInfo && (
                <Section title="H. Informasi Kendaraan & Pindahan" icon={Truck}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Jenis Kendaraan">
                      <Input placeholder="Truk, Pick-up, dll" value={formData.vehicle_type}
                        onChange={(e) => set('vehicle_type', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                    <Field label="Plat Nomor">
                      <Input placeholder="B 1234 ABC" value={formData.vehicle_plate}
                        onChange={(e) => set('vehicle_plate', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                  </div>
                  <Field label="Nama Jasa Pindahan (opsional)">
                    <Input placeholder="Nama perusahaan jasa pindahan" value={formData.moving_company}
                      onChange={(e) => set('moving_company', e.target.value)} className="h-11 rounded-xl text-sm" />
                  </Field>
                </Section>
              )}

              {/* F. Deposit */}
              {needsDeposit && (
                <Section title="F. Informasi Deposit" icon={CreditCard}>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Deposit diperlukan sebagai jaminan kerusakan fasilitas umum. Deposit akan dikembalikan setelah pemeriksaan.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Jumlah Deposit (IDR)">
                      <Input type="number" placeholder="5000000" value={formData.deposit_required}
                        onChange={(e) => set('deposit_required', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                    <Field label="Tanggal Pembayaran">
                      <Input type="date" value={formData.deposit_payment_date}
                        onChange={(e) => set('deposit_payment_date', e.target.value)} className="h-11 rounded-xl text-sm" />
                    </Field>
                  </div>
                </Section>
              )}

              {/* G. Documents */}
              <Section title="G. Dokumen Pendukung" icon={FileText}>
                {selectedPermitType?.docs && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Wajib: {selectedPermitType.docs}</p>
                  </div>
                )}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="p-3 bg-white/70 border border-white/80 backdrop-blur-sm rounded-xl flex items-center justify-between">
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
                  <div className="p-5 border-2 border-dashed border-stone-300/70 rounded-xl text-center hover:border-stone-400 hover:bg-white/50 bg-white/30 backdrop-blur-sm transition-colors">
                    {loading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full mx-auto mb-2" />
                    ) : (
                      <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                    )}
                    <p className="text-slate-600 text-sm font-medium">{loading ? 'Mengunggah...' : 'Unggah Dokumen'}</p>
                    <p className="text-slate-400 text-xs mt-1">PDF, JPG, PNG (maks. 10MB)</p>
                  </div>
                  <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={loading} />
                </label>
              </Section>
            </motion.div>
          )}

          {/* ── Review ── */}
          {showReview && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 pt-2 pb-36">
              <div className="rounded-2xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #8A8076, #5a524e)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Permohonan Izin Resmi</p>
                    <p className="text-white/70 text-xs">Periksa sebelum submit ke Manajemen Gedung</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-white/80 text-xs">Nomor referensi akan diterbitkan setelah submit</span>
                  <span className="font-mono text-xs text-white/60">AUTO-GENERATED</span>
                </div>
              </div>

              <ReviewCard title="Data Pemohon">
                <Row label="Nama" value={user?.full_name} />
                <Row label="Email" value={user?.email} />
                {formData.applicant_role && <Row label="Status" value={{ owner: 'Pemilik Unit', tenant: 'Tenant', authorized: 'Kuasa' }[formData.applicant_role]} />}
                {formData.applicant_nik && <Row label="NIK" value={formData.applicant_nik} />}
                {formData.applicant_phone && <Row label="Telepon" value={formData.applicant_phone} />}
              </ReviewCard>

              <ReviewCard title="Informasi Unit">
                <Row label="Unit" value={`${approvedUnit?.unit_number}${approvedUnit?.tower ? ' · Tower ' + approvedUnit.tower : ''}`} />
                <Row label="Properti" value={approvedUnit?.property_name} />
                <Row label="Status" value={approvedUnit?.ownership_status} />
              </ReviewCard>

              <ReviewCard title="Detail Izin">
                <Row label="Jenis Izin" value={`[${selectedPermitType?.code}] ${selectedPermitType?.label}`} />
                {formData.activity_date && <Row label="Tanggal Mulai" value={new Date(formData.activity_date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />}
                {formData.activity_end_date && <Row label="Tanggal Selesai" value={new Date(formData.activity_end_date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />}
                {formData.activity_time && <Row label="Jam" value={`${formData.activity_time}${formData.activity_end_time ? ' – ' + formData.activity_end_time : ''}`} />}
                {formData.num_workers && <Row label="Jml. Pekerja/Tamu" value={formData.num_workers} />}
              </ReviewCard>

              {formData.description && (
                <ReviewCard title="Deskripsi">
                  <p className="text-sm text-slate-700 leading-relaxed">{formData.description}</p>
                </ReviewCard>
              )}

              {(formData.visitor_name || formData.contractor_company) && (
                <ReviewCard title={needsContractorCo ? 'Data Kontraktor' : 'Data Perwakilan'}>
                  {formData.contractor_company && <Row label="Perusahaan" value={formData.contractor_company} />}
                  {formData.visitor_name && <Row label="Nama" value={formData.visitor_name} />}
                  {formData.visitor_phone && <Row label="Telepon" value={formData.visitor_phone} />}
                  {formData.visitor_id && <Row label="No. KTP" value={formData.visitor_id} />}
                </ReviewCard>
              )}

              {needsMovingInfo && (formData.vehicle_type || formData.vehicle_plate) && (
                <ReviewCard title="Kendaraan & Pindahan">
                  {formData.vehicle_type && <Row label="Kendaraan" value={formData.vehicle_type} />}
                  {formData.vehicle_plate && <Row label="Plat" value={formData.vehicle_plate} />}
                  {formData.moving_company && <Row label="Jasa Pindah" value={formData.moving_company} />}
                </ReviewCard>
              )}

              {uploadedFiles.length > 0 && (
                <ReviewCard title={`Dokumen (${uploadedFiles.length})`}>
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <FileText className="w-4 h-4" style={{ color: '#8A8076' }} />
                      <p className="text-sm text-slate-700">{file.name}</p>
                    </div>
                  ))}
                </ReviewCard>
              )}

              <p className="text-xs text-slate-400 text-center leading-relaxed px-4">
                Dengan submit, Anda menyatakan bahwa seluruh informasi benar dan setuju mematuhi peraturan properti Damai Putra Group.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom CTA ── */}
      {step === 3 && (
        <div className="fixed bottom-0 left-0 right-0 p-5" style={{ background: 'rgba(245,243,240,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.6)' }}>
          <div className="max-w-md mx-auto">
            <Button
              onClick={() => showReview ? handleSubmit() : setShowReview(true)}
              disabled={loading || !formData.activity_date || !formData.description}
              className="w-full text-white rounded-2xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 8px 24px rgba(138,128,118,0.35)', height: '52px' }}>
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : showReview ? (
                <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Submit Permohonan Resmi</span>
              ) : (
                <span className="flex items-center gap-2">Review Permohonan <ChevronRight className="w-4 h-4" /></span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-700">{title}</p>
      </div>
      <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-sm p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500 font-medium">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ReviewCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100" style={{ backgroundColor: '#f7f6f5' }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A8076' }}>{title}</p>
      </div>
      <div className="p-4 space-y-2">{children}</div>
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