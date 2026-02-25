import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Building2, Shield, Bell } from 'lucide-react';

export default function RegistrationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-10"
      style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>

      {/* Success icon */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }} className="relative mb-8">
        <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 20px 50px rgba(138,128,118,0.4)' }}>
          <CheckCircle className="w-14 h-14 text-white" />
        </div>
        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center border-4 border-white shadow-md">
          <Shield className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Account Created!</h1>
        <p className="text-slate-500 leading-relaxed max-w-xs">
          Welcome to Damai Putra. Your account has been successfully created.
        </p>
      </motion.div>

      {/* What's next cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="w-full space-y-3">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f3f1' }}>
              <Building2 className="w-5 h-5" style={{ color: '#8A8076' }} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Register Your Unit</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Add your property unit to access all management features and permits.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f3f1' }}>
              <Bell className="w-5 h-5" style={{ color: '#8A8076' }} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Enable Notifications</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Stay informed about permit approvals, announcements and updates.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full mt-8 space-y-3">
        <Button onClick={() => navigate(createPageUrl('Home'))}
          className="w-full h-14 text-white rounded-2xl font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 8px 24px rgba(138,128,118,0.35)' }}>
          Go to Home <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}