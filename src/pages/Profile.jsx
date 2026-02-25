import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Building2, Settings, HelpCircle, 
  FileText, LogOut, ChevronRight, Shield, Bell, Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BottomNav from '@/components/navigation/BottomNav';

export default function Profile() {
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

  const approvedUnits = units.filter(u => u.status === 'approved');

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl('Splash'));
  };

  const menuItems = [
    { icon: Building2, label: 'My Units', count: approvedUnits.length, action: () => navigate(createPageUrl('MyUnit')) },
    { icon: Bell, label: 'Notifications', action: () => navigate(createPageUrl('Notifications')) },
    { icon: Globe, label: 'Language', value: 'English', action: () => {} },
    { icon: Shield, label: 'Privacy & Security', action: () => {} },
    { icon: HelpCircle, label: 'Help Center', action: () => {} },
    { icon: FileText, label: 'Terms of Service', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-20 rounded-b-3xl" style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)' }}>
        <h1 className="text-2xl font-bold text-white mb-8">Profile</h1>
        
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.full_name || 'User'}</h2>
            <p className="text-teal-100 flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" />
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 -mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-lg grid grid-cols-3 gap-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{approvedUnits.length}</p>
            <p className="text-xs text-slate-500 mt-1">Units</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-2xl font-bold text-slate-800">0</p>
            <p className="text-xs text-slate-500 mt-1">Active Permits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">0</p>
            <p className="text-xs text-slate-500 mt-1">Pending</p>
          </div>
        </motion.div>
      </div>

      {/* Menu */}
      <div className="px-6 mt-6 space-y-3">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={item.action}
            className="w-full bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <item.icon className="w-5 h-5 text-slate-600" />
              </div>
              <span className="font-medium text-slate-800">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.count !== undefined && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: '#f5f3f1', color: '#8A8076' }}>
                  {item.count}
                </span>
              )}
              {item.value && (
                <span className="text-sm text-slate-500">{item.value}</span>
              )}
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-6 mt-8">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-14 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Version */}
      <div className="text-center mt-8">
        <p className="text-slate-400 text-xs">Damai Putra Apps v1.0.0</p>
      </div>

      <BottomNav currentPage="Profile" />
    </div>
  );
}