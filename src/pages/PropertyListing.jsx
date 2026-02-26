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
    <div className="min-h-screen" style={{ background: '#F4F5F7' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800 flex-1">Property</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search property..."
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
      <div className="px-5 py-3 bg-white border-b border-slate-100 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
              style={activeCategory === cat.value
                ? { background: '#1F86C7', color: '#fff' }
                : { background: '#f1f5f9', color: '#64748b' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-5 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
              <div className="w-full aspect-video bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-20" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
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