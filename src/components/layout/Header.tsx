import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bell, Search, Sparkles } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';

const PAGE_TITLES: Record<string, { title: string; titleJp: string }> = {
  '/': { title: 'Dashboard', titleJp: 'ダッシュボード' },
  '/vocabulary': { title: 'Vocabulary', titleJp: '語彙' },
  '/kanji': { title: 'Kanji', titleJp: '漢字' },
  '/grammar': { title: 'Grammar', titleJp: '文法' },
  '/reading': { title: 'Reading', titleJp: '読解' },
  '/listening': { title: 'Listening', titleJp: '聴解' },
  '/speaking': { title: 'Speaking', titleJp: '会話' },
  '/writing': { title: 'Writing', titleJp: '書写' },
  '/flashcards': { title: 'Flashcards', titleJp: 'フラッシュカード' },
  '/quiz': { title: 'Quiz', titleJp: 'クイズ' },
  '/mock-exam': { title: 'Mock Exam', titleJp: '模擬試験' },
  '/career': { title: 'Career Mode', titleJp: 'キャリアモード' },
  '/mini-games': { title: 'Mini Games', titleJp: 'ミニゲーム' },
  '/ai-tutor': { title: 'AI Tutor', titleJp: 'AI先生' },
  '/achievements': { title: 'Achievements', titleJp: '実績' },
  '/analytics': { title: 'Analytics', titleJp: '分析' },
  '/search': { title: 'Search', titleJp: '検索' },
  '/settings': { title: 'Settings', titleJp: '設定' },
  '/profile': { title: 'Profile', titleJp: 'プロフィール' },
};

export function Header() {
  const location = useLocation();
  const profile = useUserStore((s) => s.profile);

  const page = useMemo(() => {
    return PAGE_TITLES[location.pathname] ?? { title: 'TrioLingo++', titleJp: '' };
  }, [location.pathname]);

  return (
    <header
      className="flex items-center justify-between px-6 h-16 flex-shrink-0"
      style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      {/* Left — Page Title */}
      <div className="flex items-center gap-3">
        <motion.h2
          key={page.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-lg font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {page.title}
        </motion.h2>
        {page.titleJp && (
          <motion.span
            key={page.titleJp}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="text-xs font-medium"
            style={{
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-japanese)',
            }}
          >
            {page.titleJp}
          </motion.span>
        )}
      </div>

      {/* Right — Stats & Actions */}
      <div className="flex items-center gap-2">
        {/* Streak */}
        <StatBadge
          icon={<span className="animate-streak inline-block origin-bottom">🔥</span>}
          value={profile.currentStreak}
          label="streak"
          accentVar="--color-streak"
        />

        {/* XP */}
        <StatBadge
          icon={<Sparkles size={14} className="text-amber-400" />}
          value={profile.totalXP.toLocaleString()}
          label="XP"
          accentVar="--color-xp"
          glow
        />

        {/* Coins */}
        <StatBadge
          icon={<span className="text-sm">🪙</span>}
          value={profile.coins.toLocaleString()}
          label="coins"
          accentVar="--color-coin"
        />

        {/* Divider */}
        <div
          className="w-px h-6 mx-1"
          style={{ background: 'var(--border-primary)' }}
        />

        {/* Search */}
        <IconButton ariaLabel="Search">
          <Search size={17} />
        </IconButton>

        {/* Notifications */}
        <IconButton ariaLabel="Notifications" badge>
          <Bell size={17} />
        </IconButton>

        {/* Avatar */}
        <Link
          className="ml-1 w-8 h-8 rounded-full flex items-center justify-center text-base cursor-pointer transition-transform duration-150 hover:scale-110"
          style={{ background: 'var(--bg-tertiary)' }}
          aria-label="Profile"
        >
          {profile.avatarEmoji}
        </Link>
      </div>
    </header>
  );
}

/* ——— Small helper components ——— */

function Link({
  children,
  className,
  style,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Simple anchor tag – no routing needed for the avatar
  return (
    <a href="/profile" className={className} style={style} {...props}>
      {children}
    </a>
  );
}

function StatBadge({
  icon,
  value,
  label,
  glow,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accentVar: string;
  glow?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-default"
      style={{
        background: 'var(--bg-hover)',
        color: 'var(--text-primary)',
        boxShadow: glow ? 'var(--shadow-glow)' : undefined,
      }}
      title={`${value} ${label}`}
    >
      {icon}
      <span className="tabular-nums">{value}</span>
    </motion.div>
  );
}

function IconButton({
  children,
  ariaLabel,
  badge,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  badge?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
      style={{ color: 'var(--text-secondary)' }}
      aria-label={ariaLabel}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
      {badge && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full"
          style={{ background: 'var(--gradient-accent)' }}
        />
      )}
    </motion.button>
  );
}
