import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePullToRefresh } from '@/components/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileCheck, Wrench, Truck, Calendar, Users, Lock,
  ChevronRight, ClipboardList, Building2, Shovel, Banknote
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const PERMIT_ICONS = {
  izin_kegiatan: Calendar,
  renovasi_minor: Wrench,
  renovasi_mayor: Wrench,
  pembangunan_kavling: Building2,
  galian: Shovel,
  pindah_masuk: Truck,
  pindah_keluar: Truck,
  pencairan_deposit: Banknote,
  akses_kontraktor: Users,
};

const PERMIT_LABELS = {
  izin_kegiatan: 'Izin Kegiatan',
  renovasi_minor: 'Renovasi Minor',
  renovasi_mayor: 'Renovasi Mayor',
  pembangunan_kavling: 'Pembangunan Kavling',
  galian: 'Izin Galian',
  pindah_masuk: 'Pindah Masuk',
  pindah_keluar: 'Pindah Keluar',
  pencairan_deposit: 'Pencairan Deposit',
  akses_kontraktor: 'Akses Kontraktor',
};

const STATUS_STYLE = {
  draft:              { label: 'Draft',             bg: '#f1f5f9', color: '#64748b' },
  open:               { label: 'Submitted',          bg: '#eff6ff', color: '#3b82f6' },
  under_review:       { label: 'Under Review',       bg: '#fffbeb', color: '#d97706' },
  waiting_approval:   { label: 'Waiting Approval',   bg: '#fff7ed', color: '#ea580c' },
  in_progress:        { label: 'In Progress',        bg: '#f5f3ff', color: '#7c3aed' },
  approved:           { label: 'Approved',           bg: '#ecfdf5', color: '#059669' },
  rejected:           { label: 'Rejected',           bg: '#fef2f2', color: '#dc2626' },
  inspection_required:{ label: 'Inspection',         bg: '#fffbeb', color: '#d97706' },
  completed:          { label: 'Completed',          bg: '#ecfdf5', color: '#059669' },
  deposit_returned:   { label: 'Deposit Returned',   bg: '#ecfdf5', color: '#059669' },
  closed:             { label: 'Closed',             bg: '#f8fafc', color: '#94a3b8' },
};

