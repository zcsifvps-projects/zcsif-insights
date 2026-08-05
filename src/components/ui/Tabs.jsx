import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium -mb-px',
            active === tab.value ? 'text-forest-700' : 'text-ink/50 hover:text-ink'
          )}
        >
          {tab.label}
          {typeof tab.count === 'number' && (
            <span className="ml-1.5 text-xs text-ink/40">({tab.count})</span>
          )}
          {active === tab.value && (
            <motion.div
              layoutId="tab-underline"
              className="absolute left-0 right-0 -bottom-px h-0.5 bg-forest-600"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
