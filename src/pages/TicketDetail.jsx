import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileCheck, Clock, CheckCircle, XCircle, Download,
  QrCode, Calendar, User, Phone, FileText, AlertCircle,
  Building2, Truck, Users, Shield, HardHat, Package,
  PartyPopper, CheckCircle2, ChevronRight, Stamp, Hash,
  CreditCard, Wrench, MapPin, Hammer, ZapOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import StatusBadge from '@/components/ui/StatusBadge';

// ── Config ─────────────────────────────────────────────────────
const PERMIT_CONFIG = {
  izin_kegiatan:       { icon: PartyPopper, label: 'Izin Kegiatan',             code: 'IZIN-05', color: '#db2777' },
  renovasi_minor:      { icon: HardHat,     label: 'Izin Renovasi Minor',       code: 'IZIN-03', color: '#d97706' },
  renovasi_mayor:      { icon: HardHat,     label: 'Izin Renovasi Mayor',       code: 'IZIN-04', color: '#d97706' },
  pembangunan_kavling: { icon: HardHat,     label: 'Izin Pembangunan Kavling',  code: 'IZIN-02', color: '#7c3aed' },
  galian:              { icon: HardHat,     label: 'Izin Galian',               code: 'IZIN-19', color: '#0284c7' },
  pindah_masuk:        { icon: Package,     label: 'Izin Pindah Masuk',         code: 'IZIN-15', color: '#059669' },
  pindah_keluar:       { icon: Truck,       label: 'Izin Pindah Keluar',        code: 'IZIN-16', color: '#0284c7' },
  pencairan_deposit:   { icon: CreditCard,  label: 'Pencairan Deposit',         code: 'IZIN-11', color: '#8A8076' },
  akses_kontraktor:    { icon: Users,       label: 'Akses Kontraktor / Vendor', code: 'IZIN-15', color: '#059669' },
  // legacy
  renovation:          { icon: HardHat,     label: 'Renovation / Fit-Out',      code: 'IZIN-03', color: '#d97706' },
  moving_in:           { icon: Package,     label: 'Move-In Permit',            code: 'IZIN-15', color: '#059669' },
  moving_out:          { icon: Truck,       label: 'Move-Out Permit',           code: 'IZIN-16', color: '#0284c7' },
  event:               { icon: PartyPopper, label: 'Event / Gathering',         code: 'IZIN-05', color: '#db2777' },
  contractor_access:   { icon: Users,       label: 'Contractor Access',         code: 'IZIN-15', color: '#059669' },
};

const WORKFLOW_STAGES = [
  { id: 'submitted',                   label: 'Submitted',                    desc: 'Permohonan diterima sistem'                    },
  { id: 'document_check',              label: 'Document Check',               desc: 'Verifikasi kelengkapan dokumen'                 },
  { id: 'building_infrastructure_review', label: 'Building & Infrastructure', desc: 'Review oleh Tim Bangunan & Infrastruktur'       },
  { id: 'after_sales_review',          label: 'After Sales Review',           desc: 'Review oleh Tim After Sales'                   },
  { id: 'township_management_review',  label: 'Township Management',          desc: 'Review oleh Township Management'               },
  { id: 'head_approval',               label: 'Head of Township (Final)',      desc: 'Persetujuan akhir Kepala Township Management' },
  { id: 'completed',                   label: 'Completed',                    desc: 'Izin diterbitkan / ditutup'                   },
];

