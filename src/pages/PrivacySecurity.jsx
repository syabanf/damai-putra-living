import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, Bell, Database, Trash2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const Section = ({ title, children }) => (
  <div className="px-4 mt-5">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{title}</p>
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {children}
    </div>
  </div>
);

const Row = ({ icon: Icon, iconBg, iconColor, label, description, right }) => (
  <div className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`} style={{ background: iconBg }}>
      <Icon className="w-5 h-5" style={{ color: iconColor }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    {right}
  </div>
);

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${value ? 'bg-[#1F86C7]' : 'bg-slate-200'}`}>
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
    <div className="min-h-screen pb-10" style={{ background: '#F4F5F7' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">Privacy & Security</h1>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-5 rounded-2xl p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1F86C7, #1669a0)' }}>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-base">Your Privacy Matters</p>
          <p className="text-white/70 text-xs mt-0.5">Manage how your data is used and secured</p>
        </div>
      </div>

      {/* Security */}
      <Section title="Security">
        <Row icon={Lock} iconBg="#e8f4fb" iconColor="#1F86C7"
          label="Biometric Login"
          description="Use fingerprint or face ID to sign in"
          right={<Toggle value={biometric} onChange={setBiometric} />} />
        <button onClick={() => {}} className="flex items-center gap-4 p-4 border-b border-slate-100 w-full active:bg-slate-50">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-slate-700">Change Password</p>
            <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
        <button onClick={() => {}} className="flex items-center gap-4 p-4 w-full active:bg-slate-50">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-slate-700">Two-Factor Authentication</p>
            <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of protection</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
      </Section>

      {/* Privacy */}
      <Section title="Privacy">
        <Row icon={Bell} iconBg="#ecfdf5" iconColor="#10b981"
          label="Push Notifications"
          description="Receive updates on permits and units"
          right={<Toggle value={notifications} onChange={setNotifications} />} />
        <Row icon={Eye} iconBg="#f5f3f0" iconColor="#8A7F73"
          label="Activity Tracking"
          description="Help us improve the app experience"
          right={<Toggle value={activityTracking} onChange={setActivityTracking} />} />
      </Section>

      {/* Data */}
      <Section title="Your Data">
        <button onClick={() => {}} className="flex items-center gap-4 p-4 border-b border-slate-100 w-full active:bg-slate-50">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100">
            <Database className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-slate-700">Download My Data</p>
            <p className="text-xs text-slate-400 mt-0.5">Request a copy of your personal data</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
        <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-4 p-4 w-full active:bg-red-50">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-50">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-red-600">Delete Account</p>
            <p className="text-xs text-slate-400 mt-0.5">Permanently remove your account and data</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
      </Section>

      {/* Policy links */}
      <Section title="Legal">
        <button onClick={() => {}} className="flex items-center gap-4 p-4 border-b border-slate-100 w-full active:bg-slate-50">
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-slate-700">Privacy Policy</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
        <button onClick={() => {}} className="flex items-center gap-4 p-4 w-full active:bg-slate-50">
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-slate-700">Terms of Service</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
      </Section>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 text-center">Delete Account?</h3>
            <p className="text-slate-500 text-sm text-center mt-2 leading-relaxed">
              This action is permanent and cannot be undone. All your units, permits, and data will be removed.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-semibold border border-slate-200 text-slate-700 text-sm">
                Cancel
              </button>
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-semibold bg-red-500 text-white text-sm">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}