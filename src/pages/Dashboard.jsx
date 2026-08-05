import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion, useSpring, useTransform } from 'motion/react';
import { CalendarDays, GraduationCap, MessageSquareText, AlertCircle, FileDown } from 'lucide-react';
import { EventsApi, TrainingsApi, FeedbackApi, ParticipantsApi } from '@/api/supabaseClient';
import { toast } from '@/lib/toast';
import { PageHeader, Spinner, EmptyState } from '@/components/common/Common';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { formatDate } from '@/lib/utils';
import { generateDashboardReport } from '@/lib/pdf';

const FOREST = '#2F6F5E';
const OCHRE = '#C97D3B';
const RUST = '#B85C4A';
const GENDER_COLORS = { Female: '#C97D3B', Male: '#2F6F5E', Other: '#8FB89D', 'Prefer not to say': '#B7B2A0' };

function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

const containerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-panel shadow-card px-3 py-2 text-xs">
      {label && <p className="font-medium text-ink mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} className="text-ink/70 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-medium text-ink">{p.value}{suffix}</span>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [allEvents, setAllEvents] = useState([]);
  const [allTrainings, setAllTrainings] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [ev, tr, fb, pt] = await Promise.all([
          EventsApi.list(),
          TrainingsApi.list(),
          FeedbackApi.list(),
          ParticipantsApi.listAll(),
        ]);
        setAllEvents(ev);
        setAllTrainings(tr);
        setAllFeedback(fb);
        setAllParticipants(pt);
      } catch (err) {
        toast.error(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const inRange = (dateStr) => {
    if (!dateStr) return true;
    if (rangeStart && dateStr < rangeStart) return false;
    if (rangeEnd && dateStr > rangeEnd) return false;
    return true;
  };

  const events = useMemo(() => allEvents.filter((e) => inRange(e.start_date)), [allEvents, rangeStart, rangeEnd]);
  const trainings = useMemo(() => allTrainings.filter((t) => inRange(t.start_date)), [allTrainings, rangeStart, rangeEnd]);
  const feedback = useMemo(() => allFeedback.filter((f) => inRange(f.feedback_date)), [allFeedback, rangeStart, rangeEnd]);
  const participants = useMemo(() => {
    const ids = new Set([...events.map((e) => e.id), ...trainings.map((t) => t.id)]);
    return allParticipants.filter((p) => ids.has(p.related_record));
  }, [allParticipants, events, trainings]);

  const activityPerMonth = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const k = monthKey(e.start_date);
      if (!k) return;
      map[k] = map[k] || { month: k, Events: 0, Trainings: 0 };
      map[k].Events += 1;
    });
    trainings.forEach((t) => {
      const k = monthKey(t.start_date);
      if (!k) return;
      map[k] = map[k] || { month: k, Events: 0, Trainings: 0 };
      map[k].Trainings += 1;
    });
    return Object.values(map).sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [events, trainings]);

  const attendanceData = useMemo(() => {
    return [...events, ...trainings]
      .filter((r) => r.expected_participants || r.actual_participants)
      .slice(0, 10)
      .map((r) => ({
        name: (r.event_name || r.training_title || '').slice(0, 18),
        Expected: r.expected_participants || 0,
        Actual: r.actual_participants || 0,
      }));
  }, [events, trainings]);

  const ratingTrend = useMemo(() => {
    const map = {};
    feedback
      .filter((f) => f.overall_rating)
      .forEach((f) => {
        const k = monthKey(f.feedback_date);
        if (!k) return;
        map[k] = map[k] || { month: k, total: 0, count: 0 };
        map[k].total += f.overall_rating;
        map[k].count += 1;
      });
    return Object.values(map)
      .map((m) => ({ month: m.month, avgRating: +(m.total / m.count).toFixed(1) }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [feedback]);

  const genderSplit = useMemo(() => {
    const map = {};
    participants.forEach((p) => {
      const g = p.gender || 'Unspecified';
      map[g] = (map[g] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [participants]);

  const unresolvedItems = feedback.filter((f) => f.follow_up_required && f.status !== 'Actioned');
  const unresolvedFeedback = unresolvedItems.length;

  const rangeLabel =
    rangeStart || rangeEnd
      ? `${rangeStart ? formatDate(rangeStart) : 'Start'} – ${rangeEnd ? formatDate(rangeEnd) : 'Today'}`
      : 'All time';

  const handleExportReport = () => {
    generateDashboardReport({
      dateRangeLabel: `Period: ${rangeLabel}`,
      stats: [
        { label: 'Events', value: events.length },
        { label: 'Trainings', value: trainings.length },
        { label: 'Feedback logged', value: feedback.length },
        { label: 'Needs follow-up', value: unresolvedFeedback },
        { label: 'Total participants', value: participants.length },
      ],
      activityRows: [
        ...events.map((e) => `Event: ${e.event_name} — ${formatDate(e.start_date)} — ${e.status} — ${e.actual_participants ?? 0}/${e.expected_participants ?? '–'} participants`),
        ...trainings.map((t) => `Training: ${t.training_title} — ${formatDate(t.start_date)} — ${t.status} — ${t.actual_participants ?? 0}/${t.expected_participants ?? '–'} participants`),
      ],
      feedbackSummary: unresolvedItems.map(
        (f) => `${f.related_module} — ${f.respondent_name || 'Anonymous'} (${formatDate(f.feedback_date)}): ${(f.areas_for_improvement || f.what_worked_well || 'No details').slice(0, 120)}`
      ),
    });
    toast.success('Report downloaded');
  };

  if (loading) return <Spinner />;

  return (
    <motion.div variants={containerStagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Dashboard"
          subtitle="Engagement activity at a glance"
          action={
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="text-xs text-ink/50 block mb-1">From</label>
                <Input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="h-9 w-36" />
              </div>
              <div>
                <label className="text-xs text-ink/50 block mb-1">To</label>
                <Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="h-9 w-36" />
              </div>
              {(rangeStart || rangeEnd) && (
                <Button size="sm" variant="ghost" onClick={() => { setRangeStart(''); setRangeEnd(''); }}>
                  Clear
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={handleExportReport}>
                <FileDown size={15} /> Export report
              </Button>
            </div>
          }
        />
      </motion.div>

      {unresolvedItems.length > 0 && (
        <motion.div variants={fadeUp} className="mb-6">
          <Card className="p-4 border-ochre-100 bg-ochre-100/20">
            <p className="text-sm font-medium text-ochre-700 mb-2">
              {unresolvedItems.length} feedback {unresolvedItems.length === 1 ? 'entry needs' : 'entries need'} follow-up
            </p>
            <ul className="space-y-1 text-sm text-ink/70">
              {unresolvedItems.slice(0, 5).map((f) => (
                <li key={f.id}>
                  {f.related_module} · {f.respondent_name || 'Anonymous'} · {formatDate(f.feedback_date)}
                </li>
              ))}
            </ul>
            {unresolvedItems.length > 5 && (
              <p className="text-xs text-ink/40 mt-1">+ {unresolvedItems.length - 5} more — see Feedback page</p>
            )}
          </Card>
        </motion.div>
      )}

      <motion.div variants={containerStagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <motion.div variants={fadeUp}>
          <StatCard icon={CalendarDays} label="Events" value={events.length} tint="forest" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={GraduationCap} label="Trainings" value={trainings.length} tint="ochre" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={MessageSquareText} label="Feedback logged" value={feedback.length} tint="forest" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            icon={AlertCircle}
            label="Needs follow-up"
            value={unresolvedFeedback}
            tint={unresolvedFeedback > 0 ? 'rust' : 'forest'}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={containerStagger} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <h3 className="font-display text-sm font-semibold mb-4 tracking-[-0.005em]">Activity per month</h3>
            {activityPerMonth.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={activityPerMonth}>
                  <defs>
                    <linearGradient id="gradForest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={FOREST} stopOpacity={1} />
                      <stop offset="100%" stopColor={FOREST} stopOpacity={0.75} />
                    </linearGradient>
                    <linearGradient id="gradOchre" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={OCHRE} stopOpacity={1} />
                      <stop offset="100%" stopColor={OCHRE} stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#1B242099' }} axisLine={{ stroke: '#E4E1D6' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#1B242099' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#2F6F5E0d' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Events" fill="url(#gradForest)" radius={[4, 4, 0, 0]} animationDuration={600} />
                  <Bar dataKey="Trainings" fill="url(#gradOchre)" radius={[4, 4, 0, 0]} animationDuration={600} animationBegin={100} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <h3 className="font-display text-sm font-semibold mb-4 tracking-[-0.005em]">Attendance: expected vs. actual</h3>
            {attendanceData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={attendanceData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D6" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#1B242099' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#1B242099' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#2F6F5E0d' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Expected" fill="#E4E1D6" radius={[0, 4, 4, 0]} animationDuration={600} />
                  <Bar dataKey="Actual" fill={FOREST} radius={[0, 4, 4, 0]} animationDuration={600} animationBegin={100} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <h3 className="font-display text-sm font-semibold mb-4 tracking-[-0.005em]">Average feedback rating trend</h3>
            {ratingTrend.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={ratingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#1B242099' }} axisLine={{ stroke: '#E4E1D6' }} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#1B242099' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip suffix=" / 5" />} cursor={{ stroke: '#B85C4A44' }} />
                  <Line
                    type="monotone"
                    dataKey="avgRating"
                    stroke={RUST}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: RUST, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    animationDuration={700}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <h3 className="font-display text-sm font-semibold mb-4 tracking-[-0.005em]">Participant gender split</h3>
            {genderSplit.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={genderSplit}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    animationDuration={700}
                  >
                    {genderSplit.map((entry) => (
                      <Cell key={entry.name} fill={GENDER_COLORS[entry.name] || '#B7B2A0'} stroke="#F6F5F0" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[240px] flex items-center justify-center">
      <p className="text-sm text-ink/40">Not enough data yet</p>
    </div>
  );
}

const TINTS = {
  forest: 'bg-forest-50 text-forest-700',
  ochre: 'bg-ochre-100 text-ochre-600',
  rust: 'bg-rust-100 text-rust-600',
};

function AnimatedNumber({ value }) {
  const spring = useSpring(0, { stiffness: 120, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [text, setText] = useState(0);

  useEffect(() => {
    spring.set(value);
    const unsub = display.on('change', (v) => setText(v));
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{text}</>;
}

function StatCard({ icon: Icon, label, value, tint = 'forest' }) {
  return (
    <Card interactive className="p-4 flex items-center gap-3">
      <div className={`rounded-md p-2 ${TINTS[tint]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="font-display text-xl font-semibold text-ink tracking-[-0.01em]">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-xs text-ink/50">{label}</p>
      </div>
    </Card>
  );
}
