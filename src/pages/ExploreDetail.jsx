import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, MapPin, ExternalLink, ChevronRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExploreDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { data: destination, isLoading } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => base44.entities.Destination.filter({ id }),
    select: data => data?.[0],
    enabled: !!id,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants', id],
    queryFn: () => base44.entities.Tenant.filter({ destination_id: id }),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
        <div className="w-8 h-8 border-2 border-[#1F86C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
        <p className="text-slate-500">Destination not found.</p>
      </div>
    );
  }

  const allImages = [destination.hero_image, ...(destination.gallery || [])].filter(Boolean);

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 50%, #e2ddd8 100%)' }}>
      {/* Hero */}
      <div className="relative h-72 overflow-hidden bg-slate-200">
        {allImages.length > 0 ? (
          <>
            <img src={allImages[galleryIndex]} alt={destination.name}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setGalleryIndex(i)}
                    className={`rounded-full transition-all ${i === galleryIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-500" />
        )}

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 bg-black/35 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Destination name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
          <p className="text-white font-bold text-2xl leading-tight drop-shadow">{destination.name}</p>
          {destination.location && (
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-white/70" />
              <p className="text-white/70 text-sm">{destination.location}</p>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-5">
        {/* Description */}
        {destination.description && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)' }}>
            <p className="text-slate-600 text-sm leading-relaxed">{destination.description}</p>
          </motion.div>
        )}

        {/* Info Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl divide-y" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)', '--tw-divide-color': 'rgba(255,255,255,0.6)' }}>
          {destination.opening_hours && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#e8f4fb' }}>
                <Clock className="w-4.5 h-4.5" style={{ color: '#1F86C7', width: 18, height: 18 }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-semibold">Opening Hours</p>
                <p className="text-sm font-semibold text-slate-700">{destination.opening_hours}</p>
              </div>
            </div>
          )}
          {destination.location && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f5f3f0' }}>
                <MapPin className="w-4.5 h-4.5" style={{ color: '#8A7F73', width: 18, height: 18 }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-semibold">Location</p>
                <p className="text-sm font-semibold text-slate-700">{destination.location}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tenants */}
        {tenants.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800">Tenants</h2>
              <button onClick={() => navigate(createPageUrl('TenantList') + `?destination_id=${id}&destination_name=${encodeURIComponent(destination.name)}`)}
                className="text-xs font-semibold flex items-center gap-0.5" style={{ color: '#1F86C7' }}>
                See All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {tenants.slice(0, 6).map((tenant, i) => (
                <motion.div key={tenant.id}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.04 }}
                  onClick={() => navigate(createPageUrl('TenantDetail') + `?id=${tenant.id}`)}
                  className="rounded-2xl p-3 flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)' }}>
                  {tenant.logo_url ? (
                    <img src={tenant.logo_url} alt={tenant.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <p className="text-[11px] font-semibold text-slate-700 text-center leading-tight">{tenant.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* External link */}
        {destination.website_url && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <a href={destination.website_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl px-4 py-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#ecfdf5' }}>
                  <ExternalLink className="w-4 h-4" style={{ color: '#10b981', width: 16, height: 16 }} />
                </div>
                <p className="text-sm font-semibold text-slate-700">For More Information</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}