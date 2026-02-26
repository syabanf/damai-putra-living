import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Clock, Phone, Globe, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CulinaryDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const tenantId = params.get('id');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => base44.entities.Tenant.list().then(tenants => 
      tenants.find(t => t.id === tenantId)
    ),
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: tenant?.name, text: tenant?.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
        <div className="flex items-center justify-center h-screen">
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
        <div className="px-5 pt-12 pb-5 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.9)' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">Restaurant</h1>
        </div>
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-500">Restaurant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.9)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('Culinary'))} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">Restaurant</h1>
        </div>
        <button onClick={handleShare} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
          <Share2 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-4">
        {/* Logo / Image */}
        {tenant.logo_url && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden h-48">
            <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.08)' }}>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{tenant.name}</h2>
          {tenant.destination_name && (
            <p className="text-sm text-slate-500 mb-4">@ {tenant.destination_name}</p>
          )}

          <div className="space-y-3">
            {tenant.location_detail && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Location</p>
                  <p className="text-sm text-slate-700">{tenant.location_detail}</p>
                </div>
              </div>
            )}

            {tenant.opening_hours && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Hours</p>
                  <p className="text-sm text-slate-700">{tenant.opening_hours}</p>
                </div>
              </div>
            )}

            {tenant.contact && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Contact</p>
                  <p className="text-sm text-slate-700">{tenant.contact}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Description */}
        {tenant.description && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.08)' }}>
            <h3 className="font-bold text-slate-800 mb-2">About</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{tenant.description}</p>
          </motion.div>
        )}

        {/* Action Button */}
        {tenant.contact && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <a href={`https://wa.me/${tenant.contact.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl font-semibold text-white text-center transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1FB6D5 0%, #169ab5 100%)', boxShadow: '0 4px 12px rgba(31,182,213,0.3)' }}>
              Message on WhatsApp
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}