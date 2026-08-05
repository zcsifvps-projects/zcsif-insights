import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Download } from 'lucide-react';
import { toast } from '@/lib/toast';
import { FeedbackApi } from '@/api/supabaseClient';
import { PageHeader, EmptyState, Spinner } from '@/components/common/Common';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import FeedbackList from '@/components/feedback/FeedbackList';
import { RELATED_MODULES, FEEDBACK_STATUSES } from '@/lib/constants';
import { toCSV, downloadCSV } from '@/lib/csv';
import { formatDate } from '@/lib/utils';

const EXPORT_COLUMNS = [
  { key: 'related_module', label: 'Module' },
  { key: 'respondent_name', label: 'Respondent' },
  { key: 'respondent_type', label: 'Respondent type' },
  { key: 'feedback_date', label: 'Date', format: formatDate },
  { key: 'overall_rating', label: 'Rating (1-5)' },
  { key: 'satisfaction_level', label: 'Satisfaction' },
  { key: 'what_worked_well', label: 'What worked well' },
  { key: 'areas_for_improvement', label: 'Areas for improvement' },
  { key: 'recommendations', label: 'Recommendations' },
  { key: 'follow_up_required', label: 'Follow-up required', format: (v) => (v ? 'Yes' : 'No') },
  { key: 'status', label: 'Status' },
];

export default function Feedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await FeedbackApi.list());
    } catch (err) {
      toast.error(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((f) => {
      if (moduleFilter !== 'All' && f.related_module !== moduleFilter) return false;
      if (statusFilter !== 'All' && f.status !== statusFilter) return false;
      if (ratingFilter !== 'All' && String(f.overall_rating) !== ratingFilter) return false;
      if (unresolvedOnly && !(f.follow_up_required && f.status !== 'Actioned')) return false;
      return true;
    });
  }, [items, moduleFilter, statusFilter, ratingFilter, unresolvedOnly]);

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await FeedbackApi.update(editing.id, payload);
        toast.success('Feedback updated');
      } else {
        await FeedbackApi.create(payload);
        toast.success('Feedback logged');
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save feedback');
    }
  };

  const handleDelete = async (f) => {
    if (!confirm('Delete this feedback entry?')) return;
    try {
      await FeedbackApi.remove(f.id);
      toast.success('Feedback deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete feedback');
    }
  };

  return (
    <div>
      <PageHeader
        title="Feedback"
        subtitle="All feedback logged across events and trainings"
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                if (filtered.length === 0) {
                  toast.error('No feedback to export');
                  return;
                }
                downloadCSV(`feedback-${new Date().toISOString().slice(0, 10)}`, toCSV(filtered, EXPORT_COLUMNS));
                toast.success('Feedback exported');
              }}
            >
              <Download size={16} /> Export CSV
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={16} /> Log feedback
            </Button>
          </div>
        }
      />

      {items.filter((f) => f.follow_up_required && f.status !== 'Actioned').length > 0 && (
        <div className="mb-4 rounded-lg border border-ochre-100 bg-ochre-100/40 px-4 py-3 text-sm text-ochre-700">
          <span className="font-medium">
            {items.filter((f) => f.follow_up_required && f.status !== 'Actioned').length}
          </span>{' '}
          feedback {items.filter((f) => f.follow_up_required && f.status !== 'Actioned').length === 1 ? 'entry needs' : 'entries need'} follow-up.{' '}
          <button
            className="underline underline-offset-2"
            onClick={() => setUnresolvedOnly((v) => !v)}
          >
            {unresolvedOnly ? 'Show all' : 'Show unresolved only'}
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select className="sm:w-44" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
          <option value="All">All modules</option>
          {RELATED_MODULES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
        <Select className="sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {FEEDBACK_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select className="sm:w-36" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
          <option value="All">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} / 5
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No feedback found"
          description="Try adjusting your filters, or log the first feedback entry."
        />
      ) : (
        <FeedbackList
          items={filtered}
          showRelated
          onEdit={(f) => { setEditing(f); setFormOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? 'Edit feedback' : 'Log feedback'}
        wide
      >
        <FeedbackForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setFormOpen(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
