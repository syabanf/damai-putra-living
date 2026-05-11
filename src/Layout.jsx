import React, { useEffect, createContext, useState, useContext } from 'react';
import BottomNav from '@/components/navigation/BottomNav';

// Pages that should NOT show BottomNav
const NO_NAV_PAGES = ['Splash', 'Onboarding', 'Register', 'Verification', 'ForgotPassword', 'RegistrationSuccess', 'UnitSubmitted', 'TicketSubmitted'];

// Dark mode context
const DarkModeContext = createContext();

export function useDarkMode() {
  return useContext(DarkModeContext);
}

export default function Layout({ children, currentPageName }) {
  const [isDark, setIsDark] = useState(false);
  const hideNav = NO_NAV_PAGES.includes(currentPageName);

  // Detect system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handler = (e) => {
      setIsDark(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <DarkModeContext.Provider value={isDark}>
    <div className="min-h-screen bg-slate-100">
      <style>{`
        :root {
          --brand:        #1684F2;
          --brand-dark:   #231F20;
          --brand-darker: #111214;
          --brand-light:  #8DBEFF;
          --action:       #1684F2;
          --action-dark:  #0B57C2;
          --action-light: #EAF3FF;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(22,132,242,0.28); border-radius: 4px; }

        @media (min-width: 640px) {
          body { background: linear-gradient(135deg, #1684F2 0%, #111214 100%); }
        }

        /* Smooth page entrance */
        .page-wrap { animation: fadeSlideIn 0.22s ease-out; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Global tap feedback */
        button:active:not(:disabled), a:active { transform: scale(0.97); }
      `}</style>

      <div
        className="max-w-md mx-auto min-h-screen shadow-2xl relative page-wrap"
        style={{ 
          paddingTop: 'max(0px, env(safe-area-inset-top))',
          background: 'linear-gradient(160deg, #F6F9FC 0%, #EEF5FF 55%, #E7F0FF 100%)'
        }}
      >
        <div style={{ paddingBottom: hideNav ? 0 : 'calc(6rem + env(safe-area-inset-bottom))' }}>
          {children}
        </div>
        {!hideNav && <BottomNav currentPage={currentPageName} />}
      </div>
    </div>
    </DarkModeContext.Provider>
  );
}
