import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Gift, CalendarDays, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_BG, GlassHeader, GlassCard, Chip } from '@/components/ui/DesignSystem';

const STATUS_CFG = {
  unused:    { label: 'Unused',    bg: '#e6f8fb', color: '#1FB6D5' },
  used:      { label: 'Used',      bg: '#f1f5f9', color: '#94a3b8' },
  expired:   { label: 'Expired',   bg: '#fef2f2', color: '#ef4444' },
  cancelled: { label: 'Cancelled', bg: '#fef2f2', color: '#ef4444' },
};

const TABS = ['All', 'Unused', 'Used', 'Expired'];

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

export default function MyClaims() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['myClaims', user?.email],
    queryFn: () => base44.entities.RewardClaim.filter({ user_email: user.email }, '-claim_date'),
    enabled: !!user?.email,
  });

  const filtered = activeTab === 'All' ? claims : claims.filter(c => c.status === activeTab.toLowerCase());

  return (
    <div className="min-h-screen pb-10" style={{ background: PAGE_BG }}>
      <GlassHeader className="pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/70" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">My Claims</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {TABS.map(t => <Chip key={t} label={t} active={activeTab === t} onClick={() => setActiveTab(t)} />)}
        </div>
      </GlassHeader>

      <div className="px-4 py-5 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 animate-pulse flex gap-3" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <div className="w-16 h-16 bg-slate-200/50 rounded-xl" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 bg-slate-200/50 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <GlassCard className="flex flex-col items-center py-24">
            <Gift className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No claims yet</p>
            <button onClick={() => navigate(createPageUrl('Rewards'))}
              className="mt-4 px-6 py-2.5 rounded-2xl font-semibold text-white text-sm"
              style={{ background: '#1F86C7' }}>
              Browse Rewards
            </button>
          </GlassCard>
        ) : (
          filtered.map((claim, i) => {
            const statusCfg = STATUS_CFG[claim.status] || STATUS_CFG.unused;
            return (
              <motion.div key={claim.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => navigate(createPageUrl('RewardReceipt') + `?id=${claim.id}`)}
                className="rounded-2xl p-4 flex gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(138,127,115,0.1)' }}>
                <img src={claim.reward_image_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200'}
                  alt={claim.reward_title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">{claim.reward_title}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: statusCfg.bg, color: statusCfg.color }}>{statusCfg.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{claim.merchant_name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] text-slate-500 font-semibold">{claim.points_used?.toLocaleString()} pts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-slate-400" />
                      <span className="text-[11px] text-slate-400">Exp: {formatDate(claim.expiry_date)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}