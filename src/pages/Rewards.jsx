import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Gift, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_BG, GlassHeader, GlassCard, Chip, SearchBar } from '@/components/ui/DesignSystem';

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
    <div className="min-h-screen pb-28" style={{ background: PAGE_BG }}>
      <GlassHeader className="pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8A7F73' }}>Damai Putra</p>
            <h1 className="font-bold text-2xl text-slate-800">Rewards</h1>
          </div>
          <button onClick={() => navigate(createPageUrl('MyClaims'))}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/70 shadow-sm"
            style={{ background: 'rgba(255,255,255,0.65)', color: '#8A7F73' }}>
            My Claims
          </button>
        </div>

        {/* Points Banner */}
        <div className="rounded-2xl p-4 flex items-center justify-between mb-4"
          style={{ background: 'linear-gradient(135deg, #8A7F73, #5a524e)', boxShadow: '0 4px 16px rgba(90,82,78,0.35)' }}>
          <div>
            <p className="text-white/70 text-xs font-semibold">Your Points</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <p className="text-white font-bold text-2xl">{myPoints.toLocaleString()}</p>
            </div>
          </div>
          <Gift className="w-10 h-10 text-white/20" />
        </div>

        <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search rewards..." />
      </GlassHeader>

      {/* Categories */}
      <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.7)' }}>
        <div className="px-5 py-3 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 w-max">
            {CATS.map(c => <Chip key={c.value} label={c.label} active={activeCategory === c.value} onClick={() => setActiveCategory(c.value)} />)}
          </div>
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