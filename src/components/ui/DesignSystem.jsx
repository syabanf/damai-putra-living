/**
 * Shared Design System — Damai Putra Living
 * Color Palette:
 *   Brand Taupe: #8A7F73 / dark #5a524e
 *   Action Blue: #1F86C7 / dark #1669a0
 *   Bg: #F0EDE9 (warm off-white)
 *   Surface: rgba(255,255,255,0.75) + backdrop-blur
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Page background - theme responsive
const getLightPageBg = () => 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 50%, #e2ddd8 100%)';
const getDarkPageBg = () => 'linear-gradient(160deg, #1a1a1a 0%, #2a2a2a 50%, #3a3a3a 100%)';
export const PAGE_BG = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? getDarkPageBg() : getLightPageBg();

// Glassmorphism card - theme responsive
export const GlassCard = ({ children, className = '', onClick }) => {
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border shadow-sm',
        onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : '',
        className
      )}
      style={{
        background: isDark ? 'rgba(30,30,30,0.72)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)',
        boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.3)' : '0 2px 16px rgba(138,127,115,0.1)',
      }}
    >
      {children}
    </div>
  );
};

// Frosted header bar (white glass) - theme responsive
export const GlassHeader = ({ children, className = '' }) => {
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return (
    <div
      className={cn('px-5 shadow-sm', className)}
      style={{
        background: isDark ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.9)',
      }}
    >
      {children}
    </div>
  );
};

// Brand gradient header (taupe→dark)
export const BrandHeader = ({ children, className = '' }) => (
  <div
    className={cn('px-5 rounded-b-3xl', className)}
    style={{ background: 'linear-gradient(150deg, #8A7F73 0%, #6e6560 45%, #3d3733 100%)' }}
  >
    {children}
  </div>
);

// Action blue primary button
export const PrimaryButton = ({ children, onClick, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform disabled:opacity-40',
      className
    )}
    style={{ background: disabled ? '#94a3b8' : 'linear-gradient(135deg, #1F86C7, #1669a0)' }}
  >
    {children}
  </button>
);

// Category chip
export const Chip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
    style={active
      ? { background: '#1F86C7', color: '#fff', boxShadow: '0 2px 8px rgba(31,134,199,0.35)' }
      : { background: 'rgba(255,255,255,0.65)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.8)' }}
  >
    {label}
  </button>
);

// Search bar - theme responsive
export const SearchBar = ({ value, onChange, onClear, placeholder }) => {
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return (
    <div className="relative">
      <svg className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Search...'}
        className={`w-full h-11 pl-10 pr-10 rounded-xl text-sm border-0 outline-none ${isDark ? 'bg-slate-800 text-slate-100 placeholder-slate-500' : 'bg-slate-100 text-slate-700 placeholder-slate-400'}`}
        style={{
          background: isDark ? 'rgba(30,30,30,0.65)' : 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(8px)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.85)',
        }}
      />
      {value && (
        <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};