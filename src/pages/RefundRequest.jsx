import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, X, FileText, Banknote, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CHECKLIST_ITEMS = [
  { id: 1, label: 'Kwitansi Pembayaran Deposit ASLI', required: true },
  { id: 2, label: 'Surat Permohonan Pencairan Deposit Renovasi ASLI (ttd basah konsumen)', required: true },
  { id: 3, label: 'Copy KTP / ID', required: true },
  { id: 4, label: 'Copy Buku Tabungan', required: true },
  { id: 5, label: 'Berita Acara ASLI - signed by konsumen & Div. Head TM (*termasuk jika ada pemotongan untuk IPL/denda)', required: true },
  { id: 6, label: 'Foto pekerjaan sebelum renovasi dalam bentuk geotag', required: true },
  { id: 7, label: 'Foto pekerjaan sesudah renovasi dalam bentuk geotag', required: true },
  { id: 8, label: 'Surat Kuasa ASLI + Copy KTP Pemberi & penerima kuasa (apabila penerima berbeda dengan nama konsumen)', required: false },
  { id: 9, label: 'Copy Perjanjian Sewa (untuk Refund DP sewa)', required: false },
  { id: 10, label: 'Print out Kartu Kavling - system BITS (tidak ada outs IPL/Sewa)', required: true },
];

