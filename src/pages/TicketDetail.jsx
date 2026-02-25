import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileCheck, Clock, CheckCircle, XCircle, Download,
  QrCode, Calendar, User, Phone, FileText, AlertCircle,
  Building2, Truck, Users, Shield, HardHat, Package,
  PartyPopper, CheckCircle2, ChevronRight, Stamp, Hash
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import StatusBadge from '@/components/ui/StatusBadge';

const permitTypeConfig = {
  renovation:        { icon: HardHat,     label: 'Renovation / Fit-Out',      color: '#d97706' },
  moving_in:         { icon: Package,     label: 'Move-In Permit',             color: '#2563eb' },
  moving_out:        { icon: Truck,       label: 'Move-Out Permit',            color: '#7c3aed' },
  event:             { icon: PartyPopper, label: 'Event / Gathering Permit',   color: '#db2777' },
  contractor_access: { icon: Users,       label: 'Contractor / Vendor Access', color: '#059669' },
};

const WORKFLOW_STAGES = [
  { id: 'submitted',          label: 'Submitted',          desc: 'Application received by system'          },
  { id: 'document_check',     label: 'Document Check',     desc: 'Documents being verified'                },
  { id: 'management_review',  label: 'Management Review',  desc: 'Under review by Building Management'     },
  { id: 'final_approval',     label: 'Final Approval',     desc: 'Awaiting authorized officer sign-off'    },
  { id: 'completed',          label: 'Completed',          desc: 'Permit issued or closed'                 },
];

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/60 overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="px-4 py-3 border-b border-white/60" style={{ backgroundColor: 'rgba(245,243,241,0.6)' }}>
    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A8076' }}>{children}</p>
  </div>
);

