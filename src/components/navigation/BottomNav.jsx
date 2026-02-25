import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Building2, Ticket, User } from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: 'Home', page: 'Home' },
  { icon: Building2, label: 'My Unit', page: 'MyUnit' },
  { icon: Ticket, label: 'Ticket', page: 'Tickets' },
  { icon: User, label: 'Profile', page: 'Profile' },
];

export default function BottomNav({ currentPage }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-1">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center px-2 py-2 rounded-2xl border border-white/70 shadow-xl shadow-slate-300/30"
          style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)' }}>
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all active:scale-90"
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                  isActive ? "shadow-sm" : ""
                )}
                  style={isActive ? { backgroundColor: '#8A807618' } : {}}>
                  <item.icon className={cn("w-5 h-5 transition-all", isActive ? "stroke-[2.5]" : "stroke-[1.5] text-slate-400")}
                    style={isActive ? { color: '#8A8076' } : {}} />
                </div>
                <span className={cn("text-[9px] font-semibold tracking-wide", isActive ? "" : "text-slate-400")}
                  style={isActive ? { color: '#8A8076' } : {}}>
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