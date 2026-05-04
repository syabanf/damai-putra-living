import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, FileText,
  Building2, User, Truck, Wrench, Banknote, Shield, Clock,
  ChevronRight, Send
} from 'lucide-react';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';

const STATUS_FLOW = {
  open: { label: 'Submitted', next: ['under_review', 'rejected'], color: '#3b82f6' },
  under_review: { label: 'Under Review', next: ['waiting_approval', 'in_progress', 'rejected'], color: '#f59e0b' },
  waiting_approval: { label: 'Waiting Approval', next: ['approved', 'rejected'], color: '#f97316' },
  in_progress: { label: 'In Progress', next: ['inspection_required', 'approved', 'rejected'], color: '#8b5cf6' },
  inspection_required: { label: 'Inspection Required', next: ['approved', 'rejected', 'in_progress'], color: '#d97706' },
  approved: { label: 'Approved', next: ['completed', 'deposit_returned'], color: '#22c55e' },
  rejected: { label: 'Rejected', next: ['open'], color: '#ef4444' },
  completed: { label: 'Completed', next: ['closed', 'deposit_returned'], color: '#059669' },
  deposit_returned: { label: 'Deposit Returned', next: ['closed'], color: '#047857' },
  closed: { label: 'Closed', next: [], color: '#64748b' },
};

const STATUS_NEXT_LABELS = {
  under_review: 'Mark Under Review',
  waiting_approval: 'Send for Approval',
  in_progress: 'Mark In Progress',
  approved: 'Approve ✓',
  rejected: 'Reject ✗',
  inspection_required: 'Require Inspection',
  completed: 'Mark Completed',
  deposit_returned: 'Deposit Returned',
  closed: 'Close',
  open: 'Re-open',
};

const STATUS_COLORS = {
  under_review: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
  waiting_approval: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
  in_progress: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
  approved: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
  rejected: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
  inspection_required: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
  completed: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  deposit_returned: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',
  closed: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
  open: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
};

const PERMIT_LABELS = {
  izin_kegiatan: 'Izin Kegiatan', renovasi_minor: 'Renovasi Minor', renovasi_mayor: 'Renovasi Mayor',
  pembangunan_kavling: 'Pembangunan Kavling', galian: 'Izin Galian',
  pindah_masuk: 'Pindah Masuk', pindah_keluar: 'Pindah Keluar',
  pencairan_deposit: 'Pencairan Deposit', akses_kontraktor: 'Akses Kontraktor',
};

