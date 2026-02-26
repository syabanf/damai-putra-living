import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Search, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_NEWS = [
  { id: 1, title: 'ASG News February 2026', date: '13 Feb 2026', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80', content: 'Latest updates from ASG February 2026 covering community developments and new initiatives.' },
  { id: 2, title: 'Township Development Update Q1', date: '01 Feb 2026', img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80', content: 'Comprehensive update on township development progress in Q1 2026 with new infrastructure announcements.' },
  { id: 3, title: 'New Amenities Opening Soon', date: '20 Jan 2026', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80', content: 'Exciting new amenities launching soon in the township including fitness centers and retail spaces.' },
  { id: 4, title: 'Community Events Schedule 2026', date: '15 Jan 2026', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', content: 'Full schedule of community events planned for 2026 with details on participation and registration.' },
];

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl overflow-hidden ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.08)' }}
  >
    {children}
  </div>
);

export default function News() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    MOCK_NEWS.filter(n => n.title.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.9)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h1 className="font-bold text-xl text-slate-800">Latest News</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* News List */}
      <div className="px-4 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card onClick={() => navigate(createPageUrl(`NewsDetail?id=${n.id}`))}>
                <div className="flex overflow-hidden">
                  <img src={n.img} alt={n.title} className="w-24 h-24 object-cover flex-shrink-0" />
                  <div className="p-3 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Newspaper className="w-3 h-3 text-stone-400" />
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide">News</span>
                      </div>
                      <p className="font-semibold text-slate-800 text-sm leading-tight">{n.title}</p>
                    </div>
                    <p className="text-xs text-slate-400">{n.date}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-500 text-sm">No news found</p>
          </div>
        )}
      </div>
    </div>
  );
}