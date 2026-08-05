import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { toast } from '@/lib/toast';
import { TrainingsApi } from '@/api/supabaseClient';
import { PageHeader, EmptyState, Spinner } from '@/components/common/Common';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import TrainingForm from '@/components/trainings/TrainingForm';
import TrainingsTable from '@/components/trainings/TrainingsTable';
import { TRAINING_TYPES, STATUSES } from '@/lib/constants';
import { toCSV, downloadCSV } from '@/lib/csv';
import { formatDate } from '@/lib/utils';

const EXPORT_COLUMNS = [
  { key: 'training_title', label: 'Training title' },
  { key: 'training_type', label: 'Type' },
  { key: 'facilitator', label: 'Facilitator' },
  { key: 'partner_organization', label: 'Partner organization' },
  { key: 'delivery_mode', label: 'Delivery mode' },
  { key: 'location', label: 'Location' },
  { key: 'start_date', label: 'Start date', format: formatDate },
  { key: 'end_date', label: 'End date', format: formatDate },
  { key: 'target_group', label: 'Target group' },
  { key: 'expected_participants', label: 'Expected participants' },
  { key: 'actual_participants', label: 'Actual participants' },
  { key: 'male_participants', label: 'Male participants' },
  { key: 'female_participants', label: 'Female participants' },
  { key: 'certification_provided', label: 'Certification provided', format: (v) => (v ? 'Yes' : 'No') },
  { key: 'budget', label: 'Budget (ZMW)' },
  { key: 'lead_person', label: 'Lead person' },
  { key: 'status', label: 'Status' },
  { key: 'key_outcomes', label: 'Key outcomes' },
];

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setTrainings(await TrainingsApi.list());
    } catch (err) {
      toast.error(err.message || 'Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return trainings.filter((t) => {
      if (typeFilter !== 'All' && t.training_type !== typeFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (search && !t.training_title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [trainings, search, typeFilter, statusFilter]);

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await TrainingsApi.update(editing.id, payload);
        toast.success('Training updated');
      } else {
        await TrainingsApi.create(payload);
        toast.success('Training created');
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save training');
    }
  };

  const handleDelete = async (t) => {
    if (!confirm(`Delete "${t.training_title}"? This cannot be undone.`)) return;
    try {
      await TrainingsApi.remove(t.id);
      toast.success('Training deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete training');
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('No trainings to export');
      return;
    }
    downloadCSV(`trainings-${new Date().toISOString().slice(0, 10)}`, toCSV(filtered, EXPORT_COLUMNS));
    toast.success('Trainings exported');
  };

  return (
    <div>
      <PageHeader
        title="Trainings"
        subtitle="Capacity building, skills sessions and certification programs"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} /> Export CSV
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={16} /> New training
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <Input
            placeholder="Search trainings…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select className="sm:w-56" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All types</option>
          {TRAINING_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
        <Select className="sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No trainings found"
          description="Try adjusting your filters, or create the first training."
          action={
            <Button variant="secondary" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={16} /> New training
            </Button>
          }
        />
      ) : (
        <TrainingsTable
          trainings={filtered}
          onEdit={(t) => { setEditing(t); setFormOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? 'Edit training' : 'New training'}
        wide
      >
        <TrainingForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setFormOpen(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
