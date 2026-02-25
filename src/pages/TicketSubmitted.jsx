import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ArrowRight, Bell, FileCheck } from 'lucide-react';

export default function TicketSubmitted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative"
      >
        <div className="w-28 h-28 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50">
          <FileCheck className="w-14 h-14 text-white" />
        </div>
        
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center border-4 border-white"
        >
          <CheckCircle className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-8"
      >
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Request Submitted!
        </h1>
        
        <p className="text-slate-500 leading-relaxed max-w-xs">
          Your permit request has been submitted successfully and is pending review.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full mt-10 space-y-4"
      >
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800">Under Review</h3>
              <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                Management will review your request and respond within 1-2 business days.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">What's Next?</h3>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                Once approved, you'll receive a digital permit with a QR code that can be shown to security.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate(createPageUrl('Tickets'))}
          className="w-full h-14 text-white rounded-2xl font-semibold text-base mt-4"
          style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 8px 24px rgba(138,128,118,0.35)' }}
        >
          View My Tickets
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Home'))}
          className="w-full h-12 text-slate-600"
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}