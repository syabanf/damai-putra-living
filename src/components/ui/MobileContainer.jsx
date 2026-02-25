import React from 'react';

export default function MobileContainer({ children, className = "", noPadding = false }) {
  return (
    <div className={`min-h-screen bg-slate-50 ${noPadding ? '' : 'px-5 py-6'} ${className}`}>
      {children}
    </div>
  );
}