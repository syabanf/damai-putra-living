import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Users, Ticket, Download, Share2 } from 'lucide-react';

// Mock ticket data
const MOCK_TICKET = {
  id: 'TK-2026-0157',
  claimCode: 'RW-TXP-A7K9M',
  operator: 'Shuttle Plus',
  status: 'active', // active, used, expired
  from: 'Damai Putra Township',
  to: 'Central Station',
  departTime: '09:00',
  arrivalTime: '13:15',
  date: '2026-02-26',
  duration: '4h 15m',
  price: 75,
  passenger: 'John Doe',
  seat: 'A-12',
  route: 'Route 5 Express',
  qrCode: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22%3E%3Crect fill=%22white%22 width=%22180%22 height=%22180%22/%3E%3C/svg%3E',
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { bg: '#10b981', label: 'Active', icon: '✓' },
    used: { bg: '#6b7280', label: 'Used', icon: '✓' },
    expired: { bg: '#ef4444', label: 'Expired', icon: '×' },
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
      style={{ background: config.bg }}
    >
      <span>{config.icon}</span>
      {config.label}
    </div>
  );
};

export default function ActiveTicket() {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(true);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3 sticky top-0 z-20" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 2px 8px rgba(90,80,70,0.10)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h1 className="font-bold text-lg text-slate-800">My Ticket</h1>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)',
            boxShadow: '0 8px 24px rgba(31,182,213,0.3)',
          }}
        >
          {/* Ticket Header */}
          <div className="px-5 pt-5 pb-4 text-white border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs opacity-80 mb-1">Ticket ID</p>
                <p className="font-bold text-lg">{MOCK_TICKET.id}</p>
              </div>
              <StatusBadge status={MOCK_TICKET.status} />
            </div>
            <p className="text-xs opacity-80">{MOCK_TICKET.operator}</p>
          </div>

          {/* QR Code Section */}
          {showQR && (
            <div className="px-5 py-6 flex flex-col items-center">
              <p className="text-xs text-white/70 mb-3 uppercase tracking-wide font-semibold">Scan to validate</p>
              <div className="bg-white p-3 rounded-xl shadow-lg">
                <div className="w-32 h-32 rounded-lg flex items-center justify-center text-center text-slate-400 text-xs">
                  [QR CODE]
                </div>
              </div>
              <p className="text-xs text-white/70 mt-3">{MOCK_TICKET.claimCode}</p>
            </div>
          )}

          {/* Trip Details */}
          <div className="px-5 py-5" style={{ background: 'rgba(0,0,0,0.15)' }}>
            {/* Time & Route */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <p className="text-2xl font-bold">{MOCK_TICKET.departTime}</p>
                <p className="text-xs opacity-80">{MOCK_TICKET.from}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-xs text-white/70 mb-1">{MOCK_TICKET.duration}</div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  <div className="w-6 h-0.5 bg-white/30" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                </div>
              </div>

              <div className="text-right text-white">
                <p className="text-2xl font-bold">{MOCK_TICKET.arrivalTime}</p>
                <p className="text-xs opacity-80">{MOCK_TICKET.to}</p>
              </div>
            </div>

            {/* Passenger & Seat */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              <div>
                <p className="text-xs opacity-80 mb-0.5">Passenger</p>
                <p className="text-sm font-semibold text-white">{MOCK_TICKET.passenger}</p>
              </div>
              <div>
                <p className="text-xs opacity-80 mb-0.5">Seat</p>
                <p className="text-sm font-semibold text-white">{MOCK_TICKET.seat}</p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-5 py-4 flex gap-2 text-xs text-white/70">
            <Ticket className="w-4 h-4 flex-shrink-0" />
            <span>{MOCK_TICKET.route}</span>
          </div>
        </motion.div>

        {/* Info Card */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(31,182,213,0.08)', border: '1px solid rgba(31,182,213,0.2)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">Date</p>
              <p className="font-bold text-slate-800">
                {new Date(MOCK_TICKET.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">Price Paid</p>
              <p className="font-bold text-slate-800">${MOCK_TICKET.price}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 2px 8px rgba(138,127,115,0.08)',
              color: '#2E2E2E'
            }}
          >
            <Ticket className="w-4 h-4" />
            Details
          </button>

          <button
            className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 2px 8px rgba(138,127,115,0.08)',
              color: '#2E2E2E'
            }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          <button
            className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 2px 8px rgba(138,127,115,0.08)',
              color: '#2E2E2E'
            }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Additional Info */}
        {MOCK_TICKET.status === 'active' && (
          <div className="rounded-2xl p-4 border-l-4 text-sm" style={{ background: '#10b98120', borderColor: '#10b981' }}>
            <p className="font-semibold text-slate-800 mb-1">✓ Ready to travel</p>
            <p className="text-xs text-slate-600">Present your ticket at the boarding counter 15 minutes before departure</p>
          </div>
        )}
      </div>
    </div>
  );
}