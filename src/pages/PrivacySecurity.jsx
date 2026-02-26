import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Bell, Database, Trash2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_BG, GlassHeader, GlassCard } from '@/components/ui/DesignSystem';

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="w-11 h-6 rounded-full transition-all flex-shrink-0 relative"
      style={{ background: value ? '#1FB6D5' : 'rgba(0,0,0,0.12)' }}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export default function PrivacySecurity() {
  const navigate = useNavigate();
  const [biometric, setBiometric] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="min-h-screen pb-10" style={{ background: PAGE_BG }}>
      <GlassHeader className="pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/70" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">Privacy & Security</h1>
        </div>
      </GlassHeader>

      {/* Hero */}
      <div className="mx-4 mt-5 rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #1FB6D5, #169ab5)', boxShadow: '0 4px 16px rgba(31,182,213,0.3)' }}>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-base">Your Privacy Matters</p>
          <p className="text-white/70 text-xs mt-0.5">Manage how your data is used and secured</p>
        </div>
      </div>

      {/* Security */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: '#8A7F73' }}>Security</p>
        <GlassCard className="overflow-hidden divide-y" style={{ '--tw-divide-opacity': 1 }}>
          {[
            { icon: Lock, iconBg: '#e6f8fb', iconColor: '#1FB6D5', label: 'Biometric Login', desc: 'Use fingerprint or face ID', toggle: true, value: biometric, onChange: setBiometric },
            { icon: Lock, iconBg: '#fffbeb', iconColor: '#d97706', label: 'Change Password', desc: 'Update your account password' },
            { icon: Shield, iconBg: '#ecfdf5', iconColor: '#10b981', label: 'Two-Factor Authentication', desc: 'Add an extra layer of protection' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              {item.toggle ? <Toggle value={item.value} onChange={item.onChange} /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Privacy */}
      <div className="px-4 mt-4">
        <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: '#8A7F73' }}>Privacy</p>
        <GlassCard className="overflow-hidden">
          {[
            { icon: Bell, iconBg: '#ecfdf5', iconColor: '#10b981', label: 'Push Notifications', desc: 'Receive permit & unit updates', toggle: true, value: notifications, onChange: setNotifications },
            { icon: Database, iconBg: '#f5f3f0', iconColor: '#8A7F73', label: 'Activity Tracking', desc: 'Help us improve the app experience', toggle: true, value: activityTracking, onChange: setActivityTracking },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4" style={{ borderBottom: idx === 0 ? '1px solid rgba(255,255,255,0.6)' : 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Data & Legal */}
      <div className="px-4 mt-4">
        <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: '#8A7F73' }}>Your Data</p>
        <GlassCard className="overflow-hidden">
          {[
            { icon: Database, iconBg: 'rgba(255,255,255,0.5)', iconColor: '#64748b', label: 'Download My Data', desc: 'Request a copy of your personal data' },
            { icon: Lock, iconBg: 'rgba(255,255,255,0.5)', iconColor: '#64748b', label: 'Privacy Policy', desc: '' },
            { icon: Lock, iconBg: 'rgba(255,255,255,0.5)', iconColor: '#64748b', label: 'Terms of Service', desc: '' },
          ].map((item, idx) => (
            <button key={idx} className="flex items-center gap-4 p-4 w-full text-left active:bg-white/50"
              style={{ borderBottom: idx < 2 ? '1px solid rgba(255,255,255,0.6)' : 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                {item.desc && <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          ))}
        </GlassCard>
      </div>

      {/* Delete Account */}
      <div className="px-4 mt-4">
        <button onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-4 p-4 w-full rounded-2xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-red-600">Delete Account</p>
        </button>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="rounded-3xl p-6 w-full max-w-sm"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)' }}>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 text-center">Delete Account?</h3>
            <p className="text-slate-500 text-sm text-center mt-2 leading-relaxed">
              This action is permanent. All your units, permits, and data will be removed.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-semibold text-slate-700 text-sm border border-white/70"
                style={{ background: 'rgba(255,255,255,0.65)' }}>Cancel</button>
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-semibold bg-red-500 text-white text-sm">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}