import { useNavigate } from 'react-router-dom';
import ExploreMap from '@/components/map/ExploreMap';

export default function TransportExploreMap() {
  const navigate = useNavigate();
  
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get('mode') || 'transport';

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
          {filteredData.map(item => (
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

      {/* Stats Section */}
      <div className="mx-4 mt-4 flex gap-3">
        <div className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)' }}>
          <p className="text-xs text-slate-500 font-semibold">Total Available</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{filteredData.length}</p>
        </div>
        <div className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(31,182,213,0.1)', backdropFilter: 'blur(12px)' }}>
          <p className="text-xs text-slate-600 font-semibold">{mode === 'transport' ? 'Routes' : 'Categories'}</p>
          <p className="text-2xl font-bold" style={{ color: '#1FB6D5' }} className="mt-1">
            {mode === 'transport' ? filteredData.reduce((sum, i) => sum + i.routes, 0) : mode === 'explore' ? new Set(filteredData.map(i => i.type)).size : 0}
          </p>
        </div>
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

       {/* Filter Section */}
       <div className="mx-4 mt-4 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
       <div className="flex items-center justify-between mb-3">
         <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
           <Filter className="w-4 h-4" />
           Filter by Type
         </h3>
         <button onClick={() => setFilterType('all')} className="text-xs text-slate-500 hover:text-slate-700 font-medium">Reset</button>
       </div>
       <div className="flex flex-wrap gap-2">
         {LEGEND_ITEMS[mode].map(item => (
           <button
             key={item.type}
             onClick={() => setFilterType(filterType === item.type ? 'all' : item.type)}
             className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
             style={filterType === item.type
               ? { background: item.color, color: '#fff', boxShadow: `0 2px 8px ${item.color}40` }
               : { background: 'rgba(255,255,255,0.8)', color: '#64748b', border: `1px solid ${item.color}40` }
             }
           >
             {item.label}
           </button>
         ))}
       </div>
       </div>

       {/* List View Toggle & Items */}
       <div className="mx-4 mt-4">
       <button
         onClick={() => setShowList(!showList)}
         className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
         style={{
           background: showList ? 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)' : 'rgba(255,255,255,0.75)',
           color: showList ? '#fff' : '#64748b',
           border: showList ? 'none' : '1px solid rgba(255,255,255,0.85)'
         }}
       >
         {showList ? '↑ Hide List' : '↓ Show List'}
       </button>
       </div>

       {/* Items List */}
       {showList && (
       <motion.div
         initial={{ opacity: 0, height: 0 }}
         animate={{ opacity: 1, height: 'auto' }}
         exit={{ opacity: 0, height: 0 }}
         className="mx-4 mt-4 space-y-2 mb-6"
       >
         {filteredData.length > 0 ? (
           filteredData.map((item, idx) => (
             <motion.div
               key={item.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.05 }}
               onClick={() => setSelectedItem(item)}
               className="p-3 rounded-xl cursor-pointer active:scale-95 transition-all"
               style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}
             >
               <div className="flex items-center justify-between">
                 <div className="flex-1">
                   <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                   <p className="text-xs text-slate-500 mt-0.5">
                     {mode === 'transport' 
                       ? `${item.routes} routes • ${item.status}` 
                       : `${item.category}${item.rating ? ` • ${item.rating}★` : ''}`
                     }
                   </p>
                 </div>
                 <div className="text-right">
                   <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${mode === 'transport' ? (item.type === 'hub' ? '#1FB6D5' : '#8E8478') : item.type === 'commercial' ? '#1FB6D5' : item.type === 'culinary' ? '#ef4444' : item.type === 'retail' ? '#f97316' : item.type === 'entertainment' ? '#f59e0b' : item.type === 'community' ? '#10b981' : item.type === 'attraction' ? '#8b5cf6' : '#ec4899'}` }}>
                     <span className="text-white text-xs font-bold">→</span>
                   </div>
                 </div>
               </div>
             </motion.div>
           ))
         ) : (
           <div className="p-4 text-center rounded-xl" style={{ background: 'rgba(255,255,255,0.75)' }}>
             <p className="text-sm text-slate-500">No items found for this filter</p>
           </div>
         )}
       </motion.div>
       )}
       </div>
       );
       }