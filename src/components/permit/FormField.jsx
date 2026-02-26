import React from 'react';
import { Upload, CheckCircle, X, FileText } from 'lucide-react';

const ic = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 transition-all";

export const F = ({ label, required, hint, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

export const Input = ({ value, onChange, placeholder, type = 'text', ...rest }) => (
  <input type={type} className={ic} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} {...rest} />
);

export const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea className={ic + ' resize-none'} style={{ minHeight: rows * 28 }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
);

export const Select = ({ value, onChange, options, placeholder = 'Select...' }) => {
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return (
    <select className={`${ic} ${isDark ? 'bg-slate-800 text-slate-100' : ''}`} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
};

export const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer py-1">
    <input type="checkbox" className="w-4 h-4 rounded accent-stone-600" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="text-sm text-slate-600">{label}</span>
  </label>
);

export const FileUpload = ({ label, hint, uploading, uploaded, onUpload, onRemove, multiple = false }) => (
  <F label={label} hint={hint}>
    {uploaded && !multiple ? (
      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span className="text-xs text-emerald-700 flex-1 font-medium">File uploaded</span>
        {onRemove && <button onClick={onRemove}><X className="w-4 h-4 text-slate-400" /></button>}
      </div>
    ) : (
      <label className="block cursor-pointer">
        <input type="file" className="hidden" accept="image/*,.pdf" onChange={onUpload} disabled={uploading} />
        <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${uploading ? 'border-stone-300 bg-stone-50' : 'border-slate-200 hover:border-stone-400 hover:bg-stone-50/50'}`}>
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Tap to upload (JPG, PNG, PDF)</p>
            </>
          )}
        </div>
      </label>
    )}
  </F>
);

export const Section = ({ title, children }) => (
  <div className="bg-white/80 rounded-2xl p-4 space-y-4">
    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest pb-2 border-b border-slate-100">{title}</h3>
    {children}
  </div>
);