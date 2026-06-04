import React from 'react';
import { motion } from 'motion/react';
import { useThemeStore, THEMES, type ThemeId } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import {
  Palette,
  Monitor,
  Moon,
  Sun,
  Lock,
  Check,
  Volume2,
  Bell,
  Globe,
  Shield,
  Download,
  Info,
} from 'lucide-react';

function ThemeCard({
  theme,
  isActive,
  isUnlocked,
  onSelect,
}: {
  theme: (typeof THEMES)[0];
  isActive: boolean;
  isUnlocked: boolean;
  onSelect: () => void;
}) {
  const previewColors: Record<ThemeId, { bg: string; card: string; accent: string; text: string }> = {
    light: { bg: '#f8fafc', card: '#ffffff', accent: '#6366f1', text: '#0f172a' },
    dark: { bg: '#0f172a', card: '#1e293b', accent: '#818cf8', text: '#f1f5f9' },
    amoled: { bg: '#000000', card: '#0a0a0a', accent: '#818cf8', text: '#fafafa' },
    sakura: { bg: '#fdf2f8', card: '#ffffff', accent: '#ec4899', text: '#831843' },
    'cyber-tokyo': { bg: '#0a0e1a', card: '#111827', accent: '#06ffa5', text: '#06ffa5' },
    traditional: { bg: '#faf7f2', card: '#f5f0e8', accent: '#b8860b', text: '#3b240e' },
  };

  const colors = previewColors[theme.id];

  return (
    <motion.button
      whileHover={isUnlocked ? { scale: 1.03, y: -4 } : {}}
      whileTap={isUnlocked ? { scale: 0.97 } : {}}
      onClick={isUnlocked ? onSelect : undefined}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        border: isActive ? `2px solid ${colors.accent}` : '2px solid var(--border-primary)',
        boxShadow: isActive ? `0 0 20px ${colors.accent}40` : 'var(--shadow-md)',
        opacity: isUnlocked ? 1 : 0.5,
      }}
    >
      {/* Theme Preview */}
      <div className="p-3" style={{ background: colors.bg }}>
        {/* Mini sidebar + content preview */}
        <div className="flex gap-2 h-20">
          <div className="w-8 rounded-lg" style={{ background: colors.card, border: `1px solid ${colors.accent}20` }}>
            <div className="flex flex-col gap-1.5 p-1.5 mt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-1 rounded-full" style={{ background: colors.accent, opacity: i === 1 ? 1 : 0.3 }} />
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-4 rounded" style={{ background: colors.card }} />
            <div className="flex-1 rounded-lg" style={{ background: colors.card }}>
              <div className="p-2 flex gap-1.5">
                <div className="w-6 h-6 rounded" style={{ background: colors.accent }} />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-1.5 w-3/4 rounded-full" style={{ background: colors.text, opacity: 0.3 }} />
                  <div className="h-1 w-1/2 rounded-full" style={{ background: colors.text, opacity: 0.15 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Name */}
      <div className="px-3 py-2.5 flex items-center justify-between" style={{ background: 'var(--bg-card)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">{theme.icon}</span>
          <div className="text-left">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{theme.name}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{theme.nameJp}</div>
          </div>
        </div>
        {!isUnlocked && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
            <Lock size={10} />
            Lv.{theme.requiredLevel}
          </div>
        )}
        {isActive && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: colors.accent }}>
            <Check size={12} color="white" />
          </div>
        )}
      </div>
    </motion.button>
  );
}

interface SettingSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingSection({ title, icon, children }: SettingSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          {icon}
        </div>
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export function SettingsPage() {
  const { currentTheme, unlockedThemes, setTheme } = useThemeStore();
  const { profile } = useUserStore();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full pb-20">
      {/* Page Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Customize your learning experience · 設定
        </p>
      </motion.div>

      {/* Theme Selection */}
      <SettingSection title="Appearance" icon={<Palette size={18} />}>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Choose your theme. Unlock more by leveling up!
        </p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme === theme.id}
              isUnlocked={unlockedThemes.includes(theme.id)}
              onSelect={() => setTheme(theme.id)}
            />
          ))}
        </div>
      </SettingSection>

      {/* Study Settings */}
      <SettingSection title="Study Preferences" icon={<Globe size={18} />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Daily XP Goal</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Set your daily study target</div>
            </div>
            <select
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
              defaultValue="50"
            >
              <option value="20">Casual (20 XP)</option>
              <option value="50">Regular (50 XP)</option>
              <option value="100">Serious (100 XP)</option>
              <option value="200">Intense (200 XP)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>JLPT Target Level</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Currently studying: {profile.currentJLPTLevel}</div>
            </div>
            <select
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
              defaultValue={profile.currentJLPTLevel}
            >
              {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                <option key={level} value={level}>JLPT {level}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>SRS Algorithm</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Spaced repetition scheduling method</div>
            </div>
            <select
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
              defaultValue="fsrs"
            >
              <option value="fsrs">FSRS (Recommended)</option>
              <option value="sm2">SM-2 (Classic)</option>
            </select>
          </div>
        </div>
      </SettingSection>

      {/* Audio Settings */}
      <SettingSection title="Audio" icon={<Volume2 size={18} />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sound Effects</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Play sounds for correct/incorrect answers</div>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Auto-play Pronunciation</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Automatically play word audio in lessons</div>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications" icon={<Bell size={18} />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Study Reminders</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Get reminded to study each day</div>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Streak Protection Alerts</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Warning before losing your streak</div>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
        </div>
      </SettingSection>

      {/* Data & Privacy */}
      <SettingSection title="Data & Privacy" icon={<Shield size={18} />}>
        <div className="space-y-3">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            <Download size={16} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <div className="text-sm font-medium">Export Study Data</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Download all your progress and flashcards</div>
            </div>
          </button>
        </div>
      </SettingSection>

      {/* About */}
      <SettingSection title="About" icon={<Info size={18} />}>
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>0.1.0-alpha</span>
          </div>
          <div className="flex justify-between">
            <span>Data Sources</span>
            <span style={{ color: 'var(--text-primary)' }}>JMdict, KANJIDIC2, Tatoeba</span>
          </div>
          <div className="flex justify-between">
            <span>License</span>
            <span style={{ color: 'var(--text-primary)' }}>CC-BY-SA 4.0</span>
          </div>
          <p className="text-xs mt-3 pt-3" style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-tertiary)' }}>
            Dictionary data provided by the EDRDG (Electronic Dictionary Research and Development Group)
            under the Creative Commons Attribution-ShareAlike License. Example sentences from Tatoeba (CC-BY 2.0).
          </p>
        </div>
      </SettingSection>
    </div>
  );
}

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = React.useState(defaultChecked);

  return (
    <button
      onClick={() => setChecked(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer"
      style={{
        background: checked ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
        border: `1px solid ${checked ? 'transparent' : 'var(--border-primary)'}`,
      }}
    >
      <motion.div
        className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-md"
        animate={{ left: checked ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: '18px', height: '18px' }}
      />
    </button>
  );
}
