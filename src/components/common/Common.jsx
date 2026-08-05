import React from 'react';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink/60 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line py-16 px-6 text-center">
      <p className="font-display text-base font-medium text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-ink/60 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink/50 text-sm">
      <div className="h-4 w-4 rounded-full border-2 border-forest-200 border-t-forest-600 animate-spin" />
      {label}
    </div>
  );
}