export default function TicketDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');
  const [showQR, setShowQR] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const tickets = await base44.entities.Ticket.filter({ id: ticketId });
      return tickets[0];
    },
    enabled: !!ticketId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, note, stage }) => {
      const updates = { status };
      if (stage) updates.workflow_stage = stage;
      if (note) updates.rejection_note = note;
      if (status === 'approved') {
        updates.permit_id = `DP-${Date.now().toString(36).toUpperCase()}`;
        updates.reference_number = ticket.reference_number;
        updates.valid_from = ticket.activity_date || new Date().toISOString().split('T')[0];
        updates.valid_until = ticket.activity_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        updates.qr_code = `PERMIT-${updates.permit_id}`;
        updates.approved_by = 'Building Management Officer';
        updates.approval_date = new Date().toISOString();
        updates.workflow_stage = 'completed';
      }
      if (status === 'rejected') updates.workflow_stage = 'completed';
      return base44.entities.Ticket.update(ticketId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
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

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 100%)' }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Permit not found</p>
          <Button variant="outline" onClick={() => navigate(createPageUrl('Tickets'))} className="mt-4">Back</Button>
        </div>
      </div>
    );
  }

  const typeConfig = permitTypeConfig[ticket.permit_type] || { icon: FileCheck, label: ticket.category, color: '#8A8076' };
  const Icon = typeConfig.icon;
  const isPermit = ticket.category === 'permit';
  const currentStageIndex = WORKFLOW_STAGES.findIndex(s => s.id === (ticket.workflow_stage || 'submitted'));

  const headerGradient = ticket.status === 'approved'   ? 'linear-gradient(135deg, #059669, #047857)'
    : ticket.status === 'rejected'   ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
    : ticket.status === 'in_progress'? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    : 'linear-gradient(135deg, #8A8076, #5a524e)';

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-16 rounded-b-3xl" style={{ background: headerGradient }}>
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-white">
              {isPermit ? 'Permit Application' : (ticket.category === 'complaint' ? 'Complaint' : 'Service Request')}
            </h1>
            {ticket.reference_number && <p className="text-white/55 text-xs font-mono mt-0.5">{ticket.reference_number}</p>}
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 flex items-center gap-1">
            <Shield className="w-3 h-3 text-white/80" />
            <span className="text-white/80 text-xs font-medium">Official</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{typeConfig.label}</h2>
            <p className="text-white/65 text-sm">Unit {ticket.unit_number}{ticket.tower ? ` · Tower ${ticket.tower}` : ''}</p>
            <p className="text-white/45 text-xs mt-0.5">{ticket.property_name}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">

        {/* Status & Reference */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard>
            <div className="p-4 border-b border-white/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Application Status</p>
                  <p className="font-bold text-slate-800 capitalize">{ticket.status?.replace(/_/g, ' ')}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
            </div>
            <div className="p-4 flex items-center justify-between bg-white/30">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Reference Number</p>
                  <p className="font-mono text-sm font-semibold text-slate-700">{ticket.reference_number || '—'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Submitted</p>
                <p className="text-xs font-medium text-slate-600">
                  {new Date(ticket.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            {ticket.status === 'rejected' && ticket.rejection_note && (
              <div className="p-4 bg-red-50/80 border-t border-red-100/60">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{ticket.rejection_note}</p>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Digital Permit */}
        {ticket.status === 'approved' && ticket.permit_id && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #1e1b18 0%, #2d2926 100%)' }}>
              <div className="px-5 pt-5 pb-4 border-b border-white/10">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Damai Putra Property</p>
                    <h3 className="text-white font-bold text-base mt-0.5">Digital Permit</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Stamp className="w-5 h-5" style={{ color: '#c8be94' }} />
                  </div>
                </div>
                <p className="text-white/40 text-xs font-mono">{ticket.permit_id}</p>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Permit Type</p>
                    <p className="text-white font-semibold text-sm mt-0.5">{typeConfig.label}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Unit</p>
                    <p className="text-white font-semibold text-sm mt-0.5">{ticket.unit_number}{ticket.tower ? ` / Twr ${ticket.tower}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Valid From</p>
                    <p className="text-white font-semibold text-sm mt-0.5">
                      {new Date(ticket.valid_from + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Valid Until</p>
                    <p className="text-white font-semibold text-sm mt-0.5">
                      {new Date(ticket.valid_until + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {ticket.approved_by && (
                    <div className="col-span-2">
                      <p className="text-white/40 text-xs uppercase tracking-wider">Authorized By</p>
                      <p className="text-white font-semibold text-sm mt-0.5">{ticket.approved_by}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-300 text-xs font-semibold">APPROVED & ACTIVE</p>
                    {ticket.approval_date && (
                      <p className="text-emerald-400/70 text-xs">
                        {new Date(ticket.approval_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-3">
                <Button onClick={() => setShowQR(true)} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm h-10">
                  <QrCode className="w-4 h-4 mr-2" /> Show QR
                </Button>
                <Button className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm h-10">
                  <Download className="w-4 h-4 mr-2" /> Save PDF
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Workflow Timeline */}
        {isPermit && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard>
              <SectionTitle>Approval Progress</SectionTitle>
              <div className="p-4 space-y-0">
                {WORKFLOW_STAGES.map((stage, index) => {
                  const isCompleted = index < currentStageIndex || ticket.status === 'approved';
                  const isCurrent   = index === currentStageIndex && ticket.status !== 'approved' && ticket.status !== 'rejected';
                  const isRejected  = ticket.status === 'rejected' && index === currentStageIndex;
                  return (
                    <div key={stage.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          isRejected  ? 'border-red-400 bg-red-50'     :
                          isCompleted ? 'border-emerald-400 bg-emerald-50' :
                          isCurrent   ? 'border-stone-400 bg-stone-50' : 'border-slate-200 bg-white/60'
                        }`}>
                          {isRejected  ? <XCircle   className="w-3.5 h-3.5 text-red-500"     /> :
                           isCompleted ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> :
                           isCurrent   ? <Clock      className="w-3.5 h-3.5" style={{ color: '#8A8076' }} /> :
                           <div className="w-2 h-2 rounded-full bg-slate-200" />}
                        </div>
                        {index < WORKFLOW_STAGES.length - 1 && (
                          <div className={`w-0.5 h-8 mt-1 mb-1 ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                        )}
                      </div>
                      <div className="pb-4 pt-1">
                        <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>{stage.label}</p>
                        <p className="text-xs text-slate-400">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Activity Schedule */}
        {(ticket.activity_date || ticket.activity_time) && (
          <GlassCard>
            <SectionTitle>Activity Schedule</SectionTitle>
            <div className="p-4 space-y-3">
              {ticket.activity_date && (
                <InfoRow icon={Calendar} label="Date">
                  {new Date(ticket.activity_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {ticket.activity_end_date && ticket.activity_end_date !== ticket.activity_date && (
                    <span className="text-slate-400"> – {new Date(ticket.activity_end_date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  )}
                </InfoRow>
              )}
              {ticket.activity_time && (
                <InfoRow icon={Clock} label="Time">{ticket.activity_time}{ticket.activity_end_time ? ` – ${ticket.activity_end_time}` : ''}</InfoRow>
              )}
              {ticket.num_workers && (
                <InfoRow icon={Users} label="No. of Workers / Guests">{ticket.num_workers} person(s)</InfoRow>
              )}
            </div>
          </GlassCard>
        )}

        {/* Description */}
        {ticket.description && (
          <GlassCard>
            <SectionTitle>Description / Purpose</SectionTitle>
            <div className="p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
            </div>
          </GlassCard>
        )}

        {/* Work Scope */}
        {ticket.work_scope && (
          <GlassCard>
            <SectionTitle>Scope of Work</SectionTitle>
            <div className="p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.work_scope}</p>
            </div>
          </GlassCard>
        )}

        {/* Contractor / Visitor */}
        {ticket.visitor_name && (
          <GlassCard>
            <SectionTitle>
              {ticket.permit_type === 'contractor_access' || ticket.permit_type === 'renovation' ? 'Contractor Details' : 'Representative Details'}
            </SectionTitle>
            <div className="p-4 space-y-3">
              {ticket.contractor_company && <InfoRow icon={Building2} label="Company">{ticket.contractor_company}</InfoRow>}
              <InfoRow icon={User} label="Name">{ticket.visitor_name}</InfoRow>
              {ticket.visitor_phone && <InfoRow icon={Phone} label="Phone">{ticket.visitor_phone}</InfoRow>}
              {ticket.visitor_id && <InfoRow icon={FileText} label="ID Number">{ticket.visitor_id}</InfoRow>}
            </div>
          </GlassCard>
        )}

        {/* Attachments */}
        {ticket.document_urls?.length > 0 && (
          <GlassCard>
            <SectionTitle>Documents ({ticket.document_urls.length})</SectionTitle>
            <div className="p-4 space-y-2">
              {ticket.document_urls.map((url, index) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white/50 border border-white/80 rounded-xl hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#8A8076' }} />
                    <span className="text-sm text-slate-700">Document {index + 1}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Admin / Management Console */}
        <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/90 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider">🔧 Management Console (Demo)</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <p className="text-slate-400 text-xs">Update Workflow Stage</p>
              <div className="grid grid-cols-2 gap-2">
                {['submitted', 'document_check', 'management_review', 'final_approval'].map(stage => (
                  <button key={stage}
                    onClick={() => updateStatusMutation.mutate({ status: ['open','in_progress'].includes(ticket.status) ? 'in_progress' : ticket.status, stage })}
                    className={`text-xs py-2 px-3 rounded-lg border transition-all text-left ${ticket.workflow_stage === stage ? 'border-stone-400 bg-stone-400/20 text-stone-300' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                    {stage.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => updateStatusMutation.mutate({ status: 'approved', stage: 'completed' })}
                className="flex-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 h-9 text-xs">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
              </Button>
              <Button size="sm" onClick={() => updateStatusMutation.mutate({ status: 'rejected', note: adminNote || 'Application does not meet property regulations. Please review and resubmit with complete documentation.', stage: 'completed' })}
                className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 h-9 text-xs">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
              <Button size="sm" onClick={() => updateStatusMutation.mutate({ status: 'open', stage: 'submitted' })}
                className="flex-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 h-9 text-xs">
                Reset
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => setShowQR(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl border border-white/80"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-2 mb-5">
              <Shield className="w-4 h-4" style={{ color: '#8A8076' }} />
              <p className="font-bold text-slate-800 text-sm">Digital Permit QR</p>
            </div>
            <div className="w-52 h-52 bg-white border-4 border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 p-3">
              <div className="w-full h-full grid grid-cols-8 gap-0.5">
                {Array(64).fill(0).map((_, i) => {
                  const corners = [0,1,2,3,4,5,6,8,14,16,22,24,30,40,41,42,43,44,45,46,48,54,56,57,58,59,60,61,62,63];
                  const isCorner = corners.includes(i);
                  const isRand = (i * 7 + 13) % 3 === 0;
                  return <div key={i} className={`rounded-sm ${isCorner || isRand ? 'bg-slate-800' : 'bg-transparent'}`} />;
                })}
              </div>
            </div>
            <p className="font-mono text-sm font-bold text-slate-800 mb-1">{ticket.permit_id}</p>
            <p className="text-slate-400 text-xs mb-2">
              Valid: {new Date(ticket.valid_from + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – {new Date(ticket.valid_until + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            <div className="flex items-center justify-center gap-1 mb-5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mx-auto w-fit">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-700 text-xs font-medium">Verified & Active</span>
            </div>
            <p className="text-slate-400 text-xs mb-4">Present to security / management at point of entry</p>
            <Button onClick={() => setShowQR(false)} className="w-full text-white" style={{ backgroundColor: '#8A8076' }}>Close</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f3f1' }}>
        <Icon className="w-4 h-4" style={{ color: '#8A8076' }} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{children}</p>
      </div>
    </div>
  );
}