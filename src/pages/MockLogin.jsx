import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react';
import IonLogo from '@/components/brand/IonLogo';

const MOCK_ACCOUNTS = [
  {
    role: 'user',
    label: 'Resident / User',
    name: 'Budi Santoso',
    email: 'resident@example.com',
    password: 'demo1234',
    unit: 'Tower A - Unit 15',
    color: '#1684F2',
    gradient: 'linear-gradient(135deg, #1684F2 0%, #0B57C2 100%)',
    icon: User,
    description: 'Akses fitur resident: tiket, permit, rewards, dan undian',
  },
  {
    role: 'admin',
    label: 'Admin / Management',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin1234',
    unit: 'Management Office',
    color: '#231F20',
    gradient: 'linear-gradient(135deg, #231F20 0%, #231F20 100%)',
    icon: Shield,
    description: 'Akses panel admin: permit, refund, undian, dan manajemen',
  },
];

export default function MockLogin() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const account = selected !== null ? MOCK_ACCOUNTS[selected] : null;

  const handleLogin = () => {
    if (!account) return;
    setLoading(true);

    // Store mock session in localStorage
    const mockUser = {
      id: account.role === 'admin' ? 'mock-admin-001' : 'mock-user-001',
      email: account.email,
      full_name: account.name,
      role: account.role,
      unit: account.unit,
      mock: true,
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    localStorage.setItem('mock_role', account.role);

    setTimeout(() => {
      if (account.role === 'admin') {
        navigate('/AdminPermitDashboard');
      } else {
        navigate('/Home');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(160deg, #231F20 0%, #111214 60%, #091f28 100%)' }}>

      {/* BG decoration */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #1684F2, transparent)' }} />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #1684F2, transparent)' }} />

      {/* Back button */}
      <div className="relative z-10 px-5 pt-12">
        <button onClick={() => navigate('/Onboarding')}
          className="flex items-center gap-1.5 text-white/60 text-sm hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </button>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="w-36 rounded-2xl px-3 py-2 mb-5 border border-white/15"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
            <IonLogo className="w-full h-auto" />
          </div>
          <p className="text-white/50 text-[10px] tracking-widest uppercase mb-1">Demo Mode</p>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Pilih Akun<br />
            <span style={{ color: '#1684F2' }}>Demo Login</span>
          </h1>
          <p className="text-white/50 text-sm mt-2">Gunakan akun mock untuk mencoba fitur aplikasi</p>
        </motion.div>
      </div>

      {/* Account Cards */}
      <div className="relative z-10 px-5 space-y-3 flex-1">
        {MOCK_ACCOUNTS.map((acc, i) => {
          const Icon = acc.icon;
          const isSelected = selected === i;
          return (
            <motion.div
              key={acc.role}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              onClick={() => setSelected(isSelected ? null : i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(isSelected ? null : i);
                }
              }}
              className="w-full text-left rounded-2xl border-2 p-4 transition-all duration-200"
              style={{
                background: isSelected ? 'rgba(22,132,242,0.12)' : 'rgba(255,255,255,0.06)',
                borderColor: isSelected ? acc.color : 'rgba(255,255,255,0.1)',
              }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: acc.gradient }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-white text-sm">{acc.label}</p>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: acc.color, color: '#fff' }}>Dipilih</span>
                    )}
                  </div>
                  <p className="text-white/50 text-xs">{acc.name}</p>
                  <p className="text-white/35 text-[10px] mt-1 leading-relaxed">{acc.description}</p>
                </div>
              </div>

              {/* Credentials (shown when selected) */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.25)' }}>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Email</p>
                    <p className="text-white text-sm font-mono font-semibold">{acc.email}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.25)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Password</p>
                        <p className="text-white text-sm font-mono font-semibold">
                          {showPass ? acc.password : '••••••••'}
                        </p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setShowPass(v => !v); }}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {showPass ? <EyeOff className="w-4 h-4 text-white/60" /> : <Eye className="w-4 h-4 text-white/60" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Login Button */}
      <div className="relative z-10 px-5 py-6">
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: account ? 1 : 0.4, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleLogin}
          disabled={!account || loading}
          className="w-full h-14 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed"
          style={{
            background: account
              ? account.gradient
              : 'rgba(255,255,255,0.15)',
            boxShadow: account ? '0 8px 28px rgba(22,132,242,0.35)' : 'none',
          }}>
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {account ? `Masuk sebagai ${account.label}` : 'Pilih akun terlebih dahulu'}
              {account && <ArrowRight className="w-5 h-5" />}
            </>
          )}
        </motion.button>

        <p className="text-center text-white/30 text-xs mt-4">
          Ini adalah akun demo untuk keperluan testing
        </p>
      </div>
    </div>
  );
}
