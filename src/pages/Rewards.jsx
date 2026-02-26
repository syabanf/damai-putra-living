import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Gift, Star, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

const CATS = [
  { value: 'all', label: 'All' },
  { value: 'food_beverage', label: 'F&B' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'retail', label: 'Retail' },
  { value: 'health', label: 'Health' },
];

export default function Rewards() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.filter({ is_active: true }),
  });

  const { data: pointsRecords = [] } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const myPoints = pointsRecords[0]?.balance ?? 0;

  const filtered = useMemo(() => {
    let list = rewards;
    if (activeCategory !== 'all') list = list.filter(r => r.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.title?.toLowerCase().includes(q) || r.merchant_name?.toLowerCase().includes(q));
    }
    return list;
  }, [rewards, activeCategory, search]);

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 rounded-b-[2rem] relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative">
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Damai Putra Living</p>
            <h1 className="font-bold text-2xl text-white">Rewards</h1>
          </div>
          <button onClick={() => navigate(createPageUrl('MyClaims'))}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.28)' }}>
            My Claims
          </button>
        </div>
        {/* Points Banner */}
        <div className="rounded-2xl p-4 flex items-center justify-between mb-4 relative"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)' }}>
          <div>
            <p className="text-white/70 text-xs font-semibold">Your Points</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <p className="text-white font-bold text-2xl">{myPoints.toLocaleString()}</p>
            </div>
          </div>
          <Gift className="w-10 h-10 text-white/20" />
        </div>
        {/* Search */}
        <div className="relative rounded-xl flex items-center gap-2 px-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <Search className="w-4 h-4 text-white/60 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rewards..."
            className="flex-1 h-10 bg-transparent text-sm text-white placeholder-white/50 border-0 outline-none" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-white/60" /></button>}
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 py-3 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 w-max">
          {CATS.map(c => (
            <button key={c.value} onClick={() => setActiveCategory(c.value)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95"
              style={activeCategory === c.value
                ? { background: 'linear-gradient(135deg, #1F86C7, #1669a0)', color: '#fff', boxShadow: '0 3px 10px rgba(31,134,199,0.35)' }
                : { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', color: '#64748b' }
              }>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Reward Grid */}
      <div className="px-4 py-5 grid grid-cols-2 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <div className="w-full h-32 bg-slate-200/50" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 bg-slate-200/50 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center py-20">
            <Gift className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No rewards found</p>
          </div>
        ) : (
          filtered.map((reward, i) => (
            <motion.div key={reward.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => navigate(createPageUrl('RewardDetail') + `?id=${reward.id}`)}
              className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)' }}>
              <div className="h-32 overflow-hidden">
                <img src={reward.image_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'}
                  alt={reward.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">{reward.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{reward.merchant_name}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{reward.points_required?.toLocaleString()}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${myPoints >= reward.points_required ? 'bg-[#e8f4fb] text-[#1F86C7]' : 'bg-slate-100 text-slate-400'}`}>
                    {myPoints >= reward.points_required ? 'Claim' : 'Not enough'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}