import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { FormRow, Input, Select, Textarea } from '@/components/ui/Field';
import { TRAINING_TYPES, DELIVERY_MODES, STATUSES } from '@/lib/constants';

const BLANK = {
  training_title: '',
  training_type: 'Skills Building',
  facilitator: '',
  partner_organization: '',
  target_group: '',
  delivery_mode: 'In-person',
  location: '',
  start_date: '',
  end_date: '',
  expected_participants: '',
  actual_participants: '',
  male_participants: '',
  female_participants: '',
  certification_provided: false,
  budget: '',
  lead_person: '',
  status: 'Planned',
  learning_objectives: '',
  key_outcomes: '',
  notes: '',
};

export default function TrainingForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...BLANK, ...initial });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) =>
    setValues((v) => ({
      ...v,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const numFields = [
      'expected_participants',
      'actual_participants',
      'male_participants',
      'female_participants',
      'budget',
    ];
    const payload = { ...values };
    numFields.forEach((f) => {
      payload[f] = payload[f] ? Number(payload[f]) : null;
    });
    await onSubmit(payload);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormRow label="Training title" required>
        <Input required value={values.training_title} onChange={set('training_title')} />
      </FormRow>

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Training type">
          <Select value={values.training_type} onChange={set('training_type')}>
            {TRAINING_TYPES.map((t) => (
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
        <FormRow label="Facilitator">
          <Input value={values.facilitator} onChange={set('facilitator')} />
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
        <FormRow label="Delivery mode">
          <Select value={values.delivery_mode} onChange={set('delivery_mode')}>
            {DELIVERY_MODES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </FormRow>
        <FormRow label="Location">
          <Input value={values.location} onChange={set('location')} />
        </FormRow>
      </div>

      <FormRow label="Target group">
        <Input value={values.target_group} onChange={set('target_group')} />
      </FormRow>

      <div className="grid grid-cols-4 gap-4">
        <FormRow label="Expected">
          <Input type="number" min="0" value={values.expected_participants} onChange={set('expected_participants')} />
        </FormRow>
        <FormRow label="Actual">
          <Input type="number" min="0" value={values.actual_participants} onChange={set('actual_participants')} />
        </FormRow>
        <FormRow label="Male">
          <Input type="number" min="0" value={values.male_participants} onChange={set('male_participants')} />
        </FormRow>
        <FormRow label="Female">
          <Input type="number" min="0" value={values.female_participants} onChange={set('female_participants')} />
        </FormRow>
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <FormRow label="Budget">
          <Input type="number" min="0" value={values.budget} onChange={set('budget')} />
        </FormRow>
        <label className="flex items-center gap-2 text-sm text-ink/80 pb-2.5">
          <input type="checkbox" checked={values.certification_provided} onChange={set('certification_provided')} />
          Certification provided
        </label>
      </div>

      <FormRow label="Lead person">
        <Input value={values.lead_person} onChange={set('lead_person')} />
      </FormRow>

      <FormRow label="Learning objectives">
        <Textarea value={values.learning_objectives} onChange={set('learning_objectives')} />
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
          {saving ? 'Saving…' : 'Save training'}
        </Button>
      </div>
    </form>
  );
}
