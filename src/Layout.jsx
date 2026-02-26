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
    <div className="min-h-screen bg-stone-200">
      <style>{`
        :root {
          --brand:        #8E8478;
          --brand-dark:   #0F3D4C;
          --brand-darker: #0a2d38;
          --brand-light:  #b0aba5;
          --action:       #1FB6D5;
          --action-dark:  #169ab5;
          --action-light: #e6f8fb;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(138,127,115,0.3); border-radius: 4px; }

        @media (min-width: 640px) {
          body { background: linear-gradient(135deg, #8A7F73 0%, #2E2E2E 100%); }
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
          paddingTop: 'env(safe-area-inset-top)',
          background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' 
        }}
      >
        {children}
        {!hideNav && <BottomNav currentPage={currentPageName} />}
      </div>
    </div>
    </DarkModeContext.Provider>
  );
}