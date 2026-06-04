import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Search,
  Volume2,
  Plus,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

/* ──── Mock Data ──── */
interface VocabWord {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  jlptLevel: string;
  partOfSpeech: string;
  exampleJp: string;
  exampleEn: string;
  mastery: 'new' | 'learning' | 'mastered';
}

const MOCK_VOCAB: VocabWord[] = [
  { id: 1, word: '食べる', reading: 'たべる', meaning: 'to eat', jlptLevel: 'N5', partOfSpeech: 'Verb', exampleJp: '朝ごはんを食べる。', exampleEn: 'I eat breakfast.', mastery: 'mastered' },
  { id: 2, word: '飲む', reading: 'のむ', meaning: 'to drink', jlptLevel: 'N5', partOfSpeech: 'Verb', exampleJp: '水を飲む。', exampleEn: 'I drink water.', mastery: 'learning' },
  { id: 3, word: '見る', reading: 'みる', meaning: 'to see, to look', jlptLevel: 'N5', partOfSpeech: 'Verb', exampleJp: 'テレビを見る。', exampleEn: 'I watch TV.', mastery: 'learning' },
  { id: 4, word: '聞く', reading: 'きく', meaning: 'to listen, to ask', jlptLevel: 'N5', partOfSpeech: 'Verb', exampleJp: '音楽を聞く。', exampleEn: 'I listen to music.', mastery: 'new' },
  { id: 5, word: '読む', reading: 'よむ', meaning: 'to read', jlptLevel: 'N5', partOfSpeech: 'Verb', exampleJp: '本を読む。', exampleEn: 'I read a book.', mastery: 'new' },
  { id: 6, word: '書く', reading: 'かく', meaning: 'to write', jlptLevel: 'N5', partOfSpeech: 'Verb', exampleJp: '手紙を書く。', exampleEn: 'I write a letter.', mastery: 'new' },
  { id: 7, word: '話す', reading: 'はなす', meaning: 'to speak, to talk', jlptLevel: 'N5', partOfSpeech: 'Verb', exampleJp: '日本語を話す。', exampleEn: 'I speak Japanese.', mastery: 'learning' },
  { id: 8, word: '大きい', reading: 'おおきい', meaning: 'big, large', jlptLevel: 'N5', partOfSpeech: 'Adjective', exampleJp: '大きい犬がいる。', exampleEn: 'There is a big dog.', mastery: 'mastered' },
  { id: 9, word: '小さい', reading: 'ちいさい', meaning: 'small, little', jlptLevel: 'N5', partOfSpeech: 'Adjective', exampleJp: '小さい猫がいる。', exampleEn: 'There is a small cat.', mastery: 'mastered' },
  { id: 10, word: '新しい', reading: 'あたらしい', meaning: 'new', jlptLevel: 'N5', partOfSpeech: 'Adjective', exampleJp: '新しい本を買った。', exampleEn: 'I bought a new book.', mastery: 'learning' },
  { id: 11, word: '古い', reading: 'ふるい', meaning: 'old (things)', jlptLevel: 'N5', partOfSpeech: 'Adjective', exampleJp: 'あの建物は古い。', exampleEn: 'That building is old.', mastery: 'new' },
  { id: 12, word: '学生', reading: 'がくせい', meaning: 'student', jlptLevel: 'N5', partOfSpeech: 'Noun', exampleJp: '私は学生です。', exampleEn: 'I am a student.', mastery: 'mastered' },
  { id: 13, word: '先生', reading: 'せんせい', meaning: 'teacher', jlptLevel: 'N5', partOfSpeech: 'Noun', exampleJp: '田中先生は優しい。', exampleEn: 'Teacher Tanaka is kind.', mastery: 'mastered' },
  { id: 14, word: '友達', reading: 'ともだち', meaning: 'friend', jlptLevel: 'N5', partOfSpeech: 'Noun', exampleJp: '友達と遊ぶ。', exampleEn: 'I play with my friend.', mastery: 'learning' },
  { id: 15, word: '時間', reading: 'じかん', meaning: 'time, hour', jlptLevel: 'N5', partOfSpeech: 'Noun', exampleJp: '時間がない。', exampleEn: 'There is no time.', mastery: 'new' },
  { id: 16, word: '行く', reading: 'いく', meaning: 'to go', jlptLevel: 'N5', partOfSpeech: 'Verb', exampleJp: '学校に行く。', exampleEn: 'I go to school.', mastery: 'mastered' },
  { id: 17, word: '来る', reading: 'くる', meaning: 'to come', jlptLevel: 'N5', partOfSpeech: 'Verb', exampleJp: '友達が来る。', exampleEn: 'My friend is coming.', mastery: 'learning' },
  { id: 18, word: '天気', reading: 'てんき', meaning: 'weather', jlptLevel: 'N5', partOfSpeech: 'Noun', exampleJp: '今日の天気はいい。', exampleEn: 'The weather is nice today.', mastery: 'new' },
];

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const POS_FILTERS = ['All', 'Verb', 'Adjective', 'Noun', 'Adverb'];

