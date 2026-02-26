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
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 50%, #e2ddd8 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.9)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/70" style={{ background: 'rgba(255,255,255,0.65)' }}>
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{destinationName}</p>
            <h1 className="font-bold text-lg text-slate-800 leading-tight">Tenant List</h1>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tenant..."
            className="w-full h-11 pl-10 pr-10 rounded-xl text-sm text-slate-700 placeholder-slate-400 border-0 outline-none" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)' }} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
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