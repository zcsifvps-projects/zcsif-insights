import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { FormRow, Input, Select, Textarea } from '@/components/ui/Field';
import {
  RESPONDENT_TYPES,
  SATISFACTION_LEVELS,
  FEEDBACK_STATUSES,
  RELATED_MODULES,
} from '@/lib/constants';

const BLANK = {
  related_module: 'Events',
  related_record: '',
  respondent_name: '',
  respondent_type: 'Participant',
  feedback_date: new Date().toISOString().slice(0, 10),
  overall_rating: '',
  satisfaction_level: '',
  what_worked_well: '',
  areas_for_improvement: '',
  recommendations: '',
  follow_up_required: false,
  status: 'New',
  notes: '',
};

// `lockRelated` hides the related_module/related_record fields when the form
// is embedded inside an Event/Training detail page (they're implied).
export default function FeedbackForm({ initial, lockRelated, onSubmit, onCancel }) {
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
    const payload = {
      ...values,
      overall_rating: values.overall_rating ? Number(values.overall_rating) : null,
    };
    await onSubmit(payload);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!lockRelated && (
        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Related module" required>
            <Select value={values.related_module} onChange={set('related_module')}>
              {RELATED_MODULES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </FormRow>
          <FormRow label="Related record ID" required>
            <Input
              required
              value={values.related_record}
              onChange={set('related_record')}
              placeholder="Event or Training ID"
            />
          </FormRow>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Respondent name">
          <Input value={values.respondent_name} onChange={set('respondent_name')} />
        </FormRow>
        <FormRow label="Respondent type">
          <Select value={values.respondent_type} onChange={set('respondent_type')}>
            {RESPONDENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </FormRow>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormRow label="Feedback date" required>
          <Input type="date" required value={values.feedback_date} onChange={set('feedback_date')} />
        </FormRow>
        <FormRow label="Overall rating (1–5)">
          <Input type="number" min="1" max="5" value={values.overall_rating} onChange={set('overall_rating')} />
        </FormRow>
        <FormRow label="Satisfaction">
          <Select value={values.satisfaction_level} onChange={set('satisfaction_level')}>
            <option value="">Select…</option>
            {SATISFACTION_LEVELS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </FormRow>
      </div>

      <FormRow label="What worked well">
        <Textarea value={values.what_worked_well} onChange={set('what_worked_well')} />
      </FormRow>
      <FormRow label="Areas for improvement">
        <Textarea value={values.areas_for_improvement} onChange={set('areas_for_improvement')} />
      </FormRow>
      <FormRow label="Recommendations">
        <Textarea value={values.recommendations} onChange={set('recommendations')} />
      </FormRow>

      <div className="grid grid-cols-2 gap-4 items-end">
        <FormRow label="Status">
          <Select value={values.status} onChange={set('status')}>
            {FEEDBACK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </FormRow>
        <label className="flex items-center gap-2 text-sm text-ink/80 pb-2.5">
          <input type="checkbox" checked={values.follow_up_required} onChange={set('follow_up_required')} />
          Follow-up required
        </label>
      </div>

      <FormRow label="Notes">
        <Textarea value={values.notes} onChange={set('notes')} />
      </FormRow>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save feedback'}
        </Button>
      </div>
    </form>
  );
}
