import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, X, RefreshCw, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'retail', label: 'Retail & Mall' },
  { value: 'culinary', label: 'Culinary' },
  { value: 'attraction', label: 'Attraction' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'community', label: 'Community' },
];

export default function Explore() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: destinations = [], isLoading, refetch } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => base44.entities.Destination.list(),
  });

  const filtered = useMemo(() => {
    let list = destinations;
    if (activeCategory !== 'all') list = list.filter(d => d.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.location?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [destinations, activeCategory, search]);

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F4F5F7' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Damai Putra</p>
            <h1 className="font-bold text-2xl text-slate-800">Explore</h1>
          </div>
          <button onClick={() => refetch()}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50 active:scale-95 transition-transform">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tenant, destination..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-100 text-sm text-slate-700 placeholder-slate-400 border-0 outline-none focus:ring-2 focus:ring-[#1F86C7]/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-5 py-3 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 w-max">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={activeCategory === cat.value
                  ? { background: '#1F86C7', color: '#fff' }
                  : { background: '#f1f5f9', color: '#64748b' }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Destination Grid */}
      <div className="px-4 pt-5">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No destinations found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((dest, i) => (
              <motion.div key={dest.id}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(createPageUrl('ExploreDetail') + `?id=${dest.id}`)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-sm">
                <img src={dest.hero_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'}
                  alt={dest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <p className="text-white font-bold text-sm leading-tight drop-shadow">{dest.name}</p>
                  {dest.location && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-white/70" />
                      <p className="text-white/70 text-[10px]">{dest.location}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav currentPage="Explore" />
    </div>
  );
}