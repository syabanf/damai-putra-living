import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from '@/components/navigation/BottomNav';

// Pages that should NOT show BottomNav
const NO_NAV_PAGES = ['Splash', 'Onboarding', 'Register', 'Verification', 'ForgotPassword', 'RegistrationSuccess', 'UnitSubmitted', 'TicketSubmitted'];

// Map route path to page name for BottomNav active state
const PAGE_NAME_MAP = {
  '/home': 'Home',
  '/property-listing': 'PropertyListing',
  '/tickets': 'Tickets',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/explore': 'Explore',
  '/my-unit': 'MyUnit',
  '/rewards': 'Rewards',
  '/events': 'Events',
};

export default function Layout({ children, currentPageName }) {
  const hideNav = NO_NAV_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen bg-stone-100">
      <style>{`
        :root {
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

        /* Global hover & transition enhancements */
        button, a, [role="button"] {
          transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }
        button:active:not(:disabled), a:active, [role="button"]:active {
          transform: scale(0.97);
        }
        
        /* Smooth page content transitions */
        .page-enter {
          animation: pageSlideIn 0.25s ease-out forwards;
        }
        @keyframes pageSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="max-w-md mx-auto min-h-screen shadow-2xl relative page-enter" style={{ background: 'linear-gradient(160deg, #f0ede9 0%, #e8e4df 100%)' }}>
        {children}
        {!hideNav && <BottomNav currentPage={currentPageName} />}
      </div>
    </div>
  );
}