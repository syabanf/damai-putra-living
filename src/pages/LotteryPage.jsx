import React, { useState, useEffect } from 'react';
import { appClient } from '@/api/appClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import RouletteWheel from '@/components/lottery/RouletteWheel';
import { Gift, Star, Trophy, ChevronLeft, Calendar, Users, Ticket, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LotteryPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedLottery, setSelectedLottery] = useState(null);
  const [spinResult, setSpinResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => { appClient.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: lotteries = [], isLoading } = useQuery({
    queryKey: ['lotteries-active'],
    queryFn: () => appClient.entities.Lottery.filter({ is_active: true }),
  });

  const { data: pointsRecords = [] } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: () => appClient.entities.UserPoints.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: myEntries = [] } = useQuery({
    queryKey: ['my-lottery-entries', user?.email, selectedLottery?.id],
    queryFn: () => appClient.entities.LotteryEntry.filter({ lottery_id: selectedLottery?.id, user_email: user?.email }),
    enabled: !!user?.email && !!selectedLottery?.id,
  });

  const myPoints = pointsRecords[0]?.balance ?? 0;

  const spinMutation = useMutation({
    mutationFn: async ({ prize }) => {
      // Deduct points
      const current = pointsRecords?.[0];
      if (current) {
        await appClient.entities.UserPoints.update(current.id, {
          balance: Math.max(0, (current.balance || 0) - selectedLottery.points_per_entry),
        });
      }
      // Record entry
      await appClient.entities.LotteryEntry.create({
        lottery_id: selectedLottery.id,
        lottery_title: selectedLottery.title,
        user_email: user.email,
        user_name: user.full_name,
        points_spent: selectedLottery.points_per_entry,
        spin_result: prize.label,
        entry_date: new Date().toISOString(),
      });
      // Update total_entries
      await appClient.entities.Lottery.update(selectedLottery.id, {
        total_entries: (selectedLottery.total_entries || 0) + 1,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userPoints', user?.email] });
      qc.invalidateQueries({ queryKey: ['my-lottery-entries'] });
      qc.invalidateQueries({ queryKey: ['lotteries-active'] });
    },
  });

  const handleSpinEnd = (prize) => {
    setSpinResult(prize);
    spinMutation.mutate({ prize });
    setTimeout(() => setShowResult(true), 500);
  };

  const canSpin = selectedLottery &&
    myPoints >= (selectedLottery.points_per_entry || 100) &&
    myEntries.length < (selectedLottery.max_entries_per_user || 3) &&
    !spinMutation.isPending;

  const myEntriesCount = myEntries.length;
  const maxEntries = selectedLottery?.max_entries_per_user || 3;

  if (selectedLottery) {
    return (
      <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #231F20 0%, #111214 55%, #091f28 100%)' }}>
        {/* Header */}
        <div className="px-5 pt-14 pb-4 flex items-center gap-3">
          <button onClick={() => { setSelectedLottery(null); setSpinResult(null); setShowResult(false); }}
            className="p-2 bg-white/10 rounded-xl text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-xl text-white leading-tight">{selectedLottery.title}</h1>
            <p className="text-white/60 text-xs">{selectedLottery.description}</p>
          </div>
        </div>

        {/* Points & info bar */}
        <div className="mx-5 mb-5 rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <p className="text-white/60 text-[10px]">Poin Kamu</p>
              <p className="text-white font-bold text-lg">{myPoints.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-[10px]">Biaya Spin</p>
            <p className="text-amber-400 font-bold text-lg">{selectedLottery.points_per_entry} poin</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-[10px]">Spin Kamu</p>
            <p className="text-white font-bold text-lg">{myEntriesCount}/{maxEntries}</p>
          </div>
        </div>

        {/* Winner Announcement */}
        {selectedLottery.winner_announced && (
          <div className="mx-5 mb-4 p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <Trophy className="w-8 h-8 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-300 text-xs font-semibold">🏆 Pemenang Undian</p>
              <p className="text-white font-bold">{selectedLottery.winner_name}</p>
              <p className="text-amber-300 text-xs">{selectedLottery.winner_prize}</p>
            </div>
          </div>
        )}

        {/* Roulette */}
        <div className="flex flex-col items-center py-4 px-5">
          {!canSpin && myEntriesCount >= maxEntries && (
            <div className="mb-4 px-5 py-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <p className="text-white/80 text-sm font-semibold">Kamu sudah memakai semua kesempatan spin!</p>
            </div>
          )}
          {!canSpin && myPoints < (selectedLottery.points_per_entry || 100) && myEntriesCount < maxEntries && (
            <div className="mb-4 px-5 py-3 rounded-xl text-center" style={{ background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.3)' }}>
              <p className="text-red-300 text-sm font-semibold">Poin tidak cukup untuk spin</p>
              <p className="text-white/60 text-xs mt-1">Butuh {selectedLottery.points_per_entry} poin, kamu punya {myPoints}</p>
            </div>
          )}
          <RouletteWheel prizes={selectedLottery.prizes || []} onSpinEnd={handleSpinEnd} disabled={!canSpin} />
        </div>

        {/* Result Modal */}
        <AnimatePresence>
          {showResult && spinResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-5"
              style={{ background: 'rgba(0,0,0,0.75)' }}>
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280 }}
                className="bg-white rounded-3xl p-8 text-center max-w-xs w-full">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: spinResult.color || '#1684F2' }}>
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <p className="text-slate-500 text-sm mb-1">Kamu mendapatkan...</p>
                <h2 className="text-2xl font-black text-slate-800 mb-1">{spinResult.label}</h2>
                {spinResult.description && <p className="text-slate-500 text-sm mb-4">{spinResult.description}</p>}
                <div className="bg-amber-50 rounded-xl p-3 mb-5">
                  <p className="text-amber-700 text-sm font-semibold">-{selectedLottery.points_per_entry} poin digunakan</p>
                </div>
                <button onClick={() => { setShowResult(false); setSpinResult(null); }}
                  className="w-full py-3 rounded-xl font-bold text-white text-base"
                  style={{ background: 'linear-gradient(135deg, #1684F2, #231F20)' }}>
                  Tutup
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prizes List */}
        {(selectedLottery.prizes || []).length > 0 && (
          <div className="mx-5 mt-4">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Daftar Hadiah</p>
            <div className="grid grid-cols-2 gap-2">
              {selectedLottery.prizes.map((p, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: p.color || '#1684F2' }} />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{p.label}</p>
                    {p.description && <p className="text-white/40 text-[10px] truncate">{p.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List of lotteries
  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #F6F9FC 0%, #EEF5FF 55%, #E7F0FF 100%)' }}>
      <div className="px-5 pt-14 pb-5 rounded-b-[2rem]" style={{ background: 'linear-gradient(150deg, #231F20 0%, #231F20 55%, #111214 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(createPageUrl('Rewards'))} className="p-2 bg-white/10 rounded-xl text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">ION</p>
            <h1 className="font-bold text-2xl text-white">Undian & Hadiah</h1>
          </div>
        </div>
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <p className="text-white/60 text-[10px]">Poin Kamu</p>
              <p className="text-white font-bold text-xl">{myPoints.toLocaleString()}</p>
            </div>
          </div>
          <Ticket className="w-9 h-9 text-white/20" />
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white/70 rounded-2xl animate-pulse" />)
        ) : lotteries.length === 0 ? (
          <div className="py-16 text-center">
            <Gift className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Tidak ada undian aktif saat ini</p>
            <p className="text-slate-400 text-sm mt-1">Pantau terus untuk undian berikutnya!</p>
          </div>
        ) : lotteries.map((lottery, i) => (
          <motion.div key={lottery.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => setSelectedLottery(lottery)}
            className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)' }}>
            {lottery.image_url && (
              <div className="relative h-36 overflow-hidden">
                <img src={lottery.image_url} alt={lottery.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
                {lottery.winner_announced && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Selesai
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-slate-800 leading-snug">{lottery.title}</h3>
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              </div>
              {lottery.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{lottery.description}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{lottery.points_per_entry} poin/spin</span>
                <span className="flex items-center gap-1"><Gift className="w-3.5 h-3.5 text-blue-500" />{lottery.prizes?.length || 0} hadiah</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" />{lottery.total_entries || 0} peserta</span>
                {lottery.end_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />s/d {new Date(lottery.end_date).toLocaleDateString('id-ID')}</span>}
              </div>
              {myPoints < (lottery.points_per_entry || 100) && (
                <div className="mt-3 text-[10px] text-red-500 font-semibold">Poin tidak cukup (butuh {lottery.points_per_entry})</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}