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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                isActive ? "" : "text-slate-400 hover:text-slate-600"
              )}
              style={isActive ? { color: '#8A8076' } : {}}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}