import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, ChevronRight, Clock, CheckCircle,
  AlertCircle, RefreshCw, Home, KeyRound, CreditCard, CalendarRange
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import StatusBadge from '@/components/ui/StatusBadge';

const GlassCard = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.1)' }}
  >
    {children}
  </div>
);

const UnitCard = ({ unit, onClick }) => {
  const isOwner = unit.ownership_status === 'owner';

  const daysLeft = unit.rent_end_date
    ? Math.ceil((new Date(unit.rent_end_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <GlassCard
      className={`p-5 ${isOwner ? 'border-l-4 border-l-amber-400/70' : 'border-l-4 border-l-blue-400/70'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: isOwner ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            {isOwner ? <Home className="w-7 h-7 text-white" /> : <KeyRound className="w-7 h-7 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-lg">{unit.unit_number}</h3>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">{unit.property_name}</p>
            {unit.tower && <p className="text-slate-400 text-xs mt-1">Tower {unit.tower}</p>}
          </div>
        </div>
        <StatusBadge status={unit.status} />
      </div>

      {/* Tenant extras */}
      {!isOwner && unit.status === 'approved' && (
        <div className="mt-4 pt-4 border-t border-white/60 space-y-2">
          {daysLeft !== null && (
            <div className="flex items-center gap-2 text-xs">
              <CalendarRange className="w-3.5 h-3.5 text-blue-500" />
              <span className={`font-semibold ${daysLeft <= 30 ? 'text-red-500' : daysLeft <= 90 ? 'text-amber-500' : 'text-slate-600'}`}>
                {daysLeft > 0 ? `${daysLeft} days remaining` : 'Lease expired'}
              </span>
              <span className="text-slate-400">· until {new Date(unit.rent_end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          )}
          {unit.monthly_rent && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Rp {unit.monthly_rent.toLocaleString('id-ID')} / month</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                unit.rent_payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                unit.rent_payment_status === 'overdue' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {unit.rent_payment_status === 'paid' ? '✓ Paid' :
                 unit.rent_payment_status === 'overdue' ? '⚠ Overdue' : 'Due'}
              </span>
            </div>
          )}
        </div>
      )}

      {unit.status === 'rejected' && unit.rejection_note && (
        <div className="mt-4 p-3 bg-red-50/80 rounded-xl border border-red-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-xs">{unit.rejection_note}</p>
          </div>
        </div>
      )}

      {unit.status === 'approved' && (
        <div className="mt-4 pt-4 border-t border-white/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Verified</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      )}

      {unit.status === 'pending' && (
        <div className="mt-4 pt-4 border-t border-white/60 flex items-center gap-2 text-amber-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Waiting for approval</span>
        </div>
      )}
    </GlassCard>
  );
};

const EmptyState = ({ type, onAdd }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <GlassCard className="p-8 text-center">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 ${type === 'owner' ? 'bg-amber-100' : 'bg-blue-100'}`}>
        {type === 'owner' ? <Home className="w-10 h-10 text-amber-500" /> : <KeyRound className="w-10 h-10 text-blue-500" />}
      </div>
      <h2 className="text-lg font-bold text-slate-800 mb-2">
        {type === 'owner' ? 'No Owned Properties' : 'No Rented Properties'}
      </h2>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        {type === 'owner'
          ? 'Register a property you own to manage it here.'
          : 'Register a unit you are renting to track payments and lease info.'}
      </p>
      <Button onClick={onAdd}
        className="text-white rounded-xl h-12 px-6"
        style={{ background: type === 'owner' ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
        <Plus className="w-5 h-5 mr-2" /> Register Unit
      </Button>
    </GlassCard>
  </motion.div>
);

export default function MyUnit() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('owner');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const userUnits = user ? units.filter(u => u.user_email === user.email) : units;
  const ownedUnits = userUnits.filter(u => u.ownership_status === 'owner');
  const rentedUnits = userUnits.filter(u => u.ownership_status === 'tenant');
  const displayedUnits = activeTab === 'owner' ? ownedUnits : rentedUnits;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
        <h1 className="text-2xl font-bold text-white">My Unit</h1>
        <p className="text-white/50 text-sm mt-1">Manage your properties</p>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <button
            onClick={() => setActiveTab('owner')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'owner' ? 'bg-amber-400 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            <Home className="w-4 h-4" />
            Owned
            {ownedUnits.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'owner' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60'}`}>
                {ownedUnits.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tenant')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tenant' ? 'bg-blue-500 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            <KeyRound className="w-4 h-4" />
            Rented
            {rentedUnits.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'tenant' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60'}`}>
                {rentedUnits.length}
              </span>
        )}
          </button>
        </div>
      </div>

      <div className="px-4 py-5">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/50 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200/60 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200/60 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-200/60 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedUnits.length === 0 ? (
          <EmptyState type={activeTab} onAdd={() => navigate(createPageUrl('AddUnit'))} />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {displayedUnits.map((unit, index) => (
                <motion.div key={unit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                  <UnitCard unit={unit} onClick={() => navigate(createPageUrl('UnitDetail') + `?id=${unit.id}`)} />
                  {unit.status === 'rejected' && (
                    <Button variant="outline" size="sm"
                      onClick={() => navigate(createPageUrl('AddUnit') + `?resubmit=${unit.id}`)}
                      className="mt-2 w-full border-red-200 text-red-600 hover:bg-red-50">
                      <RefreshCw className="w-4 h-4 mr-2" /> Resubmit Application
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <button onClick={() => navigate(createPageUrl('AddUnit'))}
              className="w-full h-14 rounded-2xl border-2 border-dashed border-stone-300/70 bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all text-slate-500 flex items-center justify-center gap-2 font-medium text-sm">
              <Plus className="w-5 h-5" /> Add Another Unit
            </button>
          </div>
        )}
      </div>

    </div>
  );
}