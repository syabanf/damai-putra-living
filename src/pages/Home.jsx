import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Building2, Bell, ChevronRight, FileCheck, Wrench, Truck, 
  Calendar, Users, Shield, Plus, AlertCircle 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/navigation/BottomNav';
import StatusBadge from '@/components/ui/StatusBadge';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        // Not logged in
      }
    };
    loadUser();
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
    queryFn: () => base44.entities.Ticket.list('-created_date', 5),
  });

  const approvedUnit = units.find(u => u.status === 'approved');
  const unreadCount = notifications.length;

  const quickActions = [
    { icon: FileCheck, label: 'Renovation', color: 'bg-blue-500', action: () => navigate(createPageUrl('CreateTicket') + '?type=renovation') },
    { icon: Truck, label: 'Moving', color: 'bg-purple-500', action: () => navigate(createPageUrl('CreateTicket') + '?type=moving_in') },
    { icon: Calendar, label: 'Event', color: 'bg-amber-500', action: () => navigate(createPageUrl('CreateTicket') + '?type=event') },
    { icon: Users, label: 'Contractor', color: 'bg-teal-500', action: () => navigate(createPageUrl('CreateTicket') + '?type=contractor_access') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-8 rounded-b-3xl" style={{ background: 'linear-gradient(135deg, #8A8076 0%, #6e6560 50%, #3d3733 100%)' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-teal-100 text-sm">Welcome back,</p>
            <h1 className="text-white text-xl font-bold mt-1">
              {user?.full_name || 'Resident'}
            </h1>
          </div>
          <Link
            to={createPageUrl('Notifications')}
            className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* Unit Card */}
        {approvedUnit ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-teal-100 text-xs">Your Unit</p>
                  <p className="text-white font-bold">{approvedUnit.unit_number}</p>
                  <p className="text-teal-100 text-xs">{approvedUnit.property_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-400/20 text-emerald-200 text-xs font-medium rounded-full">
                  Verified
                </span>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-300" />
              <p className="text-white text-sm">No unit registered yet</p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl('MyUnit'))}
              size="sm"
              className="w-full bg-white/20 hover:bg-white/30 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Register Your Unit
            </Button>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      {approvedUnit && (
        <div className="px-6 -mt-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Quick Permits</h2>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="px-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
          <Link to={createPageUrl('Tickets')} className="text-teal-600 text-sm font-medium">
            See All
          </Link>
        </div>

        {tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.slice(0, 3).map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 capitalize">
                        {ticket.permit_type?.replace(/_/g, ' ') || ticket.category}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {ticket.unit_number} • {new Date(ticket.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No recent activity</p>
            <p className="text-slate-400 text-sm mt-1">Your permits will appear here</p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="px-6 mt-6">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Security First</h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                All permits are digitally secured and verified by management.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav currentPage="Home" />
    </div>
  );
}