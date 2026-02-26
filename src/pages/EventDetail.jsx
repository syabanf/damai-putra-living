import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, MapPin, Share2, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

function formatDateRange(start, end) {
  const fmt = d => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
  };
  if (!end || start === end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function EventDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => base44.entities.Event.filter({ id }),
    select: data => data?.[0],
    enabled: !!id,
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event?.title, text: event?.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
        <div className="w-8 h-8 border-2 border-[#1F86C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
        <p className="text-slate-500">Event not found.</p>
      </div>
    );
  }

  const allImages = [event.banner_image, ...(event.gallery || [])].filter(Boolean);

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 50%, #e2ddd8 100%)' }}>
      {/* Hero */}
      <div className="relative h-72 overflow-hidden bg-slate-200">
        {allImages.length > 0 ? (
          <>
            <img src={allImages[galleryIndex]} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)' }} />
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setGalleryIndex(i)}
                    className={`rounded-full transition-all ${i === galleryIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-600" />
        )}

        {/* Controls */}
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 bg-black/35 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={handleShare}
          className="absolute top-12 right-4 w-10 h-10 bg-black/35 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
          <Share2 className="w-4 h-4 text-white" />
        </button>

        {/* Status badge */}
        {event.status && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
              event.status === 'ongoing' ? 'bg-emerald-500 text-white' :
              event.status === 'upcoming' ? 'bg-[#1F86C7] text-white' :
              'bg-slate-500 text-white'
            }`}>
              {event.status === 'ongoing' ? 'Ongoing' : event.status === 'upcoming' ? 'Upcoming' : 'Past'}
            </span>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
          <p className="text-white font-bold text-xl leading-tight drop-shadow">{event.title}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-4">
        {/* Date & Location info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#e8f4fb' }}>
              <CalendarDays style={{ color: '#1F86C7', width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Date</p>
              <p className="text-sm font-semibold text-slate-700">{formatDateRange(event.start_date, event.end_date)}</p>
            </div>
          </div>
          {(event.start_time || event.end_time) && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#ecfdf5' }}>
                <Clock style={{ color: '#10b981', width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Time</p>
                <p className="text-sm font-semibold text-slate-700">
                  {event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}
                </p>
              </div>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f5f3f0' }}>
                <MapPin style={{ color: '#8A7F73', width: 18, height: 18 }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-semibold">Location</p>
                <p className="text-sm font-semibold text-slate-700">{event.location}</p>
                {event.address && <p className="text-xs text-slate-400 mt-0.5">{event.address}</p>}
              </div>
            </div>
          )}
        </motion.div>

        {/* Description */}
        {event.description && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-2 text-sm">About This Event</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>
          </motion.div>
        )}

        {/* Organizer */}
        {event.organizer && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 font-semibold">Organizer</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">{event.organizer}</p>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-3">
          {event.map_url && (
            <a href={event.map_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #1F86C7, #1669a0)' }}>
              <MapPin className="w-4 h-4" />
              View Location
            </a>
          )}
          {event.ticket_url && (
            <a href={event.ticket_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform border border-slate-200 bg-white"
              style={{ color: '#1F86C7' }}>
              <ExternalLink className="w-4 h-4" />
              Get Ticket
            </a>
          )}
          {!event.map_url && !event.ticket_url && (
            <button onClick={handleShare}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #1F86C7, #1669a0)' }}>
              <Share2 className="w-4 h-4" />
              Share Event
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}