export default function RefundRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({}); // { itemId: { name, url } }

  const [formData, setFormData] = useState({
    applicant_name: '',
    ktp_number: '',
    phone_number: '',
    cluster_name: '',
    block_number: '',
    unit_number: '',
    refund_type: 'Renovation Deposit',
    refund_reason: '',
    original_deposit_amount: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_holder_name: '',
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFormData(prev => ({ ...prev, applicant_name: u.full_name || '' }));
    }).catch(() => {});
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const refReq = await base44.entities.DepositRefundRequest.create(data);
      // Create checklist entries
      const checklistPromises = CHECKLIST_ITEMS.map(item =>
        base44.entities.RefundDocumentChecklist.create({
          refund_request_id: refReq.id,
          checklist_item_code: `DOC-${String(item.id).padStart(2, '0')}`,
          checklist_item_name: item.label,
          is_required: item.required,
          is_uploaded: !!uploadedFiles[item.id],
          uploaded_file: uploadedFiles[item.id]?.url || '',
        })
      );
      await Promise.all(checklistPromises);
      // Activity log
      await base44.entities.RefundActivityLog.create({
        refund_request_id: refReq.id,
        activity_type: 'Submitted',
        activity_description: 'Refund request submitted by applicant',
        performed_by: user?.full_name || user?.email,
        performed_at: new Date().toISOString(),
      });
      return refReq;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] });
      navigate(createPageUrl('Tickets'));
    },
  });

  const handleFileUpload = async (itemId, file) => {
    if (!file) return;
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFiles(prev => ({ ...prev, [itemId]: { name: file.name, url: file_url } }));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const reqNumber = `RFD/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`;
    await createMutation.mutateAsync({
      ...formData,
      refund_request_number: reqNumber,
      request_date: new Date().toISOString().split('T')[0],
      refund_status: 'Submitted',
      user_email: user?.email,
      original_deposit_amount: Number(formData.original_deposit_amount) || 0,
    });
    setLoading(false);
  };

  const canProceedStep1 = formData.applicant_name && formData.unit_number && formData.phone_number;
  const canProceedStep2 = CHECKLIST_ITEMS.filter(i => i.required).every(i => uploadedFiles[i.id]);
  const canProceedStep3 = formData.bank_name && formData.bank_account_number && formData.bank_account_holder_name;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#F5F4F2' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">Refund Deposit</h1>
            <p className="text-xs text-white/50">Langkah {step} dari 3</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 h-1 rounded-full transition-all duration-500"
              style={{ backgroundColor: s <= step ? '#fff' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Applicant + Unit Info */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #1a5068, #0F3D4C)' }}>
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Data Pemohon</h2>
                <p className="text-xs text-slate-500">Isi data diri dan unit Anda</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'applicant_name', label: 'Nama Pemohon', placeholder: 'Nama lengkap sesuai KTP' },
                  { key: 'ktp_number', label: 'Nomor KTP', placeholder: '16 digit NIK' },
                  { key: 'phone_number', label: 'Nomor HP', placeholder: '08xx-xxxx-xxxx' },
                  { key: 'cluster_name', label: 'Cluster', placeholder: 'Nama cluster' },
                  { key: 'block_number', label: 'Nomor Blok', placeholder: 'e.g. A, B, C' },
                  { key: 'unit_number', label: 'Nomor Unit', placeholder: 'e.g. A-15' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-slate-700 font-medium text-sm">{label}</Label>
                    <Input placeholder={placeholder} value={formData[key]}
                      onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                      className="h-12 rounded-xl" />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-medium text-sm">Jenis Refund</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Renovation Deposit', 'Rental Deposit', 'Other'].map(type => (
                      <button key={type} type="button"
                        onClick={() => setFormData(p => ({ ...p, refund_type: type }))}
                        className={`p-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${formData.refund_type === type ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-medium text-sm">Jumlah Deposit Awal (IDR)</Label>
                  <Input type="number" placeholder="e.g. 5000000" value={formData.original_deposit_amount}
                    onChange={e => setFormData(p => ({ ...p, original_deposit_amount: e.target.value }))}
                    className="h-12 rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-medium text-sm">Alasan Refund</Label>
                  <textarea placeholder="Jelaskan alasan pengajuan refund..." value={formData.refund_reason}
                    onChange={e => setFormData(p => ({ ...p, refund_reason: e.target.value }))}
                    className="w-full h-24 px-3 py-2.5 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Document Checklist */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #1a5068, #0F3D4C)' }}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Checklist Dokumen</h2>
                <p className="text-xs text-slate-500">Upload dokumen sesuai checklist</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs">Dokumen bertanda <span className="font-bold text-red-600">*</span> wajib diupload. Dokumen lainnya opsional.</p>
              </div>

              <div className="space-y-3">
                {CHECKLIST_ITEMS.map(item => {
                  const uploaded = uploadedFiles[item.id];
                  return (
                    <div key={item.id} className={`rounded-xl border p-3 ${uploaded ? 'border-emerald-200 bg-emerald-50/60' : item.required ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-white/60'}`}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.id}</span>
                        <p className="text-xs font-medium text-slate-700 flex-1 leading-relaxed">
                          {item.label}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        {uploaded && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                      </div>
                      {uploaded ? (
                        <div className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5 border border-emerald-100">
                          <span className="text-xs text-emerald-700 truncate flex-1">{uploaded.name}</span>
                          <button onClick={() => setUploadedFiles(p => { const n = { ...p }; delete n[item.id]; return n; })}
                            className="ml-2 text-slate-400 hover:text-red-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-100 transition-colors">
                            <Upload className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-500">Upload file PDF/JPG/PNG</span>
                          </div>
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e => handleFileUpload(item.id, e.target.files[0])} />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              {!canProceedStep2 && (
                <p className="text-xs text-red-500 text-center">Harap upload semua dokumen wajib (*) untuk melanjutkan</p>
              )}
            </motion.div>
          )}

          {/* Step 3: Bank Details */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #1a5068, #0F3D4C)' }}>
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Rekening Tujuan</h2>
                <p className="text-xs text-slate-500">Data rekening untuk pengembalian dana</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'bank_name', label: 'Nama Bank', placeholder: 'BCA, Mandiri, BRI, dst.' },
                  { key: 'bank_account_number', label: 'Nomor Rekening', placeholder: '1234567890' },
                  { key: 'bank_account_holder_name', label: 'Nama Pemilik Rekening', placeholder: 'Sesuai buku tabungan' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-slate-700 font-medium text-sm">{label}</Label>
                    <Input placeholder={placeholder} value={formData[key]}
                      onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                      className="h-12 rounded-xl" />
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 space-y-2">
                <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-2">Ringkasan Pengajuan</p>
                {[
                  ['Pemohon', formData.applicant_name],
                  ['Unit', `${formData.cluster_name} ${formData.block_number} ${formData.unit_number}`.trim()],
                  ['Jenis Refund', formData.refund_type],
                  ['Deposit', formData.original_deposit_amount ? `IDR ${Number(formData.original_deposit_amount).toLocaleString('id-ID')}` : '-'],
                  ['Dokumen Terupload', `${Object.keys(uploadedFiles).length} / ${CHECKLIST_ITEMS.length}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs">
                    <span className="text-teal-600">{l}</span>
                    <span className="font-semibold text-teal-800">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 px-5 py-3 bg-white/90 border-t border-black/[0.05]">
        <Button
          onClick={() => {
            if (step < 3) setStep(s => s + 1);
            else handleSubmit();
          }}
          disabled={loading || (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2) || (step === 3 && !canProceedStep3)}
          className="w-full h-[52px] text-white rounded-2xl font-semibold text-base"
          style={{ background: 'linear-gradient(135deg, #1FB6D5, #169ab5)', boxShadow: '0 6px 20px rgba(31,182,213,0.3)' }}>
          {loading ? 'Memproses...' : step === 3 ? 'Kirim Pengajuan' : 'Lanjutkan'}
        </Button>
      </div>
    </div>
  );
}