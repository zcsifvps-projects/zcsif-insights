import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Link2, Check, QrCode, Download as DownloadIcon } from 'lucide-react';
import { EventsApi } from '@/api/supabaseClient';
import { toast } from '@/lib/toast';
import { Spinner } from '@/components/common/Common';
import { Card, StatusBadge } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import EventForm from '@/components/events/EventForm';
import ParticipantsPanel from '@/components/participants/ParticipantsPanel';
import FeedbackPanel from '@/components/feedback/FeedbackPanel';
import { formatDate } from '@/lib/utils';
import { qrCodeUrl } from '@/lib/qr';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const feedbackUrl = `${window.location.origin}/give-feedback/events/${id}`;

  const copyFeedbackLink = () => {
    navigator.clipboard.writeText(feedbackUrl);
    setLinkCopied(true);
    toast.success('Feedback link copied');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const load = async () => {
    setLoading(true);
    try {
      setEvent(await EventsApi.get(id));
    } catch (err) {
      toast.error(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (payload) => {
    try {
      await EventsApi.update(id, payload);
      toast.success('Event updated');
      setEditOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save event');
    }
  };

  if (loading) return <Spinner />;
  if (!event) return null;

  return (
    <div>
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink mb-4"
      >
        <ArrowLeft size={15} /> Back to events
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-semibold text-ink">{event.event_name}</h1>
            <StatusBadge status={event.status} />
          </div>
          <p className="text-sm text-ink/60">
            {event.event_type} · {formatDate(event.start_date)}
            {event.end_date ? ` – ${formatDate(event.end_date)}` : ''}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Pencil size={15} /> Edit
        </Button>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Button size="sm" variant="secondary" onClick={() => setQrOpen(true)}>
          <QrCode size={15} /> QR code
        </Button>
        <Button size="sm" variant="secondary" onClick={copyFeedbackLink}>
          {linkCopied ? <Check size={15} /> : <Link2 size={15} />}
          {linkCopied ? 'Link copied' : 'Copy feedback link'}
        </Button>
      </div>

      <Tabs
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'participants', label: 'Participants' },
          { value: 'feedback', label: 'Feedback' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="pt-5">
        {tab === 'overview' && (
          <Card className="p-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <Field label="Organizer" value={event.organizer} />
            <Field label="Partner organization" value={event.partner_organization} />
            <Field label="Venue type" value={event.venue_type} />
            <Field label="Location" value={event.location} />
            <Field label="Target audience" value={event.target_audience} />
            <Field label="Lead person" value={event.lead_person} />
            <Field
              label="Participants (actual / expected)"
              value={`${event.actual_participants ?? '–'} / ${event.expected_participants ?? '–'}`}
            />
            <Field label="Budget" value={event.budget ? `ZMW ${event.budget.toLocaleString()}` : '—'} />
            <Field label="Objectives" value={event.objectives} full />
            <Field label="Key outcomes" value={event.key_outcomes} full />
            <Field label="Notes" value={event.notes} full />
          </Card>
        )}
        {tab === 'participants' && <ParticipantsPanel relatedModule="Events" relatedRecord={id} />}
        {tab === 'feedback' && <FeedbackPanel relatedModule="Events" relatedRecord={id} />}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit event" wide>
        <EventForm initial={event} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} />
      </Modal>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Feedback QR code">
        <div className="flex flex-col items-center gap-4 py-2">
          <img src={qrCodeUrl(feedbackUrl)} alt="Feedback link QR code" className="rounded-md border border-line" width={240} height={240} />
          <p className="text-xs text-ink/50 text-center max-w-xs">
            Print or display this at the event venue so attendees can scan and leave feedback.
          </p>
          <a href={qrCodeUrl(feedbackUrl, 480)} download={`feedback-qr-${event.event_name}.png`}>
            <Button size="sm" variant="secondary">
              <DownloadIcon size={15} /> Download image
            </Button>
          </a>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, value, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-xs uppercase tracking-wide text-ink/40 mb-0.5">{label}</p>
      <p className="text-ink whitespace-pre-wrap">{value || '—'}</p>
    </div>
  );
}
