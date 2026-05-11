import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Building2, FileText, Bell, User } from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home,      label: 'Home',    page: 'Home' },
  { icon: Building2, label: 'Property',page: 'PropertyListing' },
  { icon: FileText,  label: 'Permits', page: 'Tickets' },
  { icon: Bell,      label: 'Notif',   page: 'Notifications' },
  { icon: User,      label: 'Profile', page: 'Profile' },
];

// Save scroll position for the current page before navigating away
function saveScroll(page) {
  const el = document.querySelector('[data-scroll-container]') || document.documentElement;
  sessionStorage.setItem(`scroll_${page}`, String(el.scrollTop || window.scrollY));
}

// Restore scroll position after navigating to a page
export function restoreScroll(page) {
  const saved = sessionStorage.getItem(`scroll_${page}`);
  if (saved) {
    requestAnimationFrame(() => {
      const el = document.querySelector('[data-scroll-container]') || document.documentElement;
      el.scrollTop = parseInt(saved, 10);
      window.scrollTo(0, parseInt(saved, 10));
    });
  }
}

export default function BottomNav({ currentPage }) {
  const navigate = useNavigate();

  const handleTabClick = useCallback((e, page) => {
    if (page === currentPage) {
      // Tap active tab → scroll to top
      const el = document.querySelector('[data-scroll-container]') || document.documentElement;
      el.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      e.preventDefault();
      return;
    }
    // Save current scroll before leaving
    saveScroll(currentPage);
  }, [currentPage]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
      <div className="max-w-[420px] w-full pointer-events-auto">
        <div
          className="flex justify-around items-center px-2 py-2 rounded-[22px] shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow: '0 8px 32px rgba(90,80,70,0.18), 0 2px 8px rgba(90,80,70,0.10)',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={(e) => handleTabClick(e, item.page)}
                className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all active:scale-90"
              >
                <div
                  className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all")}
                  style={isActive
                    ? { background: 'linear-gradient(135deg, #1684F2, #0B57C2)', boxShadow: '0 4px 12px rgba(22,132,242,0.35)' }
                    : { background: 'transparent' }
                  }
                >
                  <item.icon
                    className={cn("w-5 h-5 transition-all", isActive ? "stroke-[2]" : "stroke-[1.5]")}
                    style={isActive ? { color: '#fff' } : { color: '#94a3b8' }}
                  />
                </div>
                <span
                  className={cn("text-[9px] font-semibold tracking-wide")}
                  style={isActive ? { color: '#1684F2' } : { color: '#94a3b8' }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}