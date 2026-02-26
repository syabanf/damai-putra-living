import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bell, ChevronRight, Building2, Phone, CalendarDays, Bus,
  Compass, UtensilsCrossed, Sparkles, Heart, Globe,
  ChevronLeft, ArrowRight, Tag, Newspaper, FileText, Home as HomeIcon, MapPin
} from 'lucide-react';

/* ── helpers ── */
const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl overflow-hidden ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.08)' }}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, onViewAll }) => (
  <div className="flex justify-between items-center mb-3 px-4">
    <h2 className="font-bold text-base" style={{ color: '#2E2E2E' }}>{title}</h2>
    {onViewAll && (
      <button onClick={onViewAll} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: '#1FB6D5' }}>
        View All <ChevronRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

/* ── static data ── */
const HERO_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    headline: 'The Future of the City\nComes to Life Here',
    sub: 'Damai Putra Township',
  },
  {
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    headline: 'Modern Living\nin Harmony',
    sub: 'World-Class Amenities',
  },
  {
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    headline: 'Your Smart\nCommunity Hub',
    sub: 'Digital Services at Your Fingertips',
  },
];

const QUICK_FEATURES = [
  { icon: Building2,       label: 'Property',   color: '#1FB6D5', bg: '#e6f8fb', page: 'PropertyListing' },
  { icon: HomeIcon,        label: 'My Unit',    color: '#8E8478', bg: '#f5f3f0', page: 'MyUnit' },
  { icon: FileText,        label: 'Permits',    color: '#0F3D4C', bg: '#e6eef0', page: 'Tickets' },
  { icon: Phone,           label: 'Hotline',    color: '#ef4444', bg: '#fef2f2', page: 'HelpCenter' },
  { icon: CalendarDays,    label: 'Events',     color: '#f59e0b', bg: '#fffbeb', page: 'Events' },
  { icon: UtensilsCrossed, label: 'Culinary',   color: '#f97316', bg: '#fff7ed', page: 'Culinary' },
  { icon: Newspaper,       label: 'News',       color: '#8b5cf6', bg: '#faf5ff', page: 'News' },
  { icon: Bus,             label: 'Transport',  color: '#06b6d4', bg: '#ecf9fb', page: 'Transport' },
  { icon: MapPin,          label: 'Explore',    color: '#8E8478', bg: '#f5f3f0', page: 'Explore' },
  { icon: Sparkles,        label: 'Rewards',    color: '#1FB6D5', bg: '#e6f8fb', page: 'Rewards' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'zh', label: '中文 (Mandarin)' },
];

