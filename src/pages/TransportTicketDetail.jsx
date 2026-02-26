import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Users, AlertCircle, ChevronRight } from 'lucide-react';

// Mock transport data
const MOCK_TRANSPORT = {
  1: {
    id: 1,
    operator: 'City Bus Express',
    from: 'Damai Putra Township',
    to: 'Central Station',
    departTime: '08:25',
    arrivalTime: '14:30',
    duration: '6h 5m',
    price: 53,
    seats: 12,
    type: 'bus',
    date: '2026-02-26',
    stops: ['Damai Putra', 'Jalan Utama', 'Jalan Merdeka', 'Terminal Kota', 'Central Station'],
  },
  2: {
    id: 2,
    operator: 'Shuttle Plus',
    from: 'Damai Putra Township',
    to: 'Central Station',
    departTime: '09:00',
    arrivalTime: '13:15',
    duration: '4h 15m',
    price: 75,
    seats: 8,
    type: 'shuttle',
    date: '2026-02-26',
    stops: ['Damai Putra', 'Terminal Kota', 'Central Station'],
  },
};

const RouteMap = ({ stops }) => (
  <div className="space-y-2">
    {stops.map((stop, idx) => (
      <div key={idx} className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full" style={{ background: '#1FB6D5' }} />
          {idx < stops.length - 1 && <div className="w-0.5 h-8" style={{ background: 'rgba(31,182,213,0.3)' }} />}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{stop}</p>
          {idx === 0 && <p className="text-xs text-slate-500">Departure</p>}
          {idx === stops.length - 1 && <p className="text-xs text-slate-500">Arrival</p>}
        </div>
      </div>
    ))}
  </div>
);

export default function TransportTicketDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const transportId = params.get('transportId');
  const transport = MOCK_TRANSPORT[transportId];
  const [showTerms, setShowTerms] = useState(false);

  if (!transport) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
        <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Transport not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3 sticky top-0 z-20" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 2px 8px rgba(90,80,70,0.10)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h1 className="font-bold text-lg text-slate-800">Booking Details</h1>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Trip Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)',
            boxShadow: '0 8px 24px rgba(31,182,213,0.3)',
          }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 text-white border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <p className="text-xs opacity-80 mb-1 uppercase tracking-wide font-semibold">{transport.operator}</p>
            <p className="text-sm opacity-90">
              {new Date(transport.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>

          {/* Main Time Display */}
          <div className="px-5 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-white">
                <p className="text-4xl font-bold">{transport.departTime}</p>
                <p className="text-xs opacity-80 mt-1">{transport.from}</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-white/70 font-semibold">{transport.duration}</div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  <div className="w-8 h-0.5 bg-white/30" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                </div>
              </div>

              <div className="text-right text-white">
                <p className="text-4xl font-bold">{transport.arrivalTime}</p>
                <p className="text-xs opacity-80 mt-1">{transport.to}</p>
              </div>
            </div>

            {/* Price */}
            <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              <p className="text-xs opacity-80 mb-1">Total Price</p>
              <p className="text-3xl font-bold text-white">${transport.price}</p>
            </div>
          </div>
        </motion.div>

        {/* Route Map */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(138,127,115,0.08)' }}>
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4">Route Details</h3>
          <RouteMap stops={transport.stops} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(138,127,115,0.08)' }}>
            <p className="text-xs text-slate-600 font-semibold mb-1.5">Duration</p>
            <p className="font-bold text-lg text-slate-800 flex items-center gap-1">
              <Clock className="w-4 h-4" /> {transport.duration}
            </p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(138,127,115,0.08)' }}>
            <p className="text-xs text-slate-600 font-semibold mb-1.5">Available Seats</p>
            <p className="font-bold text-lg text-slate-800 flex items-center gap-1">
              <Users className="w-4 h-4" /> {transport.seats} seats
            </p>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="rounded-2xl p-4 border-l-4" style={{ background: '#f0fdf4', borderColor: '#10b981' }}>
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center justify-between"
          >
            <div className="text-left">
              <p className="font-semibold text-slate-800 text-sm">Cancellation & Terms</p>
              <p className="text-xs text-slate-600 mt-0.5">Free cancellation up to 24 hours</p>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${showTerms ? 'rotate-90' : ''}`} />
          </button>
          {showTerms && (
            <div className="mt-3 pt-3 border-t border-green-200 text-xs text-slate-600 space-y-1">
              <p>• Cancellation must be made at least 24 hours before departure</p>
              <p>• Refunds processed within 3-5 business days</p>
              <p>• No refund for cancellations within 24 hours</p>
            </div>
          )}
        </div>

        {/* Buy Ticket Button */}
        <button
          onClick={() => navigate(createPageUrl('ActiveTicket'))}
          className="w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #1FB6D5, #1098b8)',
            boxShadow: '0 4px 16px rgba(31,182,213,0.35)'
          }}
        >
          Buy the Ticket
        </button>
      </div>
    </div>
  );
}