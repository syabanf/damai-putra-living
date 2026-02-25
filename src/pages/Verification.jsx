import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, RefreshCw } from 'lucide-react';

export default function Verification() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') || 'email';
  const contact = urlParams.get('contact') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (code === '123456') {
      base44.auth.redirectToLogin(createPageUrl('Home'));
    } else {
      setError('Invalid verification code. Try 123456 for demo.');
      setLoading(false);
    }
  };

  const handleResend = () => {
    setResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const maskedContact = type === 'email'
    ? contact.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : contact.replace(/(.{3})(.*)(.{2})/, '$1****$3');

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="px-6 pt-12 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
          style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 12px 32px rgba(138,128,118,0.35)' }}
        >
          {type === 'email' ? (
            <Mail className="w-10 h-10 text-white" />
          ) : (
            <Phone className="w-10 h-10 text-white" />
          )}
        </motion.div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Verification Code
        </h1>
        
        <p className="text-slate-500 text-center mb-8 leading-relaxed">
          We've sent a 6-digit code to<br />
          <span className="text-slate-700 font-medium">{maskedContact}</span>
        </p>

        <div className="flex gap-3 mb-4" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none ${
                error
                  ? 'border-red-300 bg-red-50'
                  : digit
                    ? 'border-stone-500 bg-stone-50'
                    : 'border-slate-200 bg-slate-50 focus:border-teal-500'
              }`}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mb-4"
          >
            {error}
          </motion.p>
        )}

        <p className="text-slate-400 text-sm mb-8">
          Demo code: <span className="font-mono text-slate-600">123456</span>
        </p>

        <Button
          onClick={handleVerify}
          disabled={loading || otp.some(d => !d)}
          className="w-full h-14 text-white rounded-2xl font-semibold text-base disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 8px 24px rgba(138,128,118,0.35)' }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            'Verify Code'
          )}
        </Button>

        <div className="mt-8 text-center">
          {resendTimer > 0 ? (
            <p className="text-slate-400 text-sm">
              Resend code in <span className="text-teal-600 font-medium">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="flex items-center gap-2 font-medium" style={{ color: '#8A8076' }}
            >
              <RefreshCw className="w-4 h-4" />
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}