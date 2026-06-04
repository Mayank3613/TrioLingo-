import React from 'react';
import { motion } from 'motion/react';
import { useUserStore } from '../../stores/userStore';
import {
  Trophy,
  Lock,
  Star,
  Target,
  BookOpen,
  PenTool,
  Headphones,
  MessageSquare,
  Flame,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  nameJp: string;
  description: string;
  icon: string;
  category: 'learning' | 'vocabulary' | 'kanji' | 'grammar' | 'exams' | 'streaks' | 'hidden';
  xpReward: number;
  coinReward: number;
  isHidden: boolean;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

const ACHIEVEMENT_CATEGORIES = [
  { id: 'all', label: 'All', labelJp: '全て', icon: <Star size={16} /> },
  { id: 'learning', label: 'Learning', labelJp: '学習', icon: <BookOpen size={16} /> },
  { id: 'vocabulary', label: 'Vocabulary', labelJp: '単語', icon: <Target size={16} /> },
  { id: 'kanji', label: 'Kanji', labelJp: '漢字', icon: <PenTool size={16} /> },
  { id: 'grammar', label: 'Grammar', labelJp: '文法', icon: <MessageSquare size={16} /> },
  { id: 'exams', label: 'Exams', labelJp: '試験', icon: <Trophy size={16} /> },
  { id: 'streaks', label: 'Streaks', labelJp: '連続', icon: <Flame size={16} /> },
  { id: 'hidden', label: 'Hidden', labelJp: '秘密', icon: <Sparkles size={16} /> },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  // Learning
  { id: 'first-lesson', name: 'First Steps', nameJp: '第一歩', description: 'Complete your first lesson', icon: '👣', category: 'learning', xpReward: 50, coinReward: 10, isHidden: false, isUnlocked: true, unlockedAt: new Date().toISOString() },
  { id: 'first-quiz', name: 'Quiz Taker', nameJp: 'クイズ挑戦者', description: 'Complete your first quiz', icon: '⚡', category: 'learning', xpReward: 50, coinReward: 10, isHidden: false, isUnlocked: false, progress: 0, target: 1 },
  { id: 'first-week', name: 'Week One', nameJp: '一週間', description: 'Study for 7 consecutive days', icon: '📅', category: 'learning', xpReward: 200, coinReward: 50, isHidden: false, isUnlocked: false, progress: 1, target: 7 },
  { id: 'study-10hrs', name: 'Dedicated Learner', nameJp: '熱心な学習者', description: 'Study for a total of 10 hours', icon: '📚', category: 'learning', xpReward: 500, coinReward: 100, isHidden: false, isUnlocked: false, progress: 0, target: 600 },
  // Vocabulary
  { id: 'vocab-100', name: 'Word Collector', nameJp: '言葉収集家', description: 'Learn 100 vocabulary words', icon: '📖', category: 'vocabulary', xpReward: 200, coinReward: 50, isHidden: false, isUnlocked: false, progress: 0, target: 100 },
  { id: 'vocab-500', name: 'Lexicon Builder', nameJp: '語彙マスター', description: 'Learn 500 vocabulary words', icon: '📕', category: 'vocabulary', xpReward: 500, coinReward: 100, isHidden: false, isUnlocked: false, progress: 0, target: 500 },
  { id: 'vocab-1000', name: 'Word Master', nameJp: '千語達成', description: 'Learn 1,000 vocabulary words', icon: '🏆', category: 'vocabulary', xpReward: 1000, coinReward: 200, isHidden: false, isUnlocked: false, progress: 0, target: 1000 },
  { id: 'vocab-5000', name: 'Walking Dictionary', nameJp: '歩く辞書', description: 'Learn 5,000 vocabulary words', icon: '📚', category: 'vocabulary', xpReward: 5000, coinReward: 1000, isHidden: false, isUnlocked: false, progress: 0, target: 5000 },
  // Kanji
  { id: 'kanji-50', name: 'Kanji Apprentice', nameJp: '漢字見習い', description: 'Learn 50 kanji characters', icon: '✍️', category: 'kanji', xpReward: 200, coinReward: 50, isHidden: false, isUnlocked: false, progress: 0, target: 50 },
  { id: 'kanji-100', name: 'Kanji Student', nameJp: '漢字学生', description: 'Learn 100 kanji characters', icon: '📝', category: 'kanji', xpReward: 400, coinReward: 100, isHidden: false, isUnlocked: false, progress: 0, target: 100 },
  { id: 'kanji-500', name: 'Kanji Scholar', nameJp: '漢字学者', description: 'Learn 500 kanji characters', icon: '🎓', category: 'kanji', xpReward: 1000, coinReward: 250, isHidden: false, isUnlocked: false, progress: 0, target: 500 },
  { id: 'kanji-1000', name: 'Kanji Sage', nameJp: '漢字賢者', description: 'Learn 1,000 kanji characters', icon: '🏯', category: 'kanji', xpReward: 3000, coinReward: 500, isHidden: false, isUnlocked: false, progress: 0, target: 1000 },
  // Grammar
  { id: 'grammar-n5', name: 'N5 Grammar Complete', nameJp: 'N5文法完了', description: 'Complete all N5 grammar points', icon: '📋', category: 'grammar', xpReward: 500, coinReward: 100, isHidden: false, isUnlocked: false, progress: 0, target: 80 },
  { id: 'grammar-n4', name: 'N4 Grammar Complete', nameJp: 'N4文法完了', description: 'Complete all N4 grammar points', icon: '📑', category: 'grammar', xpReward: 1000, coinReward: 200, isHidden: false, isUnlocked: false, progress: 0, target: 130 },
  { id: 'grammar-n3', name: 'N3 Grammar Complete', nameJp: 'N3文法完了', description: 'Complete all N3 grammar points', icon: '📒', category: 'grammar', xpReward: 2000, coinReward: 400, isHidden: false, isUnlocked: false, progress: 0, target: 180 },
  // Exams
  { id: 'exam-n5', name: 'N5 Champion', nameJp: 'N5チャンピオン', description: 'Pass a mock N5 exam', icon: '🎖️', category: 'exams', xpReward: 1000, coinReward: 200, isHidden: false, isUnlocked: false },
  { id: 'exam-n4', name: 'N4 Victor', nameJp: 'N4勝者', description: 'Pass a mock N4 exam', icon: '🥈', category: 'exams', xpReward: 2000, coinReward: 400, isHidden: false, isUnlocked: false },
  { id: 'exam-n1', name: 'Ultimate Master', nameJp: '究極マスター', description: 'Pass a mock N1 exam', icon: '👑', category: 'exams', xpReward: 10000, coinReward: 5000, isHidden: false, isUnlocked: false },
  // Streaks
  { id: 'streak-3', name: 'Getting Started', nameJp: 'スタート', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streaks', xpReward: 50, coinReward: 10, isHidden: false, isUnlocked: false, progress: 1, target: 3 },
  { id: 'streak-7', name: 'On Fire', nameJp: '絶好調', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streaks', xpReward: 100, coinReward: 25, isHidden: false, isUnlocked: false, progress: 1, target: 7 },
  { id: 'streak-30', name: 'Monthly Master', nameJp: '月間マスター', description: 'Maintain a 30-day streak', icon: '💪', category: 'streaks', xpReward: 500, coinReward: 100, isHidden: false, isUnlocked: false, progress: 1, target: 30 },
  { id: 'streak-100', name: 'Centurion', nameJp: '百日達成', description: 'Maintain a 100-day streak', icon: '🏅', category: 'streaks', xpReward: 2000, coinReward: 500, isHidden: false, isUnlocked: false, progress: 1, target: 100 },
  { id: 'streak-365', name: 'Year of Japanese', nameJp: '一年間', description: 'Maintain a 365-day streak', icon: '🌟', category: 'streaks', xpReward: 10000, coinReward: 2000, isHidden: false, isUnlocked: false, progress: 1, target: 365 },
  // Hidden
  { id: 'hidden-midnight', name: '???', nameJp: '???', description: 'Study at midnight', icon: '❓', category: 'hidden', xpReward: 100, coinReward: 50, isHidden: true, isUnlocked: false },
  { id: 'hidden-speed', name: '???', nameJp: '???', description: 'Answer 10 questions in under 30 seconds', icon: '❓', category: 'hidden', xpReward: 200, coinReward: 100, isHidden: true, isUnlocked: false },
];

export function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const { profile } = useUserStore();

  const filteredAchievements = selectedCategory === 'all'
    ? MOCK_ACHIEVEMENTS
    : MOCK_ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  const unlockedCount = MOCK_ACHIEVEMENTS.filter(a => a.isUnlocked).length;
  const totalCount = MOCK_ACHIEVEMENTS.filter(a => !a.isHidden || a.isUnlocked).length;

  return (
    <div className="p-6 max-w-5xl mx-auto overflow-y-auto h-full pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Achievements
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Track your progress and earn rewards · 実績
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 mb-6"
        style={{
          background: 'var(--gradient-primary)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/80 text-sm font-medium">Achievements Unlocked</div>
            <div className="text-white text-3xl font-bold mt-1">
              {unlockedCount} <span className="text-lg font-normal text-white/60">/ {totalCount}</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Trophy size={28} color="white" />
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
      >
        {ACHIEVEMENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer"
            style={{
              background: selectedCategory === cat.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
              color: selectedCategory === cat.id ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${selectedCategory === cat.id ? 'transparent' : 'var(--border-primary)'}`,
            }}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="rounded-xl p-4 flex items-start gap-3.5 transition-all"
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${achievement.isUnlocked ? 'transparent' : 'var(--border-primary)'}`,
              boxShadow: achievement.isUnlocked ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
              opacity: achievement.isHidden && !achievement.isUnlocked ? 0.5 : 1,
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: achievement.isUnlocked ? 'var(--gradient-xp)' : 'var(--bg-tertiary)',
              }}
            >
              {achievement.isHidden && !achievement.isUnlocked ? (
                <Lock size={20} style={{ color: 'var(--text-tertiary)' }} />
              ) : (
                achievement.icon
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {achievement.isHidden && !achievement.isUnlocked ? '???' : achievement.name}
                </span>
                {achievement.isUnlocked && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'var(--gradient-success)', color: 'white' }}>
                    ✓
                  </span>
                )}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {achievement.isHidden && !achievement.isUnlocked ? '???' : achievement.nameJp}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {achievement.isHidden && !achievement.isUnlocked ? 'Complete a secret task to unlock' : achievement.description}
              </p>

              {/* Progress bar */}
              {achievement.progress !== undefined && achievement.target && !achievement.isUnlocked && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-tertiary)' }}>{achievement.progress} / {achievement.target}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--gradient-primary)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    />
                  </div>
                </div>
              )}

              {/* Rewards */}
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#f59e0b' }}>
                  +{achievement.xpReward} XP
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#eab308' }}>
                  +{achievement.coinReward} 🪙
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
