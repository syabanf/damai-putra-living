import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  User, Mail, Building2, HelpCircle, 
  FileText, LogOut, ChevronRight, Shield, Bell, Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const GlassCard = ({ children, className = '' }) => (
  <div className={`rounded-2xl ${className}`} style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)' }}>
    {children}
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const approvedUnits = units.filter(u => u.status === 'approved');

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl('Splash'));
  };

  const menuItems = [
    { icon: Building2, label: 'My Units', count: approvedUnits.length, action: () => navigate(createPageUrl('MyUnit')) },
    { icon: Bell, label: 'Notifications', action: () => navigate(createPageUrl('Notifications')) },
    { icon: Globe, label: 'Language', value: 'English', action: () => {} },
    { icon: Shield, label: 'Privacy & Security', action: () => navigate(createPageUrl('PrivacySecurity')) },
    { icon: HelpCircle, label: 'Help Center', action: () => navigate(createPageUrl('HelpCenter')) },
    { icon: FileText, label: 'Terms of Service', action: () => navigate(createPageUrl('PrivacySecurity')) },
  ];

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 50%, #e2ddd8 100%)' }}>
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-14 pb-24 rounded-b-[2.5rem]"
        style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 bg-white" />
        <h1 className="text-2xl font-bold text-white mb-8 relative">Profile</h1>
        <div className="flex items-center gap-4 relative">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.full_name || 'User'}</h2>
            <p className="text-white/60 flex items-center gap-2 mt-1 text-sm">
              <Mail className="w-3.5 h-3.5" />
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card – pulled up over header */}
      <div className="px-4 -mt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-5 grid grid-cols-3 gap-4 shadow-lg shadow-slate-200/80">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">{approvedUnits.length}</p>
              <p className="text-xs text-slate-500 mt-1">Units</p>
            </div>
            <div className="text-center border-x border-slate-100/80">
              <p className="text-2xl font-bold text-slate-800">0</p>
              <p className="text-xs text-slate-500 mt-1">Active Permits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">0</p>
              <p className="text-xs text-slate-500 mt-1">Pending</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-5">
        <GlassCard className="overflow-hidden">
          {menuItems.map((item, index) => (
            <motion.button key={item.label}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
              onClick={item.action}
              className={`w-full p-4 flex items-center justify-between hover:bg-white/60 transition-colors active:bg-white/80 ${index < menuItems.length - 1 ? 'border-b border-white/60' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f5f3f118' }}>
                  <item.icon className="w-5 h-5" style={{ color: '#8A8076' }} />
                </div>
                <span className="font-medium text-slate-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.count !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: '#f5f3f1', color: '#8A8076' }}>
                    {item.count}
                  </span>
                )}
                {item.value && <span className="text-sm text-slate-400">{item.value}</span>}
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </motion.button>
          ))}
        </GlassCard>
      </div>

      {/* Logout */}
      <div className="px-4 mt-5">
        <button onClick={handleLogout}
          className="w-full h-14 rounded-2xl border border-red-200/80 bg-red-50/60 backdrop-blur-sm text-red-600 font-semibold flex items-center justify-center gap-2 hover:bg-red-100/60 transition-colors">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      <div className="text-center mt-8">
        <p className="text-slate-400 text-xs">Damai Putra Apps v1.0.0</p>
      </div>

    </div>
  );
}