const NEWS = [
  { id: 1, title: 'ASG News February 2026', date: '13 Feb 2026', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80' },
  { id: 2, title: 'Township Development Update Q1', date: '01 Feb 2026', img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80' },
  { id: 3, title: 'New Amenities Opening Soon', date: '20 Jan 2026', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80' },
];

const EVENTS = [
  { id: 1, title: 'Galloping Fortune', date: '09 Feb – 28 Feb 2026', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80' },
  { id: 2, title: 'Spring Garden Festival', date: '01 Mar – 15 Mar 2026', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80' },
];

const DEALS = [
  { id: 1, title: 'Ramadhan Bazaar 2026', date: '24 Feb 2026', tag: 'BAZAAR', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80' },
  { id: 2, title: 'Food & Beverage Fiesta', date: '05 Mar 2026', tag: 'PROMO', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
  { id: 3, title: 'Weekend Property Fair', date: '15 Mar 2026', tag: 'FAIR', img: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400&q=80' },
];

/* ─────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [slide, setSlide] = useState(0);
  const [lang, setLang] = useState('en');
  const [showLang, setShowLang] = useState(false);
  const slideTimer = useRef(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  /* auto-advance carousel */
  useEffect(() => {
    slideTimer.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(slideTimer.current);
  }, []);

  const goSlide = (n) => {
    clearInterval(slideTimer.current);
    setSlide((slide + n + HERO_SLIDES.length) % HERO_SLIDES.length);
    slideTimer.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user?.email, read: false }),
    enabled: !!user?.email,
  });

  const unreadCount = notifications.length;
  const currentLang = LANGUAGES.find(l => l.code === lang);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>

      {/* ── 1. HERO BANNER ── */}
      <div className="relative h-64 overflow-hidden">
        {HERO_SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(20,16,12,0.72) 0%, rgba(20,16,12,0.18) 55%, transparent 100%)' }} />
          </div>
        ))}

        {/* top bar */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-4 flex justify-between items-center z-10">
          <div>
            <p className="text-white/70 text-xs">Welcome back,</p>
            <p className="text-white font-bold text-lg leading-tight">{user?.full_name?.split(' ')[0] || 'Guest'}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button onClick={() => setShowLang(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 bg-black/30 backdrop-blur-sm rounded-xl border border-white/20 text-white text-xs font-semibold">
                <Globe className="w-3.5 h-3.5" />
                {currentLang?.code.toUpperCase()}
              </button>
              {showLang && (
                <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 w-44">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLang(l.code); setShowLang(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${lang === l.code ? 'font-bold text-stone-700' : 'text-slate-600'}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Bell */}
            <button onClick={() => navigate(createPageUrl('Notifications'))}
              className="relative w-9 h-9 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Bell className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ width: 18, height: 18 }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* headline */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
          <p className="text-white font-bold text-xl leading-snug whitespace-pre-line">{HERO_SLIDES[slide].headline}</p>
          <p className="text-white/60 text-xs mt-1">{HERO_SLIDES[slide].sub}</p>
        </div>

        {/* carousel controls */}
        <button onClick={() => goSlide(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/25 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button onClick={() => goSlide(1)} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/25 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>

        {/* dots */}
        <div className="absolute bottom-14 right-5 flex gap-1 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${i === slide ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* ── 2. QUICK ACCESS ── */}
      <div className="mt-5">
        <SectionHeader title="Quick Access" />
        <div className="px-4 grid grid-cols-4 gap-3">
          {QUICK_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.button key={f.label}
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.035 }}
                onClick={() => f.page ? navigate(createPageUrl(f.page)) : null}
                className="flex flex-col items-center gap-2 py-3 px-1 rounded-2xl active:scale-95 transition-transform"
                style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(138,127,115,0.08)' }}>
                <Icon className="w-6 h-6" style={{ color: f.color }} />
                <span className="text-[10px] font-semibold text-center leading-tight text-slate-600">{f.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── 3. PROMO / CTA ── */}
      <div className="mt-6 mx-4">
        <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0F3D4C 0%, #0a2d38 100%)', boxShadow: '0 4px 20px rgba(15,61,76,0.3)' }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -left-4 -bottom-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative px-5 py-5">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Exclusive Membership</p>
            <h3 className="text-white font-bold text-lg leading-snug mb-2">Join Damai Putra Living and get access to various rewards and benefits!</h3>
            <button onClick={() => navigate(createPageUrl('Rewards'))} className="mt-1 px-5 py-2.5 bg-white rounded-xl text-sm font-bold flex items-center gap-2" style={{ color: '#1FB6D5' }}>
              View Rewards <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. LATEST NEWS ── */}
      <div className="mt-6">
        <SectionHeader title="Latest Updates" onViewAll={() => navigate(createPageUrl('News'))} />
        <div className="px-4 space-y-3">
          {NEWS.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
              <Card className="flex overflow-hidden" onClick={() => navigate(createPageUrl(`NewsDetail?id=${n.id}`))}>
                <img src={n.img} alt={n.title} className="w-24 h-20 object-cover flex-shrink-0" />
                <div className="p-3 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Newspaper className="w-3 h-3 text-stone-400" />
                    <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide">News</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.date}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 5. EVENTS ── */}
      <div className="mt-6">
        <SectionHeader title="Events" onViewAll={() => navigate(createPageUrl('Events'))} />
        <div className="pl-4 flex gap-3 overflow-x-auto pb-1 hide-scrollbar pr-4">
          {EVENTS.map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex-shrink-0 w-48">
              <Card onClick={() => navigate(createPageUrl('Events'))}>
                <div className="relative h-28">
                  <img src={ev.img} alt={ev.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
                  <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">EVENT</span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{ev.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CalendarDays className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-400">{ev.date}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 6. DEALS & PROMO ── */}
      <div className="mt-6 mb-4">
        <SectionHeader title="Deals & Promos" />
        <div className="pl-4 flex gap-3 overflow-x-auto pb-1 hide-scrollbar pr-4">
          {DEALS.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex-shrink-0 w-44">
              <Card onClick={() => navigate(createPageUrl(`DealsPromoDetail?id=${d.id}`))}>
                <div className="relative h-28">
                  <img src={d.img} alt={d.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
                  <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#1FB6D5' }}>
                    {d.tag}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-slate-800 text-xs leading-tight">{d.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-400">{d.date}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}