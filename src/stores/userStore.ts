import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  username: string;
  displayName: string;
  avatarEmoji: string;
  title: string;
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  coins: number;
  currentJLPTLevel: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  vocabularyMastered: number;
  kanjiMastered: number;
  grammarCompleted: number;
  totalStudyMinutes: number;
  joinedDate: string;
}

const XP_PER_LEVEL = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, // 1-10
  4000, 4900, 5900, 7000, 8200, 9500, 11000, 12600, 14300, 16100, // 11-20
  18000, 20100, 22300, 24600, 27000, 29500, 32200, 35000, 37900, 41000, // 21-30
];

export function getXPForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level < XP_PER_LEVEL.length) return XP_PER_LEVEL[level];
  return Math.floor(XP_PER_LEVEL[XP_PER_LEVEL.length - 1] + (level - XP_PER_LEVEL.length + 1) * 3500);
}

export function getLevelTitle(level: number): string {
  if (level >= 150) return 'Japanese Legend';
  if (level >= 100) return 'JLPT Master';
  if (level >= 80) return 'JLPT Challenger';
  if (level >= 60) return 'Grammar Sage';
  if (level >= 40) return 'Kanji Hunter';
  if (level >= 25) return 'Kana Explorer';
  if (level >= 10) return 'Hiragana Apprentice';
  return 'New Student';
}

interface UserState {
  profile: UserProfile;
  isOnboarded: boolean;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateStreak: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setOnboarded: (value: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        username: 'student',
        displayName: 'New Student',
        avatarEmoji: '🎌',
        title: 'New Student',
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: 100,
        totalXP: 0,
        coins: 0,
        currentJLPTLevel: 'N5',
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
        vocabularyMastered: 0,
        kanjiMastered: 0,
        grammarCompleted: 0,
        totalStudyMinutes: 0,
        joinedDate: new Date().toISOString(),
      },
      isOnboarded: false,
      addXP: (amount) =>
        set((state) => {
          let newXP = state.profile.currentXP + amount;
          let newLevel = state.profile.currentLevel;
          let newXPToNext = state.profile.xpToNextLevel;

          while (newXP >= newXPToNext) {
            newXP -= newXPToNext;
            newLevel++;
            newXPToNext = getXPForLevel(newLevel) - getXPForLevel(newLevel - 1);
          }

          return {
            profile: {
              ...state.profile,
              currentXP: newXP,
              currentLevel: newLevel,
              xpToNextLevel: newXPToNext,
              totalXP: state.profile.totalXP + amount,
              title: getLevelTitle(newLevel),
            },
          };
        }),
      addCoins: (amount) =>
        set((state) => ({
          profile: {
            ...state.profile,
            coins: state.profile.coins + amount,
          },
        })),
      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const lastDate = state.profile.lastStudyDate;
          let newStreak = state.profile.currentStreak;

          if (lastDate === today) return state;

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastDate === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }

          return {
            profile: {
              ...state.profile,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.profile.longestStreak),
              lastStudyDate: today,
            },
          };
        }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),
      setOnboarded: (value) => set({ isOnboarded: value }),
    }),
    {
      name: 'triolingo-user',
    }
  )
);
