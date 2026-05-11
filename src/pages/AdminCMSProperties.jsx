import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';
import { Plus, Search, Building2, Edit2, Trash2, X, Save } from 'lucide-react';

const EMPTY_FORM = {
  name: '', location: '', description: '', type: '', status: 'active',
  total_units: '', image_url: '', contact_number: '', address: '',
};

export default function AdminCMSProperties() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => appClient.entities.Property.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) return appClient.entities.Property.update(editing.id, data);
      return appClient.entities.Property.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appClient.entities.Property.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-properties'] }),
  });

  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...EMPTY_FORM, ...p });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleDelete = (p) => {
    if (window.confirm(`Hapus properti "${p.name}"?`)) {
      deleteMutation.mutate(p.id);
    }
  };

  const filtered = properties.filter(p =>
    !search || [p.name, p.location, p.type].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPermitLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CMS Properties</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data properti yang ditampilkan di aplikasi</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Properti
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, lokasi, tipe..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Belum ada properti. Tambahkan yang pertama!</p>
            </div>
          ) : filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              {p.image_url ? (
                <div className="h-36 overflow-hidden">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-36 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-blue-200" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-slate-800 leading-tight">{p.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {p.status === 'active' ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>
                {p.location && <p className="text-xs text-slate-400 mb-1">{p.location}</p>}
                {p.type && <p className="text-xs text-blue-600 font-semibold mb-2">{p.type}</p>}
                {p.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{p.description}</p>}
                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button onClick={() => openEdit(p)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4"
          onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-800">{editing ? 'Edit Properti' : 'Tambah Properti Baru'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'name', label: 'Nama Properti *', type: 'text', placeholder: 'e.g. Residential Property' },
                { key: 'type', label: 'Tipe', type: 'text', placeholder: 'e.g. Apartment, Townhouse' },
                { key: 'location', label: 'Lokasi', type: 'text', placeholder: 'e.g. Bekasi, Jawa Barat' },
                { key: 'address', label: 'Alamat Lengkap', type: 'text', placeholder: 'Jl. ...' },
                { key: 'total_units', label: 'Total Unit', type: 'number', placeholder: '100' },
                { key: 'contact_number', label: 'Nomor Kontak', type: 'text', placeholder: '021-...' },
                { key: 'image_url', label: 'URL Gambar', type: 'url', placeholder: 'https://...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''} placeholder={f.placeholder}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Deskripsi</label>
                <textarea value={form.description || ''} rows={3} placeholder="Deskripsi singkat properti..."
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
                <select value={form.status || 'active'} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none">
                  <option value="active">Aktif</option>
                  <option value="inactive">Non-aktif</option>
                </select>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 pb-6 pt-3 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Batal
              </button>
              <button onClick={() => saveMutation.mutate(form)}
                disabled={!form.name || saveMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPermitLayout>
  );
}