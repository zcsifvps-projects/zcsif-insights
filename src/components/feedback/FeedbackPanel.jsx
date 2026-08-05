import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { FeedbackApi } from '@/api/supabaseClient';
import { toast } from '@/lib/toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { EmptyState, Spinner } from '@/components/common/Common';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';

export default function FeedbackPanel({ relatedModule, relatedRecord }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await FeedbackApi.listFor(relatedModule, relatedRecord));
    } catch (err) {
      toast.error(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedRecord]);

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await FeedbackApi.update(editing.id, payload);
        toast.success('Feedback updated');
      } else {
        await FeedbackApi.create({ ...payload, related_module: relatedModule, related_record: relatedRecord });
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

  if (loading) return <Spinner label="Loading feedback…" />;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={15} /> Log feedback
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No feedback logged yet" description="Record feedback from participants, partners or staff." />
      ) : (
        <FeedbackList
          items={items}
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
          lockRelated
          onSubmit={handleSubmit}
          onCancel={() => { setFormOpen(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
