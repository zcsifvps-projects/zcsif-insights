import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-forest-600 text-white hover:bg-forest-700',
  secondary: 'bg-panel text-ink border border-line hover:bg-forest-50',
  glass: 'glass border border-line/70 text-ink hover:bg-forest-50/60',
  ghost: 'text-ink hover:bg-forest-50',
  danger: 'bg-rust-500 text-white hover:bg-rust-600',
};

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium tracking-[-0.01em]',
        'transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
