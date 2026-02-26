import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl overflow-hidden ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.08)' }}
  >
    {children}
  </div>
);

export default function Culinary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => base44.entities.Destination.list(),
  });

  const foodBeverageTenants = tenants.filter(t => t.category === 'food_beverage');
  const filteredTenants = foodBeverageTenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.9)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h1 className="font-bold text-xl text-slate-800">Culinary</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search restaurants & cafes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Tenants List */}
      <div className="px-4 space-y-3">
        {filteredTenants.length > 0 ? (
          filteredTenants.map((tenant, i) => (
            <motion.div key={tenant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-slate-800">{tenant.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{tenant.destination_name}</p>
                    </div>
                    {tenant.logo_url && (
                      <img src={tenant.logo_url} alt={tenant.name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                  </div>
                  {tenant.description && (
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{tenant.description}</p>
                  )}
                  <div className="space-y-1.5 text-xs text-slate-500">
                    {tenant.location_detail && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {tenant.location_detail}
                      </div>
                    )}
                    {tenant.opening_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {tenant.opening_hours}
                      </div>
                    )}
                    {tenant.contact && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {tenant.contact}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-500 text-sm">{search ? 'No restaurants found' : 'No restaurants available'}</p>
          </div>
        )}
      </div>
    </div>
  );
}