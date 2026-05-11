import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';
import { Search, User, Shield, UserCheck, ChevronRight, Mail, Calendar } from 'lucide-react';

const ROLE_STYLE = {
  admin: { bg: 'bg-purple-50 text-purple-700', label: 'Admin' },
  user:  { bg: 'bg-blue-50 text-blue-700',     label: 'User' },
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => appClient.entities.User.list('-created_date', 500),
  });

  const filtered = users.filter(u => {
    const matchSearch = !search || [u.full_name, u.email].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  return (
    <AdminPermitLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Data Users</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola akun pengguna dan hak akses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Admin', value: adminCount, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Regular User', value: userCount, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none">
          <option value="all">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Tidak ada data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['User', 'Email', 'Role', 'Terdaftar', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <p className="font-semibold text-slate-800">{u.full_name || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLE[u.role]?.bg || 'bg-slate-100 text-slate-600'}`}>
                        {ROLE_STYLE[u.role]?.label || u.role || 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="w-3 h-3" />
                        {u.created_date ? new Date(u.created_date).toLocaleDateString('id-ID') : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(u)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-semibold">
                        Detail <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-800">{selected.full_name || 'No Name'}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLE[selected.role]?.bg || 'bg-slate-100 text-slate-600'}`}>
                    {ROLE_STYLE[selected.role]?.label || selected.role || 'User'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Email', selected.email],
                ['ID', selected.id],
                ['Terdaftar', selected.created_date ? new Date(selected.created_date).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-800 text-right break-all max-w-[60%]">{v || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminPermitLayout>
  );
}