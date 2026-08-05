import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { FormRow, Input, Select, Textarea } from '@/components/ui/Field';
import { EVENT_TYPES, VENUE_TYPES, STATUSES } from '@/lib/constants';

const BLANK = {
  event_name: '',
  event_type: 'Workshop',
  organizer: '',
  partner_organization: '',
  venue_type: 'Physical',
  location: '',
  start_date: '',
  end_date: '',
  target_audience: '',
  expected_participants: '',
  actual_participants: '',
  budget: '',
  lead_person: '',
  status: 'Planned',
  objectives: '',
  key_outcomes: '',
  notes: '',
};

export default function EventForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...BLANK, ...initial });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...values,
      expected_participants: values.expected_participants ? Number(values.expected_participants) : null,
      actual_participants: values.actual_participants ? Number(values.actual_participants) : null,
      budget: values.budget ? Number(values.budget) : null,
    };
    await onSubmit(payload);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormRow label="Event name" required>
        <Input required value={values.event_name} onChange={set('event_name')} />
      </FormRow>

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Event type">
          <Select value={values.event_type} onChange={set('event_type')}>
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </FormRow>
        <FormRow label="Status">
          <Select value={values.status} onChange={set('status')}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </FormRow>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Organizer">
          <Input value={values.organizer} onChange={set('organizer')} />
        </FormRow>
        <FormRow label="Partner organization">
          <Input value={values.partner_organization} onChange={set('partner_organization')} />
        </FormRow>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Start date" required>
          <Input type="date" required value={values.start_date} onChange={set('start_date')} />
        </FormRow>
        <FormRow label="End date">
          <Input type="date" value={values.end_date} onChange={set('end_date')} />
        </FormRow>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Venue type">
          <Select value={values.venue_type} onChange={set('venue_type')}>
            {VENUE_TYPES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
        </FormRow>
        <FormRow label="Location">
          <Input value={values.location} onChange={set('location')} />
        </FormRow>
      </div>

      <FormRow label="Target audience">
        <Input value={values.target_audience} onChange={set('target_audience')} />
      </FormRow>

      <div className="grid grid-cols-3 gap-4">
        <FormRow label="Expected participants">
          <Input type="number" min="0" value={values.expected_participants} onChange={set('expected_participants')} />
        </FormRow>
        <FormRow label="Actual participants">
          <Input type="number" min="0" value={values.actual_participants} onChange={set('actual_participants')} />
        </FormRow>
        <FormRow label="Budget">
          <Input type="number" min="0" value={values.budget} onChange={set('budget')} />
        </FormRow>
      </div>

      <FormRow label="Lead person">
        <Input value={values.lead_person} onChange={set('lead_person')} />
      </FormRow>

      <FormRow label="Objectives">
        <Textarea value={values.objectives} onChange={set('objectives')} />
      </FormRow>
      <FormRow label="Key outcomes">
        <Textarea value={values.key_outcomes} onChange={set('key_outcomes')} />
      </FormRow>
      <FormRow label="Notes">
        <Textarea value={values.notes} onChange={set('notes')} />
      </FormRow>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save event'}
        </Button>
      </div>
    </form>
  );
}
