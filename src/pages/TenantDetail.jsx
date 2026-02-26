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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F7' }}>
        <div className="w-8 h-8 border-2 border-[#1F86C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F7' }}>
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
    <div className="min-h-screen pb-10" style={{ background: '#F4F5F7' }}>
      {/* Header area */}
      <div className="bg-white pb-6 shadow-sm">
        <div className="px-5 pt-12 pb-4">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50 mb-4">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="flex flex-col items-center px-5">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name}
              className="w-24 h-24 rounded-2xl object-cover shadow-md border border-slate-100" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center shadow-md">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
          )}
          <h1 className="font-bold text-xl text-slate-800 mt-3">{tenant.name}</h1>
          {tenant.category && (
            <span className="mt-1.5 text-xs px-3 py-1 rounded-full font-semibold" style={{ background: '#e8f4fb', color: '#1F86C7' }}>
              {CATEGORY_LABELS[tenant.category] || tenant.category}
            </span>
          )}
          {tenant.destination_name && (
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-sm text-slate-500">{tenant.destination_name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Description */}
        {tenant.description && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-slate-600 text-sm leading-relaxed">{tenant.description}</p>
          </motion.div>
        )}

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
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