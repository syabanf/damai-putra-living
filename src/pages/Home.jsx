import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, Plus, FileCheck, Bell, ChevronRight,
  Wrench, Truck, Calendar, Users, ArrowRight, CheckCircle, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/navigation/BottomNav';

const GlassCard = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/60 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);

const quickActions = [
  { icon: FileCheck, label: 'Izin Kegiatan', type: 'izin_kegiatan', color: '#4f86f7', bg: '#ebf0ff' },
  { icon: Wrench, label: 'Renovasi', type: 'renovasi_minor', color: '#f97316', bg: '#fff3eb' },
  { icon: Truck, label: 'Pindah', type: 'pindah_masuk', color: '#10b981', bg: '#ecfdf5' },
  { icon: Users, label: 'Kontraktor', type: 'akses_kontraktor', color: '#8b5cf6', bg: '#f5f3ff' },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-created_date'),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ user_email: user?.email, read: false }),
    enabled: !!user?.email,
  });

  const approvedUnits = units.filter(u => u.status === 'approved');
  const recentTickets = tickets.slice(0, 3);
  const unreadCount = notifications.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-14 pb-24 rounded-b-[2.5rem]"
        style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-5 bg-white" />

        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-white/60 text-sm">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">{user?.full_name?.split(' ')[0] || 'Selamat Datang'}</h1>
          </div>
          <button
            onClick={() => navigate(createPageUrl('Notifications'))}
            className="relative w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 active:scale-90 transition-transform"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats card pulled up */}
      <div className="px-4 -mt-14 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-5 shadow-lg shadow-slate-200/80">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{approvedUnits.length}</p>
                <p className="text-xs text-slate-500 mt-1">Unit Aktif</p>
              </div>
              <div className="text-center border-x border-slate-100/80">
                <p className="text-2xl font-bold text-slate-800">
                  {tickets.filter(t => ['open', 'under_review', 'in_progress'].includes(t.status)).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Proses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {tickets.filter(t => t.status === 'approved').length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Disetujui</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="px-4 mt-5 space-y-5">
        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-slate-700">Buat Izin Baru</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.18 + i * 0.04 }}
                onClick={() => navigate(createPageUrl('CreateTicket') + `?type=${action.type}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl active:scale-95 transition-transform"
                style={{ background: action.bg }}
              >
                <action.icon className="w-6 h-6" style={{ color: action.color }} />
                <span className="text-[10px] font-semibold text-center leading-tight text-slate-600">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* My Units */}
        {approvedUnits.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <GlassCard className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">Daftarkan Unit Anda</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Diperlukan untuk membuat izin</p>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl('AddUnit'))}
                  size="sm"
                  className="text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)' }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-slate-700">Unit Saya</h2>
              <button onClick={() => navigate(createPageUrl('MyUnit'))} className="text-sm font-medium flex items-center gap-1" style={{ color: '#8A8076' }}>
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {approvedUnits.slice(0, 2).map(unit => (
                <GlassCard key={unit.id} className="p-4" onClick={() => navigate(createPageUrl('UnitDetail') + `?id=${unit.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8A8076, #5a524e)' }}>
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{unit.unit_number}</p>
                      <p className="text-xs text-slate-400">{unit.property_name}{unit.tower ? ` · Tower ${unit.tower}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Aktif</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Tickets */}
        {recentTickets.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-slate-700">Tiket Terbaru</h2>
              <button onClick={() => navigate(createPageUrl('Tickets'))} className="text-sm font-medium flex items-center gap-1" style={{ color: '#8A8076' }}>
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentTickets.map((ticket, i) => (
                <motion.div key={ticket.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}>
                  <GlassCard className="p-4" onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm capitalize truncate">
                          {ticket.permit_type?.replace(/_/g, ' ') || ticket.category}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {ticket.unit_number} · {new Date(ticket.created_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          ticket.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          ticket.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {ticket.status?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Create first ticket CTA */}
        {recentTickets.length === 0 && approvedUnits.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <GlassCard className="p-6 text-center" onClick={() => navigate(createPageUrl('CreateTicket'))}>
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="font-bold text-slate-700 mb-1">Belum Ada Tiket</h3>
              <p className="text-sm text-slate-500 mb-4">Buat izin pertama Anda sekarang</p>
              <Button className="text-white rounded-xl h-11 px-6" style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)' }}>
                <Plus className="w-4 h-4 mr-2" /> Buat Izin
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </div>

      <BottomNav currentPage="Home" />
    </div>
  );
}