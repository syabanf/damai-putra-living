import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, Clock, AlertCircle, XCircle,
  FileText, Calendar, Building2, User, Truck, Wrench,
  ChevronRight, Download, Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const statusConfig = {
  draft: { label: 'Draft', color: '#94a3b8', bg: '#f1f5f9' },
  open: { label: 'Diajukan', color: '#3b82f6', bg: '#eff6ff' },
  under_review: { label: 'Sedang Ditinjau', color: '#f59e0b', bg: '#fffbeb' },
  waiting_approval: { label: 'Menunggu Persetujuan', color: '#f97316', bg: '#fff7ed' },
  in_progress: { label: 'Sedang Berjalan', color: '#8b5cf6', bg: '#f5f3ff' },
  approved: { label: 'Disetujui', color: '#10b981', bg: '#ecfdf5' },
  rejected: { label: 'Ditolak', color: '#ef4444', bg: '#fef2f2' },
  inspection_required: { label: 'Perlu Inspeksi', color: '#f59e0b', bg: '#fffbeb' },
  completed: { label: 'Selesai', color: '#10b981', bg: '#ecfdf5' },
  deposit_returned: { label: 'Deposit Dikembalikan', color: '#10b981', bg: '#ecfdf5' },
  closed: { label: 'Ditutup', color: '#64748b', bg: '#f8fafc' },
};

const workflowStages = [
  { key: 'submitted', label: 'Diajukan' },
  { key: 'document_check', label: 'Cek Dokumen' },
  { key: 'building_infrastructure_review', label: 'Review Infrastruktur' },
  { key: 'after_sales_review', label: 'Review After Sales' },
  { key: 'township_management_review', label: 'Review Manajemen' },
  { key: 'head_approval', label: 'Persetujuan Kepala' },
  { key: 'completed', label: 'Selesai' },
];

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-slate-100/80 last:border-0">
    <span className="text-slate-500 text-sm">{label}</span>
    <span className="text-slate-800 font-medium text-sm text-right max-w-[55%]">{value || '-'}</span>
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white/80 rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
    </div>
    {children}
  </div>
);

