import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ClipboardCheck, Menu, Building2, LogOut, RefreshCw,
  Gift, Users, Home, Star, Ticket, ChevronDown, ChevronRight, ShieldCheck
} from 'lucide-react';

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
      { path: '/AdminPermitList', label: 'Semua Permohonan', icon: FileText },
      { path: '/AdminPermitList?filter=pending', label: 'Perlu Tindakan', icon: ClipboardCheck },
      { path: '/RefundAdminProcess', label: 'Refund Deposit', icon: RefreshCw },
    ],
  },
  {
    label: 'CMS & Properties',
    items: [
      { path: '/AdminCMSProperties', label: 'CMS Properties', icon: Building2 },
    ],
  },
  {
    label: 'Loyalty & Undian',
    items: [
      { path: '/AdminLoyaltyPoints', label: 'CRM Poin Loyalitas', icon: Star },
      { path: '/AdminLottery', label: 'Undian & Roulette', icon: Gift },
    ],
  },
  {
    label: 'Renovation Permits',
    items: [
      { path: '/PermitDashboard', label: 'Permit Dashboard', icon: LayoutDashboard },
      { path: '/PermitApproval', label: 'Approval Queue', icon: ClipboardCheck },
      { path: '/PermitList', label: 'Permit List', icon: FileText },
    ],
  },
];

function NavGroup({ group, isActive, onClose }) {
  const hasActive = group.items.some(i => isActive(i.path));
  const [open, setOpen] = useState(hasActive);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors">
        <span>{group.label}</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <div className="space-y-0.5">
          {group.items.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link key={path + label} to={path} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ml-1 ${
                  active ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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

export default function AdminPermitLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    const basePath = path.split('?')[0];
    return location.pathname === basePath;
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:flex ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Admin Panel</p>
              <p className="text-slate-400 text-[10px]">Damai Putra Living</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {NAV_GROUPS.map(group => (
            <NavGroup key={group.label} group={group} isActive={isActive} onClose={closeSidebar} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm">
            <LogOut className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:px-6 sticky top-0 z-30"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-slate-400 hidden sm:block">Damai Putra Living — Admin Panel</p>
          </div>
          <Link to="/AdminPermitList?filter=pending"
            className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-1.5">
            Perlu Tindakan
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}