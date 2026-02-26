import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Popup, CircleMarker, Marker } from 'react-leaflet';
import { ArrowLeft, Bus, Train } from 'lucide-react';
import L from 'leaflet';

// Sample route data for demo
const BUS_ROUTES = [
  {
    id: 1,
    name: 'Route 1A',
    color: '#ef4444',
    stops: [
      { name: 'Central Station', lat: -6.1975, lng: 106.8272 },
      { name: 'Plaza Mall', lat: -6.1976, lng: 106.8290 },
      { name: 'Tech Park', lat: -6.1977, lng: 106.8310 },
      { name: 'Hospital', lat: -6.1978, lng: 106.8330 },
    ]
  },
  {
    id: 2,
    name: 'Route 2B',
    color: '#3b82f6',
    stops: [
      { name: 'West Terminal', lat: -6.1970, lng: 106.8250 },
      { name: 'Damai Putra', lat: -6.1975, lng: 106.8272 },
      { name: 'Shopping Center', lat: -6.1980, lng: 106.8295 },
      { name: 'East Gate', lat: -6.1985, lng: 106.8340 },
    ]
  },
];

const MRT_ROUTES = [
  {
    id: 1,
    name: 'Line Red',
    color: '#dc2626',
    stops: [
      { name: 'Station A', lat: -6.1960, lng: 106.8200 },
      { name: 'Station B', lat: -6.1970, lng: 106.8250 },
      { name: 'Damai Putra Station', lat: -6.1975, lng: 106.8272 },
      { name: 'Station C', lat: -6.1990, lng: 106.8350 },
    ]
  },
  {
    id: 2,
    name: 'Line Blue',
    color: '#2563eb',
    stops: [
      { name: 'North Hub', lat: -6.1900, lng: 106.8270 },
      { name: 'Central Hub', lat: -6.1975, lng: 106.8272 },
      { name: 'South Hub', lat: -6.2050, lng: 106.8270 },
    ]
  },
];

export default function Transport() {
  const navigate = useNavigate();
  const [showBus, setShowBus] = useState(true);
  const [showMRT, setShowMRT] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const mapCenter = [-6.1975, 106.8272];

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3 sticky top-0 z-20" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 2px 8px rgba(90,80,70,0.10)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h1 className="font-bold text-xl text-slate-800">Transportation</h1>
      </div>

      {/* Toggle Buttons */}
      <div className="px-4 py-4 flex gap-2">
        <button
          onClick={() => setShowBus(!showBus)}
          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            showBus
              ? 'text-white shadow-md'
              : 'text-slate-600'
          }`}
          style={showBus
            ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px rgba(239,68,68,0.35)' }
            : { background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(138,127,115,0.08)' }
          }
        >
          <Bus className="w-4 h-4" />
          Bus Routes
        </button>
        <button
          onClick={() => setShowMRT(!showMRT)}
          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            showMRT
              ? 'text-white shadow-md'
              : 'text-slate-600'
          }`}
          style={showMRT
            ? { background: 'linear-gradient(135deg, #2563eb, #1e40af)', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }
            : { background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(138,127,115,0.08)' }
          }
        >
          <Train className="w-4 h-4" />
          MRT Lines
        </button>
      </div>

      {/* Map */}
      <div className="mx-4 rounded-2xl overflow-hidden" style={{ height: '400px', boxShadow: '0 4px 20px rgba(15,61,76,0.25)', border: '1px solid rgba(255,255,255,0.75)' }}>
        <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Bus Routes */}
          {showBus && BUS_ROUTES.map(route => (
            <div key={route.id}>
              {/* Route Line */}
              <Polyline
                positions={route.stops.map(s => [s.lat, s.lng])}
                color={route.color}
                weight={4}
                opacity={0.8}
                onClick={() => setSelectedRoute({ ...route, type: 'bus' })}
              />
              {/* Route Stops */}
              {route.stops.map((stop, idx) => (
                <CircleMarker
                  key={`${route.id}-stop-${idx}`}
                  center={[stop.lat, stop.lng]}
                  radius={6}
                  fillColor={route.color}
                  color={route.color}
                  weight={2}
                  opacity={0.8}
                  fillOpacity={0.7}
                >
                  <Popup>{stop.name}</Popup>
                </CircleMarker>
              ))}
            </div>
          ))}

          {/* MRT Routes */}
          {showMRT && MRT_ROUTES.map(route => (
            <div key={route.id}>
              {/* Route Line */}
              <Polyline
                positions={route.stops.map(s => [s.lat, s.lng])}
                color={route.color}
                weight={5}
                opacity={0.8}
                onClick={() => setSelectedRoute({ ...route, type: 'mrt' })}
                dashArray="5, 5"
              />
              {/* Route Stops */}
              {route.stops.map((stop, idx) => (
                <CircleMarker
                  key={`${route.id}-mrt-stop-${idx}`}
                  center={[stop.lat, stop.lng]}
                  radius={7}
                  fillColor={route.color}
                  color={route.color}
                  weight={2}
                  opacity={0.9}
                  fillOpacity={0.8}
                >
                  <Popup>{stop.name}</Popup>
                </CircleMarker>
              ))}
            </div>
          ))}
        </MapContainer>
      </div>

      {/* Route Details */}
      <div className="px-4 py-5 space-y-3">
        {/* Bus Routes List */}
        {showBus && (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 px-2">Bus Routes</h3>
            {BUS_ROUTES.map(route => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute({ ...route, type: 'bus' })}
                className="w-full rounded-2xl p-4 text-left transition-all active:scale-95 hover:shadow-md"
                style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(138,127,115,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: route.color }} />
                  <p className="font-semibold text-slate-800">{route.name}</p>
                </div>
                <p className="text-xs text-slate-500">
                  {route.stops.length} stops · {route.stops[0].name} to {route.stops[route.stops.length - 1].name}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* MRT Lines List */}
        {showMRT && (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 px-2">MRT Lines</h3>
            {MRT_ROUTES.map(route => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute({ ...route, type: 'mrt' })}
                className="w-full rounded-2xl p-4 text-left transition-all active:scale-95 hover:shadow-md"
                style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(138,127,115,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: route.color }} />
                  <p className="font-semibold text-slate-800">{route.name}</p>
                </div>
                <p className="text-xs text-slate-500">
                  {route.stops.length} stations · {route.stops[0].name} to {route.stops[route.stops.length - 1].name}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Selected Route Details */}
        {selectedRoute && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-full" style={{ background: selectedRoute.color }} />
              <h4 className="font-bold text-slate-800">{selectedRoute.name} Stops</h4>
            </div>
            <div className="space-y-2">
              {selectedRoute.stops.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}</span>
                  <span className="text-slate-700">{stop.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}