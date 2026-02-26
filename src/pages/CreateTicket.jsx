import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Upload, FileText, Building2,
  Calendar, Clock, Users, Truck, Wrench, CheckCircle, X, AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const PERMIT_TYPES = [
  { value: 'izin_kegiatan', label: 'Izin Kegiatan', icon: Calendar, desc: 'Acara & kegiatan di area properti', color: '#4f86f7', bg: '#ebf0ff' },
  { value: 'renovasi_minor', label: 'Renovasi Minor', icon: Wrench, desc: 'Perbaikan kecil non-struktural', color: '#f97316', bg: '#fff3eb' },
  { value: 'renovasi_mayor', label: 'Renovasi Mayor', icon: Wrench, desc: 'Renovasi besar struktural', color: '#ef4444', bg: '#fef2f2' },
  { value: 'pembangunan_kavling', label: 'Pembangunan Kavling', icon: Building2, desc: 'Pembangunan baru pada kavling', color: '#8b5cf6', bg: '#f5f3ff' },
  { value: 'galian', label: 'Galian', icon: Wrench, desc: 'Pekerjaan galian tanah', color: '#92400e', bg: '#fef3c7' },
  { value: 'pindah_masuk', label: 'Pindah Masuk', icon: Truck, desc: 'Proses pindah masuk ke unit', color: '#10b981', bg: '#ecfdf5' },
  { value: 'pindah_keluar', label: 'Pindah Keluar', icon: Truck, desc: 'Proses pindah keluar dari unit', color: '#64748b', bg: '#f1f5f9' },
  { value: 'akses_kontraktor', label: 'Akses Kontraktor', icon: Users, desc: 'Akses untuk kontraktor/teknisi', color: '#0891b2', bg: '#ecfeff' },
];

const InputField = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-stone-400/40 focus:border-stone-400 transition-all";
const selectClass = inputClass;