const GlassCard = ({ children, className = '', onClick }) => (
  <div onClick={onClick}
    className={`rounded-2xl ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)' }}>
    {children}
  </div>
);

const TicketCard = ({ ticket, onClick }) => {
  const Icon = PERMIT_ICONS[ticket.permit_type] || FileCheck;
  const st = STATUS_STYLE[ticket.status] || STATUS_STYLE.open;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="rounded-3xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(15,61,76,0.08)', border: '1px solid rgba(15,61,76,0.06)' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0f4f6' }}>
          <Icon className="w-5 h-5" style={{ color: '#0F3D4C' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm capitalize">
            {PERMIT_LABELS[ticket.permit_type] || ticket.permit_type?.replace(/_/g, ' ') || 'Permit'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#7a8fa0' }}>
            Unit {ticket.unit_number || '–'} · {new Date(ticket.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          {ticket.reference_number && (
            <p className="text-xs mt-0.5" style={{ color: '#9baab8' }}>{ticket.reference_number}</p>
          )}
          {ticket.activity_date && (
            <p className="text-xs mt-0.5" style={{ color: '#9baab8' }}>
              Scheduled: {new Date(ticket.activity_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: st.bg, color: st.color }}>{st.label}</span>
          <ChevronRight className="w-4 h-4" style={{ color: '#c8d4db' }} />
        </div>
      </div>
      {ticket.status === 'approved' && ticket.permit_id && (
        <div className="mt-3 pt-3 border-t flex items-center gap-1.5" style={{ borderColor: '#e8f5f0' }}>
          <FileCheck className="w-3.5 h-3.5" style={{ color: '#059669' }} />
          <span className="text-xs font-semibold" style={{ color: '#059669' }}>Permit No. {ticket.permit_id}</span>
        </div>
      )}
    </motion.div>
  );
};

const TABS = [
  { key: 'all',         label: 'All' },
  { key: 'open',        label: 'Submitted' },
  { key: 'in_progress', label: 'Progress' },
  { key: 'approved',    label: 'Approved' },
  { key: 'closed',      label: 'Closed' },
];

export default function Tickets() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const { isRefreshing, containerRef } = usePullToRefresh(() =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ['tickets'] }),
      qc.invalidateQueries({ queryKey: ['units'] }),
    ])
  );

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-created_date'),
  });

  const hasApprovedUnit = units.some(u => u.status === 'approved');

  const ALLOWED_TYPES = ['renovasi_mayor', 'renovasi_minor', 'pencairan_deposit'];

  const filtered = tickets.filter(t => {
    if (!ALLOWED_TYPES.includes(t.permit_type)) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return ['open', 'under_review', 'waiting_approval'].includes(t.status);
    if (activeTab === 'in_progress') return ['in_progress', 'inspection_required'].includes(t.status);
    if (activeTab === 'approved') return t.status === 'approved';
    if (activeTab === 'closed') return ['closed', 'rejected', 'completed', 'deposit_returned'].includes(t.status);
    return true;
  });

  if (!hasApprovedUnit) {
    return (
      <div ref={containerRef} className="min-h-screen pb-40 overflow-y-auto" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
        <PullToRefreshIndicator isRefreshing={isRefreshing} />
        <div className="px-5 pt-14 pb-6 rounded-b-[2rem] relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white pointer-events-none" />
          <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Damai Putra Living</p>
          <h1 className="text-2xl font-bold text-white">Digital Permits</h1>
          <p className="text-white/50 text-sm mt-1">Permit & activity management</p>
        </div>
        <div className="px-5 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Lock className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Unit Required</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                You need an approved unit to create digital permit applications.
              </p>
              <Button onClick={() => navigate(createPageUrl('MyUnit'))}
                className="text-white rounded-xl h-12 px-6"
                style={{ background: 'linear-gradient(135deg, #1a5068, #0F3D4C)' }}>
                Register Your Unit
              </Button>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen pb-40 overflow-y-auto" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      <PullToRefreshIndicator isRefreshing={isRefreshing} />
      <div className="px-5 pt-14 pb-6 rounded-b-[2.5rem] relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #1e6080 0%, #0F3D4C 55%, #092a38 100%)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-[0.07] bg-white pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-[0.05] bg-white pointer-events-none" />
        <div className="flex justify-between items-start mb-5 relative">
          <div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Damai Putra Living</p>
            <h1 className="text-[26px] font-bold text-white leading-tight">Digital Permits</h1>
            <p className="text-white/45 text-sm mt-0.5">Permit & activity management</p>
          </div>
          <button onClick={() => navigate(createPageUrl('CreateTicket'))}
            className="h-10 px-4 text-white rounded-2xl text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-90 mt-1"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto hide-scrollbar" style={{ background: 'rgba(0,0,0,0.18)' }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeTab === tab.key ? 'shadow-sm' : 'text-white/55 hover:text-white/80'}`}
              style={activeTab === tab.key ? { background: '#ffffff', color: '#0F3D4C' } : {}}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/50 rounded-2xl p-5 animate-pulse h-20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-3xl p-8 text-center" style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(15,61,76,0.08)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#f0f4f6' }}>
                <ClipboardList className="w-8 h-8" style={{ color: '#9baab8' }} />
              </div>
              <p className="font-bold text-slate-700">No permits found</p>
              <p className="text-slate-400 text-sm mt-1">
                {activeTab === 'all' ? 'Submit your first permit application' : `No ${TABS.find(t=>t.key===activeTab)?.label} permits`}
              </p>
              {activeTab === 'all' && (
                <Button onClick={() => navigate(createPageUrl('CreateTicket'))}
                  className="mt-5 text-white rounded-2xl h-11 px-6" style={{ background: 'linear-gradient(135deg, #1e6080, #0F3D4C)' }}>
                  <Plus className="w-4 h-4 mr-2" /> New Application
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((ticket, index) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}