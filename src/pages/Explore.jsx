import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, X, MapPin, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_BG, GlassHeader, Chip, SearchBar } from '@/components/ui/DesignSystem';

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

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => base44.entities.Destination.list(),
  });

  const featured = destinations.filter(d => d.is_featured);
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
    <div className="min-h-screen pb-28" style={{ background: PAGE_BG }}>
      {/* Header */}
      <GlassHeader className="pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8A7F73' }}>Damai Putra</p>
            <h1 className="font-bold text-2xl text-slate-800">Explore</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8A7F73, #5a524e)' }}>
            <Compass className="w-5 h-5 text-white" />
          </div>
        </div>
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search destination..." />
      </GlassHeader>

      {/* Category chips */}
      <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.7)' }}>
        <div className="px-5 py-3 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 w-max">
            {CATEGORIES.map(cat => (
              <Chip key={cat.value} label={cat.label} active={activeCategory === cat.value} onClick={() => setActiveCategory(cat.value)} />
            ))}
          </div>
        </div>
      </div>

      {/* Featured */}
      {activeCategory === 'all' && !search && featured.length > 0 && (
        <div className="pt-5 pb-1">
          <div className="flex items-center justify-between px-5 mb-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8A7F73' }}>Featured</p>
          </div>
          <div className="px-4 flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {featured.map((dest, i) => (
              <motion.div key={dest.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => navigate(createPageUrl('ExploreDetail') + `?id=${dest.id}`)}
                className="flex-shrink-0 w-56 h-36 rounded-2xl overflow-hidden relative cursor-pointer active:scale-95 transition-transform shadow-md">
                <img src={dest.hero_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'} alt={dest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm leading-tight">{dest.name}</p>
                  {dest.location && <p className="text-white/70 text-[10px] mt-0.5">{dest.location}</p>}
                </div>
                <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-white">Featured</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Destinations Grid */}
      <div className="px-4 pt-5">
        {(activeCategory !== 'all' || search) && (
          <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: '#8A7F73' }}>
            {filtered.length} Result{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
        {!search && activeCategory === 'all' && (
          <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: '#8A7F73' }}>All Destinations</p>
        )}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.5)' }} />
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
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                onClick={() => navigate(createPageUrl('ExploreDetail') + `?id=${dest.id}`)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-sm">
                <img src={dest.hero_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'} alt={dest.name} className="w-full h-full object-cover" />
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

    </div>
  );
}