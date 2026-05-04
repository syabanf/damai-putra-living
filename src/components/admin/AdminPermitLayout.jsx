import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, ClipboardCheck, Menu, Building2, LogOut, RefreshCw } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/AdminPermitDashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/AdminPermitList', label: 'All Requests', icon: FileText },
  { path: '/AdminPermitList?filter=pending', label: 'Needs Action', icon: ClipboardCheck },
  { path: '/RefundAdminProcess', label: 'Refund Deposits', icon: RefreshCw },
];

export default function AdminPermitLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    const basePath = path.split('?')[0];
    return location.pathname === basePath;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:flex ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Admin Panel</p>
              <p className="text-slate-400 text-[10px]">Digital Permit Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link key={path + label} to={path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${active ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-700/50 mt-3">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider px-3 mb-2">Renovation Permits</p>
            {[
              { path: '/PermitDashboard', label: 'Permit Dashboard' },
              { path: '/PermitApproval', label: 'Approval Queue' },
              { path: '/PermitList', label: 'Permit List' },
            ].map(({ path, label }) => (
              <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs text-slate-500 hover:bg-slate-800 hover:text-white">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-700/50">
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
            <p className="text-xs text-slate-400 hidden sm:block">Damai Putra Living — Admin Digital Permit</p>
          </div>
          <Link to="/AdminPermitList?filter=pending"
            className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-1.5">
            Needs Action
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}