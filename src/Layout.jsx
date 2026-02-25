import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --primary: 13 148 136;
          --primary-foreground: 255 255 255;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        /* Mobile container */
        @media (min-width: 640px) {
          body {
            background: linear-gradient(135deg, #0d9488 0%, #1e293b 100%);
          }
        }
      `}</style>
      
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {children}
      </div>
    </div>
  );
}