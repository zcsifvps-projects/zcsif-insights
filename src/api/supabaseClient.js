import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing Supabase env vars. Copy .env.local.example to .env.local and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Thin data-access layer. Every page talks to these functions rather than
// calling `supabase.from(...)` directly, so the entity shape stays in one
// place per table (mirrors the entity-based pattern from the reference app).
// ---------------------------------------------------------------------------

const handle = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export const EventsApi = {
  list: () =>
    supabase.from('events').select('*').order('start_date', { ascending: false }).then(handle),
  get: (id) => supabase.from('events').select('*').eq('id', id).single().then(handle),
  create: (payload) => supabase.from('events').insert(payload).select().single().then(handle),
  update: (id, payload) =>
    supabase.from('events').update(payload).eq('id', id).select().single().then(handle),
  remove: (id) => supabase.from('events').delete().eq('id', id).then(handle),
};

export const TrainingsApi = {
  list: () =>
    supabase.from('trainings').select('*').order('start_date', { ascending: false }).then(handle),
  get: (id) => supabase.from('trainings').select('*').eq('id', id).single().then(handle),
  create: (payload) => supabase.from('trainings').insert(payload).select().single().then(handle),
  update: (id, payload) =>
    supabase.from('trainings').update(payload).eq('id', id).select().single().then(handle),
  remove: (id) => supabase.from('trainings').delete().eq('id', id).then(handle),
};

export const ParticipantsApi = {
  listAll: () => supabase.from('participants').select('*').then(handle),
  listFor: (relatedModule, relatedRecord) =>
    supabase
      .from('participants')
      .select('*')
      .eq('related_module', relatedModule)
      .eq('related_record', relatedRecord)
      .order('full_name')
      .then(handle),
  create: (payload) =>
    supabase.from('participants').insert(payload).select().single().then(handle),
  update: (id, payload) =>
    supabase.from('participants').update(payload).eq('id', id).select().single().then(handle),
  remove: (id) => supabase.from('participants').delete().eq('id', id).then(handle),
};

export const FeedbackApi = {
  list: () =>
    supabase.from('feedback').select('*').order('feedback_date', { ascending: false }).then(handle),
  listFor: (relatedModule, relatedRecord) =>
    supabase
      .from('feedback')
      .select('*')
      .eq('related_module', relatedModule)
      .eq('related_record', relatedRecord)
      .order('feedback_date', { ascending: false })
      .then(handle),
  create: (payload) => supabase.from('feedback').insert(payload).select().single().then(handle),
  update: (id, payload) =>
    supabase.from('feedback').update(payload).eq('id', id).select().single().then(handle),
  remove: (id) => supabase.from('feedback').delete().eq('id', id).then(handle),
};

// ---------------------------------------------------------------------------
// Public (no-login) feedback link. Used by the /give-feedback/:module/:id
// page — only ever reads the record's name/date (RLS: anon read-only) and
// inserts a single feedback row (RLS: anon insert-only, forced to
// status=New / follow_up_required=false / created_by=null).
// ---------------------------------------------------------------------------
export const PublicFeedbackApi = {
  getRecord: (relatedModule, id) =>
    supabase
      .from(relatedModule === 'Trainings' ? 'trainings' : 'events')
      .select(relatedModule === 'Trainings' ? 'id, training_title, start_date' : 'id, event_name, start_date')
      .eq('id', id)
      .single()
      .then(handle),
  submit: (relatedModule, relatedRecord, payload) =>
    supabase
      .from('feedback')
      .insert({
        ...payload,
        related_module: relatedModule,
        related_record: relatedRecord,
        status: 'New',
        follow_up_required: false,
      })
      .then(({ error }) => {
        if (error) throw error;
      }),
};
