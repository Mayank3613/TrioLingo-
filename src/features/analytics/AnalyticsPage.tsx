import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useUserStore } from '../../stores/userStore';
import { useStudyStore } from '../../stores/studyStore';
import { useFSRSStore } from '../../stores/fsrsStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Clock,
  BookOpen,
  Flame,
  Trophy,
  Target,
  Award,
  TrendingUp,
} from 'lucide-react';

/* ───── Time-range type ───── */
type TimeRange = '7d' | '30d' | '90d' | 'All';

/* ───── Stagger animation helpers ───── */
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay, type: 'spring' as const, stiffness: 260, damping: 22 },
});

/* ───── Mock data generators (stable via useMemo) ───── */
function useXPData() {
  return useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        day: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', {
          month: 'short',
          day: 'numeric',
        }),
        xp: Math.floor(Math.random() * 150 + 30),
      })),
    []
  );
}

const CATEGORY_COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b'];
const CATEGORY_DATA = [
  { name: 'Vocabulary', value: 42 },
  { name: 'Kanji', value: 25 },
  { name: 'Grammar', value: 20 },
  { name: 'Reading', value: 13 },
];

const JLPT_PROGRESS = [
  { level: 'N5', pct: 78, gradient: 'var(--gradient-success)' },
  { level: 'N4', pct: 45, gradient: 'var(--gradient-primary)' },
  { level: 'N3', pct: 20, gradient: 'var(--gradient-primary)' },
  { level: 'N2', pct: 5, gradient: 'var(--gradient-xp)' },
  { level: 'N1', pct: 0, gradient: 'var(--gradient-xp)' },
];

function useHeatmapData() {
  return useMemo(() => {
    const weeks = 16;
    const data: number[][] = [];
    for (let w = 0; w < weeks; w++) {
      const week: number[] = [];
      for (let d = 0; d < 7; d++) {
        // give a bias towards study on weekdays, lighter on weekends
        const r = Math.random();
        if (r < 0.25) week.push(0);
        else if (r < 0.5) week.push(1);
        else if (r < 0.72) week.push(2);
        else if (r < 0.9) week.push(3);
        else week.push(4);
      }
      data.push(week);
    }
    return data;
  }, []);
}

const MILESTONES = [
  { icon: '🏆', title: '100 Words Mastered', desc: 'Vocabulary milestone reached', date: '2 days ago', variant: 'success' as const },
  { icon: '🔥', title: '7-Day Streak', desc: 'Studied every day for a week', date: '4 days ago', variant: 'warning' as const },
  { icon: '✍️', title: '50 Kanji Learned', desc: 'Halfway to N5 kanji mastery', date: '1 week ago', variant: 'primary' as const },
  { icon: '📖', title: 'Grammar Level Up', desc: 'Completed all N5 grammar points', date: '2 weeks ago', variant: 'primary' as const },
  { icon: '⭐', title: 'First Perfect Quiz', desc: 'Scored 100% on a vocabulary quiz', date: '3 weeks ago', variant: 'xp' as const },
];

/* ───── Stat Card ───── */
function StatCard({
  icon,
  label,
  value,
  subValue,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div {...fadeUp(delay)}>
      <Card hover padding="md">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: gradient }}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[11px] font-medium uppercase tracking-wider truncate"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {label}
            </div>
            <div
              className="text-xl font-bold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {value}
            </div>
            {subValue && (
              <div
                className="text-[10px] font-medium truncate"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {subValue}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ───── Custom Recharts Tooltip ───── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs font-semibold"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ color: 'var(--text-tertiary)' }}>{label}</div>
      <div className="mt-0.5">{payload[0].value} XP</div>
    </div>
  );
}

/* ───── Heatmap intensity helpers ───── */
const HEATMAP_OPACITY = [0.06, 0.25, 0.45, 0.7, 1];
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

/* ══════════════════════════════════════════════════════
   ANALYTICS PAGE
   ══════════════════════════════════════════════════════ */
