import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';

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
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=90')`,
        }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(7,20,34,0.62) 56%, rgba(0,0,0,0.92) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <div className="w-64 rounded-3xl flex items-center justify-center mb-7 px-6 py-5 border border-white/40"
            style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(16px)', boxShadow: '0 18px 60px rgba(0,0,0,0.28)' }}>
            <img src="/ion-logo.png" alt="ION Network" className="w-full h-auto object-contain" />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/60 text-xs tracking-[0.25em] uppercase mb-1"
          >
            NETWORK
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="text-4xl font-bold text-white tracking-tight text-center leading-tight"
          >
            ION
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-white/50 text-sm mt-3 tracking-wider text-center"
          >
            Connected service experience
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="relative z-10 mb-14 flex flex-col items-center gap-4"
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
        <button
          onClick={() => { clearTimeout(); navigate('/MockLogin'); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white/60 hover:text-white transition-all border border-white/15 hover:border-white/30"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          Demo Login
        </button>
      </motion.div>
    </div>
  );
}
