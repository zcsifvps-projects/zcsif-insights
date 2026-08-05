import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Download, Upload, Award, AlertTriangle } from 'lucide-react';
import { ParticipantsApi } from '@/api/supabaseClient';
import { toast } from '@/lib/toast';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea, FormRow } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import { EmptyState, Spinner } from '@/components/common/Common';
import { GENDERS, ATTENDANCE_STATUSES } from '@/lib/constants';
import { toCSV, downloadCSV, parseParticipantsCSV } from '@/lib/csv';
import { generateCertificate } from '@/lib/pdf';

const BLANK = {
  full_name: '',
  organization: '',
  designation: '',
  gender: '',
  contact_email: '',
  contact_number: '',
  attendance_status: 'Registered',
};

const EXPORT_COLUMNS = [
  { key: 'full_name', label: 'Full name' },
  { key: 'organization', label: 'Organization' },
  { key: 'designation', label: 'Designation' },
  { key: 'gender', label: 'Gender' },
  { key: 'contact_email', label: 'Email' },
  { key: 'contact_number', label: 'Phone' },
  { key: 'attendance_status', label: 'Attendance status' },
];

// `recordTitle`/`recordDateRange`/`certificatesEnabled` are only used for the
// Trainings context, to generate a certificate per attended participant.
export default function ParticipantsPanel({
  relatedModule,
  relatedRecord,
  recordTitle,
  recordDateRange,
  certificatesEnabled,
}) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setParticipants(await ParticipantsApi.listFor(relatedModule, relatedRecord));
    } catch (err) {
      toast.error(err.message || 'Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedRecord]);

  const existingNames = useMemo(
    () => new Set(participants.map((p) => p.full_name.trim().toLowerCase())),
    [participants]
  );

  const set = (key) => (e) => {
    const val = e.target.value;
    setValues((v) => ({ ...v, [key]: val }));
    if (key === 'full_name') {
      setDuplicateWarning(existingNames.has(val.trim().toLowerCase()) ? val.trim() : null);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ParticipantsApi.create({ ...values, related_module: relatedModule, related_record: relatedRecord });
      toast.success('Participant added');
      setFormOpen(false);
      setValues(BLANK);
      setDuplicateWarning(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to add participant');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Remove ${p.full_name} from the attendance list?`)) return;
    try {
      await ParticipantsApi.remove(p.id);
      toast.success('Participant removed');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to remove participant');
    }
  };

  const updateStatus = async (p, status) => {
    try {
      await ParticipantsApi.update(p.id, { attendance_status: status });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleExport = () => {
    if (participants.length === 0) {
      toast.error('No participants to export');
      return;
    }
    downloadCSV(`participants-${relatedRecord}`, toCSV(participants, EXPORT_COLUMNS));
    toast.success('Participants exported');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result || ''));
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const rows = parseParticipantsCSV(importText);
    if (rows.length === 0) {
      toast.error('No valid rows found. Make sure there is at least a Full Name column.');
      return;
    }
    setImporting(true);
    let added = 0;
    let skipped = 0;
    try {
      for (const row of rows) {
        const nameKey = row.full_name.trim().toLowerCase();
        if (existingNames.has(nameKey)) {
          skipped += 1;
          continue;
        }
        await ParticipantsApi.create({
          full_name: row.full_name,
          organization: row.organization || null,
          designation: row.designation || null,
          gender: GENDERS.includes(row.gender) ? row.gender : null,
          contact_email: row.contact_email || null,
          contact_number: row.contact_number || null,
          attendance_status: ATTENDANCE_STATUSES.includes(row.attendance_status)
            ? row.attendance_status
            : 'Registered',
          related_module: relatedModule,
          related_record: relatedRecord,
        });
        existingNames.add(nameKey);
        added += 1;
      }
      toast.success(`Imported ${added} participant${added === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}` : ''}`);
      setImportOpen(false);
      setImportText('');
      load();
    } catch (err) {
      toast.error(err.message || 'Import failed partway through');
      load();
    } finally {
      setImporting(false);
    }
  };

  const handleCertificate = (p) => {
    generateCertificate({
      participantName: p.full_name,
      trainingTitle: recordTitle || 'Training',
      dateRange: recordDateRange || '',
      facilitator: '',
    });
  };

  if (loading) return <Spinner label="Loading participants…" />;

  return (
    <div>
      <div className="flex justify-end gap-2 mb-3">
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <Download size={15} /> Export CSV
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setImportOpen(true)}>
          <Upload size={15} /> Import CSV
        </Button>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus size={15} /> Add participant
        </Button>
      </div>

      {participants.length === 0 ? (
        <EmptyState title="No participants recorded yet" description="Add attendees as they register or attend, or import a list." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Organization</th>
                <th className="px-4 py-2.5 font-medium">Gender</th>
                <th className="px-4 py-2.5 font-medium">Attendance</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-ink">{p.full_name}</p>
                    <p className="text-xs text-ink/50">{p.designation || '—'}</p>
                  </td>
                  <td className="px-4 py-2.5 text-ink/70">{p.organization || '—'}</td>
                  <td className="px-4 py-2.5 text-ink/70">{p.gender || '—'}</td>
                  <td className="px-4 py-2.5">
                    <Select
                      value={p.attendance_status}
                      onChange={(e) => updateStatus(p, e.target.value)}
                      className="h-8 text-xs w-36"
                    >
                      {ATTENDANCE_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1">
                      {certificatesEnabled && p.attendance_status === 'Attended' && (
                        <button
                          onClick={() => handleCertificate(p)}
                          className="rounded-md p-1.5 text-ink/50 hover:bg-forest-50 hover:text-forest-700"
                          title="Generate certificate"
                        >
                          <Award size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-md p-1.5 text-ink/50 hover:bg-rust-100 hover:text-rust-600"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setDuplicateWarning(null); }}
        title="Add participant"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <FormRow label="Full name" required>
            <Input required value={values.full_name} onChange={set('full_name')} />
          </FormRow>
          {duplicateWarning && (
            <div className="flex items-start gap-2 rounded-md bg-ochre-100/50 border border-ochre-100 px-3 py-2 text-xs text-ochre-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>&ldquo;{duplicateWarning}&rdquo; is already on this attendance list. You can still add them if this is a different person.</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Organization">
              <Input value={values.organization} onChange={set('organization')} />
            </FormRow>
            <FormRow label="Designation">
              <Input value={values.designation} onChange={set('designation')} />
            </FormRow>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Gender">
              <Select value={values.gender} onChange={set('gender')}>
                <option value="">Select…</option>
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </FormRow>
            <FormRow label="Attendance status">
              <Select value={values.attendance_status} onChange={set('attendance_status')}>
                {ATTENDANCE_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </FormRow>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Email">
              <Input type="email" value={values.contact_email} onChange={set('contact_email')} />
            </FormRow>
            <FormRow label="Phone">
              <Input value={values.contact_number} onChange={set('contact_number')} />
            </FormRow>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setFormOpen(false); setDuplicateWarning(null); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Adding…' : 'Add participant'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import participants" wide>
        <div className="space-y-4">
          <p className="text-sm text-ink/60">
            Upload a CSV file or paste rows below. Recognized columns: Full Name, Organization, Designation,
            Gender, Email, Phone, Attendance Status. If there's no header row, columns are read in that order.
            Duplicate names already on this list are skipped automatically.
          </p>
          <FormRow label="CSV file">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-ink/70 file:mr-3 file:rounded-md file:border-0 file:bg-forest-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-forest-700 hover:file:bg-forest-100"
            />
          </FormRow>
          <FormRow label="Or paste CSV text">
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={'Full Name,Organization,Gender\nJane Mwansa,ZCSIF,Female'}
              className="min-h-[160px] font-mono text-xs"
            />
          </FormRow>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleImport} disabled={importing || !importText.trim()}>
              {importing ? 'Importing…' : 'Import'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
