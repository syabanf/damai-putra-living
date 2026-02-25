import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Building2, Bell, ChevronRight, FileCheck, Truck, 
  Users, Plus, AlertCircle, CreditCard,
  Clock, HardHat, Package, PartyPopper,
  Megaphone, ArrowRight, User, Video
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/navigation/BottomNav';
import StatusBadge from '@/components/ui/StatusBadge';

const BRAND = '#8A8076';

const permitTypeConfig = {
  renovation:        { icon: HardHat,     label: 'Renovation' },
  moving_in:         { icon: Package,     label: 'Moving In'  },
  moving_out:        { icon: Truck,       label: 'Moving Out' },
  event:             { icon: PartyPopper, label: 'Event'      },
  contractor_access: { icon: Users,       label: 'Contractor' },
};

const ANNOUNCEMENTS = [
  { id: 1, title: 'Lobby Renovation Notice', body: 'The main lobby will undergo renovation from Mar 1–15. Please use the side entrance.', date: '24 Feb 2026', urgent: true },
  { id: 2, title: 'Water Supply Maintenance', body: 'Water supply will be interrupted on Feb 27, 08:00–12:00. Please store sufficient water.', date: '23 Feb 2026', urgent: false },
];

const PROMOS = [
  { id: 1, title: 'Fast-Track Permit', desc: 'Get your renovation permit approved in 24 hours. Limited slots.', badge: 'New', color: '#6d28d9' },
  { id: 2, title: 'Refer a Neighbour', desc: 'Invite a new resident and earn service credits.', badge: 'Promo', color: '#0284c7' },
];

const CAMERAS = [
  { label: 'Main Lobby',    status: 'online'  },
  { label: 'Parking B1',   status: 'online'  },
  { label: 'Elevator Hall', status: 'online'  },
  { label: 'Rooftop',      status: 'offline' },
];

const SectionHeader = ({ title, action }) => (
  <div className="flex justify-between items-center mb-3">
    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h2>
    {action}
  </div>
);

