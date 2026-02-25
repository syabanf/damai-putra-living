import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building2, User, FileText, Calendar, CheckCircle,
  Clock, XCircle, AlertCircle, Ticket, ChevronRight, RefreshCw, Video,
  Home, KeyRound, CreditCard, Phone, Mail, CalendarRange
} from 'lucide-react';
import { Button } from "@/components/ui/button";
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/60 ${className}`}>
    {children}
  </div>
);

export default function UnitDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const unitId = urlParams.get('id');

  const { data: unit, isLoading } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      const units = await base44.entities.Unit.filter({ id: unitId });
      return units[0];
    },
    enabled: !!unitId,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', unitId],
    queryFn: () => base44.entities.Ticket.filter({ unit_id: unitId }),
    enabled: !!unitId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }) => base44.entities.Unit.update(unitId, { status, rejection_note: note || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-[3px] rounded-full"
          style={{ borderColor: '#8A8076', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Unit not found</p>
          <Button variant="outline" onClick={() => navigate(createPageUrl('MyUnit'))} className="mt-4">Back to My Unit</Button>
        </div>
      </div>
    );
  }

  const isOwner = unit.ownership_status === 'owner';
  const headerGradient = unit.status === 'approved' ? 'linear-gradient(135deg, #059669, #047857)'
    : unit.status === 'rejected' ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
    : 'linear-gradient(135deg, #d97706, #b45309)';

  const StatusIcon = unit.status === 'approved' ? CheckCircle : unit.status === 'rejected' ? XCircle : Clock;

  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-16 rounded-b-3xl" style={{ background: headerGradient }}>
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Unit Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            {isOwner ? <Home className="w-8 h-8 text-white" /> : <KeyRound className="w-8 h-8 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-white">{unit.unit_number}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white/90 uppercase tracking-wide">
                {isOwner ? 'Owner' : 'Tenant'}
              </span>
            </div>
            <p className="text-white/75">{unit.property_name}</p>
            {unit.tower && <p className="text-white/55 text-sm">Tower {unit.tower}</p>}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">

        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-5 shadow-lg shadow-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  unit.status === 'approved' ? 'bg-emerald-100' :
                  unit.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  <StatusIcon className={`w-6 h-6 ${
                    unit.status === 'approved' ? 'text-emerald-600' :
                    unit.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="font-bold text-slate-800 capitalize">{unit.status}</p>
                </div>
              </div>
              <StatusBadge status={unit.status} />
            </div>

            {unit.status === 'rejected' && unit.rejection_note && (
              <div className="bg-red-50/80 border border-red-100 rounded-xl p-4">
                <p className="text-red-800 text-sm font-medium mb-1">Rejection Reason:</p>
                <p className="text-red-700 text-sm">{unit.rejection_note}</p>
              </div>
            )}

            {unit.status === 'pending' && (
              <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4">
                <p className="text-amber-700 text-sm">Your registration is being reviewed. You'll be notified once approved.</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Info Cards */}
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-white/60">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOwner ? 'bg-amber-100' : 'bg-blue-100'}`}>
                {isOwner ? <Home className="w-5 h-5 text-amber-600" /> : <KeyRound className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <p className="text-xs text-slate-400">Ownership Status</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-semibold text-slate-800 capitalize">{unit.ownership_status}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOwner ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {isOwner ? '🏠 Property Owner' : '🔑 Renter / Tenant'}
                  </span>
                </div>
                {!isOwner && (
                  <p className="text-xs text-slate-400 mt-0.5">Limited management access applies</p>
                )}
              </div>
            </div>
          </div>
          <div className={`p-4 ${unit.document_url ? 'border-b border-white/60' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f5f3f1' }}>
                <Calendar className="w-5 h-5" style={{ color: '#8A8076' }} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Registered On</p>
                <p className="font-semibold text-slate-800">
                  {new Date(unit.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          {unit.document_url && (
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f5f3f1' }}>
                    <FileText className="w-5 h-5" style={{ color: '#8A8076' }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Supporting Document</p>
                    <p className="font-semibold text-slate-800">Uploaded</p>
                  </div>
                </div>
                <a href={unit.document_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ color: '#8A8076', backgroundColor: '#f5f3f1' }}>
                  View
                </a>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Tenant-only section */}
        {!isOwner && unit.status === 'approved' && (
          <div className="space-y-4">
            {/* Renting Period */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Rental Info</p>
              <GlassCard className="overflow-hidden border-l-4 border-l-blue-400/70">
                <div className="p-4 border-b border-white/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <CalendarRange className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Renting Period</p>
                      {unit.rent_start_date && unit.rent_end_date ? (
                        <>
                          <p className="font-semibold text-slate-800">
                            {new Date(unit.rent_start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' → '}
                            {new Date(unit.rent_end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          {(() => {
                            const daysLeft = Math.ceil((new Date(unit.rent_end_date) - new Date()) / (1000 * 60 * 60 * 24));
                            const color = daysLeft <= 30 ? 'text-red-500' : daysLeft <= 90 ? 'text-amber-500' : 'text-emerald-600';
                            return <p className={`text-xs font-semibold mt-0.5 ${color}`}>{daysLeft > 0 ? `${daysLeft} days remaining` : 'Lease expired'}</p>;
                          })()}
                        </>
                      ) : (
                        <p className="font-semibold text-slate-400">Not set</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rent Payment */}
                <div className="p-4 border-b border-white/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        unit.rent_payment_status === 'paid' ? 'bg-emerald-100' :
                        unit.rent_payment_status === 'overdue' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        <CreditCard className={`w-5 h-5 ${
                          unit.rent_payment_status === 'paid' ? 'text-emerald-600' :
                          unit.rent_payment_status === 'overdue' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Monthly Rent</p>
                        <p className="font-semibold text-slate-800">
                          {unit.monthly_rent ? `Rp ${unit.monthly_rent.toLocaleString('id-ID')}` : 'Not set'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      unit.rent_payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      unit.rent_payment_status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {unit.rent_payment_status === 'paid' ? '✓ Paid' :
                       unit.rent_payment_status === 'overdue' ? '⚠ Overdue' : 'Due'}
                    </span>
                  </div>
                </div>

                {/* Owner Contact */}
                <div className="p-4">
                  <p className="text-xs text-slate-400 mb-3">Owner Contact</p>
                  {unit.owner_name || unit.owner_phone || unit.owner_email ? (
                    <div className="space-y-2">
                      {unit.owner_name && (
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-medium">{unit.owner_name}</span>
                        </div>
                      )}
                      {unit.owner_phone && (
                        <a href={`tel:${unit.owner_phone}`} className="flex items-center gap-2 text-sm text-blue-600 active:opacity-70">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">{unit.owner_phone}</span>
                        </a>
                      )}
                      {unit.owner_email && (
                        <a href={`mailto:${unit.owner_email}`} className="flex items-center gap-2 text-sm text-blue-600 active:opacity-70">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">{unit.owner_email}</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No owner contact info available</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Action Button */}
        {unit.status === 'approved' && (
          <button onClick={() => navigate(createPageUrl('Tickets'))}
            className="w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 4px 20px rgba(138,128,118,0.35)' }}>
            <Ticket className="w-5 h-5" /> Create Support Ticket
          </button>
        )}

        {unit.status === 'rejected' && (
          <button onClick={() => navigate(createPageUrl('AddUnit') + `?resubmit=${unit.id}`)}
            className="w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 4px 20px rgba(138,128,118,0.35)' }}>
            <RefreshCw className="w-5 h-5" /> Resubmit Application
          </button>
        )}

        {/* Surveillance */}
        {unit.status === 'approved' && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Unit Surveillance</p>
            <div className="rounded-2xl p-4 border border-white/10" style={{ background: 'linear-gradient(145deg, #1e2330, #111827)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Live</span>
                </div>
                <span className="text-[10px] text-slate-500">Unit {unit.unit_number}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[{ label: 'Front Door', status: 'online' }, { label: 'Corridor', status: 'online' }].map((cam, i) => (
                  <div key={i} className="rounded-xl p-3 flex items-center gap-2.5 border border-white/5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <Video className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/80 truncate">{cam.label}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        <p className="text-[10px] text-emerald-400">{cam.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                <p className="text-[10px] text-slate-500">2 cameras active</p>
                <button className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 hover:text-white transition-colors">
                  Request Footage <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tickets List */}
        {unit.status === 'approved' && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Tickets & Permits</p>
            <GlassCard className="overflow-hidden">
              {tickets.length === 0 ? (
                <div className="p-6 text-center">
                  <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No tickets yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/60">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/40 active:bg-white/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f5f3f1' }}>
                          <Ticket className="w-4 h-4" style={{ color: '#8A8076' }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 capitalize">
                            {ticket.permit_type?.replace(/_/g, ' ') || ticket.category?.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-slate-400">
                            {ticket.reference_number || new Date(ticket.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ticket.status} />
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* Admin Simulation Panel */}
        <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/90 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider">🔧 Admin Simulation (Demo Only)</p>
          </div>
          <div className="p-4 flex gap-2">
            <Button size="sm" variant="outline"
              onClick={() => updateStatusMutation.mutate({ status: 'approved' })}
              className="flex-1 bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30">
              Approve
            </Button>
            <Button size="sm" variant="outline"
              onClick={() => updateStatusMutation.mutate({ status: 'rejected', note: 'Document unclear. Please upload a clearer copy.' })}
              className="flex-1 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30">
              Reject
            </Button>
            <Button size="sm" variant="outline"
              onClick={() => updateStatusMutation.mutate({ status: 'pending' })}
              className="flex-1 bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30">
              Reset
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}