export default function TicketDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => base44.entities.Ticket.filter({ id: ticketId }).then(r => r[0]),
    enabled: !!ticketId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
        <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
        <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500">Tiket tidak ditemukan</p>
        <Button onClick={() => navigate(createPageUrl('Tickets'))} className="mt-4" variant="outline">Kembali</Button>
      </div>
    );
  }

  const status = statusConfig[ticket.status] || statusConfig.open;
  const currentStageIndex = workflowStages.findIndex(s => s.key === ticket.workflow_stage);
  const isMoving = ['pindah_masuk', 'pindah_keluar'].includes(ticket.permit_type);
  const isConstruction = ['renovasi_minor', 'renovasi_mayor', 'pembangunan_kavling', 'galian'].includes(ticket.permit_type);

  const permitLabel = {
    izin_kegiatan: 'Izin Kegiatan',
    renovasi_minor: 'Renovasi Minor',
    renovasi_mayor: 'Renovasi Mayor',
    pembangunan_kavling: 'Pembangunan Kavling',
    galian: 'Galian',
    pindah_masuk: 'Pindah Masuk',
    pindah_keluar: 'Pindah Keluar',
    akses_kontraktor: 'Akses Kontraktor',
  }[ticket.permit_type] || ticket.permit_type;

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(createPageUrl('Tickets'))}
            className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Detail Tiket</h1>
            {ticket.reference_number && <p className="text-white/50 text-xs mt-0.5">{ticket.reference_number}</p>}
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Workflow Progress */}
        <Section title="Progress Permohonan">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="space-y-3">
              {workflowStages.map((stage, i) => {
                const isDone = i < currentStageIndex;
                const isCurrent = i === currentStageIndex;
                return (
                  <div key={stage.key} className="flex items-center gap-3 pl-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${isDone ? 'bg-emerald-500' : isCurrent ? 'bg-stone-500' : 'bg-slate-200'}`}>
                      {isDone ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-slate-400'}`} />}
                    </div>
                    <span className={`text-sm ${isDone ? 'text-emerald-700 font-medium' : isCurrent ? 'text-stone-700 font-bold' : 'text-slate-400'}`}>
                      {stage.label}
                    </span>
                    {isCurrent && <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium ml-auto">Saat ini</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Informasi Dasar */}
        <Section title="Informasi Permohonan" icon={FileText}>
          <InfoRow label="Jenis Izin" value={permitLabel} />
          <InfoRow label="Unit" value={ticket.unit_number} />
          <InfoRow label="Properti" value={`${ticket.property_name}${ticket.tower ? ` Tower ${ticket.tower}` : ''}`} />
          <InfoRow label="Tanggal Diajukan" value={new Date(ticket.created_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} />
          <InfoRow label="Keterangan" value={ticket.description} />
        </Section>

        {/* Jadwal */}
        <Section title="Jadwal Kegiatan" icon={Calendar}>
          <InfoRow label="Tanggal Mulai" value={ticket.activity_date ? new Date(ticket.activity_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null} />
          <InfoRow label="Tanggal Selesai" value={ticket.activity_end_date ? new Date(ticket.activity_end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null} />
          <InfoRow label="Jam Mulai" value={ticket.activity_time} />
          <InfoRow label="Jam Selesai" value={ticket.activity_end_time} />
        </Section>

        {/* Construction details */}
        {isConstruction && (ticket.work_scope || ticket.work_type || ticket.affected_area) && (
          <Section title="Detail Pekerjaan" icon={Wrench}>
            <InfoRow label="Lingkup Pekerjaan" value={ticket.work_scope} />
            <InfoRow label="Jenis Pekerjaan" value={ticket.work_type?.replace(/_/g, ' ')} />
            <InfoRow label="Area Terdampak" value={ticket.affected_area} />
            <InfoRow label="Alat Berat" value={ticket.uses_heavy_equipment ? 'Ya' : 'Tidak'} />
            <InfoRow label="Berpotensi Bising" value={ticket.noise_potential ? 'Ya' : 'Tidak'} />
            <InfoRow label="Jumlah Pekerja" value={ticket.num_workers} />
          </Section>
        )}

        {/* Moving details */}
        {isMoving && (ticket.moving_company || ticket.vehicle_type) && (
          <Section title="Detail Pindahan" icon={Truck}>
            <InfoRow label="Perusahaan Pindah" value={ticket.moving_company} />
            <InfoRow label="PIC" value={ticket.visitor_name} />
            <InfoRow label="No. HP" value={ticket.visitor_phone} />
            <InfoRow label="Jenis Kendaraan" value={ticket.vehicle_type} />
            <InfoRow label="No. Plat" value={ticket.vehicle_plate} />
            <InfoRow label="Jumlah Pekerja" value={ticket.num_workers} />
          </Section>
        )}

        {/* Contractor */}
        {ticket.contractor_company && (
          <Section title="Data Kontraktor" icon={User}>
            <InfoRow label="Perusahaan" value={ticket.contractor_company} />
            <InfoRow label="PIC" value={ticket.visitor_name} />
            <InfoRow label="No. HP" value={ticket.visitor_phone} />
            <InfoRow label="Jumlah Pekerja" value={ticket.num_workers} />
          </Section>
        )}

        {/* Deposit */}
        {ticket.deposit_required > 0 && (
          <Section title="Informasi Deposit">
            <InfoRow label="Deposit Wajib" value={`Rp ${ticket.deposit_required?.toLocaleString('id-ID')}`} />
            <InfoRow label="Deposit Dibayar" value={ticket.deposit_paid ? `Rp ${ticket.deposit_paid?.toLocaleString('id-ID')}` : null} />
            <InfoRow label="Tgl. Pembayaran" value={ticket.deposit_payment_date} />
            <InfoRow label="Deposit Dikembalikan" value={ticket.deposit_returned ? `Rp ${ticket.deposit_returned?.toLocaleString('id-ID')}` : null} />
          </Section>
        )}

        {/* Approval info */}
        {ticket.status === 'approved' && (
          <Section title="Informasi Persetujuan">
            <InfoRow label="Disetujui Oleh" value={ticket.approved_by} />
            <InfoRow label="Tgl. Persetujuan" value={ticket.approval_date} />
            <InfoRow label="No. Izin" value={ticket.permit_id} />
            <InfoRow label="Berlaku Dari" value={ticket.valid_from} />
            <InfoRow label="Berlaku Hingga" value={ticket.valid_until} />
          </Section>
        )}

        {/* Rejection */}
        {ticket.status === 'rejected' && ticket.rejection_note && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm mb-1">Alasan Penolakan</p>
              <p className="text-red-600 text-sm">{ticket.rejection_note}</p>
            </div>
          </div>
        )}

        {/* Management notes */}
        {ticket.management_notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700 text-sm mb-1">Catatan Manajemen</p>
              <p className="text-amber-600 text-sm">{ticket.management_notes}</p>
            </div>
          </div>
        )}

        {/* Documents */}
        {ticket.document_urls?.length > 0 && (
          <Section title="Dokumen Terlampir" icon={FileText}>
            <div className="space-y-2">
              {ticket.document_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 hover:bg-stone-100 transition-colors">
                  <FileText className="w-4 h-4 text-stone-500" />
                  <span className="text-sm text-slate-700 flex-1">Dokumen {i + 1}</span>
                  <Eye className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </Section>
        )}

        <Button variant="outline" onClick={() => navigate(createPageUrl('Tickets'))}
          className="w-full h-12 rounded-2xl border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Tiket
        </Button>
      </div>
    </div>
  );
}