import React from 'react';
import { ChevronRight, Calendar, Wrench, Building2, Shovel, Truck, Banknote, Users } from 'lucide-react';

export const PERMIT_TYPES = [
  { value: 'izin_kegiatan',       label: 'Izin Kegiatan',        icon: Calendar,  desc: 'Activity & event in property area',      color: '#4f86f7', bg: '#ebf0ff' },
  { value: 'renovasi_minor',      label: 'Renovasi Minor',       icon: Wrench,    desc: 'Minor non-structural renovation',         color: '#f97316', bg: '#fff3eb' },
  { value: 'renovasi_mayor',      label: 'Renovasi Mayor',       icon: Wrench,    desc: 'Major structural renovation',             color: '#ef4444', bg: '#fef2f2' },
  { value: 'pembangunan_kavling', label: 'Pembangunan Kavling',   icon: Building2, desc: 'New construction on plot / lot',          color: '#8b5cf6', bg: '#f5f3ff' },
  { value: 'galian',              label: 'Izin Galian',          icon: Shovel,    desc: 'Excavation / soil works',                 color: '#92400e', bg: '#fef3c7' },
  { value: 'pindah_masuk',        label: 'Pindah Masuk',         icon: Truck,     desc: 'Move-in with security assistance',        color: '#10b981', bg: '#ecfdf5' },
  { value: 'pindah_keluar',       label: 'Pindah Keluar',        icon: Truck,     desc: 'Move-out with security assistance',       color: '#64748b', bg: '#f1f5f9' },
  { value: 'pencairan_deposit',   label: 'Pencairan Deposit',    icon: Banknote,  desc: 'Deposit disbursement request',            color: '#0891b2', bg: '#ecfeff' },
  { value: 'akses_kontraktor',    label: 'Akses Kontraktor',     icon: Users,     desc: 'Contractor / technician site access',     color: '#6366f1', bg: '#eef2ff' },
];

export default function PermitTypeSelector({ onSelect }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">Select the permit type to apply for.</p>
      {PERMIT_TYPES.map(pt => {
        const Icon = pt.icon;
        return (
          <button key={pt.value} onClick={() => onSelect(pt.value)}
            className="w-full p-4 rounded-2xl border bg-white/80 flex items-center gap-4 text-left active:scale-[0.98] transition-all border-slate-200 hover:shadow-md hover:border-slate-300">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: pt.bg }}>
              <Icon className="w-6 h-6" style={{ color: pt.color }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{pt.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{pt.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        );
      })}
    </div>
  );
}