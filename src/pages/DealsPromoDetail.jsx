import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Share2, Tag, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_DEALS = {
  1: { id: 1, title: 'Ramadhan Bazaar 2026', date: '24 Feb 2026', tag: 'BAZAAR', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', content: 'Join us for the spectacular Ramadhan Bazaar 2026! Experience a wide variety of traditional foods, crafts, and entertainment. This annual event brings together the community for a celebration of culture and togetherness. Special offers and discounts available throughout the event.' },
  2: { id: 2, title: 'Food & Beverage Fiesta', date: '05 Mar 2026', tag: 'PROMO', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', content: 'The Food & Beverage Fiesta is back with incredible deals and promotions from our finest culinary partners. Enjoy special menus, exclusive discounts, and limited-time offers. Perfect opportunity to discover new restaurants and enjoy your favorites at reduced prices. Come hungry, leave happy!' },
  3: { id: 3, title: 'Weekend Property Fair', date: '15 Mar 2026', tag: 'FAIR', img: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80', content: 'Damai Putra Township presents the Weekend Property Fair showcasing available units and investment opportunities. Meet with sales representatives, explore floor plans, and learn about financing options. Special promotions and flexible payment schemes available during the fair. Do not miss this opportunity!' },
};

export default function DealsPromoDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const deal = MOCK_DEALS[id] || MOCK_DEALS[1];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: deal.title, text: deal.content, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const tagColors = {
    BAZAAR: '#f59e0b',
    PROMO: '#10b981',
    FAIR: '#ef4444'
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.9)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">Deals & Promos</h1>
        </div>
        <button onClick={handleShare} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
          <Share2 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-4">
        {/* Hero Image */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden h-64">
          <img src={deal.img} alt={deal.title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Title & Meta */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: tagColors[deal.tag] || '#1FB6D5' }}>
              {deal.tag}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight">{deal.title}</h2>
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            {deal.date}
          </div>
        </motion.div>

        {/* Body */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)' }}>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{deal.content}</p>
        </motion.div>

        {/* CTA */}
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #1FB6D5, #169ab5)' }}>
          Learn More
        </motion.button>
      </div>
    </div>
  );
}