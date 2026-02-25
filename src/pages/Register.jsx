import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Mail, Phone, Lock, Eye, EyeOff, User, ArrowLeft, Check } from 'lucide-react';

const BRAND = '#8A8076';
const BRAND_DARK = '#6e6560';

export default function Register() {
  const navigate = useNavigate();
  const [registerType, setRegisterType] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (registerType === 'email') {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    } else {
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^[0-9]{10,13}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    navigate(createPageUrl('Verification') + `?type=${registerType}&contact=${registerType === 'email' ? formData.email : formData.phone}`);
  };

  const passwordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6">
        <button
          onClick={() => navigate(createPageUrl('Onboarding'))}
          className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f5f3f1' }}>
            <Building2 className="w-5 h-5" style={{ color: BRAND }} />
          </div>
          <span className="text-sm font-medium" style={{ color: BRAND }}>Damai Putra</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mt-4">Create Account</h1>
        <p className="text-slate-500 mt-2">Join our community of residents</p>
      </div>

      <div className="px-6">
        <div className="flex gap-2 p-1 bg-stone-100 rounded-xl mb-6">
          {['email', 'phone'].map((type) => (
            <button
              key={type}
              onClick={() => setRegisterType(type)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                registerType === type ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              {type === 'email' ? <><Mail className="w-4 h-4 inline mr-2" />Email</> : <><Phone className="w-4 h-4 inline mr-2" />Phone</>}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <Input type="text" placeholder="Enter your full name" value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`pl-12 h-14 bg-stone-50 border-stone-200 rounded-xl ${errors.fullName ? 'border-red-300 bg-red-50' : ''}`} />
            </div>
            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
          </div>

          {registerType === 'email' ? (
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input type="email" placeholder="Enter your email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`pl-12 h-14 bg-stone-50 border-stone-200 rounded-xl ${errors.email ? 'border-red-300 bg-red-50' : ''}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input type="tel" placeholder="Enter your phone number" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`pl-12 h-14 bg-stone-50 border-stone-200 rounded-xl ${errors.phone ? 'border-red-300 bg-red-50' : ''}`} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`pl-12 pr-12 h-14 bg-stone-50 border-stone-200 rounded-xl ${errors.password ? 'border-red-300 bg-red-50' : ''}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="w-5 h-5 text-stone-400" /> : <Eye className="w-5 h-5 text-stone-400" />}
              </button>
            </div>
            {formData.password && (
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                    passwordStrength() >= level
                      ? level <= 1 ? 'bg-red-400' : level <= 2 ? 'bg-amber-400' : level <= 3 ? 'bg-stone-400' : 'bg-emerald-500'
                      : 'bg-stone-200'
                  }`} />
                ))}
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`pl-12 h-14 bg-stone-50 border-stone-200 rounded-xl ${errors.confirmPassword ? 'border-red-300 bg-red-50' : ''}`} />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              )}
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-start gap-3">
            <Checkbox id="terms" checked={formData.agreeTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked })} className="mt-0.5" />
            <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
              I agree to the <span className="font-medium" style={{ color: BRAND }}>Terms of Service</span> and{' '}
              <span className="font-medium" style={{ color: BRAND }}>Privacy Policy</span>
            </label>
          </div>
          {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}

          <Button type="submit" disabled={loading}
            className="w-full h-14 text-white rounded-2xl font-semibold text-base mt-4"
            style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, boxShadow: '0 8px 24px rgba(138,128,118,0.35)' }}>
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-slate-500 mt-8 pb-8">
          Already have an account?{' '}
          <button onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))} className="font-semibold" style={{ color: BRAND }}>Sign In</button>
        </p>
      </div>
    </div>
  );
}