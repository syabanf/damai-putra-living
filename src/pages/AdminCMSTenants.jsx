import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';
import { Plus, Search, Store, Edit2, Trash2, X, Save } from 'lucide-react';

const CATEGORIES = ['food_beverage','fashion','beauty','entertainment','sport','services','retail','education','health'];
const CAT_LABEL = { food_beverage:'F&B', fashion:'Fashion', beauty:'Beauty', entertainment:'Entertainment', sport:'Sport', services:'Services', retail:'Retail', education:'Education', health:'Health' };

const EMPTY = { name:'', category:'', destination_name:'', destination_id:'', location_detail:'', opening_hours:'', contact:'', logo_url:'', description:'' };

export default function AdminCMSTenants() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => base44.entities.Tenant.list('-created_date', 300),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Tenant.update(editing.id, data) : base44.entities.Tenant.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); setShowForm(false); setEditing(null); setForm(EMPTY); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tenant.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] }),
  });

  const openEdit = (t) => { setEditing(t); setForm({ ...EMPTY, ...t }); setShowForm(true); };
  const openNew  = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const handleDelete = (t) => { if (window.confirm(`Hapus "${t.name}"?`)) deleteMutation.mutate(t.id); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = tenants.filter(t => {
    const matchSearch = !search || [t.name, t.destination_name, t.category].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || t.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <AdminPermitLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CMS Tenants</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data tenant/toko di semua destinasi</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama tenant..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none">
          <option value="all">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-slate-400">Loading...</div>
        : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Store className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400">Belum ada tenant</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Tenant','Destinasi','Kategori','Jam Buka','Kontak','Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {t.logo_url
                          ? <img src={t.logo_url} alt={t.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          : <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Store className="w-4 h-4 text-blue-400" /></div>
                        }
                        <span className="font-semibold text-slate-800">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.destination_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{CAT_LABEL[t.category] || t.category || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.opening_hours || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.contact || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(t)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(t)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-800">{editing ? 'Edit Tenant' : 'Tambah Tenant'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key:'name', label:'Nama Tenant *', placeholder:'e.g. Kopi Kenangan' },
                { key:'destination_id', label:'ID Destinasi', placeholder:'ID destinasi parent' },
                { key:'destination_name', label:'Nama Destinasi', placeholder:'e.g. Damai Square' },
                { key:'location_detail', label:'Lokasi Detail', placeholder:'e.g. Lantai 1, Unit A1' },
                { key:'opening_hours', label:'Jam Operasional', placeholder:'e.g. 10:00 - 22:00' },
                { key:'contact', label:'Kontak / WA', placeholder:'e.g. 0812-xxxx-xxxx' },
                { key:'logo_url', label:'URL Logo', placeholder:'https://...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
                  <input value={form[f.key] || ''} placeholder={f.placeholder}
                    onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Kategori</label>
                <select value={form.category || ''} onChange={e => set('category', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none">
                  <option value="">Pilih kategori...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Deskripsi</label>
                <textarea value={form.description || ''} rows={3} onChange={e => set('description', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none resize-none" />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 pb-6 pt-3 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">Batal</button>
              <button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />{saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPermitLayout>
  );
}