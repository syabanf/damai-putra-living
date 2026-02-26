import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <style>{`
        :root {
          /* Damai Putra Living Brand Colors */
          --brand:        #8A7F73;
          --brand-dark:   #6e6560;
          --brand-darker: #5a524e;
          --brand-light:  #a5a09a;
          --brand-pale:   #F4F5F7;
          --brand-pale2:  #e8e9ec;
          --action:       #1F86C7;
          --action-dark:  #1669a0;
          --action-light: #e8f4fb;
          --surface:      #FFFFFF;
          --bg:           #F4F5F7;
          --text-primary: #2E2E2E;
          --border-color: #E0E0E0;
        }
        
        .bg-brand        { background-color: var(--brand); }
        .bg-brand-dark   { background-color: var(--brand-dark); }
        .bg-brand-darker { background-color: var(--brand-darker); }
        .bg-brand-light  { background-color: var(--brand-light); }
        .bg-brand-pale   { background-color: var(--brand-pale); }
        .bg-action       { background-color: var(--action); }
        .text-brand      { color: var(--brand); }
        .text-brand-dark { color: var(--brand-dark); }
        .text-action     { color: var(--action); }
        .border-brand    { border-color: var(--brand); }
        .border-action   { border-color: var(--action); }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        
        @media (min-width: 640px) {
          body {
            background: linear-gradient(135deg, #8A7F73 0%, #2E2E2E 100%);
          }
        }
      `}</style>
      
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {children}
      </div>
    </div>
  );
}