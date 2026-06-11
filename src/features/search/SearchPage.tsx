import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, BookOpen, Languages, FileText, Pen } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { VOCAB_DATA } from '../../data/vocabData';
import { KANJI_DATA } from '../../data/kanjiData';
import { GRAMMAR_DATA } from '../../data/grammarData';
import { READING_DATA } from '../../data/readingData';

type Category = 'all' | 'vocabulary' | 'kanji' | 'grammar' | 'reading';

interface SearchResult {
  type: 'vocabulary' | 'kanji' | 'grammar' | 'reading';
  id: number;
  data: unknown;
}

const CATEGORY_TABS: { key: Category; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🔍' },
  { key: 'vocabulary', label: 'Vocabulary', icon: '📚' },
  { key: 'kanji', label: 'Kanji', icon: '漢' },
  { key: 'grammar', label: 'Grammar', icon: '文' },
  { key: 'reading', label: 'Reading', icon: '📖' },
];

const MAX_PER_CATEGORY = 50;

const jlptVariant = (level: string): 'primary' | 'success' | 'warning' | 'danger' | 'default' => {
  switch (level) {
    case 'N5': return 'success';
    case 'N4': return 'primary';
    case 'N3': return 'warning';
    case 'N2': return 'danger';
    case 'N1': return 'danger';
    default: return 'default';
  }
};

