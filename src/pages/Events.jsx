import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, CalendarDays, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_BG, GlassHeader, GlassCard, Chip, SearchBar } from '@/components/ui/DesignSystem';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'food', label: 'Foods' },
  { value: 'music', label: 'Music' },
  { value: 'sport', label: 'Sport' },
  { value: 'festival', label: 'Festival' },
  { value: 'community', label: 'Community' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'wellness', label: 'Wellness' },
];

const STATUS_COLOR = {
  ongoing: { bg: '#ecfdf5', text: '#10b981', label: 'Ongoing' },
  upcoming: { bg: '#e8f4fb', text: '#1F86C7', label: 'Upcoming' },
  past: { bg: 'rgba(255,255,255,0.6)', text: '#94a3b8', label: 'Past' },
};

function formatDateRange(start, end) {
  const fmt = d => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
  };
  if (!end || start === end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function Events() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_date'),
  });

  const filtered = useMemo(() => {
    let list = events;
    if (activeCategory !== 'all') list = list.filter(e => e.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, activeCategory, search]);

  return (
    <div className="min-h-screen pb-28" style={{ background: PAGE_BG }}>
      {/* Header */}
      <GlassHeader className="pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8A7F73' }}>Damai Putra</p>
            <h1 className="font-bold text-2xl text-slate-800">Events</h1>
          </div>
          <button onClick={() => navigate(createPageUrl('EventsCalendar'))}
            className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/70 shadow-sm"
            style={{ background: 'rgba(255,255,255,0.65)' }}>
            <Calendar className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search events..." />
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

      {/* Event List */}
      <div className="px-4 py-5 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <div className="w-full h-44 bg-slate-200/50" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200/50 rounded w-3/4" />
                <div className="h-3 bg-slate-200/50 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CalendarDays className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No events found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          filtered.map((event, i) => {
            const statusCfg = STATUS_COLOR[event.status] || STATUS_COLOR.upcoming;
            return (
              <motion.div key={event.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => navigate(createPageUrl('EventDetail') + `?id=${event.id}`)}
                className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)' }}>
                <div className="relative h-44">
                  <img src={event.banner_image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'}
                    alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                  <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: statusCfg.bg, color: statusCfg.text }}>
                    {statusCfg.label}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="font-bold text-slate-800 text-sm leading-snug">{event.title}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500">{formatDateRange(event.start_date, event.end_date)}</p>
                  </div>
                  {event.location && <p className="text-xs text-slate-400 mt-0.5 ml-5">{event.location}</p>}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
}