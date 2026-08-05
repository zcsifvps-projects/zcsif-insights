import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle2 } from 'lucide-react';
import { PublicFeedbackApi } from '@/api/supabaseClient';
import { RESPONDENT_TYPES, SATISFACTION_LEVELS } from '@/lib/constants';
import { formatDate, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { FormRow, Input, Select, Textarea } from '@/components/ui/Field';

const BLANK = {
  respondent_name: '',
  respondent_type: 'Participant',
  overall_rating: 0,
  satisfaction_level: '',
  what_worked_well: '',
  areas_for_improvement: '',
  recommendations: '',
  // honeypot — real people never see or fill this field; bots often do
  website: '',
};

export default function PublicFeedback() {
  const { module, id } = useParams();
  const relatedModule = module === 'trainings' ? 'Trainings' : 'Events';

  const [record, setRecord] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [values, setValues] = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    PublicFeedbackApi.getRecord(relatedModule, id)
      .then(setRecord)
      .catch(() => setLoadError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (values.website) return; // honeypot tripped — silently drop, no error shown to the bot
    setSubmitting(true);
    try {
      const { website, ...rest } = values;
      await PublicFeedbackApi.submit(relatedModule, id, {
        ...rest,
        overall_rating: rest.overall_rating || null,
      });
      setDone(true);
    } catch {
      setLoadError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const recordName = record ? (relatedModule === 'Trainings' ? record.training_title : record.event_name) : null;

  return (
    <div className="min-h-screen bg-paper flex items-start justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg mt-8 sm:mt-16">
        <div className="text-center mb-6">
          <p className="font-display text-lg font-semibold text-forest-700 tracking-[-0.015em]">ZCSIF</p>
          <p className="text-xs text-ink/50">Engagement Tracker · Feedback</p>
        </div>

        <div className="bg-panel border border-line rounded-lg shadow-card p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="flex flex-col items-center text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.05 }}
                >
                  <CheckCircle2 size={40} className="text-forest-600 mb-3" />
                </motion.div>
                <h1 className="font-display text-lg font-semibold text-ink tracking-[-0.01em]">Thank you</h1>
                <p className="text-sm text-ink/60 mt-1 max-w-xs">
                  Your feedback has been recorded. We appreciate you taking the time.
                </p>
              </motion.div>
            ) : loadError ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <p className="text-sm text-ink/70">
                  This feedback link isn't valid, or something went wrong. Please check the link and try again.
                </p>
              </motion.div>
            ) : !record ? (
              <div className="flex items-center justify-center py-16 text-ink/50 text-sm gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-forest-200 border-t-forest-600 animate-spin" />
                Loading…
              </div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="mb-2">
                  <h1 className="font-display text-lg font-semibold text-ink tracking-[-0.01em]">{recordName}</h1>
                  <p className="text-xs text-ink/50 mt-0.5">{formatDate(record.start_date)} · Share your feedback</p>
                </div>

                {/* honeypot — hidden from real users via CSS, not the accessibility tree issue since it's off-screen */}
                <input
                  type="text"
                  name="website"
                  value={values.website}
                  onChange={set('website')}
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute -left-[9999px] w-px h-px opacity-0"
                  aria-hidden="true"
                />

                <FormRow label="Your name (optional)">
                  <Input value={values.respondent_name} onChange={set('respondent_name')} placeholder="Optional" />
                </FormRow>

                <FormRow label="I am a">
                  <Select value={values.respondent_type} onChange={set('respondent_type')}>
                    {RESPONDENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </FormRow>

                <FormRow label="Overall rating">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <motion.button
                        key={n}
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        onClick={() => setValues((v) => ({ ...v, overall_rating: n }))}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                        className="p-0.5"
                      >
                        <Star
                          size={26}
                          className={cn(
                            'transition-colors duration-150',
                            n <= values.overall_rating ? 'fill-ochre-500 text-ochre-500' : 'text-line'
                          )}
                        />
                      </motion.button>
                    ))}
                  </div>
                </FormRow>

                <FormRow label="Satisfaction">
                  <Select value={values.satisfaction_level} onChange={set('satisfaction_level')}>
                    <option value="">Select…</option>
                    {SATISFACTION_LEVELS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </FormRow>

                <FormRow label="What worked well">
                  <Textarea value={values.what_worked_well} onChange={set('what_worked_well')} />
                </FormRow>
                <FormRow label="Areas for improvement">
                  <Textarea value={values.areas_for_improvement} onChange={set('areas_for_improvement')} />
                </FormRow>
                <FormRow label="Any recommendations?">
                  <Textarea value={values.recommendations} onChange={set('recommendations')} />
                </FormRow>

                <Button type="submit" disabled={submitting} className="w-full mt-2">
                  {submitting ? 'Submitting…' : 'Submit feedback'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
