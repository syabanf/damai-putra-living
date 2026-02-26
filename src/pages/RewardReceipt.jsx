import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Share2, CheckCircle2, Copy, MapPin, Star, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CFG = {
  unused:    { label: 'Unused',    bg: '#e8f4fb', color: '#1F86C7' },
  used:      { label: 'Used',      bg: '#f1f5f9', color: '#94a3b8' },
  expired:   { label: 'Expired',   bg: '#fef2f2', color: '#ef4444' },
  cancelled: { label: 'Cancelled', bg: '#fef2f2', color: '#ef4444' },
};

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

export default function RewardReceipt() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const [copied, setCopied] = useState(false);
  const [using, setUsing] = useState(false);

  const { data: claim } = useQuery({
    queryKey: ['rewardClaim', id],
    queryFn: () => base44.entities.RewardClaim.filter({ id }),
    select: d => d?.[0],
    enabled: !!id,
  });

  const useMutation_ = useMutation({
    mutationFn: () => base44.entities.RewardClaim.update(id, {
      status: 'used',
      used_date: new Date().toISOString(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewardClaim', id] });
      qc.invalidateQueries({ queryKey: ['myClaims'] });
      setUsing(false);
    },
  });

  const copyCode = () => {
    navigator.clipboard.writeText(claim?.claim_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: claim?.reward_title, text: `My reward: ${claim?.reward_title}\nCode: ${claim?.claim_code}` });
    }
  };

  if (!claim) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F7' }}>
      <div className="w-8 h-8 border-2 border-[#1F86C7] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statusCfg = STATUS_CFG[claim.status] || STATUS_CFG.unused;

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 50%, #e2ddd8 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('Rewards'))} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">Reward Receipt</h1>
        </div>
        <button onClick={handleShare} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
          <Share2 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Reward Summary Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {claim.reward_image_url && (
            <img src={claim.reward_image_url} alt={claim.reward_title} className="w-full h-40 object-cover" />
          )}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800 text-base leading-tight">{claim.reward_title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{claim.merchant_name}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: statusCfg.bg, color: statusCfg.color }}>
                {statusCfg.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-semibold">Claimed</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatDateTime(claim.claim_date)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-semibold">Expires</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatDate(claim.expiry_date)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* QR Code Section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
          
          {/* QR Code - generated from claim_code using a URL */}
          <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-slate-100 flex items-center justify-center bg-white">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(claim.claim_code)}&bgcolor=ffffff&color=000000&qzone=1`}
              alt="QR Code"
              className="w-full h-full"
            />
          </div>

          <p className="text-xs text-slate-400 mt-4 font-semibold uppercase tracking-widest">Claim Code</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="font-bold text-slate-800 text-lg tracking-wider">{claim.claim_code}</p>
            <button onClick={copyCode} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 active:bg-slate-200">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">Show this QR code to the merchant for validation</p>
        </motion.div>

        {/* Reward Details */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold">Points Used</p>
              <p className="text-sm font-bold text-slate-700">{claim.points_used?.toLocaleString()} pts</p>
            </div>
          </div>
          {claim.merchant_location && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Location</p>
                <p className="text-sm font-semibold text-slate-700">{claim.merchant_location}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* T&C */}
        {claim.terms?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="font-bold text-slate-800 text-sm mb-3">Terms & Conditions</p>
            <ul className="space-y-1.5">
              {claim.terms.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1F86C7] flex-shrink-0 mt-1.5" />
                  <span className="text-xs text-slate-500">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Action Buttons */}
        {claim.status === 'unused' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="flex gap-3">
            <button onClick={() => useMutation_.mutate()} disabled={using}
              className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1F86C7, #1669a0)' }}>
              <CheckCircle2 className="w-4 h-4" />
              {using ? 'Processing...' : 'Mark as Used'}
            </button>
            <button onClick={handleShare}
              className="w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-200 bg-white active:bg-slate-50">
              <Share2 className="w-5 h-5 text-slate-600" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}