import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface GrammarPoint {
  id: number;
  pattern: string;
  meaning: string;
  jlptLevel: string;
  formation: string;
  explanation: string;
  examples: { jp: string; en: string }[];
  notes: string;
  mastery: 'new' | 'learning' | 'mastered';
}

const MOCK_GRAMMAR: GrammarPoint[] = [
  {
    id: 1, pattern: '～は～です', meaning: 'X is Y (polite)', jlptLevel: 'N5', formation: 'Noun は Noun です',
    explanation: 'The most basic sentence pattern in Japanese. は (wa) marks the topic, and です (desu) is the polite copula meaning "is/am/are".',
    examples: [{ jp: '私は学生です。', en: 'I am a student.' }, { jp: 'これは本です。', en: 'This is a book.' }],
    notes: 'は is pronounced "wa" when used as a particle.', mastery: 'mastered',
  },
  {
    id: 2, pattern: '～を～ます', meaning: 'Object + Verb (polite)', jlptLevel: 'N5', formation: 'Noun を Verb-ます',
    explanation: 'を (wo/o) marks the direct object of a transitive verb. ます form is the polite present/future tense.',
    examples: [{ jp: '水を飲みます。', en: 'I drink water.' }, { jp: '本を読みます。', en: 'I read a book.' }],
    notes: 'を is pronounced "o" in modern Japanese.', mastery: 'mastered',
  },
  {
    id: 3, pattern: '～に行く', meaning: 'Go to ~', jlptLevel: 'N5', formation: 'Place に 行く/来る/帰る',
    explanation: 'に marks the destination of movement verbs like 行く (to go), 来る (to come), and 帰る (to return).',
    examples: [{ jp: '学校に行く。', en: 'I go to school.' }, { jp: '日本に来ました。', en: 'I came to Japan.' }],
    notes: 'へ (e) can also mark direction, but に is more specific about destination.', mastery: 'learning',
  },
  {
    id: 4, pattern: '～が好きです', meaning: 'Like ~', jlptLevel: 'N5', formation: 'Noun が 好き/嫌い です',
    explanation: 'が marks the object of liking/disliking. 好き (suki) means "like" and is a na-adjective.',
    examples: [{ jp: '猫が好きです。', en: 'I like cats.' }, { jp: '数学が嫌いです。', en: 'I dislike math.' }],
    notes: 'The subject is often implied (私は) and omitted.', mastery: 'learning',
  },
  {
    id: 5, pattern: '～たい', meaning: 'Want to ~', jlptLevel: 'N5', formation: 'Verb stem + たい',
    explanation: 'たい expresses the speaker\'s desire. Attach it to the verb stem (masu-stem).',
    examples: [{ jp: '日本に行きたい。', en: 'I want to go to Japan.' }, { jp: '寿司を食べたい。', en: 'I want to eat sushi.' }],
    notes: 'Cannot be used for third person desires — use たがっている instead.', mastery: 'new',
  },
  {
    id: 6, pattern: '～てください', meaning: 'Please do ~', jlptLevel: 'N5', formation: 'Verb て-form + ください',
    explanation: 'A polite request form. Convert the verb to te-form and add ください.',
    examples: [{ jp: '待ってください。', en: 'Please wait.' }, { jp: 'ここに座ってください。', en: 'Please sit here.' }],
    notes: 'For negative requests, use ～ないでください.', mastery: 'new',
  },
  {
    id: 7, pattern: '～ている', meaning: 'Is doing ~ / state', jlptLevel: 'N5', formation: 'Verb て-form + いる',
    explanation: 'Expresses ongoing action (progressive) or resultant state depending on the verb type.',
    examples: [{ jp: '今、食べている。', en: 'I am eating now.' }, { jp: '東京に住んでいる。', en: 'I live in Tokyo.' }],
    notes: 'In casual speech, い is often dropped: 食べてる.', mastery: 'new',
  },
  {
    id: 8, pattern: '～から～まで', meaning: 'From ~ to ~', jlptLevel: 'N5', formation: 'Time/Place から Time/Place まで',
    explanation: 'から marks the starting point, まで marks the ending point. Can be used for time and location.',
    examples: [{ jp: '9時から5時まで働く。', en: 'I work from 9 to 5.' }, { jp: '東京から大阪まで。', en: 'From Tokyo to Osaka.' }],
    notes: 'They can be used independently too.', mastery: 'learning',
  },
];

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export function GrammarPage() {
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return MOCK_GRAMMAR.filter((g) => {
      if (g.jlptLevel !== selectedLevel) return false;
      if (search) {
        const q = search.toLowerCase();
        return g.pattern.includes(q) || g.meaning.toLowerCase().includes(q) || g.explanation.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedLevel, search]);

  const stats = useMemo(() => {
    const level = MOCK_GRAMMAR.filter((g) => g.jlptLevel === selectedLevel);
    return {
      total: level.length,
      mastered: level.filter((g) => g.mastery === 'mastered').length,
      learning: level.filter((g) => g.mastery === 'learning').length,
      newCount: level.filter((g) => g.mastery === 'new').length,
    };
  }, [selectedLevel]);

  return (
    <div className="p-6 overflow-y-auto h-full pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Grammar</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Master Japanese grammar patterns · 文法
        </p>
      </motion.div>

      {/* JLPT Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-4">
        {JLPT_LEVELS.map((lv) => (
          <button
            key={lv}
            onClick={() => { setSelectedLevel(lv); setExpandedId(null); }}
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

      {/* Stats + Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <ProgressBar
          value={stats.mastered}
          max={stats.total}
          label={`${selectedLevel} Grammar Progress — ${stats.mastered}/${stats.total} mastered`}
          showPercentage
          gradient="var(--gradient-success)"
          className="mb-4"
        />
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Search grammar patterns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
        />
      </motion.div>

      {/* Grammar List */}
      <div className="space-y-3">
        {filtered.map((g, i) => {
          const isExpanded = expandedId === g.id;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-2xl overflow-hidden transition-shadow"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isExpanded ? 'rgba(99,102,241,0.4)' : 'var(--border-primary)'}`,
                boxShadow: isExpanded ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
              }}
            >
              {/* Header Row */}
              <button
                className="w-full p-4 flex items-center gap-4 text-left cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : g.id)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: g.mastery === 'mastered' ? 'var(--gradient-success)' : g.mastery === 'learning' ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                  }}
                >
                  {g.mastery === 'mastered' ? (
                    <CheckCircle2 size={18} className="text-white" />
                  ) : (
                    <BookOpen size={18} style={{ color: g.mastery === 'learning' ? 'white' : 'var(--text-tertiary)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)' }}>
                      {g.pattern}
                    </span>
                    <Badge variant={g.mastery === 'mastered' ? 'success' : g.mastery === 'learning' ? 'primary' : 'default'}>
                      {g.mastery}
                    </Badge>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {g.meaning}
                  </p>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                </motion.div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-5 pt-1 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                      {/* Formation */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                          Formation
                        </div>
                        <div
                          className="text-sm font-mono px-3 py-2 rounded-lg"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                        >
                          {g.formation}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                          Explanation
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {g.explanation}
                        </p>
                      </div>

                      {/* Examples */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                          Examples
                        </div>
                        <div className="space-y-2">
                          {g.examples.map((ex, ei) => (
                            <div key={ei} className="rounded-lg p-3" style={{ background: 'var(--bg-tertiary)' }}>
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)' }}>
                                {ex.jp}
                              </p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                {ex.en}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {g.notes && (
                        <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                          <span className="text-xs mt-0.5">💡</span>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {g.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
