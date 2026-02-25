import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Building2, Bell, ChevronRight, FileCheck, Wrench, Truck, 
  Calendar, Users, Shield, Plus, AlertCircle, CreditCard,
  CheckCircle2, Clock, XCircle, HardHat, Package, PartyPopper,
  Megaphone, ArrowRight, Gift, Star, User, Home as HomeIcon, Cctv, Video
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/navigation/BottomNav';
import StatusBadge from '@/components/ui/StatusBadge';

const BRAND = '#8A8076';

const permitTypeConfig = {
  renovation: { icon: HardHat, label: 'Renovation' },
  moving_in: { icon: Package, label: 'Moving In' },
  moving_out: { icon: Truck, label: 'Moving Out' },
  event: { icon: PartyPopper, label: 'Event' },
  contractor_access: { icon: Users, label: 'Contractor' },
};

// Static mock announcements & promos
const ANNOUNCEMENTS = [
  { id: 1, title: 'Lobby Renovation Notice', body: 'The main lobby will undergo renovation from Mar 1–15. Please use the side entrance.', date: '24 Feb 2026', urgent: true },
  { id: 2, title: 'Water Supply Maintenance', body: 'Water supply will be interrupted on Feb 27, 08:00–12:00. Please store sufficient water.', date: '23 Feb 2026', urgent: false },
];

