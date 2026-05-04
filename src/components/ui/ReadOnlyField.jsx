import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Displays a verified, read-only prefilled field.
 * Used when data is sourced from master data / previous transactions.
 */
export default function ReadOnlyField({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
        {Icon ? (
          <Icon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        )}
        <span className="text-sm font-medium text-emerald-800 flex-1">{value}</span>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full tracking-wide">VERIFIED</span>
      </div>
    </div>
  );
}