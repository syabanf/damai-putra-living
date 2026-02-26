import React from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, MapPin, Phone, Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_LABELS = {
  food_beverage: 'Food & Beverage',
  fashion: 'Fashion',
  beauty: 'Beauty & Wellness',
  entertainment: 'Entertainment',
  sport: 'Sport',
  services: 'Services',
  retail: 'Retail',
  education: 'Education',
  health: 'Health',
};

export default function TenantDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => base44.entities.Tenant.filter({ id }),
    select: data => data?.[0],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
        <div className="w-8 h-8 border-2 border-[#1F86C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
        <p className="text-slate-500">Tenant not found.</p>
      </div>
    );
  }

  const handleContact = () => {
    if (tenant.contact) {
      const num = tenant.contact.replace(/\D/g, '');
      window.open(`https://wa.me/${num}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 55%, #e2ddd8 100%)' }}>
      {/* Header area */}
      <div className="pb-8 rounded-b-[2rem] relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="px-5 pt-14 pb-4 relative">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.28)' }}>
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex flex-col items-center px-5 pb-2">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name}
              className="w-24 h-24 rounded-2xl object-cover shadow-xl border-2 border-white/30" />
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}>
              <Users className="w-10 h-10 text-white/70" />
            </div>
          )}
          <h1 className="font-bold text-xl text-white mt-3">{tenant.name}</h1>
          {tenant.category && (
            <span className="mt-1.5 text-xs px-3 py-1 rounded-full font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              {CATEGORY_LABELS[tenant.category] || tenant.category}
            </span>
          )}
          {tenant.destination_name && (
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className="w-3.5 h-3.5 text-white/60" />
              <p className="text-sm text-white/70">{tenant.destination_name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Description */}
        {tenant.description && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)' }}>
            <p className="text-slate-600 text-sm leading-relaxed">{tenant.description}</p>
          </motion.div>
        )}

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl divide-y" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)' }}>
          {tenant.opening_hours && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#e8f4fb' }}>
                <Clock style={{ color: '#1F86C7', width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Opening Hours</p>
                <p className="text-sm font-semibold text-slate-700">{tenant.opening_hours}</p>
              </div>
            </div>
          )}
          {tenant.location_detail && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f5f3f0' }}>
                <MapPin style={{ color: '#8A7F73', width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Location</p>
                <p className="text-sm font-semibold text-slate-700">{tenant.location_detail}</p>
              </div>
            </div>
          )}
          {tenant.contact && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#ecfdf5' }}>
                <Phone style={{ color: '#10b981', width: 18, height: 18 }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-semibold">Contact</p>
                <p className="text-sm font-semibold text-slate-700">{tenant.contact}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        {tenant.contact && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={handleContact}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #1F86C7, #1669a0)' }}>
            <Phone className="w-4 h-4" />
            Contact via WhatsApp
          </motion.button>
        )}
      </div>
    </div>
  );
}