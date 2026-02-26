import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, X } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'kavling', label: 'Kavling' },
  { value: 'bizpark', label: 'Bizpark' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
];

export default function PropertyListing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const filtered = useMemo(() => {
    let list = properties;
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.cluster?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [properties, activeCategory, search]);

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 rounded-b-[2rem] relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 relative">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.28)' }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Damai Putra Living</p>
            <h1 className="font-bold text-xl text-white">Property</h1>
          </div>
        </div>
        <div className="relative rounded-xl flex items-center gap-2 px-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <Search className="w-4 h-4 text-white/60 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search property..."
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
                ? { background: 'linear-gradient(135deg, #1FB6D5, #169ab5)', color: '#fff', boxShadow: '0 3px 10px rgba(31,182,213,0.35)' }
                : { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', color: '#64748b' }
              }>{cat.label}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-5 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)' }}>
              <div className="w-full aspect-video bg-slate-300/50" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-300/50 rounded w-20" />
                <div className="h-5 bg-slate-300/50 rounded w-3/4" />
                <div className="h-3 bg-slate-300/50 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No properties found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          filtered.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </div>
    </div>
  );
}