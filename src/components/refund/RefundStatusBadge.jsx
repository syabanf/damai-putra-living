import React from 'react';

const CONFIG = {
  'Draft':                    { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400' },
  'Submitted':                { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500' },
  'Under Verification':       { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500' },
  'Waiting Inspection Result':{ bg: 'bg-purple-50',   text: 'text-purple-700',  dot: 'bg-purple-500' },
  'Waiting Finance Validation':{ bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-500' },
  'Approved':                 { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Partially Approved':       { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500' },
  'Rejected':                 { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500' },
  'Paid':                     { bg: 'bg-green-100',   text: 'text-green-800',   dot: 'bg-green-600' },
  'Closed':                   { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400' },
};

export default function RefundStatusBadge({ status, size = 'sm' }) {
  const cfg = CONFIG[status] || CONFIG['Draft'];
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${cfg.bg} ${cfg.text} ${textSize}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}