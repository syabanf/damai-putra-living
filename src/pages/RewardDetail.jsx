import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function generateClaimCode() {
  const rand = Math.floor(10000000 + Math.random() * 90000000);
  return `RW-PIK-${rand}`;
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function RewardDetail() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: reward } = useQuery({
    queryKey: ['reward', id],
    queryFn: () => base44.entities.Reward.filter({ id }),
    select: d => d?.[0],
    enabled: !!id,
  });

  const { data: pointsRecords = [] } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const myPoints = pointsRecords[0]?.balance ?? 0;
  const canClaim = myPoints >= (reward?.points_required ?? 0);

  const handleClaim = async () => {
    if (!user || !reward) return;
    setClaiming(true);
    const claimCode = generateClaimCode();
    const expiryDate = addDays(reward.valid_days || 30);

    // Create claim record
    const claim = await base44.entities.RewardClaim.create({
      reward_id: reward.id,
      reward_title: reward.title,
      merchant_name: reward.merchant_name,
      merchant_location: reward.merchant_location,
      reward_image_url: reward.image_url,
      points_used: reward.points_required,
      terms: reward.terms || [],
      claim_code: claimCode,
      claim_date: new Date().toISOString(),
      expiry_date: expiryDate,
      status: 'unused',
      user_email: user.email,
      user_name: user.full_name,
    });

    // Deduct points
    const pRec = pointsRecords[0];
    if (pRec) {
      await base44.entities.UserPoints.update(pRec.id, {
        balance: (pRec.balance || 0) - reward.points_required,
        total_spent: (pRec.total_spent || 0) + reward.points_required,
      });
    }

    qc.invalidateQueries({ queryKey: ['userPoints'] });
    setClaiming(false);
    setShowModal(false);
    navigate(createPageUrl('RewardReceipt') + `?id=${claim.id}`);
  };

  if (!reward) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
      <div className="w-8 h-8 border-2 border-[#1F86C7] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 50%, #e2ddd8 100%)' }}>
      {/* Hero */}
      <div className="relative h-64 bg-slate-200 overflow-hidden">
        <img src={reward.image_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'}
          alt={reward.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 bg-black/35 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p className="text-white font-bold text-xl leading-tight">{reward.title}</p>
          <p className="text-white/70 text-sm mt-0.5">{reward.merchant_name}</p>
        </div>
      </div>

      {/* Points badge */}
      <div className="px-4 -mt-0">
        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)' }}>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-slate-800 text-lg">{reward.points_required?.toLocaleString()} Points</span>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${canClaim ? 'bg-[#e8f4fb] text-[#1F86C7]' : 'bg-red-50 text-red-500'}`}>
            {canClaim ? 'You have enough points' : `You need ${(reward.points_required - myPoints).toLocaleString()} more`}
          </span>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Info */}
        <div className="rounded-2xl divide-y" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)', '--tw-divide-color': 'rgba(255,255,255,0.6)' }}>
          {reward.merchant_location && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-600">{reward.merchant_location}</p>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <p className="text-sm text-slate-600">Valid for {reward.valid_days || 30} days after claim</p>
          </div>
        </div>

        {/* Description */}
        {reward.description && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)' }}>
            <h3 className="font-bold text-slate-800 text-sm mb-2">About This Reward</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{reward.description}</p>
          </div>
        )}

        {/* T&C */}
        {reward.terms?.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)' }}>
            <h3 className="font-bold text-slate-800 text-sm mb-3">Terms & Conditions</h3>
            <ul className="space-y-2">
              {reward.terms.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1F86C7] flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-500">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <button onClick={() => setShowModal(true)} disabled={!canClaim}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform disabled:opacity-40"
          style={{ background: canClaim ? 'linear-gradient(135deg, #1F86C7, #1669a0)' : '#94a3b8' }}>
          <Star className="w-4 h-4" />
          Claim Reward
        </button>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm">
              <h3 className="font-bold text-lg text-slate-800 text-center">Confirm Reward Claim</h3>
              <div className="bg-slate-50 rounded-2xl p-4 mt-4">
                <p className="font-semibold text-slate-700 text-sm text-center">{reward.title}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-800">{reward.points_required?.toLocaleString()} Points</span>
                </div>
              </div>
              <div className="flex items-start gap-2 mt-4 bg-amber-50 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Points will be deducted and cannot be reversed.</p>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-2xl font-semibold border border-slate-200 text-slate-700 text-sm">Cancel</button>
                <button onClick={handleClaim} disabled={claiming}
                  className="flex-1 py-3 rounded-2xl font-semibold text-white text-sm disabled:opacity-60"
                  style={{ background: '#1F86C7' }}>
                  {claiming ? 'Processing...' : 'Confirm Claim'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}