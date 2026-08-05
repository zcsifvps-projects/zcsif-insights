import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Card';
import { formatDate, cn } from '@/lib/utils';

function AttendanceRate({ actual, expected }) {
  if (!expected) return null;
  const pct = Math.round((Math.min(actual || 0, expected) / expected) * 100);
  const tone =
    pct >= 90 ? 'text-forest-700 bg-forest-50' : pct >= 60 ? 'text-ochre-600 bg-ochre-100' : 'text-rust-600 bg-rust-100';
  return (
    <span className={cn('ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-medium', tone)}>
      {pct}%
    </span>
  );
}

export default function EventsTable({ events, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-panel">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
            <th className="px-4 py-3 font-medium">Event</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Dates</th>
            <th className="px-4 py-3 font-medium">Participants</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev, i) => (
            <motion.tr
              key={ev.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32, delay: Math.min(i * 0.03, 0.3) }}
              whileHover={{ backgroundColor: 'rgba(47,111,94,0.05)' }}
              className="border-b border-line last:border-0 cursor-pointer"
              onClick={() => navigate(`/events/${ev.id}`)}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{ev.event_name}</p>
                <p className="text-xs text-ink/50">{ev.location || '—'}</p>
              </td>
              <td className="px-4 py-3 text-ink/70">{ev.event_type}</td>
              <td className="px-4 py-3 text-ink/70">
                {formatDate(ev.start_date)}
                {ev.end_date ? ` – ${formatDate(ev.end_date)}` : ''}
              </td>
              <td className="px-4 py-3 text-ink/70">
                {ev.actual_participants ?? '–'} / {ev.expected_participants ?? '–'}
                <AttendanceRate actual={ev.actual_participants} expected={ev.expected_participants} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={ev.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    onClick={() => onEdit(ev)}
                    className="rounded-md p-1.5 text-ink/50 hover:bg-forest-50 hover:text-forest-700"
                    aria-label="Edit"
                  >
                    <Pencil size={15} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    onClick={() => onDelete(ev)}
                    className="rounded-md p-1.5 text-ink/50 hover:bg-rust-100 hover:text-rust-600"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
