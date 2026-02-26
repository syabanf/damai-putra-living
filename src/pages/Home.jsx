import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Bell, ChevronRight, FileCheck, Truck,
  Users, Plus, AlertCircle, Clock,
  HardHat, Package, PartyPopper, Phone,
  Calendar, Bus, PlayCircle, UtensilsCrossed,
  Sparkles, Heart, User, ChevronLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/navigation/BottomNav';
import StatusBadge from '@/components/ui/StatusBadge';

const BRAND = '#8A8076';

// ── Static data ──────────────────────────────────────────────
const HERO_SLIDES = [
  {
    bg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    headline: 'The Future of the City\nComes to Life Here',
    sub: 'Damai Putra Township – Smart Living Experience',
  },
  {
    bg: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    headline: 'Everything You Need,\nRight at Your Doorstep',
    sub: 'World-class facilities for modern living',
  },
  {
    bg: 'https://images.unsplash.com/photo-1582407947304-fd86f28f958c?w=800&q=80',
    headline: 'A Community Built\nfor the Future',
    sub: 'Join thousands of happy residents today',
  },
];

const LANGUAGES = [
  { code: 'id', label: 'ID', name: 'Bahasa Indonesia' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: 中, name: 'Mandarin' },
];

const QUICK_ACCESS = [
  { icon: Building2,      label: 'Property',       color: '#8A8076', href: 'MyUnit'        },
  { icon: Phone,          label: 'Hotline',         color: '#dc2626', href: null,           tel: 'tel:+62211234567' },
  { icon: Calendar,       label: 'Events',          color: '#7c3aed', href: null            },
  { icon: Bus,            label: 'Transportation',  color: '#0284c7', href: null            },
  { icon: PlayCircle,     label: 'Virtual Tour',    color: '#059669', href: null            },
  { icon: UtensilsCrossed,label: 'Culinary',        color: '#d97706', href: null            },
  { icon: Sparkles,       label: 'NICE',            color: '#db2777', href: null            },
  { icon: Heart,          label: 'Tzu Chi',         color: '#e11d48', href: null            },
];

