import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle,
  FileText, Building2, User, Truck, Wrench,
  Eye, Banknote, ClipboardCheck, Shield, ClipboardList, History, Search, Clock, SkipForward
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const STATUS_STYLE = {
  draft:               { label: 'Draft',              bg: '#f1f5f9', color: '#64748b' },
  open:                { label: 'Submitted',           bg: '#eff6ff', color: '#3b82f6' },
  under_review:        { label: 'Under Review',        bg: '#fffbeb', color: '#d97706' },
  waiting_approval:    { label: 'Waiting Approval',    bg: '#fff7ed', color: '#ea580c' },
  in_progress:         { label: 'In Progress',         bg: '#f5f3ff', color: '#7c3aed' },
  approved:            { label: 'Approved',            bg: '#ecfdf5', color: '#059669' },
  rejected:            { label: 'Rejected',            bg: '#fef2f2', color: '#dc2626' },
  inspection_required: { label: 'Inspection Required', bg: '#fffbeb', color: '#d97706' },
  completed:           { label: 'Completed',           bg: '#ecfdf5', color: '#059669' },
  deposit_returned:    { label: 'Deposit Returned',    bg: '#ecfdf5', color: '#059669' },
  closed:              { label: 'Closed',              bg: '#f8fafc', color: '#94a3b8' },
};

const PERMIT_LABELS = {
  izin_kegiatan: 'Izin Kegiatan',
  renovasi_minor: 'Renovasi Minor',
  renovasi_mayor: 'Renovasi Mayor',
  pembangunan_kavling: 'Pembangunan Kavling',
  galian: 'Izin Galian',
  pindah_masuk: 'Pindah Masuk',
  pindah_keluar: 'Pindah Keluar',
  pencairan_deposit: 'Pencairan Deposit',
  akses_kontraktor: 'Akses Kontraktor',
};

const WORKFLOW = [
  { key: 'submitted',                    label: 'Application Submitted',        dept: '' },
  { key: 'document_check',               label: 'Document Verification',         dept: 'Admin' },
  { key: 'building_infrastructure_review', label: 'Building & Infrastructure Review', dept: 'Level 1' },
  { key: 'after_sales_review',            label: 'After Sales Review',           dept: 'Level 2' },
  { key: 'township_management_review',    label: 'Township Management Review',   dept: 'Level 3' },
  { key: 'head_approval',                 label: 'Head of Township Approval',    dept: 'Level 4' },
  { key: 'completed',                     label: 'Permit Issued / Completed',    dept: '' },
];

const Row = ({ label, value }) => value ? (
  <div className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-slate-500 text-sm flex-shrink-0">{label}</span>
    <span className="text-slate-800 font-medium text-sm text-right ml-4 max-w-[60%]">{value}</span>
  </div>
) : null;

const Section = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(138,127,115,0.08)' }}>
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
      {Icon && <Icon className="w-4 h-4 text-stone-500" />}
      <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

const PERMIT_TABS = [
  { key: 'overview', label: 'Overview', icon: FileText },
  { key: 'work', label: 'Work Scope', icon: ClipboardList },
  { key: 'approvals', label: 'Approvals', icon: ClipboardCheck },
  { key: 'inspections', label: 'Inspeksi', icon: Search },
  { key: 'log', label: 'Log', icon: History },
];

