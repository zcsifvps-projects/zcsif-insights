import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function Card({ className, interactive, ...props }) {
  if (interactive) {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className={cn(
          'bg-panel border border-line rounded-xl shadow-card hover:shadow-elevated cursor-pointer transition-shadow duration-200',
          className
        )}
        {...props}
      />
    );
  }
  return (
    <div
      className={cn('bg-panel border border-line rounded-xl shadow-card', className)}
      {...props}
    />
  );
}

const STATUS_COLORS = {
  Planned: 'bg-forest-50 text-forest-700',
  Confirmed: 'bg-forest-100 text-forest-700',
  Ongoing: 'bg-ochre-100 text-ochre-600',
  Completed: 'bg-forest-600 text-white',
  Postponed: 'bg-ochre-100 text-ochre-600',
  Cancelled: 'bg-rust-100 text-rust-600',
  New: 'bg-ochre-100 text-ochre-600',
  Reviewed: 'bg-forest-50 text-forest-700',
  Actioned: 'bg-forest-600 text-white',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-[0.01em]',
        STATUS_COLORS[status] || 'bg-line text-ink/70'
      )}
    >
      {status}
    </span>
  );
}
