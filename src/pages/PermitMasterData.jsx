import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Settings, ClipboardList, Shield, FileText } from 'lucide-react';
import PermitLayout from '@/components/permit-mgmt/PermitLayout';
import PermitStatusBadge from '@/components/permit-mgmt/PermitStatusBadge';

const TABS = [
  { key: 'work_items', label: 'Work Items', icon: ClipboardList },
  { key: 'rules', label: 'Permit Rules', icon: Shield },
  { key: 'doc_types', label: 'Document Types', icon: FileText },
];

const DOC_TYPES = ['Design Drawing','IMB/Building Permit','KTP/ID','Ownership Certificate','Contractor License','Material Specification','Site Photo','Approval Letter','Other'];

export default function PermitMasterData() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('work_items');
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Interior');
  const [newItemType, setNewItemType] = useState('Minor');
  const [newRule, setNewRule] = useState({ rule_code: '', rule_title: '', rule_description: '', applies_to: 'Both' });

  const { data: workItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['master-work-items'],
    queryFn: () => base44.entities.WorkItem.filter({ is_master: true }),
  });

  const { data: rules = [], isLoading: loadingRules } = useQuery({
    queryKey: ['master-rules'],
    queryFn: () => base44.entities.PermitRule.filter({ is_master: true }),
  });

  const addItemMutation = useMutation({
    mutationFn: () => base44.entities.WorkItem.create({ work_item_name: newItem, work_category: newCategory, work_item_type: newItemType, is_master: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['master-work-items'] }); setNewItem(''); },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['master-work-items'] }),
  });

  const addRuleMutation = useMutation({
    mutationFn: () => base44.entities.PermitRule.create({ ...newRule, is_master: true, is_mandatory: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['master-rules'] }); setNewRule({ rule_code: '', rule_title: '', rule_description: '', applies_to: 'Both' }); },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.PermitRule.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['master-rules'] }),
  });

  const inputCls = "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <PermitLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Master Data</h1>
        <p className="text-slate-500 text-sm">Manage work items, permit rules, and document requirements</p>
      </div>

      <div className="flex gap-2 mb-5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === key ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'work_items' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Add Work Item</h3>
            <div className="flex flex-wrap gap-3">
              <input className={`${inputCls} flex-1 min-w-48`} placeholder="Work item name" value={newItem} onChange={e => setNewItem(e.target.value)} />
              <input className={`${inputCls} w-36`} placeholder="Category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
              <select className={`${inputCls}`} value={newItemType} onChange={e => setNewItemType(e.target.value)}>
                {['Minor', 'Major', 'Both'].map(t => <option key={t}>{t}</option>)}
              </select>
              <button onClick={() => addItemMutation.mutate()} disabled={!newItem || addItemMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Work Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody>
                {loadingItems ? <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr> :
                  workItems.length === 0 ? <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No master work items. Seed data or add items above.</td></tr> :
                  workItems.map(item => (
                    <tr key={item.id} className="border-b border-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">{item.work_item_name}</td>
                      <td className="px-4 py-3 text-slate-500">{item.work_category}</td>
                      <td className="px-4 py-3"><PermitStatusBadge status={item.work_item_type === 'Minor' ? 'Minor Renovation' : item.work_item_type === 'Major' ? 'Major Renovation' : 'Under Review'} size="xs" /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteItemMutation.mutate(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Add Permit Rule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Rule code (e.g. R-001)" value={newRule.rule_code} onChange={e => setNewRule(r => ({ ...r, rule_code: e.target.value }))} />
              <select className={inputCls} value={newRule.applies_to} onChange={e => setNewRule(r => ({ ...r, applies_to: e.target.value }))}>
                {['Both', 'Minor', 'Major'].map(t => <option key={t}>{t}</option>)}
              </select>
              <input className={`${inputCls} col-span-full`} placeholder="Rule title" value={newRule.rule_title} onChange={e => setNewRule(r => ({ ...r, rule_title: e.target.value }))} />
              <textarea className={`${inputCls} col-span-full`} rows={2} placeholder="Rule description" value={newRule.rule_description} onChange={e => setNewRule(r => ({ ...r, rule_description: e.target.value }))} />
            </div>
            <button onClick={() => addRuleMutation.mutate()} disabled={!newRule.rule_title || addRuleMutation.isPending}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>
          <div className="space-y-2">
            {loadingRules ? <div className="bg-white rounded-2xl border border-slate-200 h-32 animate-pulse" /> :
              rules.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">No master rules yet</div> :
              rules.map(rule => (
                <div key={rule.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {rule.rule_code && <span className="text-xs font-mono font-bold text-blue-600">{rule.rule_code}</span>}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rule.applies_to === 'Major' ? 'bg-purple-100 text-purple-700' : rule.applies_to === 'Minor' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>{rule.applies_to}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{rule.rule_title}</p>
                    {rule.rule_description && <p className="text-xs text-slate-500 mt-0.5">{rule.rule_description}</p>}
                  </div>
                  <button onClick={() => deleteRuleMutation.mutate(rule.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === 'doc_types' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Document Type Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Document Type</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Minor</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Major</th>
              </tr></thead>
              <tbody>
                {[
                  { type: 'KTP/ID', minor: true, major: true },
                  { type: 'Ownership Certificate', minor: true, major: true },
                  { type: 'Design Drawing', minor: false, major: true },
                  { type: 'IMB/Building Permit', minor: false, major: true },
                  { type: 'Contractor License', minor: false, major: true },
                  { type: 'Material Specification', minor: false, major: true },
                  { type: 'Site Photo', minor: true, major: true },
                ].map(r => (
                  <tr key={r.type} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{r.type}</td>
                    <td className="px-4 py-3 text-center">{r.minor ? '✅' : '—'}</td>
                    <td className="px-4 py-3 text-center font-semibold text-purple-600">{r.major ? '✅ Required' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PermitLayout>
  );
}