const PROMOS = [
  { id: 1, title: 'Fast-Track Permit', desc: 'Get your renovation permit approved in 24 hours. Limited slots.', badge: 'New', color: '#6d28d9' },
  { id: 2, title: 'Refer a Neighbour', desc: 'Invite a new resident and earn service credits.', badge: 'Promo', color: '#0284c7' },
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

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ read: false }),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-created_date', 10),
  });

  const approvedUnit = units.find(u => u.status === 'approved');
  const unreadCount = notifications.length;

  // Active permits (approved + not closed)
  const activePermits = tickets.filter(t => t.category === 'permit' && t.status === 'approved');
  const pendingPermits = tickets.filter(t => t.category === 'permit' && ['open', 'in_progress', 'under_review'].includes(t.status));

  const quickActions = [
    { icon: HardHat, label: 'Renovation', color: '#d97706', type: 'renovation' },
    { icon: Package, label: 'Moving', color: '#7c3aed', type: 'moving_in' },
    { icon: PartyPopper, label: 'Event', color: '#db2777', type: 'event' },
    { icon: Users, label: 'Contractor', color: '#0284c7', type: 'contractor_access' },
    { icon: Truck, label: 'Move Out', color: '#059669', type: 'moving_out' },
    { icon: Plus, label: 'More', color: BRAND, type: null },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Resident';

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* ── HEADER ── */}
      <div className="px-5 pt-12 pb-10 rounded-b-[2rem]" style={{ background: 'linear-gradient(145deg, #8A8076 0%, #6e6560 55%, #3d3733 100%)' }}>
        {/* Top bar */}
        <div className="flex justify-between items-center mb-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <User className="w-6 h-6 text-white/80" />
            </div>
            <div>
              <p className="text-white/60 text-xs">{getGreeting()},</p>
              <h1 className="text-white font-bold text-base leading-tight">{firstName} 👋</h1>
            </div>
          </div>
          <Link to={createPageUrl('Notifications')}
            className="relative w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* ── UNIT SUMMARY CARD ⭐ ── */}
        {approvedUnit ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(createPageUrl('MyUnit'))}
            className="bg-white/12 backdrop-blur-sm rounded-2xl p-4 border border-white/20 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Your Unit</p>
                  <p className="text-white font-bold text-lg leading-tight">{approvedUnit.unit_number}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-400/25 text-emerald-200 text-xs font-semibold rounded-full border border-emerald-400/30">
                ✓ Verified
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">{approvedUnit.property_name}{approvedUnit.tower ? ` · Tower ${approvedUnit.tower}` : ''}</p>
                <p className="text-white/50 text-xs mt-0.5 capitalize">{approvedUnit.ownership_status}</p>
              </div>
              <div className="flex items-center gap-1 text-white/50">
                <p className="text-xs">View details</p>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/12 backdrop-blur-sm rounded-2xl p-4 border border-amber-400/30">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">No unit registered</p>
                <p className="text-white/50 text-xs">Register your unit to access all features</p>
              </div>
            </div>
            <Button onClick={() => navigate(createPageUrl('MyUnit'))} size="sm"
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/20">
              <Plus className="w-4 h-4 mr-2" /> Register Unit
            </Button>
          </motion.div>
        )}
      </div>

      <div className="px-5 space-y-5 mt-5">

        {/* ── ACTIVE PERMIT STATUS ⭐ ── */}
        {approvedUnit && (activePermits.length > 0 || pendingPermits.length > 0) && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Permit Status</h2>
              <Link to={createPageUrl('Tickets')} className="text-xs font-medium flex items-center gap-1" style={{ color: BRAND }}>
                See All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {activePermits.slice(0, 2).map((ticket) => {
                const cfg = permitTypeConfig[ticket.permit_type] || { icon: FileCheck, label: ticket.permit_type };
                const Ic = cfg.icon;
                return (
                  <motion.div key={ticket.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}
                    className="bg-white rounded-2xl p-4 border border-emerald-100 cursor-pointer shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Ic className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                      <p className="text-xs text-slate-400 font-mono">{ticket.permit_id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold rounded-full">Active</span>
                      {ticket.valid_until && (
                        <p className="text-xs text-slate-400">until {new Date(ticket.valid_until + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {pendingPermits.slice(0, 1).map((ticket) => {
                const cfg = permitTypeConfig[ticket.permit_type] || { icon: FileCheck, label: ticket.permit_type };
                const Ic = cfg.icon;
                return (
                  <motion.div key={ticket.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}
                    className="bg-white rounded-2xl p-4 border border-amber-100 cursor-pointer shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Ic className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                      <p className="text-xs text-slate-400">{ticket.reference_number || 'Pending Review'}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 font-semibold rounded-full flex-shrink-0">
                      <Clock className="w-3 h-3 inline mr-1" />Pending
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── BILLING SUMMARY ── */}
        {approvedUnit && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Billing</h2>
              <span className="text-xs text-slate-400">Feb 2026</span>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f5f3f1' }}>
                    <CreditCard className="w-5 h-5" style={{ color: BRAND }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Service Charge</p>
                    <p className="font-bold text-slate-800">Rp 850.000</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">Paid</span>
              </div>
              <div className="h-px bg-slate-100 mb-3" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Next due: <span className="text-slate-700 font-medium">1 Mar 2026</span></span>
                <span className="font-medium" style={{ color: BRAND }}>View Statement →</span>
              </div>
            </div>
          </section>
        )}

        {/* ── QUICK ACTIONS ⭐ ── */}
        {approvedUnit && (
          <section>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Quick Permits</h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => action.type ? navigate(createPageUrl('CreateTicket') + `?type=${action.type}`) : navigate(createPageUrl('Tickets'))}
                    className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${action.color}18` }}>
                      <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <span className="text-xs text-slate-600 font-medium text-center leading-tight">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── ANNOUNCEMENTS ── */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Announcements</h2>
            <span className="text-xs font-medium" style={{ color: BRAND }}>{ANNOUNCEMENTS.length} new</span>
          </div>
          <div className="space-y-2">
            {ANNOUNCEMENTS.map((ann, i) => (
              <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer ${ann.urgent ? 'border-red-100' : 'border-slate-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ann.urgent ? 'bg-red-50' : 'bg-slate-100'}`}>
                    <Megaphone className={`w-4 h-4 ${ann.urgent ? 'text-red-500' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{ann.title}</p>
                      {ann.urgent && <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium flex-shrink-0">Urgent</span>}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{ann.body}</p>
                    <p className="text-xs text-slate-400 mt-1.5">{ann.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── RECENT ACTIVITY ── */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recent Activity</h2>
            <Link to={createPageUrl('Tickets')} className="text-xs font-medium flex items-center gap-1" style={{ color: BRAND }}>
              See All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {tickets.length > 0 ? (
            <div className="space-y-2">
              {tickets.slice(0, 3).map((ticket, index) => {
                const cfg = permitTypeConfig[ticket.permit_type] || { icon: FileCheck, label: ticket.permit_type || ticket.category };
                const Ic = cfg.icon;
                return (
                  <motion.div key={ticket.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}
                    onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Ic className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                        <p className="text-xs text-slate-400">
                          {ticket.unit_number} · {new Date(ticket.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileCheck className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-sm">No recent activity</p>
              <p className="text-slate-400 text-xs mt-1">Your permits will appear here</p>
            </div>
          )}
        </section>

        {/* ── SURVEILLANCE / CCTV ── */}
        {approvedUnit && (
          <section>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Surveillance</h2>
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Live</span>
                </div>
                <span className="text-xs text-slate-500">CCTV Monitoring</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Main Lobby', status: 'online' },
                  { label: 'Parking B1', status: 'online' },
                  { label: 'Elevator Hall', status: 'online' },
                  { label: 'Rooftop', status: 'offline' },
                ].map((cam, i) => (
                  <div key={i} className="bg-slate-800 rounded-xl p-3 flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cam.status === 'online' ? 'bg-emerald-900' : 'bg-slate-700'}`}>
                      <Video className={`w-4 h-4 ${cam.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{cam.label}</p>
                      <p className={`text-xs ${cam.status === 'online' ? 'text-emerald-500' : 'text-slate-500'}`}>{cam.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-500">3 of 4 cameras active</p>
                <button className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  Request Footage <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── COMMUNITY / PROMO ── */}
        <section className="pb-2">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Community & Offers</h2>
          <div className="space-y-3">
            {PROMOS.map((promo, i) => (
              <motion.div key={promo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-4 text-white cursor-pointer overflow-hidden relative"
                style={{ background: `linear-gradient(135deg, ${promo.color}, ${promo.color}cc)` }}>
                <div className="absolute right-0 top-0 w-24 h-24 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8" />
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full font-medium mb-2 inline-block">{promo.badge}</span>
                    <p className="font-bold text-sm leading-tight">{promo.title}</p>
                    <p className="text-white/70 text-xs mt-1 leading-relaxed">{promo.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/50 flex-shrink-0 ml-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>

      <BottomNav currentPage="Home" />
    </div>
  );
}