import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ClipboardCheck, Search, Settings,
  Building2, LogOut, Star, Gift, Users, Home, RefreshCw,
  ChevronDown, ChevronRight, Store, Calendar
} from 'lucide-react';
import IonLogo from '@/components/brand/IonLogo';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/AdminPermitDashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Resident & User',
    items: [
      { path: '/AdminResidents', label: 'Data Residents', icon: Home },
      { path: '/AdminUsers', label: 'Data Users', icon: Users },
    ],
  },
  {
    label: 'Permit Management',
    items: [
      { path: '/AdminPermitList', label: 'All Permits', icon: FileText },
      { path: '/PermitDashboard', label: 'Permit Dashboard', icon: LayoutDashboard },
      { path: '/PermitApproval', label: 'Approvals', icon: ClipboardCheck },
      { path: '/PermitInspection', label: 'Inspections', icon: Search },
      { path: '/PermitMasterData', label: 'Master Data', icon: Settings },
      { path: '/RefundAdminProcess', label: 'Refund Deposit', icon: RefreshCw },
    ],
  },
  {
    label: 'CMS & Properties',
    items: [
      { path: '/AdminCMSProperties', label: 'Properties', icon: Building2 },
      { path: '/AdminCMSTenants', label: 'Tenants', icon: Store },
      { path: '/AdminCMSEvents', label: 'Events', icon: Calendar },
    ],
  },
  {
    label: 'Loyalty & Undian',
    items: [
      { path: '/AdminLoyaltyPoints', label: 'CRM Poin Loyalitas', icon: Star },
      { path: '/AdminLottery', label: 'Undian & Roulette', icon: Gift },
    ],
  },
];

function NavGroup({ group, isActive, onClose }) {
  const hasActive = group.items.some(i => isActive(i.path));
  const [open, setOpen] = useState(hasActive);

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors">
        <span>{group.label}</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <div className="space-y-0.5 mb-1">
          {group.items.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link key={path + label} to={path} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SharedAdminSidebar({ onClose }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="h-screen w-64 flex flex-col sticky top-0" style={{ background: '#111214' }}>
      {/* Logo */}
      <div className="p-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center">
            <IonLogo variant="mark" className="w-9 h-9" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">ION</p>
            <p className="text-slate-400 text-[10px] font-bold tracking-widest">NETWORK</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1">
        {NAV_GROUPS.map(group => (
          <NavGroup key={group.label} group={group} isActive={isActive} onClose={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <Link to="/" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm">
          <LogOut className="w-4 h-4" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
