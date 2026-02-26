import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, X, MapPin, Compass, Map } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen pb-40" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 rounded-b-[2rem] relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative">
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Damai Putra Living</p>
            <h1 className="font-bold text-2xl text-white">Explore</h1>
          </div>
          <button
           onClick={() => navigate(createPageUrl('TransportExploreMap?mode=explore'))}
           className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
           style={{ background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)', boxShadow: '0 2px 8px rgba(31,182,213,0.2)' }}
           title="View on Map"
          >
            <Map className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="relative rounded-xl flex items-center gap-2 px-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <Search className="w-4 h-4 text-white/60 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search destination..."
            className="flex-1 h-10 bg-transparent text-sm text-white placeholder-white/50 border-0 outline-none" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-white/60" /></button>}
        </div>
      </div>

      {/* Category chips */}
      <div className="px-5 py-3 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95"
              style={activeCategory === cat.value
                ? { background: 'linear-gradient(135deg, #1F86C7, #1669a0)', color: '#fff', boxShadow: '0 3px 10px rgba(31,134,199,0.35)' }
                : { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', color: '#64748b' }
              }>{cat.label}</button>
          ))}
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