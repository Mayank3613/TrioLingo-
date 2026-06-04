import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, PenTool, X, BookOpen } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

/* ──── Mock Data ──── */
interface KanjiEntry {
  id: number;
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  jlptLevel: string;
  strokeCount: number;
  examples: string[];
  mastery: 'new' | 'learning' | 'mastered';
}

const MOCK_KANJI: KanjiEntry[] = [
  { id: 1, character: '日', meaning: 'day, sun', onyomi: 'ニチ、ジツ', kunyomi: 'ひ、-び、-か', jlptLevel: 'N5', strokeCount: 4, examples: ['日本 (にほん) - Japan', '今日 (きょう) - today', '日曜日 (にちようび) - Sunday'], mastery: 'mastered' },
  { id: 2, character: '月', meaning: 'month, moon', onyomi: 'ゲツ、ガツ', kunyomi: 'つき', jlptLevel: 'N5', strokeCount: 4, examples: ['月曜日 (げつようび) - Monday', '今月 (こんげつ) - this month'], mastery: 'mastered' },
  { id: 3, character: '火', meaning: 'fire', onyomi: 'カ', kunyomi: 'ひ、-び、ほ-', jlptLevel: 'N5', strokeCount: 4, examples: ['火曜日 (かようび) - Tuesday', '花火 (はなび) - fireworks'], mastery: 'learning' },
  { id: 4, character: '水', meaning: 'water', onyomi: 'スイ', kunyomi: 'みず', jlptLevel: 'N5', strokeCount: 4, examples: ['水曜日 (すいようび) - Wednesday', '水 (みず) - water'], mastery: 'learning' },
  { id: 5, character: '木', meaning: 'tree, wood', onyomi: 'モク、ボク', kunyomi: 'き、こ-', jlptLevel: 'N5', strokeCount: 4, examples: ['木曜日 (もくようび) - Thursday', '木 (き) - tree'], mastery: 'new' },
  { id: 6, character: '金', meaning: 'gold, money', onyomi: 'キン、コン', kunyomi: 'かね、かな-', jlptLevel: 'N5', strokeCount: 8, examples: ['金曜日 (きんようび) - Friday', 'お金 (おかね) - money'], mastery: 'new' },
  { id: 7, character: '土', meaning: 'earth, soil', onyomi: 'ド、ト', kunyomi: 'つち', jlptLevel: 'N5', strokeCount: 3, examples: ['土曜日 (どようび) - Saturday', '土地 (とち) - land'], mastery: 'new' },
  { id: 8, character: '人', meaning: 'person', onyomi: 'ジン、ニン', kunyomi: 'ひと、-り、-と', jlptLevel: 'N5', strokeCount: 2, examples: ['日本人 (にほんじん) - Japanese person', '一人 (ひとり) - one person'], mastery: 'mastered' },
  { id: 9, character: '大', meaning: 'big, large', onyomi: 'ダイ、タイ', kunyomi: 'おお-、おお.きい', jlptLevel: 'N5', strokeCount: 3, examples: ['大学 (だいがく) - university', '大きい (おおきい) - big'], mastery: 'mastered' },
  { id: 10, character: '小', meaning: 'small, little', onyomi: 'ショウ', kunyomi: 'ちい.さい、こ-、お-', jlptLevel: 'N5', strokeCount: 3, examples: ['小学校 (しょうがっこう) - elementary school', '小さい (ちいさい) - small'], mastery: 'learning' },
  { id: 11, character: '学', meaning: 'study, learning', onyomi: 'ガク', kunyomi: 'まな.ぶ', jlptLevel: 'N5', strokeCount: 8, examples: ['学生 (がくせい) - student', '大学 (だいがく) - university'], mastery: 'learning' },
  { id: 12, character: '生', meaning: 'life, birth', onyomi: 'セイ、ショウ', kunyomi: 'い.きる、う.まれる、なま', jlptLevel: 'N5', strokeCount: 5, examples: ['先生 (せんせい) - teacher', '学生 (がくせい) - student'], mastery: 'new' },
  { id: 13, character: '山', meaning: 'mountain', onyomi: 'サン', kunyomi: 'やま', jlptLevel: 'N5', strokeCount: 3, examples: ['山 (やま) - mountain', '富士山 (ふじさん) - Mt. Fuji'], mastery: 'mastered' },
  { id: 14, character: '川', meaning: 'river', onyomi: 'セン', kunyomi: 'かわ', jlptLevel: 'N5', strokeCount: 3, examples: ['川 (かわ) - river', '小川 (おがわ) - stream'], mastery: 'new' },
  { id: 15, character: '上', meaning: 'above, up', onyomi: 'ジョウ、ショウ', kunyomi: 'うえ、あ.げる、のぼ.る', jlptLevel: 'N5', strokeCount: 3, examples: ['上 (うえ) - above', '上手 (じょうず) - skillful'], mastery: 'learning' },
];

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

const MASTERY_RING: Record<string, string> = {
  new: 'var(--border-primary)',
  learning: 'rgba(99, 102, 241, 0.6)',
  mastered: 'rgba(34, 197, 94, 0.6)',
};

