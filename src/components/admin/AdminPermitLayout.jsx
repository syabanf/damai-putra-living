import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import SharedAdminSidebar from '@/components/admin/SharedAdminSidebar';

export default function AdminPermitLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:flex ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SharedAdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:px-6 sticky top-0 z-30"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-slate-400 hidden sm:block">Damai Putra Living — Admin Panel</p>
          </div>
          <Link to="/AdminPermitList"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            Semua Permohonan
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}