const GlassCard = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/60 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: units = [] }         = useQuery({ queryKey: ['units'],         queryFn: () => base44.entities.Unit.list() });
  const { data: notifications = [] } = useQuery({ queryKey: ['notifications'], queryFn: () => base44.entities.Notification.filter({ read: false }) });
  const { data: tickets = [] }       = useQuery({ queryKey: ['tickets'],       queryFn: () => base44.entities.Ticket.list('-created_date', 10) });

  const approvedUnit   = units.find(u => u.status === 'approved');
  const unreadCount    = notifications.length;
  const activePermits  = tickets.filter(t => t.category === 'permit' && t.status === 'approved');
  const pendingPermits = tickets.filter(t => t.category === 'permit' && ['open', 'in_progress', 'under_review'].includes(t.status));

  const quickActions = [
    { icon: HardHat,     label: 'Renovation', color: '#d97706', type: 'renovation'        },
    { icon: Package,     label: 'Moving In',  color: '#7c3aed', type: 'moving_in'         },
    { icon: PartyPopper, label: 'Event',       color: '#db2777', type: 'event'             },
    { icon: Users,       label: 'Contractor', color: '#0284c7', type: 'contractor_access' },
    { icon: Truck,       label: 'Move Out',   color: '#059669', type: 'moving_out'        },
    { icon: Plus,        label: 'All',        color: BRAND,     type: null                },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Resident';

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden px-5 pt-14 pb-32 rounded-b-[2.5rem]"
        style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 bg-white" />
        <div className="absolute top-20 -left-8 w-32 h-32 rounded-full opacity-5 bg-white" />

        {/* Top bar */}
        <div className="relative flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full ring-2 ring-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="w-6 h-6 text-white/90" />
            </div>
            <div>
              <p className="text-white/55 text-xs">{getGreeting()},</p>
              <h1 className="text-white font-bold text-lg leading-tight">{firstName} 👋</h1>
            </div>
          </div>
          <Link to={createPageUrl('Notifications')}
            className="relative w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* ── UNIT SUMMARY CARD ── */}
        {approvedUnit ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(createPageUrl('MyUnit'))}
            className="relative cursor-pointer rounded-2xl p-5 border border-white/25 backdrop-blur-md active:scale-[0.98] transition-transform"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/55 text-[10px] font-semibold uppercase tracking-widest">Your Unit</p>
                  <p className="text-white font-bold text-xl leading-tight">{approvedUnit.unit_number}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/40 text-emerald-200 bg-emerald-400/15">
                ✓ Verified
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">{approvedUnit.property_name}{approvedUnit.tower ? ` · Tower ${approvedUnit.tower}` : ''}</p>
                <p className="text-white/40 text-xs mt-0.5 capitalize">{approvedUnit.ownership_status}</p>
              </div>
              <div className="flex items-center gap-1 text-white/40 text-xs">
                View details <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 border border-amber-400/30 backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.10)' }}>
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">No unit registered</p>
                <p className="text-white/50 text-xs">Register to access all features</p>
              </div>
            </div>
            <Button onClick={() => navigate(createPageUrl('MyUnit'))} size="sm"
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/25 backdrop-blur-sm">
              <Plus className="w-4 h-4 mr-2" /> Register Unit
            </Button>
          </motion.div>
        )}
      </div>

      {/* ── SCROLLABLE CONTENT (pulled up over hero) ── */}
      <div className="px-4 -mt-20 space-y-5">

        {/* ── QUICK ACTIONS ── */}
        {approvedUnit && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Permits</p>
              <div className="grid grid-cols-6 gap-1">
                {quickActions.map((action, index) => (
                  <button key={action.label} onClick={() => action.type ? navigate(createPageUrl('CreateTicket') + `?type=${action.type}`) : navigate(createPageUrl('Tickets'))}
                    className="flex flex-col items-center gap-1.5 py-2 rounded-xl active:scale-90 transition-transform">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${action.color}18` }}>
                      <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold text-center leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.section>
        )}

        {/* ── ACTIVE PERMIT STATUS ── */}
        {approvedUnit && (activePermits.length > 0 || pendingPermits.length > 0) && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <SectionHeader title="Permit Status"
              action={<Link to={createPageUrl('Tickets')} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: BRAND }}>See All <ChevronRight className="w-3 h-3" /></Link>} />
            <div className="space-y-2">
              {activePermits.slice(0, 2).map((ticket) => {
                const cfg = permitTypeConfig[ticket.permit_type] || { icon: FileCheck, label: ticket.permit_type };
                const Ic = cfg.icon;
                return (
                  <GlassCard key={ticket.id} className="p-4 flex items-center gap-3" onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}>
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Ic className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                      <p className="text-xs text-slate-400 font-mono">{ticket.permit_id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">Active</span>
                      {ticket.valid_until && (
                        <p className="text-[10px] text-slate-400">until {new Date(ticket.valid_until + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
              {pendingPermits.slice(0, 1).map((ticket) => {
                const cfg = permitTypeConfig[ticket.permit_type] || { icon: FileCheck, label: ticket.permit_type };
                const Ic = cfg.icon;
                return (
                  <GlassCard key={ticket.id} className="p-4 flex items-center gap-3 border-amber-200/80" onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}>
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Ic className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                      <p className="text-xs text-slate-400">{ticket.reference_number || 'Pending Review'}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  </GlassCard>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── BILLING SUMMARY ── */}
        {approvedUnit && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <SectionHeader title="Billing" action={<span className="text-[10px] text-slate-400 font-medium">Feb 2026</span>} />
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f5f3f1' }}>
                    <CreditCard className="w-5 h-5" style={{ color: BRAND }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Service Charge</p>
                    <p className="font-bold text-slate-800 text-base">Rp 850.000</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">Paid</span>
              </div>
              <div className="h-px bg-slate-100 mb-3" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Next due: <span className="text-slate-700 font-semibold">1 Mar 2026</span></span>
                <span className="font-semibold" style={{ color: BRAND }}>View Statement →</span>
              </div>
            </GlassCard>
          </motion.section>
        )}

        {/* ── ANNOUNCEMENTS ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionHeader title="Announcements" action={<span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: BRAND }}>{ANNOUNCEMENTS.length} new</span>} />
          <div className="space-y-2">
            {ANNOUNCEMENTS.map((ann, i) => (
              <GlassCard key={ann.id} className={`p-4 ${ann.urgent ? 'border-red-200/80' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ann.urgent ? 'bg-red-100' : 'bg-slate-100'}`}>
                    <Megaphone className={`w-4 h-4 ${ann.urgent ? 'text-red-500' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{ann.title}</p>
                      {ann.urgent && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md font-bold flex-shrink-0">URGENT</span>}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{ann.body}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">{ann.date}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.section>

        {/* ── RECENT ACTIVITY ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader title="Recent Activity"
            action={<Link to={createPageUrl('Tickets')} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: BRAND }}>See All <ChevronRight className="w-3 h-3" /></Link>} />
          {tickets.length > 0 ? (
            <div className="space-y-2">
              {tickets.slice(0, 3).map((ticket, index) => {
                const cfg = permitTypeConfig[ticket.permit_type] || { icon: FileCheck, label: ticket.permit_type || ticket.category };
                const Ic = cfg.icon;
                return (
                  <GlassCard key={ticket.id} className="p-4 flex items-center gap-3" onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}>
                    <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Ic className="w-5 h-5 text-stone-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                      <p className="text-xs text-slate-400">{ticket.unit_number} · {new Date(ticket.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileCheck className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-sm">No recent activity</p>
              <p className="text-slate-400 text-xs mt-1">Your permits will appear here</p>
            </GlassCard>
          )}
        </motion.section>

        {/* ── SURVEILLANCE / CCTV ── */}
        {approvedUnit && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <SectionHeader title="Surveillance" action={
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Live</span>
              </div>
            } />
            <div className="rounded-2xl p-4 border border-white/10" style={{ background: 'linear-gradient(145deg, #1e2330, #111827)' }}>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {CAMERAS.map((cam, i) => (
                  <div key={i} className="rounded-xl p-3 flex items-center gap-2.5 border border-white/5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cam.status === 'online' ? 'bg-emerald-500/15' : 'bg-white/5'}`}>
                      <Video className={`w-4 h-4 ${cam.status === 'online' ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/80 truncate">{cam.label}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className={`w-1 h-1 rounded-full ${cam.status === 'online' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <p className={`text-[10px] capitalize ${cam.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`}>{cam.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                <p className="text-[10px] text-slate-500">3 of 4 cameras active</p>
                <button className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 hover:text-white transition-colors">
                  Request Footage <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── COMMUNITY / PROMO ── */}
        <motion.section className="pb-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <SectionHeader title="Community & Offers" />
          <div className="space-y-3">
            {PROMOS.map((promo) => (
              <div key={promo.id} className="rounded-2xl p-4 text-white cursor-pointer overflow-hidden relative active:scale-[0.98] transition-transform"
                style={{ background: `linear-gradient(135deg, ${promo.color}ee, ${promo.color}99)`, backdropFilter: 'blur(12px)' }}>
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                <div className="absolute right-10 bottom-0 w-16 h-16 rounded-full bg-white/5" />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-bold mb-2 inline-block tracking-wide">{promo.badge}</span>
                    <p className="font-bold text-sm leading-snug">{promo.title}</p>
                    <p className="text-white/65 text-xs mt-1 leading-relaxed">{promo.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

      </div>

      <BottomNav currentPage="Home" />
    </div>
  );
}