const NEWS = [
  { id: 1, title: 'ASG News Februari 2026', date: '13 Feb 2026', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80' },
  { id: 2, title: 'Pembangunan Tower D Dimulai', date: '10 Feb 2026', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80' },
  { id: 3, title: 'Penghargaan Properti Terbaik 2026', date: '05 Feb 2026', img: 'https://images.unsplash.com/photo-1486308510493-aa64833637bc?w=400&q=80' },
];

const EVENTS = [
  { id: 1, title: 'Galloping Fortune', date: '09 Feb – 28 Feb 2026', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80', tag: 'Ongoing' },
  { id: 2, title: 'Ramadhan Night Market', date: '10 Mar – 09 Apr 2026', img: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600&q=80', tag: 'Upcoming' },
];

const DEALS = [
  { id: 1, title: 'Bazar Seru Ramadhan 2026', date: '24 Feb 2026', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', badge: 'Limited', color: '#d97706' },
  { id: 2, title: 'Member Discount – Culinary Zone', date: '01 Mar 2026', img: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80', badge: 'Members', color: '#7c3aed' },
];

// ── Sub-components ────────────────────────────────────────────
const SectionHeader = ({ title, onViewAll }) => (
  <div className="flex justify-between items-center mb-3 px-4">
    <h2 className="text-sm font-bold text-slate-800">{title}</h2>
    {onViewAll && (
      <button onClick={onViewAll} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: BRAND }}>
        View All <ChevronRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

export default function Home() {
  const navigate  = useNavigate();
  const [user, setUser]           = useState(null);
  const [slide, setSlide]         = useState(0);
  const [lang, setLang]           = useState('id');
  const [showLang, setShowLang]   = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  // Auto-advance hero carousel
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const { data: units         = [] } = useQuery({ queryKey: ['units'],         queryFn: () => base44.entities.Unit.list() });
  const { data: notifications = [] } = useQuery({ queryKey: ['notifications'], queryFn: () => base44.entities.Notification.filter({ read: false }) });

  const approvedUnit  = units.find(u => u.status === 'approved');
  const unreadCount   = notifications.length;
  const firstName     = user?.full_name?.split(' ')[0] || 'Resident';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat pagi';
    if (h < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  return (
    <div className="min-h-screen pb-28 bg-stone-50">

      {/* ── 1. HERO BANNER / CAROUSEL ──────────────────── */}
      <div className="relative h-72 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={slide}
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.7 }}
            className="absolute inset-0">
            <img src={HERO_SLIDES[slide].bg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)' }} />
          </motion.div>
        </AnimatePresence>

        {/* Top bar: greeting + notifications + language */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-12 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/25">
              <User className="w-5 h-5 text-white/90" />
            </div>
            <div>
              <p className="text-white/55 text-[11px]">{getGreeting()},</p>
              <p className="text-white font-bold text-base leading-tight">{firstName} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button onClick={() => setShowLang(v => !v)}
                className="h-9 px-3 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 text-white text-xs font-bold flex items-center gap-1">
                {LANGUAGES.find(l => l.code === lang)?.label ?? 'ID'}
                <ChevronLeft className={`w-3 h-3 transition-transform ${showLang ? 'rotate-90' : '-rotate-90'}`} />
              </button>
              <AnimatePresence>
                {showLang && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-11 z-50 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden min-w-[140px]">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setShowLang(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-stone-50 transition-colors ${lang === l.code ? 'text-stone-700 bg-stone-50' : 'text-slate-500'}`}>
                        <span className="font-bold mr-2">{l.label}</span>{l.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <Link to={createPageUrl('Notifications')}
              className="relative w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Hero headline */}
        <div className="relative z-10 px-4 mt-4">
          <AnimatePresence mode="wait">
            <motion.div key={slide}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <p className="text-white font-extrabold text-xl leading-snug whitespace-pre-line drop-shadow-sm">
                {HERO_SLIDES[slide].headline}
              </p>
              <p className="text-white/65 text-xs mt-1">{HERO_SLIDES[slide].sub}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`transition-all rounded-full ${i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* ── Unit mini-card pulled up over hero ── */}
      <div className="px-4 -mt-1">
        {approvedUnit ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(createPageUrl('MyUnit'))}
            className="cursor-pointer rounded-2xl p-4 flex items-center gap-3 border border-stone-200/80 bg-white shadow-sm active:scale-[0.98] transition-transform">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${BRAND}18` }}>
              <Building2 className="w-5 h-5" style={{ color: BRAND }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-base leading-tight">{approvedUnit.unit_number}</p>
              <p className="text-xs text-slate-400">{approvedUnit.property_name}{approvedUnit.tower ? ` · Tower ${approvedUnit.tower}` : ''}</p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
              ✓ Verified
            </span>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-center gap-3 border border-amber-200 bg-amber-50">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-800 text-sm">No unit registered</p>
              <p className="text-xs text-amber-600">Register your unit to access all features</p>
            </div>
            <Button size="sm" onClick={() => navigate(createPageUrl('MyUnit'))}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 h-8 flex-shrink-0">
              Register
            </Button>
          </motion.div>
        )}
      </div>

      {/* ── 2. QUICK ACCESS GRID ──────────────────────── */}
      <motion.section className="mt-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="mx-4 bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="grid grid-cols-4 gap-y-4">
            {QUICK_ACCESS.map((item) => (
              <button key={item.label}
                onClick={() => {
                  if (item.tel) { window.location.href = item.tel; return; }
                  if (item.href) navigate(createPageUrl(item.href));
                }}
                className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
                <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 3. PROMOTION / CTA SECTION ───────────────── */}
      <motion.section className="mt-5 px-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="relative rounded-2xl overflow-hidden p-5"
          style={{ background: 'linear-gradient(135deg, #8A8076 0%, #5a524e 100%)' }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-12 bottom-0 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white tracking-wider">MEMBERSHIP</span>
            <p className="text-white font-extrabold text-base mt-2 leading-snug">
              Join Sedayu One and get access to various rewards and benefits!
            </p>
            <p className="text-white/60 text-xs mt-1 mb-4">Exclusive perks · Priority service · Special discounts</p>
            <Button className="bg-white text-stone-700 hover:bg-white/90 font-bold text-xs h-9 px-5 rounded-xl">
              Register Now →
            </Button>
          </div>
        </div>
      </motion.section>

      {/* ── 4. LATEST UPDATES (NEWS) ──────────────────── */}
      <motion.section className="mt-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SectionHeader title="Latest Updates" onViewAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 hide-scrollbar">
          {NEWS.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-52 rounded-2xl overflow-hidden bg-white border border-stone-100 shadow-sm cursor-pointer active:scale-[0.97] transition-transform">
              <img src={item.img} alt={item.title} className="w-full h-28 object-cover" />
              <div className="p-3">
                <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">{item.title}</p>
                <p className="text-[10px] text-slate-400 mt-1.5">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── 5. EVENTS SECTION ─────────────────────────── */}
      <motion.section className="mt-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <SectionHeader title="Events" onViewAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 hide-scrollbar">
          {EVENTS.map((ev) => (
            <div key={ev.id} className="flex-shrink-0 w-64 rounded-2xl overflow-hidden bg-white border border-stone-100 shadow-sm cursor-pointer active:scale-[0.97] transition-transform relative">
              <img src={ev.img} alt={ev.title} className="w-full h-32 object-cover" />
              <div className="absolute top-2 left-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${ev.tag === 'Ongoing' ? 'bg-emerald-500' : 'bg-violet-500'}`}>
                  {ev.tag}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-slate-800 leading-snug">{ev.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {ev.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── 6. DEALS & PROMO SECTION ──────────────────── */}
      <motion.section className="mt-6 pb-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SectionHeader title="Deals & Promo" onViewAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 hide-scrollbar">
          {DEALS.map((deal) => (
            <div key={deal.id} className="flex-shrink-0 w-60 rounded-2xl overflow-hidden bg-white border border-stone-100 shadow-sm cursor-pointer active:scale-[0.97] transition-transform relative">
              <img src={deal.img} alt={deal.title} className="w-full h-28 object-cover" />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: deal.color }}>
                  {deal.badge}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-slate-800 leading-snug">{deal.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {deal.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <BottomNav currentPage="Home" />
    </div>
  );
}