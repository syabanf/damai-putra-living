import React from 'react';
import { CheckCircle2, XCircle, Clock, SkipForward, AlertCircle } from 'lucide-react';

const STAGE_ICONS = {
  Approved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  Rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  Pending:  { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' },
  Skipped:  { icon: SkipForward, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' },
  'Revision Requested': { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
};

const DEFAULT_STAGES_MINOR = [
  { stage: 'Pemohon', role: 'Applicant' },
  { stage: 'ASS TM / IPL', role: 'Section Head Ass Building & Infrastructure' },
  { stage: 'Head Building & Infrastructure', role: 'Head of Building & Infrastructure Dept' },
];

const DEFAULT_STAGES_MAJOR = [
  { stage: 'Pemohon', role: 'Applicant' },
  { stage: 'ASS TM / IPL', role: 'Section Head Ass Building & Infrastructure' },
  { stage: 'Head Building & Infrastructure', role: 'Head of Building & Infrastructure Dept' },
  { stage: 'Head After Sales Service', role: 'Head of After Sales Service Dept' },
  { stage: 'Head Township Management', role: 'Head of Township Management Division' },
];

export default function ApprovalTimeline({ approvals = [], permitType }) {
  const defaultStages = permitType === 'Major Renovation' ? DEFAULT_STAGES_MAJOR : DEFAULT_STAGES_MINOR;

  const stages = defaultStages.map(def => {
    const found = approvals.find(a => a.approval_stage === def.stage);
    return { ...def, ...(found || {}), approval_status: found?.approval_status || 'Pending' };
  });

  return (
    <div className="space-y-3">
      {stages.map((s, i) => {
        const cfg = STAGE_ICONS[s.approval_status] || STAGE_ICONS.Pending;
        const Icon = cfg.icon;
        const isLast = i === stages.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.border}`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-slate-200 mt-1 min-h-[1.5rem]" />}
            </div>
            <div className={`pb-4 flex-1 ${isLast ? '' : ''}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{s.stage}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{s.approval_status}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{s.role}</p>
              {s.approver_name && <p className="text-xs text-slate-600 mt-0.5">By: {s.approver_name}</p>}
              {s.approval_date && <p className="text-xs text-slate-400">{new Date(s.approval_date).toLocaleDateString('id-ID')}</p>}
              {s.approval_notes && <p className="text-xs text-slate-500 mt-1 italic">"{s.approval_notes}"</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}