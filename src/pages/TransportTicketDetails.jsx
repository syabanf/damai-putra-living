import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, MapPin, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

const LOCATION_MAP = {
  '221': 'Damai Putra',
  '213123': 'Central Station',
  '101': 'KL Airport',
  '102': 'Sentosa Terminal',
  '103': 'Bukit Bintang',
  '104': 'Klang Valley',
  '105': 'Shah Alam',
};

const TICKET_OPTIONS = [
  { id: 1, name: 'Adult', price: 45, quantity: 1 },
  { id: 2, name: 'Child', price: 25, quantity: 0 },
  { id: 3, name: 'Senior', price: 35, quantity: 0 },
];

export default function TransportTicketDetails() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');
  const to = params.get('to');
  const date = params.get('date');
  const type = params.get('type');
  
  const [quantities, setQuantities] = useState({ adult: 1, child: 0, senior: 0 });
  const [selectedSeats, setSelectedSeats] = useState([1, 2]);
  const [bookingStep, setBookingStep] = useState('details');

  const fromName = LOCATION_MAP[from] || from;
  const toName = LOCATION_MAP[to] || to;
  
  const priceAdult = 45;
  const priceChild = 25;
  const priceSenior = 35;
  
  const total = (quantities.adult * priceAdult) + (quantities.child * priceChild) + (quantities.senior * priceSenior);
  const totalPassengers = quantities.adult + quantities.child + quantities.senior;

  const handleQuantityChange = (type, change) => {
    setQuantities(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + change)
    }));
  };

  const handleBooking = () => {
    if (totalPassengers > 0) {
      setBookingStep('confirmation');
    }
  };

  const handleConfirm = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3 sticky top-0 z-20" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)' }}>
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h1 className="font-bold text-lg text-slate-800">Book Ticket</h1>
      </div>

      {bookingStep === 'details' ? (
        <>
          {/* Route & Date Summary */}
          <div className="mx-4 mt-5 rounded-2xl p-4" style={{ background: 'rgba(31,182,213,0.08)', border: '1px solid rgba(31,182,213,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-slate-600" />
              <p className="text-sm font-semibold text-slate-700">{fromName} → {toName}</p>
            </div>
            <p className="text-xs text-slate-500">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {type?.toUpperCase()}
            </p>
          </div>

          {/* Passenger Selection */}
          <div className="mx-4 mt-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Select Passengers</h3>
            {[
              { key: 'adult', label: 'Adult', price: priceAdult },
              { key: 'child', label: 'Child (0-12)', price: priceChild },
              { key: 'senior', label: 'Senior (60+)', price: priceSenior }
            ].map(p => (
              <div key={p.key} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{p.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">${p.price} per ticket</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(p.key, -1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: 'rgba(31,182,213,0.1)' }}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold">{quantities[p.key]}</span>
                    <button
                      onClick={() => handleQuantityChange(p.key, 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)' }}
                    >
                      <span className="text-white font-semibold">+</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="mx-4 mt-8 rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal ({totalPassengers} pax)</span>
              <span className="text-slate-800 font-semibold">${total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Booking Fee</span>
              <span className="text-slate-800 font-semibold">$2.50</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
              <span className="font-bold text-slate-800">Total</span>
              <span className="font-bold" style={{ color: '#1FB6D5' }}>${(total + 2.5).toFixed(2)}</span>
            </div>
          </div>

          {/* Book Button */}
          <div className="mx-4 mt-8">
            <button
              onClick={handleBooking}
              disabled={totalPassengers === 0}
              className="w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: totalPassengers > 0 ? 'linear-gradient(135deg, #1FB6D5, #1098b8)' : 'linear-gradient(135deg, #cbd5e1, #b0bac3)',
                boxShadow: totalPassengers > 0 ? '0 4px 16px rgba(31,182,213,0.35)' : 'none'
              }}
            >
              Continue to Payment
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Confirmation Screen */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 mt-8 rounded-2xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: '#d1fae5' }}
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </motion.div>

            <h2 className="font-bold text-xl text-slate-800 mb-2">Booking Confirmed!</h2>
            <p className="text-sm text-slate-500 mb-6">Your ticket has been reserved</p>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-6 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Booking ID</span>
                <span className="font-semibold text-slate-800">BK{Math.floor(Math.random() * 100000)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Route</span>
                <span className="font-semibold text-slate-800">{fromName} → {toName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Passengers</span>
                <span className="font-semibold text-slate-800">{totalPassengers}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 pt-3">
                <span className="text-slate-600">Total Amount</span>
                <span className="font-bold" style={{ color: '#1FB6D5' }}>${(total + 2.5).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #1FB6D5, #1098b8)' }}
            >
              Back to Results
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}