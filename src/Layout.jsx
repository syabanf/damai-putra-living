import React from 'react';
import BottomNav from '@/components/navigation/BottomNav';

// Pages that should NOT show BottomNav
const NO_NAV_PAGES = ['Splash', 'Onboarding', 'Register', 'Verification', 'ForgotPassword', 'RegistrationSuccess', 'UnitSubmitted', 'TicketSubmitted'];

export default function Layout({ children, currentPageName }) {
  const hideNav = NO_NAV_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen bg-stone-200">
      <style>{`
        :root {
          --brand:        #8A7F73;
          --brand-dark:   #6e6560;
          --brand-darker: #5a524e;
          --brand-light:  #a5a09a;
          --action:       #1F86C7;
          --action-dark:  #1669a0;
          --action-light: #e8f4fb;
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
        style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 55%, #e2ddd8 100%)' }}
      >
        {children}
        {!hideNav && <BottomNav currentPage={currentPageName} />}
      </div>
    </div>
  );
}