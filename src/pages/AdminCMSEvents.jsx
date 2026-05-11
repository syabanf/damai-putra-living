import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import AdminPermitLayout from '@/components/admin/AdminPermitLayout';
import { Plus, Search, Calendar, Edit2, Trash2, X, Save } from 'lucide-react';

const CATEGORIES = ['community','cultural','food','music','sport','festival','wellness','commercial'];
const CAT_LABEL = { community:'Community', cultural:'Cultural', food:'Food', music:'Music', sport:'Sport', festival:'Festival', wellness:'Wellness', commercial:'Commercial' };
const STATUS_STYLE = { upcoming:'bg-blue-50 text-blue-700', ongoing:'bg-emerald-50 text-emerald-700', past:'bg-slate-100 text-slate-500' };

const EMPTY = { title:'', description:'', category:'', status:'upcoming', start_date:'', end_date:'', start_time:'', end_time:'', location:'', address:'', organizer:'', banner_image:'', ticket_url:'', is_featured: false };

export default function AdminCMSEvents() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => appClient.entities.Event.list('-start_date', 300),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? appClient.entities.Event.update(editing.id, data) : appClient.entities.Event.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setShowForm(false); setEditing(null); setForm(EMPTY); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appClient.entities.Event.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-events'] }),
  });

  const openEdit = (e) => { setEditing(e); setForm({ ...EMPTY, ...e }); setShowForm(true); };
  const openNew  = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const handleDelete = (e) => { if (window.confirm(`Hapus event "${e.title}"?`)) deleteMutation.mutate(e.id); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = events.filter(e => {
    const matchSearch = !search || [e.title, e.location, e.organizer].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminPermitLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CMS Events</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data acara dan kegiatan komunitas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Upcoming', count: events.filter(e => e.status === 'upcoming').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ongoing',  count: events.filter(e => e.status === 'ongoing').length,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Past',     count: events.filter(e => e.status === 'past').length,     color: 'text-slate-500', bg: 'bg-slate-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari event..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none">
          <option value="all">Semua Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* Cards Grid */}
      {isLoading ? <div className="p-8 text-center text-slate-400">Loading...</div>
      : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-100">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400">Belum ada event</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ev => (
            <div key={ev.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              {ev.banner_image
                ? <div className="h-36 overflow-hidden"><img src={ev.banner_image} alt={ev.title} className="w-full h-full object-cover" /></div>
                : <div className="h-36 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center"><Calendar className="w-12 h-12 text-blue-200" /></div>
              }
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{ev.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLE[ev.status] || 'bg-slate-100 text-slate-500'}`}>{ev.status}</span>
                </div>
                {ev.location && <p className="text-xs text-slate-400 mb-1">{ev.location}</p>}
                <p className="text-xs text-blue-600 font-semibold mb-1">{ev.start_date}{ev.end_date && ev.end_date !== ev.start_date ? ` – ${ev.end_date}` : ''}</p>
                {ev.organizer && <p className="text-xs text-slate-400 mb-3">by {ev.organizer}</p>}
                {ev.is_featured && <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full mr-1">Featured</span>}
                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  <button onClick={() => openEdit(ev)} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(ev)} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50">
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-800">{editing ? 'Edit Event' : 'Tambah Event Baru'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key:'title', label:'Judul Event *', placeholder:'e.g. Damai Run 2026' },
                { key:'location', label:'Lokasi', placeholder:'e.g. Lapangan Damai Putra' },
                { key:'address', label:'Alamat', placeholder:'Jl. ...' },
                { key:'organizer', label:'Organizer', placeholder:'e.g. Damai Putra Management' },
                { key:'banner_image', label:'URL Banner', placeholder:'https://...' },
                { key:'ticket_url', label:'URL Tiket/Registrasi', placeholder:'https://...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
                  <input value={form[f.key] || ''} placeholder={f.placeholder} onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[{ key:'start_date', label:'Tanggal Mulai *', type:'date' }, { key:'end_date', label:'Tanggal Selesai', type:'date' },
                  { key:'start_time', label:'Jam Mulai', type:'time' }, { key:'end_time', label:'Jam Selesai', type:'time' }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
                    <input type={f.type} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Kategori</label>
                  <select value={form.category || ''} onChange={e => set('category', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none">
                    <option value="">Pilih...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
                  <select value={form.status || 'upcoming'} onChange={e => set('status', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={!!form.is_featured} onChange={e => set('is_featured', e.target.checked)}
                  className="w-4 h-4 accent-blue-600" />
                <label htmlFor="featured" className="text-sm text-slate-600 font-medium">Featured event (tampil di homepage)</label>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Deskripsi</label>
                <textarea value={form.description || ''} rows={3} onChange={e => set('description', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none resize-none" />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 pb-6 pt-3 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">Batal</button>
              <button onClick={() => saveMutation.mutate(form)} disabled={!form.title || !form.start_date || saveMutation.isPending}
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