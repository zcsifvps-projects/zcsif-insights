import React from 'react';
import { cn } from '@/lib/utils';

export function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-ink/80 mb-1.5 block', className)} {...props} />;
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full h-10 rounded-xl border border-line bg-panel px-3.5 text-sm text-ink placeholder:text-ink/40',
        'transition-shadow duration-150',
        'focus:border-forest-500 focus:ring-4 focus:ring-forest-500/12 focus:outline-none',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full min-h-[80px] rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40',
        'transition-shadow duration-150',
        'focus:border-forest-500 focus:ring-4 focus:ring-forest-500/12 focus:outline-none',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full h-10 rounded-xl border border-line bg-panel px-3.5 text-sm text-ink',
        'transition-shadow duration-150',
        'focus:border-forest-500 focus:ring-4 focus:ring-forest-500/12 focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function FormRow({ label, children, required }) {
  return (
    <div>
      <Label>
        {label} {required && <span className="text-rust-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
