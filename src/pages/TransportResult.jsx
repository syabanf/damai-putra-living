import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, MapPin } from 'lucide-react';

// Mock transport results
const MOCK_RESULTS = [
  {
    id: 1,
    operator: 'City Bus Express',
    from: 'Damai Putra',
    to: 'Central Station',
    departTime: '08:25',
    arrivalTime: '14:30',
    duration: '6h 5m',
    price: 53,
    seats: 12,
    type: 'bus'
  },
  {
    id: 2,
    operator: 'Shuttle Plus',
    from: 'Damai Putra',
    to: 'Central Station',
    departTime: '09:00',
    arrivalTime: '13:15',
    duration: '4h 15m',
    price: 75,
    seats: 8,
    type: 'shuttle'
  },
  {
    id: 3,
    operator: 'Premium Coach',
    from: 'Damai Putra',
    to: 'Central Station',
    departTime: '10:30',
    arrivalTime: '15:45',
    duration: '5h 15m',
    price: 65,
    seats: 15,
    type: 'bus'
  },
  {
    id: 4,
    operator: 'Fast Track Shuttle',
    from: 'Damai Putra',
    to: 'Central Station',
    departTime: '11:00',
    arrivalTime: '14:00',
    duration: '3h',
    price: 85,
    seats: 5,
    type: 'shuttle'
  },
];

const TransportCard = ({ transport, onSelect }) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={() => onSelect(transport)}
    className="w-full rounded-2xl p-4 text-left transition-all active:scale-95"
    style={{
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.85)',
      boxShadow: '0 2px 8px rgba(138,127,115,0.08)'
    }}
  >
    {/* Header: Operator & Price */}
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-0.5">Operator</p>
        <p className="font-bold text-slate-800">{transport.operator}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Price</p>
        <p className="font-bold text-lg" style={{ color: '#1FB6D5' }}>${transport.price}</p>
      </div>
    </div>

    {/* Time & Route */}
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1">
        <p className="text-xl font-bold text-slate-800">{transport.departTime}</p>
        <p className="text-xs text-slate-500">{transport.from}</p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-2 h-2 rounded-full" style={{ background: '#1FB6D5' }} />
        <div className="w-0.5 h-6" style={{ background: 'rgba(31,182,213,0.3)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#1FB6D5' }} />
      </div>

      <div className="flex-1 text-right">
        <p className="text-xl font-bold text-slate-800">{transport.arrivalTime}</p>
        <p className="text-xs text-slate-500">{transport.to}</p>
      </div>
    </div>

    {/* Duration & Seats */}
    <div className="flex gap-3 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <Clock className="w-3.5 h-3.5" />
        <span>{transport.duration}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <Users className="w-3.5 h-3.5" />
        <span>{transport.seats} seats</span>
      </div>
    </div>
  </motion.button>
);

export default function TransportResult() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');
  const to = params.get('to');
  const date = params.get('date');
  const type = params.get('type');

  const results = useMemo(() => {
    return MOCK_RESULTS.filter(r => !type || r.type === type);
  }, [type]);

  const handleSelectTransport = (transport) => {
    navigate(createPageUrl(`TicketDetail?transportId=${transport.id}`));
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3 sticky top-0 z-20" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 2px 8px rgba(90,80,70,0.10)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h1 className="font-bold text-lg text-slate-800">Available Tickets</h1>
      </div>

      {/* Route Summary */}
      <div className="mx-4 mt-5 rounded-2xl p-4" style={{ background: 'rgba(31,182,213,0.08)', border: '1px solid rgba(31,182,213,0.2)' }}>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-600" />
          <p className="text-sm font-semibold text-slate-700">
            {from} → {to}
          </p>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Results List */}
      <div className="px-4 mt-6 space-y-3">
        {results.length > 0 ? (
          results.map((transport) => (
            <TransportCard key={transport.id} transport={transport} onSelect={handleSelectTransport} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 font-semibold">No transport available</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}