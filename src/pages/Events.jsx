import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { toast } from '@/lib/toast';
import { EventsApi } from '@/api/supabaseClient';
import { PageHeader, EmptyState, Spinner } from '@/components/common/Common';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import EventForm from '@/components/events/EventForm';
import EventsTable from '@/components/events/EventsTable';
import { EVENT_TYPES, STATUSES } from '@/lib/constants';
import { toCSV, downloadCSV } from '@/lib/csv';
import { formatDate } from '@/lib/utils';

const EXPORT_COLUMNS = [
  { key: 'event_name', label: 'Event name' },
  { key: 'event_type', label: 'Type' },
  { key: 'organizer', label: 'Organizer' },
  { key: 'partner_organization', label: 'Partner organization' },
  { key: 'venue_type', label: 'Venue type' },
  { key: 'location', label: 'Location' },
  { key: 'start_date', label: 'Start date', format: formatDate },
  { key: 'end_date', label: 'End date', format: formatDate },
  { key: 'target_audience', label: 'Target audience' },
  { key: 'expected_participants', label: 'Expected participants' },
  { key: 'actual_participants', label: 'Actual participants' },
  { key: 'budget', label: 'Budget (ZMW)' },
  { key: 'lead_person', label: 'Lead person' },
  { key: 'status', label: 'Status' },
  { key: 'key_outcomes', label: 'Key outcomes' },
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setEvents(await EventsApi.list());
    } catch (err) {
      toast.error(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (typeFilter !== 'All' && ev.event_type !== typeFilter) return false;
      if (statusFilter !== 'All' && ev.status !== statusFilter) return false;
      if (search && !ev.event_name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [events, search, typeFilter, statusFilter]);

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await EventsApi.update(editing.id, payload);
        toast.success('Event updated');
      } else {
        await EventsApi.create(payload);
        toast.success('Event created');
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save event');
    }
  };

  const handleDelete = async (ev) => {
    if (!confirm(`Delete "${ev.event_name}"? This cannot be undone.`)) return;
    try {
      await EventsApi.remove(ev.id);
      toast.success('Event deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete event');
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('No events to export');
      return;
    }
    downloadCSV(`events-${new Date().toISOString().slice(0, 10)}`, toCSV(filtered, EXPORT_COLUMNS));
    toast.success('Events exported');
  };

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Workshops, conferences, meetings and outreach activities"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} /> Export CSV
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={16} /> New event
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <Input
            placeholder="Search events…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select className="sm:w-48" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All types</option>
          {EVENT_TYPES.map((t) => (
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
          title="No events found"
          description="Try adjusting your filters, or create the first event."
          action={
            <Button variant="secondary" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={16} /> New event
            </Button>
          }
        />
      ) : (
        <EventsTable
          events={filtered}
          onEdit={(ev) => { setEditing(ev); setFormOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? 'Edit event' : 'New event'}
        wide
      >
        <EventForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setFormOpen(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
