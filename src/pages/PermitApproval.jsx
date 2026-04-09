import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, AlertCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import PermitLayout from '@/components/permit-mgmt/PermitLayout';
import PermitStatusBadge from '@/components/permit-mgmt/PermitStatusBadge';
import ApprovalTimeline from '@/components/permit-mgmt/ApprovalTimeline';

const APPROVAL_ROLES = [
  'Pemohon',
  'ASS TM / IPL',
  'Head Building & Infrastructure',
  'Head After Sales Service',
  'Head Township Management',
];

function ApprovalModal({ permit, approvals, onClose }) {
  const qc = useQueryClient();
  const [role, setRole] = useState(APPROVAL_ROLES[0]);
  const [approverName, setApproverName] = useState('');
  const [decision, setDecision] = useState('Approved');
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const existing = approvals.find(a => a.approval_stage === role);
      if (existing) {
        await base44.entities.ApprovalWorkflow.update(existing.id, {
          approver_name: approverName,
          approval_status: decision,
          approval_notes: notes,
          approval_date: new Date().toISOString(),
        });
      } else {
        await base44.entities.ApprovalWorkflow.create({
          application_id: permit.id,
          approval_stage: role,
          approver_role: role,
          approver_name: approverName,
          approval_status: decision,
          approval_notes: notes,
          approval_date: new Date().toISOString(),
          sequence_order: APPROVAL_ROLES.indexOf(role) + 1,
        });
      }
      // Update permit status
      const newStatus = decision === 'Approved' ? 'Under Review' : decision === 'Rejected' ? 'Rejected' : 'Revision Needed';
      if (role === 'Head Township Management' && decision === 'Approved') {
        await base44.entities.PermitApplication.update(permit.id, { application_status: 'Approved' });
      } else {
        await base44.entities.PermitApplication.update(permit.id, { application_status: newStatus, current_approval_stage: role });
      }
      await base44.entities.ActivityLog.create({
        application_id: permit.id,
        activity_type: decision === 'Approved' ? 'Approved' : 'Rejected',
        activity_description: `${role} ${decision.toLowerCase()} the application. Notes: ${notes}`,
        performed_by: approverName,
        performed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => { qc.invalidateQueries(); onClose(); },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Record Approval Decision</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Approval Stage</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none" value={role} onChange={e => setRole(e.target.value)}>
              {APPROVAL_ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Approver Name</label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={approverName} onChange={e => setApproverName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Decision</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'Approved', color: 'bg-green-100 text-green-700 border-green-300' },
                { val: 'Rejected', color: 'bg-red-100 text-red-700 border-red-300' },
                { val: 'Revision Requested', color: 'bg-orange-100 text-orange-700 border-orange-300' },
              ].map(({ val, color }) => (
                <button key={val} onClick={() => setDecision(val)}
                  className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${decision === val ? color : 'bg-white text-slate-400 border-slate-200'}`}>
                  {val}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Notes</label>
            <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3}
              value={notes} onChange={e => setNotes(e.target.value)} placeholder="Approval notes..." />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !approverName}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Record Decision'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PermitApproval() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [modalPermit, setModalPermit] = useState(null);

  const { data: permits = [], isLoading } = useQuery({
    queryKey: ['permits-approval'],
    queryFn: () => base44.entities.PermitApplication.filter({ application_status: 'Under Review' }, '-created_date'),
  });
  const { data: pendingRevision = [] } = useQuery({
    queryKey: ['permits-revision'],
    queryFn: () => base44.entities.PermitApplication.filter({ application_status: 'Revision Needed' }, '-created_date'),
  });
  const { data: submitted = [] } = useQuery({
    queryKey: ['permits-submitted'],
    queryFn: () => base44.entities.PermitApplication.filter({ application_status: 'Submitted' }, '-created_date'),
  });

  const allPending = [...submitted, ...permits, ...pendingRevision];

  const { data: allApprovals = [] } = useQuery({
    queryKey: ['all-approvals'],
    queryFn: () => base44.entities.ApprovalWorkflow.list('-created_date', 200),
  });

  const getApprovals = (pid) => allApprovals.filter(a => a.application_id === pid);

  return (
    <PermitLayout>
      {modalPermit && (
        <ApprovalModal
          permit={modalPermit}
          approvals={getApprovals(modalPermit.id)}
          onClose={() => setModalPermit(null)}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Approval Queue</h1>
        <p className="text-slate-500 text-sm">{allPending.length} permits awaiting action</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}</div>
      ) : allPending.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No permits awaiting approval</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allPending.map(permit => {
            const approvals = getApprovals(permit.id);
            const isOpen = expanded === permit.id;
            return (
              <div key={permit.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-mono text-sm font-bold text-blue-700">{permit.permit_number}</span>
                        <PermitStatusBadge status={permit.permit_type} size="xs" />
                        <PermitStatusBadge status={permit.application_status} size="xs" />
                      </div>
                      <p className="text-sm text-slate-600">{permit.applicant_name} · {permit.cluster_name} Blok {permit.block_number}/{permit.unit_number}</p>
                      <p className="text-xs text-slate-400">{permit.submission_date} · {permit.duration_days ? `${permit.duration_days} days` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => navigate(`/PermitDetail?id=${permit.id}`)}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <Eye className="w-4 h-4 text-slate-500" />
                    </button>
                    <button onClick={() => setModalPermit(permit)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
                      Review
                    </button>
                    <button onClick={() => setExpanded(isOpen ? null : permit.id)}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Approval Timeline</p>
                    <ApprovalTimeline approvals={approvals} permitType={permit.permit_type} />
                    {permit.renovation_description && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Description</p>
                        <p className="text-sm text-slate-700">{permit.renovation_description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PermitLayout>
  );
}