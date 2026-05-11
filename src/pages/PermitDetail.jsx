import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { ArrowLeft, FileText, CheckCircle2, ClipboardList, History, Upload, Search, Edit2 } from 'lucide-react';
import PermitLayout from '@/components/permit-mgmt/PermitLayout';
import PermitStatusBadge from '@/components/permit-mgmt/PermitStatusBadge';
import ApprovalTimeline from '@/components/permit-mgmt/ApprovalTimeline';
import { createPageUrl } from '@/utils';

const TABS = [
  { key: 'overview', label: 'Overview', icon: FileText },
  { key: 'work', label: 'Work Scope', icon: ClipboardList },
  { key: 'approvals', label: 'Approvals', icon: CheckCircle2 },
  { key: 'inspections', label: 'Inspections', icon: Search },
  { key: 'documents', label: 'Documents', icon: Upload },
  { key: 'log', label: 'Activity Log', icon: History },
];

const Row = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs text-slate-400 sm:w-40 flex-shrink-0 mb-0.5 sm:mb-0">{label}</span>
    <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
  </div>
);

export default function PermitDetail() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const [tab, setTab] = useState('overview');
  const [editStatus, setEditStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { data: permit, isLoading } = useQuery({
    queryKey: ['permit', id],
    queryFn: () => appClient.entities.PermitApplication.filter({ id }),
    select: data => data[0],
    enabled: !!id,
  });

  const { data: workItems = [] } = useQuery({
    queryKey: ['work-items', id],
    queryFn: () => appClient.entities.WorkItem.filter({ application_id: id }),
    enabled: !!id,
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ['approvals', id],
    queryFn: () => appClient.entities.ApprovalWorkflow.filter({ application_id: id }),
    enabled: !!id,
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', id],
    queryFn: () => appClient.entities.Inspection.filter({ application_id: id }),
    enabled: !!id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => appClient.entities.PermitDocument.filter({ application_id: id }),
    enabled: !!id,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs', id],
    queryFn: () => appClient.entities.ActivityLog.filter({ application_id: id }),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: async (status) => {
      await appClient.entities.PermitApplication.update(id, { application_status: status });
      await appClient.entities.ActivityLog.create({
        application_id: id,
        activity_type: 'Status Changed',
        activity_description: `Status changed to ${status}`,
        performed_by: 'Admin',
        performed_at: new Date().toISOString(),
        old_value: permit?.application_status,
        new_value: status,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['permit', id] }); qc.invalidateQueries({ queryKey: ['logs', id] }); setEditStatus(false); },
  });

  if (isLoading) return <PermitLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div></PermitLayout>;
  if (!permit) return <PermitLayout><div className="text-center text-slate-400 py-20">Permit not found</div></PermitLayout>;

  return (
    <PermitLayout>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button onClick={() => navigate(createPageUrl('PermitList'))} className="mt-1 p-2 hover:bg-slate-200 rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-800 font-mono">{permit.permit_number || 'DRAFT'}</h1>
            <PermitStatusBadge status={permit.permit_type} />
            <PermitStatusBadge status={permit.application_status} />
          </div>
          <p className="text-slate-500 text-sm">{permit.applicant_name} · {permit.cluster_name} Blok {permit.block_number}/{permit.unit_number}</p>
        </div>
        <div className="flex gap-2">
          {!editStatus ? (
            <button onClick={() => { setEditStatus(true); setNewStatus(permit.application_status); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Edit2 className="w-3.5 h-3.5" /> Update Status
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                {['Draft','Submitted','Under Review','Revision Needed','Approved','Rejected','Closed'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => statusMutation.mutate(newStatus)} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Save</button>
              <button onClick={() => setEditStatus(false)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-5 pb-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${tab === key ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Applicant Details</h3>
              <Row label="Applicant Name" value={permit.applicant_name} />
              <Row label="Owner Name" value={permit.owner_name} />
              <Row label="Phone" value={permit.phone_number} />
              <Row label="Email" value={permit.email} />
              <Row label="Address" value={permit.address} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Property & Schedule</h3>
              <Row label="Cluster" value={permit.cluster_name} />
              <Row label="Block / Unit" value={`Blok ${permit.block_number} / No. ${permit.unit_number}`} />
              <Row label="Property Type" value={permit.property_type} />
              <Row label="Start Date" value={permit.start_date} />
              <Row label="End Date" value={permit.end_date} />
              <Row label="Duration" value={permit.duration_days ? `${permit.duration_days} days` : null} />
              <Row label="Contractor" value={permit.contractor_name} />
              <Row label="Workers" value={permit.num_workers} />
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Renovation Info</h3>
              <Row label="Description" value={permit.renovation_description} />
              <Row label="Work Scope" value={permit.work_scope_summary} />
              <Row label="Applicant Notes" value={permit.notes_from_applicant} />
              <Row label="Deposit Amount" value={permit.deposit_amount ? `Rp ${Number(permit.deposit_amount).toLocaleString('id-ID')}` : null} />
              <Row label="Deposit Status" value={permit.deposit_status} />
              <Row label="Submission Date" value={permit.submission_date} />
            </div>
          </div>
        )}

        {tab === 'work' && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Selected Work Items</h3>
            {workItems.length === 0 ? <p className="text-slate-400 text-sm">No work items recorded</p> : (
              <div className="space-y-2">
                {workItems.map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${item.work_item_type === 'Major' ? 'border-purple-200 bg-purple-50' : 'border-sky-200 bg-sky-50'}`}>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.work_item_name}</p>
                      <p className="text-xs text-slate-500">{item.work_item_type} · {item.work_category || 'General'}</p>
                    </div>
                    <PermitStatusBadge status={item.review_status} size="xs" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'approvals' && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Approval Workflow</h3>
            <ApprovalTimeline approvals={approvals} permitType={permit.permit_type} />
          </div>
        )}

        {tab === 'inspections' && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Inspection History</h3>
            {inspections.length === 0 ? <p className="text-slate-400 text-sm">No inspections recorded</p> : (
              <div className="space-y-3">
                {inspections.map(ins => (
                  <div key={ins.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{ins.inspection_type}</p>
                        <p className="text-xs text-slate-400">{ins.inspection_date} · {ins.inspector_name}</p>
                      </div>
                      <PermitStatusBadge status={ins.inspection_result} size="xs" />
                    </div>
                    {ins.site_condition && <p className="text-xs text-slate-600 mb-1"><span className="font-medium">Condition:</span> {ins.site_condition}</p>}
                    {ins.issue_found && <p className="text-xs text-red-600 mb-1"><span className="font-medium">Issue:</span> {ins.issue_found}</p>}
                    {ins.corrective_action && <p className="text-xs text-amber-600"><span className="font-medium">Action:</span> {ins.corrective_action}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'documents' && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Uploaded Documents</h3>
            {documents.length === 0 ? <p className="text-slate-400 text-sm">No documents uploaded</p> : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{doc.document_name}</p>
                      <p className="text-xs text-slate-400">{doc.document_type} · v{doc.version_number} · {doc.uploaded_by}</p>
                    </div>
                    <PermitStatusBadge status={doc.verification_status} size="xs" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'log' && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Activity Log</h3>
            {logs.length === 0 ? <p className="text-slate-400 text-sm">No activity recorded</p> : (
              <div className="space-y-3">
                {[...logs].sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at)).map(log => (
                  <div key={log.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-sm text-slate-800">{log.activity_description}</p>
                      <p className="text-xs text-slate-400">{log.performed_by} · {log.performed_at ? new Date(log.performed_at).toLocaleString('id-ID') : ''}</p>
                      {log.old_value && log.new_value && (
                        <p className="text-xs text-slate-400">{log.old_value} → {log.new_value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PermitLayout>
  );
}