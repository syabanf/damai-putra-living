import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Bell, CheckCircle, XCircle, Building2, FileCheck,
  Trash2, Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const notificationConfig = {
  unit_approved: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  unit_rejected: { icon: XCircle, color: 'bg-red-100 text-red-600' },
  permit_approved: { icon: FileCheck, color: 'bg-blue-100 text-blue-600' },
  permit_rejected: { icon: XCircle, color: 'bg-red-100 text-red-600' },
  info: { icon: Bell, color: 'bg-slate-100 text-slate-600' },
};

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date'),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notif of unread) {
      await base44.entities.Notification.update(notif.id, { read: true });
    }
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.reference_id) {
      if (notification.type.includes('unit')) {
        navigate(createPageUrl('UnitDetail') + `?id=${notification.reference_id}`);
      } else if (notification.type.includes('permit')) {
        navigate(createPageUrl('TicketDetail') + `?id=${notification.reference_id}`);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-teal-600"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No notifications</p>
            <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification, index) => {
                const config = notificationConfig[notification.type] || notificationConfig.info;
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`bg-white rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? 'border-l-4 border-teal-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium text-slate-800 ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                            className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.created_date).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
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