const APPROVAL_STAGE_ICONS = {
  Approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  Rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  Pending:  { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50' },
  Skipped:  { icon: SkipForward, color: 'text-slate-400', bg: 'bg-slate-50' },
  'Revision Requested': { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
};

export default function TicketDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => base44.entities.Ticket.filter({ id: ticketId }).then(r => r[0]),
    enabled: !!ticketId,
  });

  const isRenovation = ticket && ['renovasi_minor', 'renovasi_mayor'].includes(ticket.permit_type);

  const { data: workItems = [] } = useQuery({
    queryKey: ['ticket-workitems', ticketId],
    queryFn: () => base44.entities.WorkItem.filter({ application_id: ticketId }),
    enabled: !!ticketId && isRenovation,
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ['ticket-approvals', ticketId],
    queryFn: () => base44.entities.ApprovalWorkflow.filter({ application_id: ticketId }),
    enabled: !!ticketId && isRenovation,
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['ticket-inspections', ticketId],
    queryFn: () => base44.entities.Inspection.filter({ application_id: ticketId }),
    enabled: !!ticketId && isRenovation,
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['ticket-logs', ticketId],
    queryFn: () => base44.entities.ActivityLog.filter({ application_id: ticketId }),
    enabled: !!ticketId && isRenovation,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
        <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
        <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Permit not found</p>
        <Button onClick={() => navigate(createPageUrl('Tickets'))} className="mt-4" variant="outline">Back to Permits</Button>
      </div>
    );
  }

  const st = STATUS_STYLE[ticket.status] || STATUS_STYLE.open;
  const currentStageIdx = WORKFLOW.findIndex(s => s.key === ticket.workflow_stage);
  const isMoving = ['pindah_masuk', 'pindah_keluar'].includes(ticket.permit_type);
  const isConstruction = ['renovasi_minor', 'renovasi_mayor', 'pembangunan_kavling', 'galian'].includes(ticket.permit_type);
  const hasDeposit = ticket.deposit_required > 0;
  const permitLabel = PERMIT_LABELS[ticket.permit_type] || ticket.permit_type?.replace(/_/g, ' ');
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
  const currency = (n) => n ? `IDR ${Number(n).toLocaleString('id-ID')}` : null;

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #1a5068 0%, #0F3D4C 55%, #0a2d38 100%)' }}>
        <div className="flex items-start gap-3 mb-4">
          <button onClick={() => navigate(createPageUrl('Tickets'))}
            className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0 mt-0.5">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-white/50 text-xs">Damai Putra Living</p>
            <h1 className="text-xl font-bold text-white">{permitLabel}</h1>
            {ticket.reference_number && <p className="text-white/50 text-xs mt-0.5">{ticket.reference_number}</p>}
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold mt-1 flex-shrink-0"
            style={{ background: st.bg, color: st.color }}>{st.label}</span>
        </div>
        {/* Tabs — only for renovation tickets */}
        {isRenovation && (
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            {PERMIT_TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === key ? 'bg-white text-slate-800' : 'bg-white/15 text-white/70 border border-white/20'
                }`}>
                <Icon className="w-3 h-3" />{label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* ── RENOVATION TABS ── */}
        {isRenovation && activeTab === 'work' && (
          <Section title="Lingkup Pekerjaan" icon={ClipboardList}>
            {workItems.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Tidak ada work item tercatat</p>
            ) : (
              <div className="space-y-2">
                {workItems.map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                    item.work_item_type === 'Major' ? 'border-purple-200 bg-purple-50' : 'border-sky-200 bg-sky-50'
                  }`}>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.work_item_name}</p>
                      <p className="text-xs text-slate-500">{item.work_item_type} · {item.work_category || 'General'}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.review_status === 'Approved' ? 'bg-green-100 text-green-700' :
                      item.review_status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{item.review_status}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {isRenovation && activeTab === 'approvals' && (
          <Section title="Approval Timeline" icon={ClipboardCheck}>
            {approvals.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Belum ada approval</p>
            ) : (
              <div className="space-y-3">
                {approvals.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0)).map((appr, i) => {
                  const cfg = APPROVAL_STAGE_ICONS[appr.approval_status] || APPROVAL_STAGE_ICONS.Pending;
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 pb-3 border-b border-slate-100 last:border-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-800">{appr.approval_stage}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{appr.approval_status}</span>
                        </div>
                        {appr.approver_name && <p className="text-xs text-slate-500">By: {appr.approver_name}</p>}
                        {appr.approval_date && <p className="text-xs text-slate-400">{new Date(appr.approval_date).toLocaleDateString('id-ID')}</p>}
                        {appr.approval_notes && <p className="text-xs text-slate-500 mt-1 italic">"{appr.approval_notes}"</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        )}

        {isRenovation && activeTab === 'inspections' && (
          <Section title="Riwayat Inspeksi" icon={Search}>
            {inspections.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Belum ada inspeksi</p>
            ) : (
              <div className="space-y-3">
                {inspections.map(ins => (
                  <div key={ins.id} className="border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-800">{ins.inspection_type}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ins.inspection_result === 'Pass' ? 'bg-green-100 text-green-700' :
                        ins.inspection_result === 'Failed' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{ins.inspection_result}</span>
                    </div>
                    <p className="text-xs text-slate-400">{ins.inspection_date} · {ins.inspector_name}</p>
                    {ins.site_condition && <p className="text-xs text-slate-600 mt-1">Kondisi: {ins.site_condition}</p>}
                    {ins.issue_found && <p className="text-xs text-red-600 mt-0.5">Temuan: {ins.issue_found}</p>}
                    {ins.corrective_action && <p className="text-xs text-amber-600 mt-0.5">Tindakan: {ins.corrective_action}</p>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {isRenovation && activeTab === 'log' && (
          <Section title="Activity Log" icon={History}>
            {activityLogs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Belum ada aktivitas</p>
            ) : (
              <div className="space-y-2">
                {[...activityLogs].sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at)).map(log => (
                  <div key={log.id} className="flex gap-2.5 py-2 border-b border-slate-100 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-sm text-slate-800">{log.activity_description}</p>
                      <p className="text-xs text-slate-400">{log.performed_by} · {log.performed_at ? new Date(log.performed_at).toLocaleString('id-ID') : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Non-renovation OR overview tab: show existing sections */}
        {(!isRenovation || activeTab === 'overview') && (
          <>
        {/* ── Approval Progress ── */}
        <Section title="Approval Progress" icon={ClipboardCheck}>
          <div className="space-y-1">
            {WORKFLOW.map((stage, i) => {
              const isDone = i < currentStageIdx;
              const isCurrent = i === currentStageIdx;
              return (
                <div key={stage.key} className="flex items-center gap-3 py-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${isDone ? 'bg-emerald-500 border-emerald-500' : isCurrent ? 'border-sky-400' : 'bg-white border-slate-200'}`}
                    style={isCurrent ? { background: '#1FB6D5', borderColor: '#1FB6D5' } : {}}>
                    {isDone
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <span className={`text-[10px] font-bold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>{i + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDone ? 'text-emerald-700' : isCurrent ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>{stage.label}</p>
                    {stage.dept && <p className={`text-[10px] ${isDone ? 'text-emerald-500' : isCurrent ? 'text-blue-600' : 'text-slate-300'}`}>{stage.dept}</p>}
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#e8f4fb', color: '#1F86C7' }}>Current</span>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── A. Applicant ── */}
        <Section title="Applicant Information" icon={User}>
          <Row label="Full Name"    value={ticket.user_name} />
          <Row label="Role"         value={ticket.applicant_role} />
          <Row label="NIK / ID"     value={ticket.applicant_nik} />
          <Row label="Phone"        value={ticket.applicant_phone} />
          <Row label="Email"        value={ticket.user_email} />
        </Section>

        {/* ── B. Property ── */}
        <Section title="Property / Unit" icon={Building2}>
          <Row label="Unit Number"  value={ticket.unit_number} />
          <Row label="Property"     value={ticket.property_name} />
          <Row label="Tower"        value={ticket.tower} />
        </Section>

        {/* ── C. Permit ── */}
        <Section title="Permit Details" icon={FileText}>
          <Row label="Permit Type"   value={permitLabel} />
          <Row label="Application No" value={ticket.reference_number} />
          <Row label="Submitted"     value={fmt(ticket.created_date)} />
          <Row label="Activity"      value={ticket.activity_name || ticket.description} />
          <Row label="Start Date"    value={fmt(ticket.activity_date)} />
          <Row label="End Date"      value={fmt(ticket.activity_end_date)} />
          <Row label="Working Hours" value={ticket.activity_time && ticket.activity_end_time ? `${ticket.activity_time} – ${ticket.activity_end_time}` : null} />
          <Row label="Workers"       value={ticket.num_workers} />
          <Row label="Contractor"    value={ticket.contractor_company} />
        </Section>

        {/* ── D. Construction ── */}
        {isConstruction && (
          <Section title="Renovation / Construction" icon={Wrench}>
            <Row label="Work Type"      value={ticket.work_type?.replace(/_/g, ' ')} />
            <Row label="Work Scope"     value={ticket.work_scope} />
            <Row label="Affected Area"  value={ticket.affected_area} />
            <Row label="Heavy Equipment" value={ticket.uses_heavy_equipment != null ? (ticket.uses_heavy_equipment ? 'Yes' : 'No') : null} />
            <Row label="Noise Potential" value={ticket.noise_potential != null ? (ticket.noise_potential ? 'Yes' : 'No') : null} />
          </Section>
        )}

        {/* ── Moving / Security ── */}
        {isMoving && (
          <Section title="Security / Moving Details" icon={Truck}>
            <Row label="Moving Company"  value={ticket.moving_company} />
            <Row label="PIC Name"        value={ticket.visitor_name} />
            <Row label="PIC Phone"       value={ticket.visitor_phone} />
            <Row label="Vehicle Type"    value={ticket.vehicle_type} />
            <Row label="Plate Number"    value={ticket.vehicle_plate} />
          </Section>
        )}

        {/* ── Deposit ── */}
        {hasDeposit && (
          <Section title="Deposit Information" icon={Banknote}>
            <Row label="Deposit Required" value={currency(ticket.deposit_required)} />
            <Row label="Amount Paid"      value={currency(ticket.deposit_paid)} />
            <Row label="Payment Date"     value={fmt(ticket.deposit_payment_date)} />
            <Row label="Deposit Returned" value={currency(ticket.deposit_returned)} />
          </Section>
        )}

        {/* ── Inspection ── */}
        {(ticket.inspection_date || ticket.inspection_result) && (
          <Section title="Inspection Result" icon={Shield}>
            <Row label="Inspection Date"  value={fmt(ticket.inspection_date)} />
            <Row label="Result"           value={ticket.inspection_result} />
            <Row label="Damage Found"     value={ticket.damage_found != null ? (ticket.damage_found ? 'Yes' : 'No') : null} />
            <Row label="Damage Desc"      value={ticket.damage_description} />
            <Row label="Repair Cost"      value={currency(ticket.repair_cost)} />
          </Section>
        )}

        {/* ── Approval ── */}
        {ticket.status === 'approved' && (
          <Section title="Permit Approval" icon={CheckCircle}>
            <Row label="Approved By"   value={ticket.approved_by} />
            <Row label="Approval Date" value={ticket.approval_date} />
            <Row label="Permit No."    value={ticket.permit_id} />
            <Row label="Valid From"    value={fmt(ticket.valid_from)} />
            <Row label="Valid Until"   value={fmt(ticket.valid_until)} />
          </Section>
        )}

        {/* ── Rejection Note ── */}
        {ticket.status === 'rejected' && ticket.rejection_note && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm mb-1">Rejection Reason</p>
              <p className="text-red-600 text-sm">{ticket.rejection_note}</p>
            </div>
          </div>
        )}

        {/* ── Management Notes ── */}
        {ticket.management_notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700 text-sm mb-1">Management Notes</p>
              <p className="text-amber-600 text-sm">{ticket.management_notes}</p>
            </div>
          </div>
        )}

        {/* ── Documents ── */}
        {ticket.document_urls?.length > 0 && (
          <Section title="Attached Documents" icon={FileText}>
            <div className="space-y-2">
              {ticket.document_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 hover:bg-stone-100 transition-colors">
                  <FileText className="w-4 h-4 text-stone-500" />
                  <span className="text-sm text-slate-700 flex-1">Document {i + 1}</span>
                  <Eye className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </Section>
        )}

        </>
        )}

        <Button variant="outline" onClick={() => navigate(createPageUrl('Tickets'))}
          className="w-full h-12 rounded-2xl border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Permits
        </Button>
      </div>
    </div>
  );
}