// ── Sub-components ─────────────────────────────────────────────
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="px-4 py-3 border-b border-white/60" style={{ backgroundColor: 'rgba(245,243,241,0.6)' }}>
    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A8076' }}>{children}</p>
  </div>
);

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f3f1' }}>
        <Icon className="w-4 h-4" style={{ color: '#8A8076' }} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{children}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function TicketDetail() {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const urlParams     = new URLSearchParams(window.location.search);
  const ticketId      = urlParams.get('id');
  const [showQR, setShowQR]         = useState(false);
  const [adminNote, setAdminNote]   = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const tickets = await base44.entities.Ticket.filter({ id: ticketId });
      return tickets[0];
    },
    enabled: !!ticketId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ status, note, stage }) => {
      const updates = { status };
      if (stage) updates.workflow_stage = stage;
      if (note)  updates.rejection_note = note;
      if (status === 'approved') {
        updates.permit_id      = `DP-${Date.now().toString(36).toUpperCase()}`;
        updates.valid_from     = ticket.activity_date     || new Date().toISOString().split('T')[0];
        updates.valid_until    = ticket.activity_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        updates.qr_code        = `PERMIT-${updates.permit_id}`;
        updates.approved_by    = 'Head of Township Management';
        updates.approval_date  = new Date().toISOString();
        updates.workflow_stage = 'completed';
      }
      if (status === 'rejected') updates.workflow_stage = 'completed';
      return base44.entities.Ticket.update(ticketId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-[3px] rounded-full" style={{ borderColor: '#8A8076', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!ticket) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">Permohonan tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate(createPageUrl('Tickets'))} className="mt-4">Kembali</Button>
      </div>
    </div>
  );

  const typeConfig       = PERMIT_CONFIG[ticket.permit_type] || { icon: FileCheck, label: ticket.category, code: '—', color: '#8A8076' };
  const Icon             = typeConfig.icon;
  const isPermit         = ticket.category === 'permit';
  const currentStageIdx  = WORKFLOW_STAGES.findIndex(s => s.id === (ticket.workflow_stage || 'submitted'));

  const headerGradient = ticket.status === 'approved'    ? 'linear-gradient(135deg, #059669, #047857)'
    : ticket.status === 'rejected'    ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
    : ticket.status === 'in_progress' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    : 'linear-gradient(135deg, #8A8076, #5a524e)';

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-16 rounded-b-3xl" style={{ background: headerGradient }}>
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-white">
              {isPermit ? 'Permohonan Izin' : ticket.category === 'complaint' ? 'Pengaduan' : 'Permintaan Layanan'}
            </h1>
            {ticket.reference_number && <p className="text-white/55 text-xs font-mono mt-0.5">{ticket.reference_number}</p>}
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 flex items-center gap-1">
            <Shield className="w-3 h-3 text-white/80" />
            <span className="text-white/80 text-xs font-medium">Official</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold text-white">{typeConfig.label}</h2>
              {typeConfig.code && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white/80">{typeConfig.code}</span>}
            </div>
            <p className="text-white/65 text-sm">Unit {ticket.unit_number}{ticket.tower ? ` · Tower ${ticket.tower}` : ''}</p>
            <p className="text-white/45 text-xs mt-0.5">{ticket.property_name}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">

        {/* ── Status & Reference ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard>
            <div className="p-4 border-b border-white/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status Permohonan</p>
                  <p className="font-bold text-slate-800 capitalize">{ticket.status?.replace(/_/g, ' ')}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
            </div>
            <div className="p-4 flex items-center justify-between bg-white/30">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Nomor Referensi</p>
                  <p className="font-mono text-sm font-semibold text-slate-700">{ticket.reference_number || '—'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Disubmit</p>
                <p className="text-xs font-medium text-slate-600">
                  {new Date(ticket.created_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            {ticket.status === 'rejected' && ticket.rejection_note && (
              <div className="p-4 bg-red-50/80 border-t border-red-100/60">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Alasan Penolakan</p>
                    <p className="text-sm text-red-700">{ticket.rejection_note}</p>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* ── Digital Permit Card ── */}
        {ticket.status === 'approved' && ticket.permit_id && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #1e1b18 0%, #2d2926 100%)' }}>
              <div className="px-5 pt-5 pb-4 border-b border-white/10">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Damai Putra Group</p>
                    <h3 className="text-white font-bold text-base mt-0.5">Digital Permit</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Stamp className="w-5 h-5" style={{ color: '#c8be94' }} />
                  </div>
                </div>
                <p className="text-white/40 text-xs font-mono">{ticket.permit_id}</p>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Jenis Izin</p>
                    <p className="text-white font-semibold text-sm mt-0.5">{typeConfig.label}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Unit</p>
                    <p className="text-white font-semibold text-sm mt-0.5">{ticket.unit_number}{ticket.tower ? ` / Twr ${ticket.tower}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Berlaku Dari</p>
                    <p className="text-white font-semibold text-sm mt-0.5">
                      {ticket.valid_from && new Date(ticket.valid_from + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Berlaku S/D</p>
                    <p className="text-white font-semibold text-sm mt-0.5">
                      {ticket.valid_until && new Date(ticket.valid_until + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {ticket.approved_by && (
                    <div className="col-span-2">
                      <p className="text-white/40 text-xs uppercase tracking-wider">Disetujui Oleh</p>
                      <p className="text-white font-semibold text-sm mt-0.5">{ticket.approved_by}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-300 text-xs font-semibold">DISETUJUI & AKTIF</p>
                    {ticket.approval_date && (
                      <p className="text-emerald-400/70 text-xs">
                        {new Date(ticket.approval_date).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-3">
                <Button onClick={() => setShowQR(true)} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm h-10">
                  <QrCode className="w-4 h-4 mr-2" /> Tampilkan QR
                </Button>
                <Button className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm h-10">
                  <Download className="w-4 h-4 mr-2" /> Simpan PDF
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Approval Workflow ── */}
        {isPermit && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard>
              <SectionTitle>Alur Persetujuan (4 Level)</SectionTitle>
              <div className="p-4 space-y-0">
                {WORKFLOW_STAGES.map((stage, index) => {
                  const isCompleted = index < currentStageIdx || ticket.status === 'approved';
                  const isCurrent   = index === currentStageIdx && ticket.status !== 'approved' && ticket.status !== 'rejected';
                  const isRejected  = ticket.status === 'rejected' && index === currentStageIdx;
                  return (
                    <div key={stage.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          isRejected  ? 'border-red-400 bg-red-50'        :
                          isCompleted ? 'border-emerald-400 bg-emerald-50' :
                          isCurrent   ? 'border-stone-400 bg-stone-50'    : 'border-slate-200 bg-white/60'
                        }`}>
                          {isRejected  ? <XCircle   className="w-3.5 h-3.5 text-red-500"     /> :
                           isCompleted ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> :
                           isCurrent   ? <Clock      className="w-3.5 h-3.5" style={{ color: '#8A8076' }} /> :
                           <div className="w-2 h-2 rounded-full bg-slate-200" />}
                        </div>
                        {index < WORKFLOW_STAGES.length - 1 && (
                          <div className={`w-0.5 h-8 mt-1 mb-1 ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                        )}
                      </div>
                      <div className="pb-4 pt-1">
                        <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>{stage.label}</p>
                        <p className="text-xs text-slate-400">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Activity Schedule ── */}
        {(ticket.activity_date || ticket.activity_time) && (
          <GlassCard>
            <SectionTitle>Jadwal Kegiatan</SectionTitle>
            <div className="p-4 space-y-3">
              {ticket.activity_date && (
                <InfoRow icon={Calendar} label="Tanggal">
                  {new Date(ticket.activity_date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {ticket.activity_end_date && ticket.activity_end_date !== ticket.activity_date && (
                    <span className="text-slate-400"> – {new Date(ticket.activity_end_date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  )}
                </InfoRow>
              )}
              {ticket.activity_time && (
                <InfoRow icon={Clock} label="Jam">{ticket.activity_time}{ticket.activity_end_time ? ` – ${ticket.activity_end_time}` : ''}</InfoRow>
              )}
              {ticket.num_workers && (
                <InfoRow icon={Users} label="Jml. Pekerja / Tamu">{ticket.num_workers} orang</InfoRow>
              )}
            </div>
          </GlassCard>
        )}

        {/* ── Applicant Info ── */}
        {(ticket.user_name || ticket.user_email) && (
          <GlassCard>
            <SectionTitle>Data Pemohon</SectionTitle>
            <div className="p-4 space-y-3">
              {ticket.user_name && <InfoRow icon={User} label="Nama">{ticket.user_name}</InfoRow>}
              {ticket.user_email && <InfoRow icon={FileText} label="Email">{ticket.user_email}</InfoRow>}
            </div>
          </GlassCard>
        )}

        {/* ── Description ── */}
        {ticket.description && (
          <GlassCard>
            <SectionTitle>Deskripsi / Tujuan</SectionTitle>
            <div className="p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
            </div>
          </GlassCard>
        )}

        {/* ── Work Scope ── */}
        {ticket.work_scope && (
          <GlassCard>
            <SectionTitle>Ruang Lingkup Pekerjaan</SectionTitle>
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.work_scope}</p>
              {ticket.work_type && <InfoRow icon={Hammer} label="Jenis Pekerjaan">{ticket.work_type.replace(/_/g, ' ')}</InfoRow>}
              {ticket.affected_area && <InfoRow icon={MapPin} label="Area Terdampak">{ticket.affected_area}</InfoRow>}
              {ticket.uses_heavy_equipment && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  <ZapOff className="w-4 h-4 flex-shrink-0" /> Menggunakan Alat Berat
                </div>
              )}
              {ticket.noise_potential && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> Berpotensi Menimbulkan Kebisingan
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* ── Contractor / Visitor ── */}
        {ticket.visitor_name && (
          <GlassCard>
            <SectionTitle>{ticket.contractor_company ? 'Data Kontraktor / Vendor' : 'Data Perwakilan'}</SectionTitle>
            <div className="p-4 space-y-3">
              {ticket.contractor_company && <InfoRow icon={Building2} label="Perusahaan">{ticket.contractor_company}</InfoRow>}
              <InfoRow icon={User} label="Nama">{ticket.visitor_name}</InfoRow>
              {ticket.visitor_phone && <InfoRow icon={Phone} label="Telepon">{ticket.visitor_phone}</InfoRow>}
              {ticket.visitor_id && <InfoRow icon={FileText} label="No. KTP">{ticket.visitor_id}</InfoRow>}
            </div>
          </GlassCard>
        )}

        {/* ── Moving / Vehicle ── */}
        {(ticket.vehicle_type || ticket.vehicle_plate || ticket.moving_company) && (
          <GlassCard>
            <SectionTitle>Informasi Kendaraan & Pindahan</SectionTitle>
            <div className="p-4 space-y-3">
              {ticket.vehicle_type  && <InfoRow icon={Truck}     label="Jenis Kendaraan">{ticket.vehicle_type}</InfoRow>}
              {ticket.vehicle_plate && <InfoRow icon={Hash}      label="Plat Nomor">{ticket.vehicle_plate}</InfoRow>}
              {ticket.moving_company && <InfoRow icon={Building2} label="Jasa Pindahan">{ticket.moving_company}</InfoRow>}
            </div>
          </GlassCard>
        )}

        {/* ── Deposit Info ── */}
        {(ticket.deposit_required || ticket.deposit_paid) && (
          <GlassCard>
            <SectionTitle>Informasi Deposit</SectionTitle>
            <div className="p-4 space-y-3">
              {ticket.deposit_required && <InfoRow icon={CreditCard} label="Deposit Diperlukan">Rp {Number(ticket.deposit_required).toLocaleString('id-ID')}</InfoRow>}
              {ticket.deposit_paid     && <InfoRow icon={CheckCircle2} label="Deposit Dibayar">Rp {Number(ticket.deposit_paid).toLocaleString('id-ID')}</InfoRow>}
              {ticket.deposit_payment_date && <InfoRow icon={Calendar} label="Tgl. Pembayaran">{new Date(ticket.deposit_payment_date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</InfoRow>}
              {ticket.deposit_returned && <InfoRow icon={CreditCard} label="Deposit Dikembalikan">Rp {Number(ticket.deposit_returned).toLocaleString('id-ID')}</InfoRow>}
            </div>
          </GlassCard>
        )}

        {/* ── Inspection ── */}
        {ticket.inspection_date && (
          <GlassCard>
            <SectionTitle>Hasil Pemeriksaan (Berita Acara)</SectionTitle>
            <div className="p-4 space-y-3">
              <InfoRow icon={Calendar} label="Tanggal Pemeriksaan">{new Date(ticket.inspection_date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</InfoRow>
              {ticket.inspection_result && (
                <InfoRow icon={CheckCircle} label="Hasil">
                  <span className={`font-semibold ${ticket.inspection_result === 'pass' ? 'text-emerald-600' : ticket.inspection_result === 'fail' ? 'text-red-600' : 'text-amber-600'}`}>
                    {ticket.inspection_result === 'pass' ? 'Lulus' : ticket.inspection_result === 'fail' ? 'Tidak Lulus' : 'Sebagian'}
                  </span>
                </InfoRow>
              )}
              {ticket.damage_found && (
                <>
                  <InfoRow icon={AlertCircle} label="Kerusakan">{ticket.damage_description || 'Ditemukan kerusakan'}</InfoRow>
                  {ticket.repair_cost && <InfoRow icon={CreditCard} label="Biaya Perbaikan">Rp {Number(ticket.repair_cost).toLocaleString('id-ID')}</InfoRow>}
                </>
              )}
            </div>
          </GlassCard>
        )}

        {/* ── Documents ── */}
        {ticket.document_urls?.length > 0 && (
          <GlassCard>
            <SectionTitle>Dokumen ({ticket.document_urls.length})</SectionTitle>
            <div className="p-4 space-y-2">
              {ticket.document_urls.map((url, index) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white/50 border border-white/80 rounded-xl hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#8A8076' }} />
                    <span className="text-sm text-slate-700">Dokumen {index + 1}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </GlassCard>
        )}

        {/* ── Management Console (Admin) ── */}
        <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/90 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider">🔧 Management Console (Demo)</p>
          </div>
          <div className="p-4 space-y-4">
            {/* Stage selector */}
            <div className="space-y-2">
              <p className="text-slate-400 text-xs font-medium">Update Workflow Stage</p>
              <div className="grid grid-cols-2 gap-2">
                {['document_check', 'building_infrastructure_review', 'after_sales_review', 'head_approval'].map(stage => (
                  <button key={stage}
                    onClick={() => updateMutation.mutate({ status: ticket.status === 'open' ? 'in_progress' : ticket.status, stage })}
                    className={`text-xs py-2 px-3 rounded-lg border transition-all text-left ${ticket.workflow_stage === stage ? 'border-stone-400 bg-stone-400/20 text-stone-300' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                    {stage.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin note */}
            <div className="space-y-1.5">
              <p className="text-slate-400 text-xs font-medium">Catatan (untuk penolakan)</p>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Alasan penolakan / catatan internal..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl text-slate-300 text-xs p-3 resize-none min-h-[70px] placeholder:text-slate-500" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateMutation.mutate({ status: 'approved', stage: 'completed' })}
                className="flex-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 h-9 text-xs">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Setuju
              </Button>
              <Button size="sm" onClick={() => updateMutation.mutate({ status: 'rejected', note: adminNote || 'Permohonan tidak memenuhi ketentuan properti.', stage: 'completed' })}
                className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 h-9 text-xs">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Tolak
              </Button>
              <Button size="sm" onClick={() => updateMutation.mutate({ status: 'open', stage: 'submitted' })}
                className="flex-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 h-9 text-xs">
                Reset
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* ── QR Modal ── */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => setShowQR(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl border border-white/80"
            style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-2 mb-5">
              <Shield className="w-4 h-4" style={{ color: '#8A8076' }} />
              <p className="font-bold text-slate-800 text-sm">Digital Permit QR</p>
            </div>
            <div className="w-52 h-52 bg-white border-4 border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 p-3">
              <div className="w-full h-full grid grid-cols-8 gap-0.5">
                {Array(64).fill(0).map((_, i) => {
                  const corners = [0,1,2,3,4,5,6,8,14,16,22,24,30,40,41,42,43,44,45,46,48,54,56,57,58,59,60,61,62,63];
                  return <div key={i} className={`rounded-sm ${corners.includes(i) || (i * 7 + 13) % 3 === 0 ? 'bg-slate-800' : 'bg-transparent'}`} />;
                })}
              </div>
            </div>
            <p className="font-mono text-sm font-bold text-slate-800 mb-1">{ticket.permit_id}</p>
            <p className="text-slate-400 text-xs mb-2">
              Berlaku: {ticket.valid_from && new Date(ticket.valid_from + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} – {ticket.valid_until && new Date(ticket.valid_until + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            <div className="flex items-center justify-center gap-1 mb-5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mx-auto w-fit">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-700 text-xs font-medium">Terverifikasi & Aktif</span>
            </div>
            <p className="text-slate-400 text-xs mb-4">Tunjukkan kepada petugas keamanan / manajemen</p>
            <Button onClick={() => setShowQR(false)} className="w-full text-white" style={{ backgroundColor: '#8A8076' }}>Tutup</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}