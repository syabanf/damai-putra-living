import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileCheck, Wrench, Truck, Calendar, Users, AlertCircle,
  ChevronRight, Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from '@/components/navigation/BottomNav';
import StatusBadge from '@/components/ui/StatusBadge';

const permitTypeIcons = {
  renovation: Wrench,
  moving_in: Truck,
  moving_out: Truck,
  event: Calendar,
  contractor_access: Users,
};

const GlassCard = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/60 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);

export default function Tickets() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-created_date'),
  });

  const hasApprovedUnit = units.some(u => u.status === 'approved');

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return ticket.status === 'open';
    if (activeTab === 'in_progress') return ['in_progress', 'approved'].includes(ticket.status);
    if (activeTab === 'closed') return ['closed', 'rejected'].includes(ticket.status);
    return true;
  });

  const getIcon = (type) => permitTypeIcons[type] || FileCheck;

  if (!hasApprovedUnit) {
    return (
      <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>
        {/* Header */}
        <div className="px-5 pt-14 pb-6 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-white/50 text-sm mt-1">Create and manage permits</p>
        </div>

        <div className="px-5 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Lock className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Unit Required</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                You need an approved unit to create support tickets and digital permits.
              </p>
              <Button onClick={() => navigate(createPageUrl('MyUnit'))}
                className="text-white rounded-xl h-12 px-6"
                style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 4px 16px rgba(138,128,118,0.3)' }}>
                Register Your Unit
              </Button>
            </GlassCard>
          </motion.div>
        </div>
        <BottomNav currentPage="Ticket" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
            <p className="text-white/50 text-sm mt-0.5">Manage your permits & requests</p>
          </div>
          <Button onClick={() => navigate(createPageUrl('CreateTicket'))}
            className="h-10 px-4 text-white rounded-xl border border-white/20 bg-white/15 backdrop-blur-sm hover:bg-white/25">
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>

        {/* Tabs inside header */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
          {['all', 'open', 'in_progress', 'closed'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'bg-white/90 text-slate-800 shadow-sm' : 'text-white/60 hover:text-white'}`}>
              {tab === 'in_progress' ? 'Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200/60 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200/60 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-200/60 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No tickets found</p>
              <p className="text-slate-400 text-sm mt-1">
                {activeTab === 'all' ? 'Create your first ticket' : `No ${activeTab.replace('_', ' ')} tickets`}
              </p>
              {activeTab === 'all' && (
                <Button onClick={() => navigate(createPageUrl('CreateTicket'))}
                  className="mt-4 text-white" style={{ backgroundColor: '#8A8076' }}>
                  <Plus className="w-4 h-4 mr-2" /> Create Ticket
                </Button>
              )}
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTickets.map((ticket, index) => {
                const Icon = getIcon(ticket.permit_type);
                return (
                  <motion.div key={ticket.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <GlassCard className="p-4" onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            ticket.category === 'permit' ? 'bg-blue-100' :
                            ticket.category === 'complaint' ? 'bg-red-100' : 'bg-slate-100'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              ticket.category === 'permit' ? 'text-blue-600' :
                              ticket.category === 'complaint' ? 'text-red-600' : 'text-slate-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 capitalize">
                              {ticket.permit_type?.replace(/_/g, ' ') || ticket.category}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {ticket.unit_number} • {new Date(ticket.created_date).toLocaleDateString()}
                            </p>
                            {ticket.activity_date && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                Scheduled: {new Date(ticket.activity_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={ticket.status} />
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      {ticket.status === 'approved' && ticket.permit_id && (
                        <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center gap-2">
                          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                            <FileCheck className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="text-xs text-emerald-600 font-medium">Permit #{ticket.permit_id}</span>
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav currentPage="Ticket" />
    </div>
  );
}