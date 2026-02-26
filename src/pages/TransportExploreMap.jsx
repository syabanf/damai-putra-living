import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Bus, Compass, MapPin, Clock, DollarSign } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const TRANSPORT_STATIONS = [
  { id: 1, name: 'Damai Putra Hub', lat: 3.1089, lng: 101.5180, type: 'hub', routes: 5, status: 'Active' },
  { id: 2, name: 'KL Central Station', lat: 3.1466, lng: 101.6956, type: 'hub', routes: 12, status: 'Active' },
  { id: 3, name: 'Jalan Utama Terminal', lat: 3.1200, lng: 101.5500, type: 'stop', routes: 3, status: 'Active' },
  { id: 4, name: 'Terminal Kota', lat: 3.1350, lng: 101.5900, type: 'stop', routes: 4, status: 'Active' },
  { id: 5, name: 'Jalan Merdeka Stop', lat: 3.1250, lng: 101.5700, type: 'stop', routes: 2, status: 'Active' },
  { id: 6, name: 'Sentosa Terminal', lat: 3.1400, lng: 101.5400, type: 'stop', routes: 3, status: 'Active' },
  { id: 7, name: 'Bukit Bintang Hub', lat: 3.1380, lng: 101.7120, type: 'hub', routes: 8, status: 'Active' },
  { id: 8, name: 'Midvalley Stop', lat: 3.1120, lng: 101.6850, type: 'stop', routes: 2, status: 'Active' },
];

const DESTINATION_PINS = [
  { id: 1, name: 'Central Mall', lat: 3.1350, lng: 101.5900, type: 'commercial', category: 'Shopping Mall', rating: 4.5 },
  { id: 2, name: 'The Curve F&B Zone', lat: 3.1200, lng: 101.5500, type: 'culinary', category: 'Food Court', rating: 4.3 },
  { id: 3, name: 'Sunway Lagoon Theme Park', lat: 3.1450, lng: 101.6000, type: 'entertainment', category: 'Theme Park', rating: 4.6 },
  { id: 4, name: 'Community Center Damansara', lat: 3.1100, lng: 101.5300, type: 'community', category: 'Community', rating: 4.1 },
  { id: 5, name: 'Premium Outlets KL', lat: 3.1250, lng: 101.5700, type: 'retail', category: 'Outlets', rating: 4.4 },
  { id: 6, name: 'Pavilion KL', lat: 3.1500, lng: 101.7200, type: 'commercial', category: 'Shopping Mall', rating: 4.7 },
  { id: 7, name: 'Nandos Restaurant', lat: 3.1150, lng: 101.6100, type: 'culinary', category: 'Restaurant', rating: 4.2 },
  { id: 8, name: 'Petronas Twin Towers', lat: 3.1570, lng: 101.6876, type: 'attraction', category: 'Attraction', rating: 4.8 },
  { id: 9, name: 'Klang Valley Health Center', lat: 3.1300, lng: 101.5600, type: 'health', category: 'Healthcare', rating: 4.0 },
  { id: 10, name: 'Fashion District', lat: 3.1400, lng: 101.5800, type: 'retail', category: 'Fashion', rating: 4.3 },
];

const LEGEND_ITEMS = {
  transport: [
    { type: 'hub', label: 'Major Hub', color: '#1FB6D5' },
    { type: 'stop', label: 'Bus Stop', color: '#8E8478' },
  ],
  explore: [
    { type: 'commercial', label: 'Shopping', color: '#1FB6D5' },
    { type: 'culinary', label: 'F&B', color: '#ef4444' },
    { type: 'retail', label: 'Retail', color: '#f97316' },
    { type: 'entertainment', label: 'Entertainment', color: '#f59e0b' },
    { type: 'community', label: 'Community', color: '#10b981' },
    { type: 'attraction', label: 'Attraction', color: '#8b5cf6' },
    { type: 'health', label: 'Health', color: '#ec4899' },
  ],
};

const MapIcon = (type, isTransport) => {
  const colors = isTransport ? {
    hub: '#1FB6D5',
    stop: '#8E8478',
  } : {
    commercial: '#1FB6D5',
    retail: '#f97316',
    culinary: '#ef4444',
    attraction: '#8b5cf6',
    entertainment: '#f59e0b',
    community: '#10b981',
    health: '#ec4899',
  };
  
  return L.divIcon({
    html: `<div style="background-color: ${colors[type] || '#1FB6D5'}; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 14px; box-shadow: 0 3px 10px rgba(0,0,0,0.25);"></div>`,
    iconSize: [36, 36],
    className: 'custom-icon-hover',
  });
};

