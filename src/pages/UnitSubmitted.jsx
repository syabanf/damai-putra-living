import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ArrowRight, Bell } from 'lucide-react';

export default function UnitSubmitted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative"
      >
        <div className="w-28 h-28 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-200/50">
          <CheckCircle className="w-14 h-14 text-white" />
        </div>
        
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center border-4 border-white"
        >
          <Clock className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-8"
      >
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Registration Submitted!
        </h1>
        
        <p className="text-slate-500 leading-relaxed max-w-xs">
          Your unit registration has been submitted and is pending approval from management.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full mt-10 space-y-4"
      >
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">Pending Review</h3>
              <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                Management will review your application within 1-3 business days.
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
              <h3 className="font-semibold text-slate-800">Stay Notified</h3>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                You'll receive a notification once your unit is approved or if additional information is needed.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate(createPageUrl('MyUnit'))}
          className="w-full h-14 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-2xl font-semibold text-base shadow-lg shadow-teal-200/50 mt-4"
        >
          View My Units
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