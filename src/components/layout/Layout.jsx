import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, GraduationCap, MessageSquareText, LayoutDashboard, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { EventsApi, TrainingsApi } from '@/api/supabaseClient';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/trainings', label: 'Trainings', icon: GraduationCap },
  { to: '/feedback', label: 'Feedback', icon: MessageSquareText },
];

function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    Promise.all([EventsApi.list(), TrainingsApi.list()])
      .then(([ev, tr]) => {
        setEvents(ev);
        setTrainings(tr);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const q = query.trim().toLowerCase();
  const eventResults = q ? events.filter((e) => e.event_name?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)).slice(0, 5) : [];
  const trainingResults = q ? trainings.filter((t) => t.training_title?.toLowerCase().includes(q) || t.location?.toLowerCase().includes(q)).slice(0, 5) : [];
  const hasResults = eventResults.length > 0 || trainingResults.length > 0;

  const go = (path) => {
    navigate(path);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search events, trainings…"
          className="w-full h-8 rounded-md border border-line bg-panel pl-8 pr-2 text-xs text-ink placeholder:text-ink/40 focus:border-forest-500 focus:ring-1 focus:ring-forest-500"
        />
      </div>
      <AnimatePresence>
        {open && q && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 mt-1 rounded-md border border-line bg-panel shadow-card z-20 max-h-80 overflow-y-auto"
          >
            {!hasResults ? (
              <p className="px-3 py-3 text-xs text-ink/40">No matches</p>
            ) : (
              <>
                {eventResults.length > 0 && (
                  <div>
                    <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-ink/40">Events</p>
                    {eventResults.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => go(`/events/${e.id}`)}
                        className="block w-full text-left px-3 py-1.5 text-xs text-ink hover:bg-forest-50"
                      >
                        {e.event_name}
                      </button>
                    ))}
                  </div>
                )}
                {trainingResults.length > 0 && (
                  <div>
                    <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-ink/40">Trainings</p>
                    {trainingResults.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => go(`/trainings/${t.id}`)}
                        className="block w-full text-left px-3 py-1.5 text-xs text-ink hover:bg-forest-50"
                      >
                        {t.training_title}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-line bg-panel/70 backdrop-blur-xl flex flex-col">
        <div className="px-5 py-6 border-b border-line/70">
          <p className="font-display text-lg font-semibold text-forest-700 leading-tight tracking-[-0.015em]">
            ZCSIF
          </p>
          <p className="text-xs text-ink/50 mt-0.5 tracking-[0.005em]">Engagement Tracker</p>
        </div>
        <div className="px-3 pt-3">
          <GlobalSearch />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="relative block"
            >
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium',
                    isActive ? 'text-forest-700' : 'text-ink/70 hover:text-ink'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-forest-50"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <Icon size={17} className="relative" />
                  <span className="relative">{label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-line/70">
          <p className="px-3 text-xs text-ink/50 truncate mb-2">{user?.email}</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-ink/60 hover:bg-rust-100 hover:text-rust-600 transition-colors duration-150"
          >
            <LogOut size={17} />
            Sign out
          </motion.button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
