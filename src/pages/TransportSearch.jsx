import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, ArrowRight, Plane, Bus, Train, Car, Package } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const TRANSPORT_TYPES = [
  { id: 'shuttle', label: 'Shuttle', icon: Plane, color: '#1FB6D5' },
  { id: 'bus', label: 'Bus', icon: Bus, color: '#ef4444' },
  { id: 'train', label: 'Train', icon: Train, color: '#2563eb' },
  { id: 'car', label: 'Car Rental', icon: Car, color: '#f97316' },
  { id: 'delivery', label: 'Delivery', icon: Package, color: '#8b5cf6' },
];

const TRANSPORT_STATIONS = [
  { id: 1, name: 'Damai Putra Township', lat: 3.1089, lng: 101.5180, type: 'hub' },
  { id: 2, name: 'Central Station', lat: 3.1466, lng: 101.6956, type: 'hub' },
  { id: 3, name: 'Jalan Utama Terminal', lat: 3.1200, lng: 101.5500, type: 'stop' },
  { id: 4, name: 'Terminal Kota', lat: 3.1350, lng: 101.5900, type: 'stop' },
  { id: 5, name: 'Jalan Merdeka', lat: 3.1250, lng: 101.5700, type: 'stop' },
];

const MapIcon = (color) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"></div>`,
  iconSize: [30, 30],
  className: 'custom-icon',
});

export default function TransportSearch() {
  const navigate = useNavigate();
  const [transportType, setTransportType] = useState('shuttle');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const handleSearch = () => {
    if (fromLocation && toLocation && departDate) {
      navigate(createPageUrl(`TransportResult?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}&date=${departDate}&type=${transportType}`));
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3 sticky top-0 z-20" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 2px 8px rgba(90,80,70,0.10)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h1 className="font-bold text-xl text-slate-800">Find Transport</h1>
      </div>

      {/* Hero Section */}
      <div className="mx-4 mt-5 rounded-2xl overflow-hidden relative h-40" style={{ background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)', boxShadow: '0 4px 20px rgba(31,182,213,0.3)' }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-8 w-40 h-40 rounded-full bg-white/5" />
        </div>
        <div className="relative px-5 py-6 flex flex-col justify-center h-full">
          <h2 className="text-white font-bold text-lg leading-snug">To buy a ticket,<br />to watch the schedule</h2>
          <p className="text-white/70 text-xs mt-2">Book your journey in minutes</p>
        </div>
      </div>

      {/* Transport Type Selector */}
      <div className="mt-6 px-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Choose Transport</h3>
        <div className="grid grid-cols-5 gap-2">
          {TRANSPORT_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTransportType(t.id)}
                className="rounded-xl py-3 px-2 flex flex-col items-center gap-1.5 transition-all"
                style={
                  transportType === t.id
                    ? { background: `${t.color}20`, border: `2px solid ${t.color}` }
                    : { background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }
                }
              >
                <Icon className="w-5 h-5" style={{ color: t.color }} />
                <span className="text-[9px] font-semibold text-center leading-tight text-slate-700">{t.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Route Input Section */}
      <div className="mt-6 px-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Route Details</h3>

        {/* From Location */}
        <div>
          <label className="text-xs text-slate-600 font-semibold mb-1.5 block">From</label>
          <input
            type="text"
            placeholder="Departure location"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 2px 8px rgba(138,127,115,0.08)',
              focusRing: '0 0 0 2px rgba(31,182,213,0.2)'
            }}
          />
        </div>

        {/* To Location */}
        <div>
          <label className="text-xs text-slate-600 font-semibold mb-1.5 block">To</label>
          <input
            type="text"
            placeholder="Arrival location"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 2px 8px rgba(138,127,115,0.08)',
              focusRing: '0 0 0 2px rgba(31,182,213,0.2)'
            }}
          />
        </div>

        {/* Swap Button */}
        <button
          onClick={() => {
            const temp = fromLocation;
            setFromLocation(toLocation);
            setToLocation(temp);
          }}
          className="absolute left-1/2 -translate-x-1/2 mt-[-45px] w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 12px rgba(31,182,213,0.2)' }}
        >
          <ArrowRight className="w-4 h-4 text-slate-600 rotate-90" />
        </button>
      </div>

      {/* Date Selector */}
      <div className="mt-6 px-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Travel Dates</h3>

        {/* Departure Date */}
        <div>
          <label className="text-xs text-slate-600 font-semibold mb-1.5 block">Departure</label>
          <input
            type="date"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 2px 8px rgba(138,127,115,0.08)'
            }}
          />
        </div>

        {/* Return Date */}
        <div>
          <label className="text-xs text-slate-600 font-semibold mb-1.5 block">Return (Optional)</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 2px 8px rgba(138,127,115,0.08)'
            }}
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="px-4 mt-8">
        <button
          onClick={handleSearch}
          disabled={!fromLocation || !toLocation || !departDate}
          className="w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: fromLocation && toLocation && departDate 
              ? 'linear-gradient(135deg, #1FB6D5, #1098b8)' 
              : 'linear-gradient(135deg, #cbd5e1, #b0bac3)',
            boxShadow: fromLocation && toLocation && departDate 
              ? '0 4px 16px rgba(31,182,213,0.35)' 
              : 'none'
          }}
        >
          Search Tickets
        </button>
      </div>
    </div>
  );
}