export default function CreateTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get('type');

  const [step, setStep] = useState(preselectedType ? 2 : 1);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    permit_type: preselectedType || '',
    unit_id: '',
    description: '',
    activity_date: '',
    activity_end_date: '',
    activity_time: '',
    activity_end_time: '',
    work_scope: '',
    work_type: '',
    affected_area: '',
    uses_heavy_equipment: false,
    noise_potential: false,
    num_workers: '',
    contractor_company: '',
    visitor_name: '',
    visitor_phone: '',
    vehicle_type: '',
    vehicle_plate: '',
    moving_company: '',
    document_urls: [],
  });

  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const approvedUnits = user ? units.filter(u => u.status === 'approved' && u.user_email === user.email) : [];
  const selectedUnit = approvedUnits.find(u => u.id === form.unit_id);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      navigate(createPageUrl('TicketSubmitted'));
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('document_urls', [...form.document_urls, file_url]);
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!form.unit_id || !form.permit_type || !form.activity_date) return;
    const unit = approvedUnits.find(u => u.id === form.unit_id);
    mutation.mutate({
      ...form,
      num_workers: form.num_workers ? Number(form.num_workers) : undefined,
      category: 'permit',
      status: 'open',
      user_email: user?.email,
      user_name: user?.full_name,
      unit_number: unit?.unit_number,
      tower: unit?.tower,
      property_name: unit?.property_name,
    });
  };

  const selectedPermit = PERMIT_TYPES.find(p => p.value === form.permit_type);
  const isMoving = ['pindah_masuk', 'pindah_keluar'].includes(form.permit_type);
  const isConstruction = ['renovasi_minor', 'renovasi_mayor', 'pembangunan_kavling', 'galian'].includes(form.permit_type);
  const isContractor = form.permit_type === 'akses_kontraktor';

  const steps = ['Jenis Izin', 'Detail', 'Dokumen'];

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
            className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Buat Izin</h1>
            <p className="text-white/50 text-xs">Langkah {step} dari {steps.length}</p>
          </div>
        </div>
        {/* Step indicator */}
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < step ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Step 1: Pilih Jenis Izin */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-bold text-slate-700 mb-4">Pilih Jenis Izin</h2>
            <div className="space-y-3">
              {PERMIT_TYPES.map(pt => {
                const Icon = pt.icon;
                return (
                  <button key={pt.value} onClick={() => { set('permit_type', pt.value); setStep(2); }}
                    className="w-full p-4 rounded-2xl border bg-white/80 flex items-center gap-4 text-left active:scale-[0.98] transition-transform border-slate-200/80 hover:border-slate-300">
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
            </div>
          </motion.div>
        )}

        {/* Step 2: Detail */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            {/* Jenis terpilih */}
            {selectedPermit && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: selectedPermit.bg }}>
                <selectedPermit.icon className="w-5 h-5" style={{ color: selectedPermit.color }} />
                <span className="font-semibold text-sm text-slate-700">{selectedPermit.label}</span>
                <button onClick={() => setStep(1)} className="ml-auto text-xs text-slate-400 underline">Ganti</button>
              </div>
            )}

            {/* Unit */}
            <div className="bg-white/80 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm">A. Informasi Unit</h3>
              <InputField label="Unit" required>
                <select className={selectClass} value={form.unit_id} onChange={e => set('unit_id', e.target.value)}>
                  <option value="">Pilih unit...</option>
                  {approvedUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.unit_number} – {u.property_name}{u.tower ? ` Tower ${u.tower}` : ''}</option>
                  ))}
                </select>
              </InputField>
            </div>

            {/* Jadwal */}
            <div className="bg-white/80 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm">B. Jadwal Kegiatan</h3>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Tanggal Mulai" required>
                  <input type="date" className={inputClass} value={form.activity_date} onChange={e => set('activity_date', e.target.value)} />
                </InputField>
                <InputField label="Tanggal Selesai">
                  <input type="date" className={inputClass} value={form.activity_end_date} onChange={e => set('activity_end_date', e.target.value)} />
                </InputField>
                <InputField label="Jam Mulai">
                  <input type="time" className={inputClass} value={form.activity_time} onChange={e => set('activity_time', e.target.value)} />
                </InputField>
                <InputField label="Jam Selesai">
                  <input type="time" className={inputClass} value={form.activity_end_time} onChange={e => set('activity_end_time', e.target.value)} />
                </InputField>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-white/80 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm">C. Keterangan Kegiatan</h3>
              <InputField label="Deskripsi" required>
                <textarea className={inputClass + ' min-h-[80px] resize-none'} placeholder="Jelaskan kegiatan yang akan dilakukan..."
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </InputField>

              {/* Construction fields */}
              {isConstruction && (
                <>
                  <InputField label="Lingkup Pekerjaan">
                    <textarea className={inputClass + ' min-h-[70px] resize-none'} placeholder="Rincian lingkup pekerjaan..."
                      value={form.work_scope} onChange={e => set('work_scope', e.target.value)} />
                  </InputField>
                  <InputField label="Jenis Pekerjaan">
                    <select className={selectClass} value={form.work_type} onChange={e => set('work_type', e.target.value)}>
                      <option value="">Pilih jenis...</option>
                      <option value="struktural">Struktural</option>
                      <option value="non_struktural">Non-Struktural</option>
                      <option value="mep">MEP (Mekanikal/Elektrikal/Plumbing)</option>
                      <option value="finishing">Finishing</option>
                    </select>
                  </InputField>
                  <InputField label="Area Terdampak">
                    <input type="text" className={inputClass} placeholder="Contoh: Kamar tidur utama, dapur..." value={form.affected_area} onChange={e => set('affected_area', e.target.value)} />
                  </InputField>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.uses_heavy_equipment} onChange={e => set('uses_heavy_equipment', e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm text-slate-600">Alat Berat</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.noise_potential} onChange={e => set('noise_potential', e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm text-slate-600">Berpotensi Bising</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Kontraktor / Pekerja */}
            {(isConstruction || isContractor) && (
              <div className="bg-white/80 rounded-2xl p-4 space-y-4">
                <h3 className="font-bold text-slate-700 text-sm">D. Data Kontraktor</h3>
                <InputField label="Nama Perusahaan Kontraktor">
                  <input type="text" className={inputClass} placeholder="PT. / CV. ..." value={form.contractor_company} onChange={e => set('contractor_company', e.target.value)} />
                </InputField>
                <InputField label="Nama PIC / Mandor">
                  <input type="text" className={inputClass} value={form.visitor_name} onChange={e => set('visitor_name', e.target.value)} />
                </InputField>
                <InputField label="No. HP PIC">
                  <input type="tel" className={inputClass} value={form.visitor_phone} onChange={e => set('visitor_phone', e.target.value)} />
                </InputField>
                <InputField label="Jumlah Pekerja">
                  <input type="number" className={inputClass} placeholder="0" value={form.num_workers} onChange={e => set('num_workers', e.target.value)} />
                </InputField>
              </div>
            )}

            {/* Moving */}
            {isMoving && (
              <div className="bg-white/80 rounded-2xl p-4 space-y-4">
                <h3 className="font-bold text-slate-700 text-sm">D. Data Pindahan</h3>
                <InputField label="Perusahaan Jasa Pindah">
                  <input type="text" className={inputClass} value={form.moving_company} onChange={e => set('moving_company', e.target.value)} />
                </InputField>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Jenis Kendaraan">
                    <input type="text" className={inputClass} placeholder="Pickup / Truk..." value={form.vehicle_type} onChange={e => set('vehicle_type', e.target.value)} />
                  </InputField>
                  <InputField label="No. Plat">
                    <input type="text" className={inputClass} placeholder="B 1234 XX" value={form.vehicle_plate} onChange={e => set('vehicle_plate', e.target.value)} />
                  </InputField>
                </div>
                <InputField label="Nama PIC">
                  <input type="text" className={inputClass} value={form.visitor_name} onChange={e => set('visitor_name', e.target.value)} />
                </InputField>
                <InputField label="No. HP PIC">
                  <input type="tel" className={inputClass} value={form.visitor_phone} onChange={e => set('visitor_phone', e.target.value)} />
                </InputField>
                <InputField label="Jumlah Pekerja">
                  <input type="number" className={inputClass} value={form.num_workers} onChange={e => set('num_workers', e.target.value)} />
                </InputField>
              </div>
            )}

            <Button onClick={() => setStep(3)} disabled={!form.unit_id || !form.description || !form.activity_date}
              className="w-full h-13 text-white rounded-2xl font-semibold text-base py-3"
              style={{ background: 'linear-gradient(135deg, #8A8076, #5a524e)' }}>
              Lanjut ke Dokumen <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Step 3: Dokumen */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="bg-white/80 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm">E. Dokumen Pendukung</h3>
              <p className="text-xs text-slate-500">Upload dokumen pendukung seperti desain, KTP, surat kuasa, dll.</p>

              <label className="block">
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} disabled={uploading} />
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50/50 transition-all">
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Mengupload...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-600">Tap untuk upload dokumen</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF hingga 10MB</p>
                    </>
                  )}
                </div>
              </label>

              {form.document_urls.length > 0 && (
                <div className="space-y-2">
                  {form.document_urls.map((url, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                      <FileText className="w-4 h-4 text-stone-500 flex-shrink-0" />
                      <span className="text-xs text-slate-600 flex-1 truncate">Dokumen {i + 1}</span>
                      <button onClick={() => set('document_urls', form.document_urls.filter((_, j) => j !== i))}>
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white/80 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-700 text-sm">Ringkasan Permohonan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Jenis Izin</span><span className="font-medium text-slate-800">{selectedPermit?.label}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Unit</span><span className="font-medium text-slate-800">{selectedUnit?.unit_number || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Tanggal</span><span className="font-medium text-slate-800">{form.activity_date ? new Date(form.activity_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Dokumen</span><span className="font-medium text-slate-800">{form.document_urls.length} file</span></div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Permohonan akan diproses oleh tim manajemen. Anda akan mendapat notifikasi perkembangan status.</p>
            </div>

            <Button onClick={handleSubmit} disabled={mutation.isPending}
              className="w-full h-13 text-white rounded-2xl font-semibold text-base py-3"
              style={{ background: 'linear-gradient(135deg, #8A8076, #5a524e)' }}>
              {mutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengirim...
                </div>
              ) : (
                <><CheckCircle className="w-5 h-5 mr-2" /> Kirim Permohonan</>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}