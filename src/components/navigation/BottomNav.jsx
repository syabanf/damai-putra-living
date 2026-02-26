import React from 'react';
import { Link } from 'react-router-dom';
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

export default function BottomNav({ currentPage }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
      <div className="max-w-md w-full pointer-events-auto">
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
                className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all active:scale-90"
              >
                <div
                  className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all")}
                  style={isActive
                    ? { background: 'linear-gradient(135deg, #1F86C7, #1669a0)', boxShadow: '0 4px 12px rgba(31,134,199,0.35)' }
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
                  style={isActive ? { color: '#1F86C7' } : { color: '#94a3b8' }}
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