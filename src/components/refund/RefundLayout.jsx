import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, PlusCircle, ShieldCheck, Search, Banknote, Menu, ArrowLeft } from 'lucide-react';

const NAV = [
  { path: '/RefundDashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/RefundList', label: 'All Requests', icon: List },
  { path: '/RefundSubmission', label: 'New Request', icon: PlusCircle },
  { path: '/RefundVerification', label: 'Verification', icon: ShieldCheck },
  { path: '/RefundInspectionPage', label: 'Inspection', icon: Search },
  { path: '/RefundFinancePage', label: 'Finance', icon: Banknote },
];

export default function RefundLayout({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:flex ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Deposit Refund</p>
              <p className="text-slate-400 text-[10px]">Pencairan Deposit</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:px-6 sticky top-0 z-30" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <p className="text-xs text-slate-400 hidden sm:block flex-1">Damai Putra Living — Deposit Refund Management</p>
          <Link to="/RefundSubmission"
            className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 ml-auto">
            + New Request
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}