export function KanjiPage() {
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [search, setSearch] = useState('');
  const [selectedKanji, setSelectedKanji] = useState<KanjiEntry | null>(null);

  const filtered = useMemo(() => {
    return MOCK_KANJI.filter((k) => {
      if (k.jlptLevel !== selectedLevel) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          k.character.includes(q) ||
          k.meaning.toLowerCase().includes(q) ||
          k.onyomi.includes(q) ||
          k.kunyomi.includes(q)
        );
      }
      return true;
    });
  }, [selectedLevel, search]);

  const stats = useMemo(() => {
    const level = MOCK_KANJI.filter((k) => k.jlptLevel === selectedLevel);
    return {
      total: level.length,
      mastered: level.filter((k) => k.mastery === 'mastered').length,
      learning: level.filter((k) => k.mastery === 'learning').length,
      newCount: level.filter((k) => k.mastery === 'new').length,
    };
  }, [selectedLevel]);

  return (
    <div className="p-6 overflow-y-auto h-full pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Kanji
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Learn and master kanji characters · 漢字
        </p>
      </motion.div>

      {/* JLPT Level Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-4"
      >
        {JLPT_LEVELS.map((lv) => (
          <button
            key={lv}
            onClick={() => { setSelectedLevel(lv); setSelectedKanji(null); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: selectedLevel === lv ? 'var(--gradient-primary)' : 'var(--bg-card)',
              color: selectedLevel === lv ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${selectedLevel === lv ? 'transparent' : 'var(--border-primary)'}`,
            }}
          >
            {lv}
          </button>
        ))}
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-4 gap-3 mb-4"
      >
        {[
          { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Mastered', value: stats.mastered, color: '#22c55e' },
          { label: 'Learning', value: stats.learning, color: '#6366f1' },
          { label: 'New', value: stats.newCount, color: 'var(--text-tertiary)' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          >
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search kanji by character, meaning, or reading..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <ProgressBar
          value={stats.mastered}
          max={stats.total}
          label={`${selectedLevel} Kanji Progress`}
          showPercentage
          gradient="var(--gradient-success)"
          className="mb-5"
        />
      </motion.div>

      {/* Two-Column: Kanji Grid + Detail Panel */}
      <div className="flex gap-5">
        {/* Kanji Grid */}
        <div className={`grid gap-3 ${selectedKanji ? 'grid-cols-3 flex-1' : 'grid-cols-5 w-full'}`}>
          {filtered.map((kanji, i) => (
            <motion.button
              key={kanji.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.03 * i }}
              whileHover={{ scale: 1.08, boxShadow: 'var(--shadow-glow)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedKanji(kanji)}
              className="rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all aspect-square"
              style={{
                background: 'var(--bg-card)',
                border: `2px solid ${selectedKanji?.id === kanji.id ? '#6366f1' : MASTERY_RING[kanji.mastery]}`,
                boxShadow: selectedKanji?.id === kanji.id ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
              }}
            >
              <span
                className="text-4xl font-bold"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)' }}
              >
                {kanji.character}
              </span>
              <span className="text-xs mt-2 font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                {kanji.meaning.split(',')[0]}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
                >
                  {kanji.strokeCount}画
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedKanji && (
            <motion.div
              key={selectedKanji.id}
              initial={{ opacity: 0, x: 30, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 340 }}
              exit={{ opacity: 0, x: 30, width: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="flex-shrink-0 rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div className="p-6 h-full overflow-y-auto">
                {/* Close button */}
                <button
                  onClick={() => setSelectedKanji(null)}
                  className="absolute top-3 right-3 p-1 rounded-lg cursor-pointer"
                  style={{ color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)' }}
                >
                  <X size={14} />
                </button>

                {/* Large Character */}
                <div className="text-center mb-6">
                  <div
                    className="text-8xl font-bold inline-block"
                    style={{
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-japanese)',
                      textShadow: '0 0 30px rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    {selectedKanji.character}
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={
                        selectedKanji.mastery === 'mastered'
                          ? 'success'
                          : selectedKanji.mastery === 'learning'
                          ? 'primary'
                          : 'default'
                      }
                      size="md"
                    >
                      {selectedKanji.mastery}
                    </Badge>
                  </div>
                </div>

                {/* Meaning */}
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    Meaning
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedKanji.meaning}
                  </div>
                </div>

                {/* Readings */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl p-3" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                      On'yomi (音読み)
                    </div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)' }}>
                      {selectedKanji.onyomi}
                    </div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                      Kun'yomi (訓読み)
                    </div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)' }}>
                      {selectedKanji.kunyomi}
                    </div>
                  </div>
                </div>

                {/* Strokes */}
                <div className="rounded-xl p-3 mb-4 flex items-center gap-3" style={{ background: 'var(--bg-tertiary)' }}>
                  <PenTool size={16} style={{ color: 'var(--text-tertiary)' }} />
                  <div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Stroke Count</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedKanji.strokeCount} strokes</div>
                  </div>
                </div>

                {/* Examples */}
                <div className="mb-5">
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <BookOpen size={12} /> Example Words
                  </div>
                  <div className="space-y-2">
                    {selectedKanji.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="text-sm px-3 py-2 rounded-lg"
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)' }}
                      >
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    <PenTool size={14} /> Practice Writing
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    <Plus size={14} /> Flashcards
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
