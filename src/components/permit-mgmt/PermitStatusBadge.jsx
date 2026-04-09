import React from 'react';

const STATUS_CONFIG = {
  'Draft':          { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  'Submitted':      { bg: 'bg-blue-50',   text: 'text-blue-700',  dot: 'bg-blue-500' },
  'Under Review':   { bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-500' },
  'Revision Needed':{ bg: 'bg-orange-50', text: 'text-orange-700',dot: 'bg-orange-500' },
  'Approved':       { bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500' },
  'Rejected':       { bg: 'bg-red-50',    text: 'text-red-700',   dot: 'bg-red-500' },
  'Closed':         { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
  'Pending':        { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  'Pass':           { bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500' },
  'Failed':         { bg: 'bg-red-50',    text: 'text-red-700',   dot: 'bg-red-500' },
  'Hold':           { bg: 'bg-orange-50', text: 'text-orange-700',dot: 'bg-orange-500' },
  'Need Revision':  { bg: 'bg-yellow-50', text: 'text-yellow-700',dot: 'bg-yellow-500' },
  'Minor Renovation':{ bg: 'bg-sky-50',  text: 'text-sky-700',   dot: 'bg-sky-500' },
  'Major Renovation':{ bg: 'bg-purple-50',text: 'text-purple-700',dot: 'bg-purple-500' },
};

export default function PermitStatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${cfg.bg} ${cfg.text} ${textSize}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}