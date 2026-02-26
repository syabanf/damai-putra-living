import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, CheckCircle, XCircle, FileCheck, Trash2, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

const notificationConfig = {
  unit_approved:   { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  unit_rejected:   { icon: XCircle,     color: 'bg-red-100 text-red-600'         },
  permit_approved: { icon: FileCheck,   color: 'bg-blue-100 text-blue-600'       },
  permit_rejected: { icon: XCircle,     color: 'bg-red-100 text-red-600'         },
  info:            { icon: Bell,        color: 'bg-stone-100 text-stone-600'     },
};

const GlassCard = ({ children, className = '', onClick, style: extraStyle }) => (
  <div onClick={onClick}
    className={`rounded-2xl ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)', ...extraStyle }}>
    {children}
  </div>
);

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date'),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notif of unread) await base44.entities.Notification.update(notif.id, { read: true });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) markAsReadMutation.mutate(notification.id);
    if (notification.reference_id) {
      if (notification.type.includes('unit')) navigate(createPageUrl('UnitDetail') + `?id=${notification.reference_id}`);
      else if (notification.type.includes('permit')) navigate(createPageUrl('TicketDetail') + `?id=${notification.reference_id}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6 rounded-b-[2rem]" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Damai Putra Living</p>
              <h1 className="text-lg font-bold text-white">Notifications</h1>
              {unreadCount > 0 && <p className="text-white/55 text-xs">{unreadCount} unread</p>}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 rounded-2xl p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-200/60 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200/60 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200/60 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No notifications</p>
              <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification, index) => {
                const config = notificationConfig[notification.type] || notificationConfig.info;
                const Icon = config.icon;
                return (
                  <motion.div key={notification.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: index * 0.04 }}>
                    <GlassCard className={`p-4 ${!notification.read ? 'border-l-4' : ''}`}
                      style={!notification.read ? { borderLeftColor: '#8A8076' } : {}}
                      onClick={() => handleNotificationClick(notification)}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-slate-800 text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </p>
                            <button onClick={(e) => { e.stopPropagation(); deleteNotificationMutation.mutate(notification.id); }}
                              className="w-7 h-7 rounded-xl hover:bg-red-50 flex items-center justify-center flex-shrink-0 transition-colors">
                              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notification.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{new Date(notification.created_date).toLocaleString()}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#8A8076' }} />
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}