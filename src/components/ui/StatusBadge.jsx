import React from 'react';
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' },
  open: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Open' },
  in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'In Progress' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Closed' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-medium border",
      config.bg, config.text, config.border
    )}>
      {config.label}
    </span>
  );
}