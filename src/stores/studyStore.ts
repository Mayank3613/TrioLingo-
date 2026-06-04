import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyGoal {
  id: string;
  title: string;
  titleJp: string;
  target: number;
  current: number;
  icon: string;
  xpReward: number;
}

export interface RecentActivity {
  id: string;
  type: 'lesson' | 'quiz' | 'review' | 'achievement' | 'level-up';
  title: string;
  description: string;
  xpEarned: number;
  timestamp: string;
  icon: string;
}

interface StudyState {
  dailyGoals: DailyGoal[];
  recentActivity: RecentActivity[];
  reviewsDue: number;
  lessonsAvailable: number;
  addActivity: (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => void;
  updateGoalProgress: (goalId: string, amount: number) => void;
  resetDailyGoals: () => void;
}

const defaultGoals: DailyGoal[] = [
  { id: 'vocab', title: 'Learn Words', titleJp: '単語', target: 10, current: 0, icon: '📚', xpReward: 50 },
  { id: 'kanji', title: 'Study Kanji', titleJp: '漢字', target: 5, current: 0, icon: '✍️', xpReward: 50 },
  { id: 'review', title: 'Review Cards', titleJp: '復習', target: 20, current: 0, icon: '🔄', xpReward: 30 },
  { id: 'grammar', title: 'Grammar Point', titleJp: '文法', target: 1, current: 0, icon: '📖', xpReward: 40 },
];

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      dailyGoals: defaultGoals,
      recentActivity: [
        {
          id: '1',
          type: 'lesson',
          title: 'Welcome to TrioLingo++!',
          description: 'Begin your Japanese learning journey',
          xpEarned: 0,
          timestamp: new Date().toISOString(),
          icon: '🎌',
        },
      ],
      reviewsDue: 0,
      lessonsAvailable: 42,
      addActivity: (activity) =>
        set((state) => ({
          recentActivity: [
            {
              ...activity,
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
            },
            ...state.recentActivity.slice(0, 19),
          ],
        })),
      updateGoalProgress: (goalId, amount) =>
        set((state) => ({
          dailyGoals: state.dailyGoals.map((g) =>
            g.id === goalId ? { ...g, current: Math.min(g.current + amount, g.target) } : g
          ),
        })),
      resetDailyGoals: () =>
        set((state) => ({
          dailyGoals: state.dailyGoals.map((g) => ({ ...g, current: 0 })),
        })),
    }),
    {
      name: 'triolingo-study',
    }
  )
);
