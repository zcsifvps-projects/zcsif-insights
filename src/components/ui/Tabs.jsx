import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="inline-flex gap-0.5 rounded-xl bg-line/40 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
            active === tab.value ? 'text-forest-700' : 'text-ink/55 hover:text-ink'
          )}
        >
          {active === tab.value && (
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-0 rounded-lg bg-panel shadow-card"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className="text-xs text-ink/40">({tab.count})</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
