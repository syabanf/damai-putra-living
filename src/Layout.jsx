import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <style>{`
        :root {
          --brand: #8A8076;
          --brand-dark: #6e6560;
          --brand-darker: #5a524e;
          --brand-light: #a5a09a;
          --brand-pale: #f5f3f1;
          --brand-pale2: #ece9e6;
        }
        
        .bg-brand { background-color: var(--brand); }
        .bg-brand-dark { background-color: var(--brand-dark); }
        .bg-brand-darker { background-color: var(--brand-darker); }
        .bg-brand-light { background-color: var(--brand-light); }
        .bg-brand-pale { background-color: var(--brand-pale); }
        .text-brand { color: var(--brand); }
        .text-brand-dark { color: var(--brand-dark); }
        .border-brand { border-color: var(--brand); }
        .ring-brand { --tw-ring-color: var(--brand); }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c8c2bb; border-radius: 4px; }
        
        @media (min-width: 640px) {
          body {
            background: linear-gradient(135deg, #8A8076 0%, #3d3733 100%);
          }
        }
      `}</style>
      
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {children}
      </div>
    </div>
  );
}