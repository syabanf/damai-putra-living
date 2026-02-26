import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(createPageUrl('Onboarding'));
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background lifestyle image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=90')`,
        }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* Logo mark */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/30"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
            <img
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&q=80"
              alt="DP"
              className="w-10 h-10 rounded-xl object-cover"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/60 text-xs tracking-[0.25em] uppercase mb-1"
          >
            Damai Putra Group
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="text-4xl font-bold text-white tracking-tight text-center leading-tight"
          >
            Damai Putra
            <br />
            <span style={{ color: '#1F86C7' }}>Living</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-white/50 text-sm mt-3 tracking-wider text-center"
          >
            Your Premium Lifestyle Companion
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="relative z-10 mb-14"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}