export default function TransportExploreMap() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('transport');
  const [selectedItem, setSelectedItem] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get('mode') || 'transport';
  
  React.useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  const data = mode === 'transport' ? TRANSPORT_STATIONS : DESTINATION_PINS;
  const title = mode === 'transport' ? 'Transport Stations' : 'Explore Destinations';

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 pt-4 px-4 pb-4" style={{ background: 'rgba(245,244,242,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl active:scale-95 transition-transform" style={{ background: 'rgba(255,255,255,0.75)' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E2E2E' }} />
          </button>
          <h1 className="text-lg font-bold" style={{ color: '#2E2E2E' }}>{title}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Map */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden h-96" style={{ boxShadow: '0 4px 20px rgba(31,182,213,0.2)' }}>
        <MapContainer center={[3.1200, 101.5600]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {data.map(item => (
           <Marker 
             key={item.id} 
             position={[item.lat, item.lng]} 
             icon={MapIcon(item.type, mode === 'transport')}
             eventHandlers={{
               click: () => setSelectedItem(item),
             }}
           >
             <Popup>
               <div className="text-sm font-semibold">{item.name}</div>
             </Popup>
           </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Toggle Buttons */}
      <div className="mx-4 mt-4 flex gap-3">
        <motion.button
          onClick={() => setMode('transport')}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          style={mode === 'transport' ? {
            background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)',
            color: '#fff',
            boxShadow: '0 3px 10px rgba(31,182,213,0.35)',
          } : {
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.85)',
            color: '#64748b',
          }}
        >
          <Bus className="w-4 h-4" />
          Transport
        </motion.button>
        
        <motion.button
          onClick={() => setMode('explore')}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          style={mode === 'explore' ? {
            background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)',
            color: '#fff',
            boxShadow: '0 3px 10px rgba(31,182,213,0.35)',
          } : {
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.85)',
            color: '#64748b',
          }}
        >
          <Compass className="w-4 h-4" />
          Explore
        </motion.button>
      </div>

      {/* Legend */}
      <div className="mx-4 mt-4 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
       <h3 className="text-xs font-bold text-slate-800 mb-3">Map Legend</h3>
       <div className="grid grid-cols-2 gap-2">
         {LEGEND_ITEMS[mode].map(item => (
           <div key={item.type} className="flex items-center gap-2 text-xs">
             <div className="w-4 h-4 rounded-full" style={{ background: item.color }}></div>
             <span className="text-slate-600">{item.label}</span>
           </div>
         ))}
       </div>
      </div>

      {/* Selected Item Details */}
      {selectedItem && (
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mx-4 mt-4 rounded-2xl p-4 mb-6"
         style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)' }}
       >
         <div className="flex justify-between items-start mb-3">
           <div>
             <h3 className="font-bold text-slate-800">{selectedItem.name}</h3>
             <p className="text-xs text-slate-500 mt-0.5">
               {selectedItem.category || (selectedItem.type === 'hub' ? 'Major Hub' : 'Bus Stop')}
             </p>
           </div>
           <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
             ✕
           </button>
         </div>

         {mode === 'transport' ? (
           <div className="space-y-2">
             <div className="flex items-center gap-2 text-sm">
               <Bus className="w-4 h-4 text-slate-400" />
               <span className="text-slate-700"><strong>{selectedItem.routes}</strong> routes available</span>
             </div>
             <div className="flex items-center gap-2 text-sm">
               <Clock className="w-4 h-4 text-slate-400" />
               <span className="text-slate-700">{selectedItem.status}</span>
             </div>
           </div>
         ) : (
           <div className="space-y-2">
             <div className="flex items-center gap-2 text-sm">
               <MapPin className="w-4 h-4 text-slate-400" />
               <span className="text-slate-700">{selectedItem.category}</span>
             </div>
             <div className="flex items-center gap-2 text-sm">
               <span className="text-amber-500">★</span>
               <span className="text-slate-700"><strong>{selectedItem.rating}</strong> rating</span>
             </div>
           </div>
         )}
       </motion.div>
      )}
      </div>
      );
      }