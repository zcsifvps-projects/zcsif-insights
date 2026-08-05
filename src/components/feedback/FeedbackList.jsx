import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export default function FeedbackList({ items, onEdit, onDelete, showRelated }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-panel">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
            {showRelated && <th className="px-4 py-2.5 font-medium">Linked to</th>}
            <th className="px-4 py-2.5 font-medium">Respondent</th>
            <th className="px-4 py-2.5 font-medium">Date</th>
            <th className="px-4 py-2.5 font-medium">Rating</th>
            <th className="px-4 py-2.5 font-medium">Satisfaction</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((f) => (
            <tr key={f.id} className="border-b border-line last:border-0">
              {showRelated && (
                <td className="px-4 py-2.5 text-ink/70">
                  {f.related_module} · <span className="text-xs text-ink/40">{f.related_record}</span>
                </td>
              )}
              <td className="px-4 py-2.5">
                <p className="font-medium text-ink">{f.respondent_name || 'Anonymous'}</p>
                <p className="text-xs text-ink/50">{f.respondent_type}</p>
              </td>
              <td className="px-4 py-2.5 text-ink/70">{formatDate(f.feedback_date)}</td>
              <td className="px-4 py-2.5 text-ink/70">{f.overall_rating ? `${f.overall_rating} / 5` : '—'}</td>
              <td className="px-4 py-2.5 text-ink/70">{f.satisfaction_level || '—'}</td>
              <td className="px-4 py-2.5">
                <StatusBadge status={f.status} />
                {f.follow_up_required && (
                  <span className="ml-1.5 text-xs text-ochre-600 font-medium">Follow-up</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(f)}
                    className="rounded-md p-1.5 text-ink/50 hover:bg-forest-50 hover:text-forest-700"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(f)}
                    className="rounded-md p-1.5 text-ink/50 hover:bg-rust-100 hover:text-rust-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
