import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDateRange(start, end) {
  const fmt = d => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${parseInt(day)} ${MONTHS[parseInt(m)-1].slice(0,3)} ${y}`;
  };
  if (!end || start === end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function EventsCalendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_date'),
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build set of dates that have events (any day in range)
  const eventDates = useMemo(() => {
    const set = new Set();
    events.forEach(ev => {
      const start = new Date(ev.start_date);
      const end = ev.end_date ? new Date(ev.end_date) : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        set.add(d.toISOString().slice(0, 10));
      }
    });
    return set;
  }, [events]);

  const eventsForSelected = useMemo(() => {
    return events.filter(ev => {
      const start = ev.start_date;
      const end = ev.end_date || ev.start_date;
      return selectedDate >= start && selectedDate <= end;
    });
  }, [events, selectedDate]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Calendar cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F4F5F7' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">Event Calendar</h1>
        </div>
      </div>

      {/* Calendar */}
      <div className="mx-4 mt-5 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <p className="font-bold text-slate-800">{MONTHS[month]} {year}</p>
          <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = eventDates.has(dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today.toISOString().slice(0, 10);
            return (
              <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                className="flex flex-col items-center py-1.5 rounded-xl transition-all"
                style={isSelected ? { background: '#1F86C7' } : isToday ? { background: '#e8f4fb' } : {}}>
                <span className={`text-sm font-semibold ${isSelected ? 'text-white' : isToday ? 'text-[#1F86C7]' : 'text-slate-700'}`}>
                  {day}
                </span>
                {hasEvent && (
                  <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-[#1F86C7]'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events for selected date */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          {selectedDate === today.toISOString().slice(0, 10) ? 'Today' : formatDateRange(selectedDate, selectedDate)}
        </p>

        {eventsForSelected.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CalendarDays className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm">There is no event today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventsForSelected.map((event, i) => (
              <motion.div key={event.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => navigate(createPageUrl('EventDetail') + `?id=${event.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex cursor-pointer active:scale-[0.98] transition-transform">
                <img src={event.banner_image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80'}
                  alt={event.title} className="w-20 h-20 object-cover flex-shrink-0" />
                <div className="p-3 flex flex-col justify-center">
                  <p className="font-bold text-slate-800 text-sm leading-tight">{event.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CalendarDays className="w-3 h-3 text-slate-400" />
                    <p className="text-[11px] text-slate-400">{formatDateRange(event.start_date, event.end_date)}</p>
                  </div>
                  {event.location && <p className="text-[11px] text-slate-400 mt-0.5">{event.location}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}