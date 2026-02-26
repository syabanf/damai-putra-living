import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, X, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_LABELS = {
  food_beverage: 'F&B',
  fashion: 'Fashion',
  beauty: 'Beauty',
  entertainment: 'Entertainment',
  sport: 'Sport',
  services: 'Services',
  retail: 'Retail',
  education: 'Education',
  health: 'Health',
};

export default function TenantList() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const destinationId = params.get('destination_id');
  const destinationName = params.get('destination_name') || 'Destination';
  const [search, setSearch] = useState('');

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants', destinationId],
    queryFn: () => base44.entities.Tenant.filter({ destination_id: destinationId }),
    enabled: !!destinationId,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return tenants;
    const q = search.toLowerCase();
    return tenants.filter(t =>
      t.name?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  }, [tenants, search]);

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 55%, #e2ddd8 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 rounded-b-[2rem] relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 relative">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.28)' }}>
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">{destinationName}</p>
            <h1 className="font-bold text-xl text-white leading-tight">Tenant List</h1>
          </div>
        </div>
        <div className="relative rounded-xl flex items-center gap-2 px-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <Search className="w-4 h-4 text-white/60 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenant..."
            className="flex-1 h-10 bg-transparent text-sm text-white placeholder-white/50 border-0 outline-none" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-white/60" /></button>}
        </div>
      </div>

      <div className="px-4 py-5">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 aspect-square animate-pulse" style={{ background: 'rgba(255,255,255,0.55)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No tenants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((tenant, i) => (
              <motion.div key={tenant.id}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(createPageUrl('TenantDetail') + `?id=${tenant.id}`)}
                className="rounded-2xl p-3 flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
                {tenant.logo_url ? (
                  <img src={tenant.logo_url} alt={tenant.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <p className="text-[11px] font-semibold text-slate-700 text-center leading-tight">{tenant.name}</p>
                {tenant.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                    {CATEGORY_LABELS[tenant.category] || tenant.category}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}