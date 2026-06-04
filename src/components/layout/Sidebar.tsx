import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  FileText,
  BookMarked,
  Headphones,
  Mic,
  Edit3,
  Layers,
  Zap,
  GraduationCap,
  Map,
  Gamepad2,
  Bot,
  Trophy,
  BarChart3,
  Search as SearchIcon,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useSidebarStore } from '../../stores/sidebarStore';

interface NavItem {
  label: string;
  labelJp?: string;
  icon: React.ElementType;
  path: string;
}

interface NavSection {
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', labelJp: 'ダッシュボード', icon: LayoutDashboard, path: '/' },
      { label: 'Vocabulary', labelJp: '語彙', icon: BookOpen, path: '/vocabulary' },
      { label: 'Kanji', labelJp: '漢字', icon: PenTool, path: '/kanji' },
      { label: 'Grammar', labelJp: '文法', icon: FileText, path: '/grammar' },
      { label: 'Reading', labelJp: '読解', icon: BookMarked, path: '/reading' },
      { label: 'Listening', labelJp: '聴解', icon: Headphones, path: '/listening' },
      { label: 'Speaking', labelJp: '会話', icon: Mic, path: '/speaking' },
      { label: 'Writing', labelJp: '書写', icon: Edit3, path: '/writing' },
    ],
  },
  {
    items: [
      { label: 'Flashcards', labelJp: 'フラッシュカード', icon: Layers, path: '/flashcards' },
      { label: 'Quiz', labelJp: 'クイズ', icon: Zap, path: '/quiz' },
      { label: 'Mock Exam', labelJp: '模擬試験', icon: GraduationCap, path: '/mock-exam' },
    ],
  },
  {
    items: [
      { label: 'Career Mode', labelJp: 'キャリアモード', icon: Map, path: '/career' },
      { label: 'Mini Games', labelJp: 'ミニゲーム', icon: Gamepad2, path: '/mini-games' },
      { label: 'AI Tutor', labelJp: 'AI先生', icon: Bot, path: '/ai-tutor' },
    ],
  },
  {
    items: [
      { label: 'Achievements', labelJp: '実績', icon: Trophy, path: '/achievements' },
      { label: 'Analytics', labelJp: '分析', icon: BarChart3, path: '/analytics' },
      { label: 'Search', labelJp: '検索', icon: SearchIcon, path: '/search' },
    ],
  },
];

const BOTTOM_NAV: NavItem = {
  label: 'Settings',
  labelJp: '設定',
  icon: Settings,
  path: '/settings',
};

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const location = useLocation();
  const profile = useUserStore((s) => s.profile);

  const sidebarWidth = collapsed ? 72 : 260;
  const xpPercent = profile.xpToNextLevel > 0
    ? Math.round((profile.currentXP / profile.xpToNextLevel) * 100)
    : 0;

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen z-40 flex flex-col select-none"
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-primary)',
      }}
      animate={{ width: sidebarWidth }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-2 min-h-[60px]">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-white"
          style={{ background: 'var(--gradient-primary)' }}
        >
          T
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1
                className="text-base font-bold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                TrioLingo++
              </h1>
              <span
                className="text-[10px] tracking-widest"
                style={{
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-japanese)',
                }}
              >
                トリオリンゴ
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User XP Mini Display */}
      <div className="px-3 pb-3 pt-1">
        <div
          className="rounded-xl p-2.5 flex items-center gap-2.5 transition-colors duration-200"
          style={{ background: 'var(--bg-hover)' }}
        >
          <div className="flex-shrink-0 text-xl w-8 h-8 flex items-center justify-center">
            {profile.avatarEmoji}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex-1 overflow-hidden min-w-0"
              >
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Lv.{profile.currentLevel}{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {profile.title}
                  </span>
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--gradient-xp)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-medium tabular-nums"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {profile.currentXP}/{profile.xpToNextLevel}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 space-y-0.5 pb-2">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {si > 0 && (
              <div
                className="h-px mx-2 my-2"
                style={{ background: 'var(--border-primary)' }}
              />
            )}
            {section.items.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <SidebarLink
                  key={item.path}
                  item={item}
                  isActive={isActive}
                  collapsed={collapsed}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div
        className="px-2.5 pb-2"
        style={{ borderTop: '1px solid var(--border-primary)' }}
      >
        <div className="pt-2">
          <SidebarLink
            item={BOTTOM_NAV}
            isActive={location.pathname === BOTTOM_NAV.path}
            collapsed={collapsed}
          />
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => toggle()}
          className="w-full flex items-center justify-center gap-2 py-2 mt-1 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {collapsed ? (
            <ChevronsRight size={16} />
          ) : (
            <>
              <ChevronsLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

/* ——— Individual Nav Link ——— */

function SidebarLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className="relative flex items-center gap-2.5 rounded-lg transition-colors duration-150 group"
      style={{
        padding: collapsed ? '8px 0' : '7px 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: isActive ? undefined : 'transparent',
        color: isActive ? '#fff' : 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Active background */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg"
          style={{ background: 'var(--gradient-primary)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}

      <span className="relative z-10 flex-shrink-0">
        <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
      </span>

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.12 }}
            className="relative z-10 text-[13px] font-medium whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div
          className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-primary)',
          }}
        >
          {item.label}
        </div>
      )}
    </Link>
  );
}