export function AnalyticsPage() {
  const { profile } = useUserStore();
  useStudyStore();
  useFSRSStore();

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const xpData = useXPData();
  const heatmapData = useHeatmapData();

  // Format total study time
  const hours = Math.floor(profile.totalStudyMinutes / 60);
  const mins = profile.totalStudyMinutes % 60;
  const studyTimeFormatted = `${hours}h ${mins}m`;

  // Filter XP data based on time range
  const filteredXP = useMemo(() => {
    const rangeMap: Record<TimeRange, number> = { '7d': 7, '30d': 30, '90d': 90, All: 30 };
    return xpData.slice(-rangeMap[timeRange]);
  }, [xpData, timeRange]);

  const totalXPInRange = filteredXP.reduce((s, d) => s + d.xp, 0);

  const ranges: TimeRange[] = ['7d', '30d', '90d', 'All'];

  return (
    <div className="p-6 overflow-y-auto h-full pb-20 space-y-6">
      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Study Analytics
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-japanese)' }}
          >
            学習分析
          </p>
        </div>

        <div className="flex gap-1.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: timeRange === r ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: timeRange === r ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Clock size={20} className="text-blue-500" />}
          label="Total Study Time"
          value={studyTimeFormatted}
          gradient="linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.08))"
          delay={0.08}
        />
        <StatCard
          icon={<BookOpen size={20} className="text-emerald-500" />}
          label="Words Mastered"
          value={profile.vocabularyMastered}
          gradient="linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))"
          delay={0.14}
        />
        <StatCard
          icon={<Target size={20} className="text-purple-500" />}
          label="Kanji Learned"
          value={profile.kanjiMastered}
          gradient="linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.08))"
          delay={0.2}
        />
        <StatCard
          icon={<Flame size={20} className="text-orange-500" />}
          label="Current Streak"
          value={`${profile.currentStreak} days`}
          subValue={`Longest: ${profile.longestStreak} days`}
          gradient="linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.08))"
          delay={0.26}
        />
      </div>

      {/* ── XP Progress Chart ── */}
      <motion.div {...fadeUp(0.3)}>
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                XP Progress
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                XP earned over time
              </p>
            </div>
            <Badge variant="xp" size="md">
              <TrendingUp size={12} />
              {totalXPInRange.toLocaleString()} XP
            </Badge>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={filteredXP} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="xpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" strokeOpacity={0.5} />
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="var(--accent-primary)"
                strokeWidth={2.5}
                fill="url(#xpAreaGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: 'var(--accent-primary)',
                  stroke: 'var(--bg-card)',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* ── Two-column: Category Breakdown + JLPT Progress ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <motion.div {...fadeUp(0.38)}>
          <Card padding="lg">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Category Breakdown
            </h2>
            <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--text-tertiary)' }}>
              学習カテゴリー
            </p>

            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {CATEGORY_DATA.map((_, idx) => (
                      <Cell key={idx} fill={CATEGORY_COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Share']}
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {CATEGORY_DATA.map((cat, idx) => (
                <div key={cat.name} className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: CATEGORY_COLORS[idx] }}
                  />
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {cat.name}
                  </span>
                  <span
                    className="text-xs font-bold ml-auto flex-shrink-0"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {cat.value}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* JLPT Progress */}
        <motion.div {...fadeUp(0.42)}>
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  JLPT Progress
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  日本語能力試験
                </p>
              </div>
              <Badge variant="primary" size="sm">
                {profile.currentJLPTLevel}
              </Badge>
            </div>

            <div className="space-y-4">
              {JLPT_PROGRESS.map((jp, i) => (
                <motion.div
                  key={jp.level}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-sm font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {jp.level}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: jp.pct > 0 ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}
                    >
                      {jp.pct}%
                    </span>
                  </div>
                  <ProgressBar
                    value={jp.pct}
                    max={100}
                    size="md"
                    gradient={jp.gradient}
                  />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Study Activity Heatmap ── */}
      <motion.div {...fadeUp(0.5)}>
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Study Activity
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                学習活動 · Last 16 weeks
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Less
              </span>
              {HEATMAP_OPACITY.map((op, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: 'var(--accent-primary)',
                    opacity: op,
                  }}
                />
              ))}
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                More
              </span>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-1 flex-shrink-0">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="w-6 h-3 flex items-center justify-end"
                  style={{ color: 'var(--text-tertiary)', fontSize: '9px', fontWeight: 500 }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid cells */}
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((intensity, di) => (
                  <motion.div
                    key={di}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      background: 'var(--accent-primary)',
                      opacity: HEATMAP_OPACITY[intensity],
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.55 + wi * 0.02 + di * 0.005 }}
                  />
                ))}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Recent Milestones ── */}
      <motion.div {...fadeUp(0.6)}>
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Recent Milestones
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                最近の達成
              </p>
            </div>
            <Trophy size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          <div className="space-y-3">
            {MILESTONES.map((ms, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + i * 0.06 }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl transition-colors duration-150"
                style={{
                  borderBottom: i < MILESTONES.length - 1 ? '1px solid var(--border-primary)' : 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  {ms.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {ms.title}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {ms.desc}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={ms.variant} size="sm">
                    <Award size={10} />
                    Earned
                  </Badge>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {ms.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