const MASTERY_COLORS = {
  new: 'var(--bg-tertiary)',
  learning: 'rgba(99, 102, 241, 0.15)',
  mastered: 'rgba(34, 197, 94, 0.15)',
};
const MASTERY_BORDER = {
  new: 'var(--border-primary)',
  learning: 'rgba(99, 102, 241, 0.4)',
  mastered: 'rgba(34, 197, 94, 0.4)',
};

export function VocabularyPage() {
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [posFilter, setPosFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return MOCK_VOCAB.filter((w) => {
      if (w.jlptLevel !== selectedLevel) return false;
      if (posFilter !== 'All' && w.partOfSpeech !== posFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          w.word.includes(q) ||
          w.reading.includes(q) ||
          w.meaning.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedLevel, posFilter, search]);

  const stats = useMemo(() => {
    const level = MOCK_VOCAB.filter((w) => w.jlptLevel === selectedLevel);
    return {
      total: level.length,
      mastered: level.filter((w) => w.mastery === 'mastered').length,
      learning: level.filter((w) => w.mastery === 'learning').length,
      newCount: level.filter((w) => w.mastery === 'new').length,
    };
  }, [selectedLevel]);

  return (
    <div className="p-6 overflow-y-auto h-full pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Vocabulary
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Master essential Japanese words · 単語
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
            onClick={() => setSelectedLevel(lv)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: selectedLevel === lv ? 'var(--gradient-primary)' : 'var(--bg-card)',
              color: selectedLevel === lv ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${selectedLevel === lv ? 'transparent' : 'var(--border-primary)'}`,
              boxShadow: selectedLevel === lv ? 'var(--shadow-md)' : 'none',
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
        className="grid grid-cols-4 gap-3 mb-5"
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

      {/* Search + POS Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 mb-5"
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            placeholder="Search words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <div className="flex gap-1.5 items-center">
          <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
          {POS_FILTERS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: posFilter === pos ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                color: posFilter === pos ? 'white' : 'var(--text-secondary)',
              }}
            >
              {pos}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
        <ProgressBar
          value={stats.mastered}
          max={stats.total}
          label={`${selectedLevel} Progress`}
          showPercentage
          gradient="var(--gradient-success)"
          className="mb-5"
        />
      </motion.div>

      {/* Word Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-3"
        >
          <span className="text-5xl">🔍</span>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No words match your search</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((word, i) => {
            const isExpanded = expandedId === word.id;
            return (
              <motion.div
                key={word.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl overflow-hidden cursor-pointer transition-shadow"
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${MASTERY_BORDER[word.mastery]}`,
                  boxShadow: isExpanded ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                }}
                onClick={() => setExpandedId(isExpanded ? null : word.id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)' }}>
                        {word.word}
                      </div>
                      <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-japanese)' }}>
                        {word.reading}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={word.mastery === 'mastered' ? 'success' : word.mastery === 'learning' ? 'primary' : 'default'}>
                        {word.mastery}
                      </Badge>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                        {word.partOfSpeech}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>
                    {word.meaning}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    {isExpanded ? (
                      <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} />
                    ) : (
                      <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-4 pb-4 pt-2 border-t"
                        style={{ borderColor: 'var(--border-secondary)' }}
                      >
                        <div className="mb-3">
                          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>
                            Example
                          </div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)' }}>
                            {word.exampleJp}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {word.exampleEn}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Volume2 size={12} /> Play Audio
                          </button>
                          <button
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
                            style={{ background: 'var(--gradient-primary)' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Plus size={12} /> Add to Flashcards
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