const Row = ({ label, value }) => value != null && value !== '' ? (
  <div className="flex justify-between items-start py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-slate-500 text-sm flex-shrink-0">{label}</span>
    <span className="text-slate-800 font-medium text-sm text-right ml-4 max-w-[60%]">{String(value)}</span>
  </div>
) : null;

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
      {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

export default function AdminPermitDetail() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');

  const [adminNotes, setAdminNotes] = useState('');
  const [approverName, setApproverName] = useState('');
  const [permitId, setPermitId] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [pendingStatus, setPendingStatus] = useState(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['admin-ticket', ticketId],
    queryFn: () => base44.entities.Ticket.filter({ id: ticketId }).then(r => r[0]),
    enabled: !!ticketId,
    onSuccess: (t) => {
      if (t?.management_notes) setAdminNotes(t.management_notes);
      if (t?.approved_by) setApproverName(t.approved_by);
      if (t?.permit_id) setPermitId(t.permit_id);
      if (t?.rejection_note) setRejectionNote(t.rejection_note);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const updates = {
        status: newStatus,
        management_notes: adminNotes,
      };
      if (newStatus === 'approved') {
        const generatedPermitId = permitId || `DP/${ticket?.permit_type?.toUpperCase().slice(0, 3)}/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`;
        updates.approved_by = approverName || 'Admin';
        updates.approval_date = new Date().toISOString();
        updates.permit_id = generatedPermitId;
        updates.workflow_stage = 'completed';
        setPermitId(generatedPermitId);
        // Send notification to user
        if (ticket?.user_email) {
          await base44.entities.Notification.create({
            user_email: ticket.user_email,
            title: 'Permit Approved',
            message: `Your ${PERMIT_LABELS[ticket.permit_type] || 'permit'} request has been approved. Permit No: ${generatedPermitId}`,
            type: 'permit_approved',
            reference_id: ticket.id,
          });
        }
      } else if (newStatus === 'rejected') {
        updates.rejection_note = rejectionNote;
        updates.workflow_stage = 'document_check';
        // Send notification to user
        if (ticket?.user_email) {
          await base44.entities.Notification.create({
            user_email: ticket.user_email,
            title: 'Permit Request Rejected',
            message: `Your ${PERMIT_LABELS[ticket.permit_type] || 'permit'} request has been rejected. Reason: ${rejectionNote || 'Please contact management.'}`,
            type: 'permit_rejected',
            reference_id: ticket.id,
          });
        }
      } else if (newStatus === 'under_review') {
        updates.workflow_stage = 'document_check';
      } else if (newStatus === 'waiting_approval') {
        updates.workflow_stage = 'head_approval';
      } else if (newStatus === 'in_progress') {
        updates.workflow_stage = 'building_infrastructure_review';
      }

      await base44.entities.Ticket.update(ticketId, updates);
      // Log
      await base44.entities.ActivityLog.create({
        application_id: ticketId,
        activity_type: 'Status Changed',
        activity_description: `Status changed to ${newStatus} by admin. ${adminNotes ? 'Notes: ' + adminNotes : ''}`,
        performed_by: approverName || 'Admin',
        performed_at: new Date().toISOString(),
        old_value: ticket?.status,
        new_value: newStatus,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ticket', ticketId] });
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
      qc.invalidateQueries({ queryKey: ['admin-tickets-list'] });
      setPendingStatus(null);
    },
  });

  if (isLoading) {
    return (
      <AdminPermitLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminPermitLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminPermitLayout>
        <div className="text-center py-16 text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Permit not found</p>
        </div>
      </AdminPermitLayout>
    );
  }

  const flow = STATUS_FLOW[ticket.status] || { label: ticket.status, next: [], color: '#94a3b8' };
  const isMoving = ['pindah_masuk', 'pindah_keluar'].includes(ticket.permit_type);
  const isConstruction = ['renovasi_minor', 'renovasi_mayor', 'pembangunan_kavling', 'galian'].includes(ticket.permit_type);
  const hasDeposit = ticket.deposit_required > 0;
  const fmt = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
  const currency = n => n ? `IDR ${Number(n).toLocaleString('id-ID')}` : null;

  return (
    <AdminPermitLayout>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => navigate('/AdminPermitList')}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-slate-800">{PERMIT_LABELS[ticket.permit_type] || ticket.permit_type}</h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: flow.color + '22', color: flow.color }}>{flow.label}</span>
          </div>
          <p className="text-slate-500 text-sm">{ticket.reference_number || 'No reference'} · {ticket.user_name} · Unit {ticket.unit_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-4">
          <Section title="Applicant" icon={User}>
            <Row label="Name" value={ticket.user_name} />
            <Row label="Email" value={ticket.user_email} />
          </Section>

          <Section title="Property / Unit" icon={Building2}>
            <Row label="Unit Number" value={ticket.unit_number} />
            <Row label="Property" value={ticket.property_name} />
            <Row label="Tower / Cluster" value={ticket.tower} />
          </Section>

          <Section title="Permit Details" icon={FileText}>
            <Row label="Type" value={PERMIT_LABELS[ticket.permit_type]} />
            <Row label="Application No." value={ticket.reference_number} />
            <Row label="Submitted" value={fmt(ticket.created_date)} />
            <Row label="Activity" value={ticket.description} />
            <Row label="Start Date" value={fmt(ticket.activity_date)} />
            <Row label="End Date" value={fmt(ticket.activity_end_date)} />
            <Row label="Working Hours" value={ticket.activity_time && ticket.activity_end_time ? `${ticket.activity_time} – ${ticket.activity_end_time}` : null} />
            <Row label="Workers" value={ticket.num_workers} />
          </Section>

          {isConstruction && (
            <Section title="Renovation / Construction" icon={Wrench}>
              <Row label="Work Type" value={ticket.work_type} />
              <Row label="Work Scope" value={ticket.work_scope} />
              <Row label="Affected Area" value={ticket.affected_area} />
              <Row label="Contractor" value={ticket.contractor_company} />
              <Row label="Heavy Equipment" value={ticket.uses_heavy_equipment != null ? (ticket.uses_heavy_equipment ? 'Yes' : 'No') : null} />
              <Row label="Noise Potential" value={ticket.noise_potential != null ? (ticket.noise_potential ? 'Yes' : 'No') : null} />
            </Section>
          )}

          {isMoving && (
            <Section title="Moving / Security" icon={Truck}>
              <Row label="Moving Company" value={ticket.moving_company} />
              <Row label="PIC Name" value={ticket.visitor_name} />
              <Row label="PIC Phone" value={ticket.visitor_phone} />
              <Row label="Vehicle Type" value={ticket.vehicle_type} />
              <Row label="Plate Number" value={ticket.vehicle_plate} />
            </Section>
          )}

          {hasDeposit && (
            <Section title="Deposit" icon={Banknote}>
              <Row label="Required" value={currency(ticket.deposit_required)} />
              <Row label="Paid" value={currency(ticket.deposit_paid)} />
              <Row label="Payment Date" value={fmt(ticket.deposit_payment_date)} />
            </Section>
          )}

          {ticket.document_urls?.length > 0 && (
            <Section title="Attached Documents" icon={Shield}>
              <div className="space-y-2">
                {ticket.document_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-blue-50 transition-colors">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-blue-600 flex-1">Document {i + 1}</span>
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4">Current Status</h3>
            <div className="flex flex-col gap-2">
              {Object.entries(STATUS_FLOW).slice(0, 7).map(([key, cfg]) => (
                <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  ticket.status === key ? 'text-white' : 'text-slate-400 bg-slate-50'
                }`} style={ticket.status === key ? { background: cfg.color } : {}}>
                  {ticket.status === key
                    ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                  }
                  {cfg.label}
                </div>
              ))}
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Admin Actions</h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">Approver / Officer Name</label>
              <input value={approverName} onChange={e => setApproverName(e.target.value)}
                placeholder="Full name of officer"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {pendingStatus === 'approved' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Permit ID (auto-generated if empty)</label>
                <input value={permitId} onChange={e => setPermitId(e.target.value)}
                  placeholder="e.g. DP/RNV/2026/0001"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            )}

            {pendingStatus === 'rejected' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-red-500">Rejection Reason *</label>
                <textarea value={rejectionNote} onChange={e => setRejectionNote(e.target.value)}
                  placeholder="Explain why this permit is rejected..."
                  rows={3}
                  className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">Management Notes</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                placeholder="Internal notes for this permit..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Status Transition Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">Update Status</label>
              <div className="space-y-2">
                {flow.next.map(nextStatus => (
                  <div key={nextStatus}>
                    {pendingStatus === nextStatus ? (
                      <div className="flex gap-2">
                        <button onClick={() => statusMutation.mutate(nextStatus)}
                          disabled={statusMutation.isPending || (nextStatus === 'rejected' && !rejectionNote)}
                          className="flex-1 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                          <Send className="w-3.5 h-3.5" />
                          {statusMutation.isPending ? 'Saving...' : 'Confirm'}
                        </button>
                        <button onClick={() => setPendingStatus(null)}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setPendingStatus(nextStatus)}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${STATUS_COLORS[nextStatus] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {STATUS_NEXT_LABELS[nextStatus] || nextStatus}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Approval Info (if already approved) */}
          {ticket.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="font-semibold text-green-700 text-sm">Approved</p>
              </div>
              <Row label="By" value={ticket.approved_by} />
              <Row label="Date" value={ticket.approval_date ? new Date(ticket.approval_date).toLocaleDateString('id-ID') : null} />
              <Row label="Permit No." value={ticket.permit_id} />
            </div>
          )}

          {ticket.status === 'rejected' && ticket.rejection_note && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="font-semibold text-red-700 text-sm">Rejection Reason</p>
              </div>
              <p className="text-red-600 text-sm">{ticket.rejection_note}</p>
            </div>
          )}
        </div>
      </div>
    </AdminPermitLayout>
  );
}