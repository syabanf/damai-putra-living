import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function RegistrationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200/50">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>
        
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-10"
      >
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Account Created!
        </h1>
        
        <p className="text-slate-500 leading-relaxed max-w-xs">
          Welcome to Damai Putra community. Your account has been successfully verified.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full mt-12 space-y-4"
      >
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-2">What's Next?</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-teal-600 text-xs font-bold">1</span>
              </div>
              <span>Register your unit in "My Unit" section</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-teal-600 text-xs font-bold">2</span>
              </div>
              <span>Wait for management approval</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-teal-600 text-xs font-bold">3</span>
              </div>
              <span>Access digital permits & services</span>
            </li>
          </ul>
        </div>

        <Button
          onClick={() => navigate(createPageUrl('Login'))}
          className="w-full h-14 text-white rounded-2xl font-semibold text-base"
          style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 8px 24px rgba(138,128,118,0.35)' }}
        >
          Continue to Login
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}