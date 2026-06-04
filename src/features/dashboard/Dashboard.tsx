import React from 'react';
import { motion } from 'motion/react';
import { useUserStore, getLevelTitle } from '../../stores/userStore';
import { useStudyStore } from '../../stores/studyStore';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import {
  Flame,
  Star,
  Clock,
  BookOpen,
  Play,
  Layers,
  Zap,
  PenTool,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

/* ──────────── Animated XP Ring ──────────── */
function XPRing({ current, max, level }: { current: number; max: number; level: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(current / max, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        {/* track */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
        {/* progress */}
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#xpGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      {/* center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-gradient-primary">{level}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          Level
        </span>
      </div>
    </div>
  );
}

/* ──────────── Stat Card ──────────── */
function StatCard({
  icon,
  label,
  value,
  suffix,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  gradient?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Card hover padding="md">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: gradient || 'var(--bg-tertiary)' }}
          >
            {icon}
          </div>
          <div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {label}
            </div>
            <div className="text-xl font-bold flex items-baseline gap-1" style={{ color: 'var(--text-primary)' }}>
              {value}
              {suffix && (
                <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  {suffix}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ──────────── Quick-Action Card ──────────── */
function ActionCard({
  icon,
  title,
  subtitle,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="rounded-2xl p-5 text-left text-white cursor-pointer w-full"
      style={{ background: gradient, boxShadow: 'var(--shadow-lg)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white/20">
        {icon}
      </div>
      <div className="text-sm font-bold">{title}</div>
      <div className="text-xs opacity-80 mt-0.5">{subtitle}</div>
    </motion.button>
  );
}

/* ──────────── Time-ago helper ──────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ──────────── RADAR DATA ──────────── */
const RADAR_DATA = [
  { skill: 'Vocabulary', value: 65, fullMark: 100 },
  { skill: 'Kanji', value: 45, fullMark: 100 },
  { skill: 'Grammar', value: 70, fullMark: 100 },
  { skill: 'Reading', value: 55, fullMark: 100 },
  { skill: 'Listening', value: 40, fullMark: 100 },
  { skill: 'Speaking', value: 30, fullMark: 100 },
];

/* ──────────── DASHBOARD ──────────── */
export default function Dashboard() {
  const { profile } = useUserStore();
  const { dailyGoals, recentActivity, reviewsDue, lessonsAvailable } = useStudyStore();

  const completedGoals = dailyGoals.filter((g) => g.current >= g.target).length;
  const dailyPct = dailyGoals.length > 0 ? Math.round((completedGoals / dailyGoals.length) * 100) : 0;

  return (
    <div className="p-6 overflow-y-auto h-full pb-20 space-y-6">
      {/* ── Hero Welcome ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl p-6 flex items-center gap-6"
        style={{
          background: 'var(--gradient-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <XPRing current={profile.currentXP} max={profile.xpToNextLevel} level={profile.currentLevel} />

        <div className="text-white">
          <motion.h1
            className="text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome back, {profile.displayName}!
          </motion.h1>
          <motion.p
            className="text-white/70 text-sm mt-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            おかえりなさい · {getLevelTitle(profile.currentLevel)}
          </motion.p>

          <motion.div
            className="mt-3 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <Star size={14} />
              <span className="text-xs font-semibold">{profile.currentXP} / {profile.xpToNextLevel} XP</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <TrendingUp size={14} />
              <span className="text-xs font-semibold">{profile.totalXP} Total XP</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Flame size={20} className="text-orange-400" />}
          label="Study Streak"
          value={profile.currentStreak}
          suffix="days"
          delay={0.15}
        />
        <StatCard
          icon={<Sparkles size={20} className="text-yellow-400" />}
          label="XP Today"
          value={profile.currentXP}
          gradient="linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))"
          delay={0.2}
        />
        <StatCard
          icon={<Clock size={20} className="text-blue-400" />}
          label="Reviews Due"
          value={reviewsDue}
          delay={0.25}
        />
        <StatCard
          icon={<BookOpen size={20} className="text-emerald-400" />}
          label="Lessons Available"
          value={lessonsAvailable}
          delay={0.3}
        />
      </div>

      {/* ── Two-Column: Daily Goals + Radar Chart ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Daily Goals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Daily Goals
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  今日の目標
                </p>
              </div>
              <Badge variant={dailyPct === 100 ? 'success' : 'primary'} size="md">
                {dailyPct}%
              </Badge>
            </div>

            <div className="space-y-3">
              {dailyGoals.map((goal, i) => {
                const done = goal.current >= goal.target;
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{
                        background: done ? 'var(--gradient-success)' : 'var(--bg-tertiary)',
                      }}
                    >
                      {done ? <CheckCircle2 size={16} className="text-white" /> : goal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                            textDecoration: done ? 'line-through' : 'none',
                          }}
                        >
                          {goal.title}
                        </span>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <ProgressBar
                        value={goal.current}
                        max={goal.target}
                        size="sm"
                        gradient={done ? 'var(--gradient-success)' : 'var(--gradient-primary)'}
                        className="mt-1"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* JLPT Radar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card padding="lg">
            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              JLPT {profile.currentJLPTLevel} Readiness
            </h2>
            <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
              スキル分析
            </p>

            <ResponsiveContainer width="100%" height={220}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                <PolarGrid stroke="var(--border-primary)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <motion.h2
          className="text-base font-bold mb-3"
          style={{ color: 'var(--text-primary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Quick Actions
        </motion.h2>
        <div className="grid grid-cols-4 gap-4">
          <ActionCard
            icon={<Play size={20} />}
            title="Continue Lesson"
            subtitle="JLPT N5 · Verbs"
            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
            delay={0.55}
          />
          <ActionCard
            icon={<Layers size={20} />}
            title="Review Flashcards"
            subtitle={`${reviewsDue} cards due`}
            gradient="linear-gradient(135deg, #ec4899, #f472b6)"
            delay={0.6}
          />
          <ActionCard
            icon={<Zap size={20} />}
            title="Take a Quiz"
            subtitle="5 min quick quiz"
            gradient="linear-gradient(135deg, #22c55e, #4ade80)"
            delay={0.65}
          />
          <ActionCard
            icon={<PenTool size={20} />}
            title="Practice Kanji"
            subtitle="Stroke order drill"
            gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
            delay={0.7}
          />
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <Card padding="lg">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.slice(0, 6).map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className="flex items-center gap-3 py-2 border-b last:border-b-0"
                style={{ borderColor: 'var(--border-secondary)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {act.title}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {act.description}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {act.xpEarned > 0 && <Badge variant="xp">+{act.xpEarned} XP</Badge>}
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {timeAgo(act.timestamp)}
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
