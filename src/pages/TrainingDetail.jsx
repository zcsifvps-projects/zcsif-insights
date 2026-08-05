import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, BadgeCheck, Link2, Check, QrCode, Download as DownloadIcon } from 'lucide-react';
import { TrainingsApi } from '@/api/supabaseClient';
import { toast } from '@/lib/toast';
import { Spinner } from '@/components/common/Common';
import { Card, StatusBadge } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import TrainingForm from '@/components/trainings/TrainingForm';
import ParticipantsPanel from '@/components/participants/ParticipantsPanel';
import FeedbackPanel from '@/components/feedback/FeedbackPanel';
import { formatDate } from '@/lib/utils';
import { qrCodeUrl } from '@/lib/qr';

export default function TrainingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const feedbackUrl = `${window.location.origin}/give-feedback/trainings/${id}`;

  const copyFeedbackLink = () => {
    navigator.clipboard.writeText(feedbackUrl);
    setLinkCopied(true);
    toast.success('Feedback link copied');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const load = async () => {
    setLoading(true);
    try {
      setTraining(await TrainingsApi.get(id));
    } catch (err) {
      toast.error(err.message || 'Failed to load training');
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
      await TrainingsApi.update(id, payload);
      toast.success('Training updated');
      setEditOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save training');
    }
  };

  if (loading) return <Spinner />;
  if (!training) return null;

  return (
    <div>
      <button
        onClick={() => navigate('/trainings')}
        className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink mb-4"
      >
        <ArrowLeft size={15} /> Back to trainings
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-semibold text-ink">{training.training_title}</h1>
            <StatusBadge status={training.status} />
            {training.certification_provided && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-forest-700">
                <BadgeCheck size={14} /> Certified
              </span>
            )}
          </div>
          <p className="text-sm text-ink/60">
            {training.training_type} · {formatDate(training.start_date)}
            {training.end_date ? ` – ${formatDate(training.end_date)}` : ''}
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
            <Field label="Facilitator" value={training.facilitator} />
            <Field label="Partner organization" value={training.partner_organization} />
            <Field label="Delivery mode" value={training.delivery_mode} />
            <Field label="Location" value={training.location} />
            <Field label="Target group" value={training.target_group} />
            <Field label="Lead person" value={training.lead_person} />
            <Field
              label="Participants (actual / expected)"
              value={`${training.actual_participants ?? '–'} / ${training.expected_participants ?? '–'}`}
            />
            <Field
              label="Gender split (M / F)"
              value={`${training.male_participants ?? '–'} / ${training.female_participants ?? '–'}`}
            />
            <Field label="Budget" value={training.budget ? `ZMW ${training.budget.toLocaleString()}` : '—'} />
            <Field label="Certification provided" value={training.certification_provided ? 'Yes' : 'No'} />
            <Field label="Learning objectives" value={training.learning_objectives} full />
            <Field label="Key outcomes" value={training.key_outcomes} full />
            <Field label="Notes" value={training.notes} full />
          </Card>
        )}
        {tab === 'participants' && (
          <ParticipantsPanel
            relatedModule="Trainings"
            relatedRecord={id}
            recordTitle={training.training_title}
            recordDateRange={`${formatDate(training.start_date)}${training.end_date ? ` – ${formatDate(training.end_date)}` : ''}`}
            certificatesEnabled={training.certification_provided}
          />
        )}
        {tab === 'feedback' && <FeedbackPanel relatedModule="Trainings" relatedRecord={id} />}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit training" wide>
        <TrainingForm initial={training} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} />
      </Modal>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Feedback QR code">
        <div className="flex flex-col items-center gap-4 py-2">
          <img src={qrCodeUrl(feedbackUrl)} alt="Feedback link QR code" className="rounded-md border border-line" width={240} height={240} />
          <p className="text-xs text-ink/50 text-center max-w-xs">
            Print or display this at the training venue so participants can scan and leave feedback.
          </p>
          <a href={qrCodeUrl(feedbackUrl, 480)} download={`feedback-qr-${training.training_title}.png`}>
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