export function SearchPage() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search with 200ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Filter results using useMemo
  const vocabResults = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return VOCAB_DATA
      .filter(v =>
        v.word.toLowerCase().includes(q) ||
        v.reading.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q)
      )
      .slice(0, MAX_PER_CATEGORY)
      .map(v => ({ type: 'vocabulary' as const, id: v.id, data: v }));
  }, [debouncedQuery]);

  const kanjiResults = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return KANJI_DATA
      .filter(k =>
        k.character.toLowerCase().includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.onyomi.toLowerCase().includes(q) ||
        k.kunyomi.toLowerCase().includes(q)
      )
      .slice(0, MAX_PER_CATEGORY)
      .map(k => ({ type: 'kanji' as const, id: k.id, data: k }));
  }, [debouncedQuery]);

  const grammarResults = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return GRAMMAR_DATA
      .filter(g =>
        g.pattern.toLowerCase().includes(q) ||
        g.meaning.toLowerCase().includes(q)
      )
      .slice(0, MAX_PER_CATEGORY)
      .map(g => ({ type: 'grammar' as const, id: g.id, data: g }));
  }, [debouncedQuery]);

  const readingResults = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return READING_DATA
      .filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.titleJp.toLowerCase().includes(q)
      )
      .slice(0, MAX_PER_CATEGORY)
      .map(r => ({ type: 'reading' as const, id: r.id, data: r }));
  }, [debouncedQuery]);

  const counts = useMemo(() => ({
    all: vocabResults.length + kanjiResults.length + grammarResults.length + readingResults.length,
    vocabulary: vocabResults.length,
    kanji: kanjiResults.length,
    grammar: grammarResults.length,
    reading: readingResults.length,
  }), [vocabResults, kanjiResults, grammarResults, readingResults]);

  const filteredResults = useMemo<SearchResult[]>(() => {
    switch (activeCategory) {
      case 'vocabulary': return vocabResults;
      case 'kanji': return kanjiResults;
      case 'grammar': return grammarResults;
      case 'reading': return readingResults;
      default: return [...vocabResults, ...kanjiResults, ...grammarResults, ...readingResults];
    }
  }, [activeCategory, vocabResults, kanjiResults, grammarResults, readingResults]);

  const handleClear = () => {
    setInputValue('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2.5rem 1.5rem 1.5rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}
        >
          Search
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-japanese)',
            color: 'var(--text-tertiary)',
            fontSize: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          検索
        </p>

        {/* Search Input */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '36rem',
          }}
        >
          <Search
            size={22}
            style={{
              position: 'absolute',
              left: '1.125rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Search vocabulary, kanji, grammar..."
            style={{
              width: '100%',
              padding: '1rem 3rem 1rem 3.25rem',
              fontSize: '1.125rem',
              borderRadius: '1rem',
              border: '2px solid var(--border-primary)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: 'var(--shadow-md)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.15)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          />
          <AnimatePresence>
            {inputValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '1.75rem',
                  height: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Category Filter Tabs - only show when there's a query */}
        {debouncedQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              marginBottom: '1rem',
              scrollbarWidth: 'none',
            }}
          >
            {CATEGORY_TABS.map(tab => {
              const isActive = activeCategory === tab.key;
              const count = counts[tab.key];
              return (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    background: isActive ? 'var(--gradient-primary)' : 'var(--bg-card)',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    ...(
                      !isActive ? { border: '1px solid var(--border-primary)' } : {}
                    ),
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-tertiary)',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Result Stats */}
        {debouncedQuery && counts.all > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {counts.all} result{counts.all !== 1 ? 's' : ''} found
            </span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>·</span>
            {counts.vocabulary > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                📚 {counts.vocabulary} vocab
              </span>
            )}
            {counts.kanji > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                漢 {counts.kanji} kanji
              </span>
            )}
            {counts.grammar > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                文 {counts.grammar} grammar
              </span>
            )}
            {counts.reading > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                📖 {counts.reading} reading
              </span>
            )}
          </motion.div>
        )}

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {!debouncedQuery ? (
            /* Empty State: No Query */
            <motion.div
              key="empty-initial"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                textAlign: 'center',
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <Search size={32} style={{ color: 'var(--accent-primary)' }} />
              </motion.div>
              <h2
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Search TrioLingo++
              </h2>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-tertiary)',
                  maxWidth: '24rem',
                  lineHeight: 1.6,
                }}
              >
                Search across vocabulary, kanji, grammar points, and reading passages
              </p>
            </motion.div>
          ) : filteredResults.length === 0 ? (
            /* Empty State: No Results */
            <motion.div
              key="empty-no-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <Search size={32} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <h2
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                No results found
              </h2>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-tertiary)',
                  maxWidth: '24rem',
                }}
              >
                No matches for "<strong style={{ color: 'var(--text-secondary)' }}>{debouncedQuery}</strong>"
              </p>
            </motion.div>
          ) : (
            /* Results List */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              {filteredResults.map((result, index) => (
                <motion.div
                  key={`${result.type}-${result.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.8), duration: 0.35 }}
                  whileHover={{ y: -2 }}
                >
                  <ResultCard result={result} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Result Card Component ──────────────────────────── */

function ResultCard({ result }: { result: SearchResult }) {
  switch (result.type) {
    case 'vocabulary':
      return <VocabCard data={result.data as typeof VOCAB_DATA[0]} />;
    case 'kanji':
      return <KanjiCard data={result.data as typeof KANJI_DATA[0]} />;
    case 'grammar':
      return <GrammarCard data={result.data as typeof GRAMMAR_DATA[0]} />;
    case 'reading':
      return <ReadingCard data={result.data as typeof READING_DATA[0]} />;
  }
}

/* ─── Vocab Card ─────────────────────────────────────── */

function VocabCard({ data }: { data: typeof VOCAB_DATA[0] }) {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vocabulary
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-japanese)',
                fontSize: '1.375rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {data.word}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-japanese)',
                fontSize: '0.875rem',
                color: 'var(--text-tertiary)',
              }}
            >
              {data.reading}
            </span>
          </div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: 0 }}>
            {data.meaning}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
          <Badge variant={jlptVariant(data.jlptLevel)}>{data.jlptLevel}</Badge>
          <Badge variant="default">{data.partOfSpeech}</Badge>
        </div>
      </div>
    </div>
  );
}

/* ─── Kanji Card ─────────────────────────────────────── */

function KanjiCard({ data }: { data: typeof KANJI_DATA[0] }) {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Large Kanji Character */}
        <div
          style={{
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '0.75rem',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-japanese)',
              fontSize: '2.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {data.character}
          </span>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Languages size={14} style={{ color: 'var(--accent-secondary)' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Kanji
            </span>
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.375rem' }}>
            {data.meaning}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            {data.onyomi && (
              <span>
                <strong style={{ color: 'var(--text-secondary)' }}>音:</strong>{' '}
                <span style={{ fontFamily: 'var(--font-japanese)' }}>{data.onyomi}</span>
              </span>
            )}
            {data.kunyomi && (
              <span>
                <strong style={{ color: 'var(--text-secondary)' }}>訓:</strong>{' '}
                <span style={{ fontFamily: 'var(--font-japanese)' }}>{data.kunyomi}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
          <Badge variant={jlptVariant(data.jlptLevel)}>{data.jlptLevel}</Badge>
          <Badge variant="default">
            <Pen size={10} /> {data.strokeCount} strokes
          </Badge>
        </div>
      </div>
    </div>
  );
}

/* ─── Grammar Card ───────────────────────────────────── */

function GrammarCard({ data }: { data: typeof GRAMMAR_DATA[0] }) {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <FileText size={14} style={{ color: 'var(--accent-tertiary)' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Grammar
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-japanese)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 0.25rem',
            }}
          >
            {data.pattern}
          </p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: '0 0 0.375rem' }}>
            {data.meaning}
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-tertiary)',
              margin: 0,
              fontFamily: 'var(--font-japanese)',
            }}
          >
            {data.formation}
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Badge variant={jlptVariant(data.jlptLevel)}>{data.jlptLevel}</Badge>
        </div>
      </div>
    </div>
  );
}

/* ─── Reading Card ───────────────────────────────────── */

function ReadingCard({ data }: { data: typeof READING_DATA[0] }) {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <BookOpen size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reading
            </span>
          </div>
          <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            {data.title}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-japanese)',
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
              margin: '0 0 0.5rem',
            }}
          >
            {data.titleJp}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant="default">{data.topic}</Badge>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {data.wordCount} words
            </span>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Badge variant={jlptVariant(data.jlptLevel)}>{data.jlptLevel}</Badge>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
