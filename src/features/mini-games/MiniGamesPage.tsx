import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Trophy, Target, RotateCcw, CheckCircle2, XCircle, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { VOCAB_DATA } from '../../data/vocabData';
import { KANJI_DATA } from '../../data/kanjiData';

// ─── Types ───────────────────────────────────────────────────
type GameState = 'hub' | 'word-match' | 'kanji-memory' | 'speed-type' | 'results';

interface GameResult {
  game: string;
  score: number;
  maxScore: number;
  time: number;
  extra?: string; // e.g. moves or accuracy
}

// ─── Helpers ─────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fireConfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } }), 250);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getN5Vocab(count: number) {
  const n5 = VOCAB_DATA.filter((w) => w.jlptLevel === 'N5');
  return shuffle(n5).slice(0, count);
}

function getN5Kanji(count: number) {
  const n5 = KANJI_DATA.filter((k) => k.jlptLevel === 'N5');
  return shuffle(n5).slice(0, count);
}

// ─── Game Hub ────────────────────────────────────────────────
const GAMES = [
  {
    id: 'word-match' as const,
    title: 'Word Match',
    titleJp: '単語マッチ',
    icon: '🎯',
    description: 'Match Japanese words with their English meanings',
    gradient: 'var(--gradient-primary)',
  },
  {
    id: 'kanji-memory' as const,
    title: 'Kanji Memory',
    titleJp: '漢字メモリー',
    icon: '🧠',
    description: 'Flip cards to match kanji with meanings',
    gradient: 'var(--gradient-accent)',
  },
  {
    id: 'speed-type' as const,
    title: 'Speed Type',
    titleJp: 'スピードタイプ',
    icon: '⚡',
    description: 'Type the meaning before time runs out',
    gradient: 'var(--gradient-success)',
  },
];

function GameHub({ onSelectGame }: { onSelectGame: (id: GameState) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <motion.h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Mini Games
        </motion.h1>
        <motion.p
          style={{
            fontFamily: 'var(--font-japanese)',
            fontSize: '1.1rem',
            color: 'var(--text-tertiary)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ミニゲーム
        </motion.p>
      </div>

      {/* Game Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: game.gradient,
              border: 'none',
              borderRadius: 'var(--radius-xl, 16px)',
              padding: '36px 28px',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'white',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative circle */}
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
              }}
            />
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{game.icon}</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 4 }}>{game.title}</h3>
            <p
              style={{
                fontFamily: 'var(--font-japanese)',
                fontSize: '0.85rem',
                opacity: 0.85,
                marginBottom: 12,
              }}
            >
              {game.titleJp}
            </p>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.4 }}>{game.description}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Results Screen ──────────────────────────────────────────
function ResultsScreen({
  result,
  onPlayAgain,
  onBackToHub,
}: {
  result: GameResult;
  onPlayAgain: () => void;
  onBackToHub: () => void;
}) {
  const isPerfect = result.score === result.maxScore;

  useEffect(() => {
    if (isPerfect) fireConfetti();
  }, [isPerfect]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}
    >
      <Card padding="lg">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
          style={{ fontSize: '3.5rem', marginBottom: 16 }}
        >
          {isPerfect ? '🎉' : '🏆'}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}
        >
          {isPerfect ? 'Perfect Score!' : 'Game Complete!'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ color: 'var(--text-secondary)', marginBottom: 24, fontFamily: 'var(--font-japanese)' }}
        >
          {result.game}
        </motion.p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '16px 24px',
              minWidth: 100,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
              <Trophy size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>SCORE</span>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {result.score}/{result.maxScore}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '16px 24px',
              minWidth: 100,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
              <Clock size={16} style={{ color: 'var(--accent-secondary)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TIME</span>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatTime(result.time)}
            </span>
          </motion.div>

          {result.extra && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg, 12px)',
                padding: '16px 24px',
                minWidth: 100,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
                <Target size={16} style={{ color: 'var(--accent-tertiary)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>DETAIL</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.extra}</span>
            </motion.div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="secondary" onClick={onBackToHub} leftIcon={<ArrowLeft size={16} />}>
            Back to Hub
          </Button>
          <Button variant="primary" onClick={onPlayAgain} leftIcon={<RotateCcw size={16} />}>
            Play Again
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Game Header ─────────────────────────────────────────────
function GameHeader({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={18} />
        </Button>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {children && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{children}</div>}
    </div>
  );
}

// ─── GAME 1: Word Match ──────────────────────────────────────
function WordMatchGame({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: (result: GameResult) => void;
}) {
  const [pairs] = useState(() => {
    const words = getN5Vocab(6);
    return words.map((w) => ({ id: w.id, word: w.word, reading: w.reading, meaning: w.meaning }));
  });
  const [shuffledMeanings] = useState(() => shuffle(pairs.map((p) => ({ id: p.id, meaning: p.meaning }))));
  const [selectedJp, setSelectedJp] = useState<number | null>(null);
  const [selectedEn, setSelectedEn] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ jp: number; en: number } | null>(null);
  const [score, setScore] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (matched.size === pairs.length) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime, matched.size, pairs.length]);

  // Check match
  useEffect(() => {
    if (selectedJp !== null && selectedEn !== null) {
      if (selectedJp === selectedEn) {
        // correct
        setMatched((prev) => new Set(prev).add(selectedJp));
        setScore((s) => s + 1);
        setSelectedJp(null);
        setSelectedEn(null);
      } else {
        // wrong
        setWrongPair({ jp: selectedJp, en: selectedEn });
        const t = setTimeout(() => {
          setWrongPair(null);
          setSelectedJp(null);
          setSelectedEn(null);
        }, 600);
        return () => clearTimeout(t);
      }
    }
  }, [selectedJp, selectedEn]);

  // Done
  useEffect(() => {
    if (matched.size === pairs.length && pairs.length > 0) {
      const t = setTimeout(
        () =>
          onFinish({
            game: '単語マッチ — Word Match',
            score,
            maxScore: pairs.length,
            time: elapsed,
          }),
        600,
      );
      return () => clearTimeout(t);
    }
  }, [matched.size, pairs.length, score, elapsed, onFinish]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <GameHeader title="🎯 Word Match" onBack={onBack}>
        <Badge variant="primary" size="md">
          <Trophy size={14} /> {score}/{pairs.length}
        </Badge>
        <Badge variant="default" size="md">
          <Clock size={14} /> {formatTime(elapsed)}
        </Badge>
      </GameHeader>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          maxWidth: 700,
          margin: '0 auto',
        }}
      >
        {/* Japanese Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            Japanese
          </p>
          {pairs.map((p) => {
            const isMatched = matched.has(p.id);
            const isSelected = selectedJp === p.id;
            const isWrong = wrongPair?.jp === p.id;
            return (
              <AnimatePresence key={p.id}>
                {!isMatched ? (
                  <motion.button
                    layout
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    animate={
                      isWrong
                        ? { x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } }
                        : { x: 0 }
                    }
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => !wrongPair && setSelectedJp(p.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: `2px solid ${isSelected ? 'var(--accent-primary)' : isWrong ? '#ef4444' : 'var(--border-primary)'}`,
                      background: isSelected
                        ? 'rgba(99,102,241,0.1)'
                        : isWrong
                          ? 'rgba(239,68,68,0.1)'
                          : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.15)' : 'var(--shadow-sm)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-japanese)',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {p.word}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-japanese)',
                        marginTop: 2,
                      }}
                    >
                      {p.reading}
                    </span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0.3 }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: '2px solid rgba(34,197,94,0.4)',
                      background: 'rgba(34,197,94,0.08)',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-japanese)',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {p.word} ✓
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>

        {/* English Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            English
          </p>
          {shuffledMeanings.map((m) => {
            const isMatched = matched.has(m.id);
            const isSelected = selectedEn === m.id;
            const isWrong = wrongPair?.en === m.id;
            return (
              <AnimatePresence key={m.id}>
                {!isMatched ? (
                  <motion.button
                    layout
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    animate={
                      isWrong
                        ? { x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } }
                        : { x: 0 }
                    }
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => !wrongPair && setSelectedEn(m.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: `2px solid ${isSelected ? 'var(--accent-primary)' : isWrong ? '#ef4444' : 'var(--border-primary)'}`,
                      background: isSelected
                        ? 'rgba(99,102,241,0.1)'
                        : isWrong
                          ? 'rgba(239,68,68,0.1)'
                          : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.15)' : 'var(--shadow-sm)',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {m.meaning}
                    </span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0.3 }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: '2px solid rgba(34,197,94,0.4)',
                      background: 'rgba(34,197,94,0.08)',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                      {m.meaning} ✓
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── GAME 2: Kanji Memory ────────────────────────────────────
interface MemoryCard {
  uid: string;
  pairId: number;
  display: string;
  type: 'kanji' | 'meaning';
}

function KanjiMemoryGame({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: (result: GameResult) => void;
}) {
  const [cards] = useState<MemoryCard[]>(() => {
    const kanji = getN5Kanji(6);
    const cardList: MemoryCard[] = [];
    kanji.forEach((k) => {
      cardList.push({ uid: `k-${k.id}`, pairId: k.id, display: k.character, type: 'kanji' });
      cardList.push({ uid: `m-${k.id}`, pairId: k.id, display: k.meaning, type: 'meaning' });
    });
    return shuffle(cardList);
  });

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);

  const totalPairs = 6;

  // Timer
  useEffect(() => {
    if (matchedIds.size === totalPairs) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime, matchedIds.size]);

  // Check match when 2 cards are flipped
  useEffect(() => {
    if (flipped.length === 2) {
      setLockBoard(true);
      setMoves((m) => m + 1);

      const [first, second] = flipped;
      const c1 = cards.find((c) => c.uid === first)!;
      const c2 = cards.find((c) => c.uid === second)!;

      if (c1.pairId === c2.pairId && c1.type !== c2.type) {
        // Match!
        setTimeout(() => {
          setMatchedIds((prev) => new Set(prev).add(c1.pairId));
          setFlipped([]);
          setLockBoard(false);
        }, 400);
      } else {
        // No match - flip back
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, 1000);
      }
    }
  }, [flipped, cards]);

  // Done
  useEffect(() => {
    if (matchedIds.size === totalPairs && totalPairs > 0) {
      const t = setTimeout(
        () =>
          onFinish({
            game: '漢字メモリー — Kanji Memory',
            score: totalPairs,
            maxScore: totalPairs,
            time: elapsed,
            extra: `${moves} moves`,
          }),
        700,
      );
      return () => clearTimeout(t);
    }
  }, [matchedIds.size, totalPairs, elapsed, moves, onFinish]);

  const handleFlip = (uid: string) => {
    if (lockBoard) return;
    if (flipped.includes(uid)) return;
    const card = cards.find((c) => c.uid === uid)!;
    if (matchedIds.has(card.pairId)) return;
    setFlipped((prev) => (prev.length < 2 ? [...prev, uid] : prev));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <GameHeader title="🧠 Kanji Memory" onBack={onBack}>
        <Badge variant="default" size="md">
          <Target size={14} /> {moves} moves
        </Badge>
        <Badge variant="success" size="md">
          <CheckCircle2 size={14} /> {matchedIds.size}/{totalPairs}
        </Badge>
        <Badge variant="default" size="md">
          <Clock size={14} /> {formatTime(elapsed)}
        </Badge>
      </GameHeader>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          maxWidth: 560,
          margin: '0 auto',
        }}
      >
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.uid);
          const isMatchedCard = matchedIds.has(card.pairId);
          const showFace = isFlipped || isMatchedCard;

          return (
            <motion.button
              key={card.uid}
              onClick={() => handleFlip(card.uid)}
              whileHover={!showFace ? { scale: 1.05 } : undefined}
              whileTap={!showFace ? { scale: 0.95 } : undefined}
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-lg, 12px)',
                border: `2px solid ${isMatchedCard ? 'rgba(34,197,94,0.5)' : isFlipped ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                background: showFace
                  ? isMatchedCard
                    ? 'rgba(34,197,94,0.08)'
                    : 'var(--bg-card)'
                  : 'var(--gradient-primary)',
                cursor: showFace ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
                boxShadow: isMatchedCard ? '0 0 12px rgba(34,197,94,0.2)' : 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.3s, background 0.3s',
              }}
            >
              <AnimatePresence mode="wait">
                {showFace ? (
                  <motion.span
                    key="face"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      fontFamily: card.type === 'kanji' ? 'var(--font-japanese)' : 'inherit',
                      fontSize: card.type === 'kanji' ? '2rem' : '0.75rem',
                      fontWeight: card.type === 'kanji' ? 700 : 600,
                      color: isMatchedCard ? 'rgba(34,197,94,0.7)' : 'var(--text-primary)',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                    }}
                  >
                    {card.display}
                  </motion.span>
                ) : (
                  <motion.span
                    key="back"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      fontFamily: 'var(--font-japanese)',
                      fontSize: '1.5rem',
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 700,
                    }}
                  >
                    漢
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── GAME 3: Speed Type ──────────────────────────────────────
const SPEED_TYPE_ROUNDS = 10;
const SECONDS_PER_ROUND = 10;

function SpeedTypeGame({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: (result: GameResult) => void;
}) {
  const [words] = useState(() => getN5Vocab(SPEED_TYPE_ROUNDS));
  const [currentRound, setCurrentRound] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_ROUND);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const currentWord = words[currentRound];
  const isGameOver = currentRound >= SPEED_TYPE_ROUNDS;

  // Focus input
  useEffect(() => {
    if (!isGameOver && !feedback) {
      inputRef.current?.focus();
    }
  }, [currentRound, isGameOver, feedback]);

  // Countdown
  useEffect(() => {
    if (isGameOver || feedback) return;
    setTimeLeft(SECONDS_PER_ROUND);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time's up
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound, isGameOver, feedback]);

  const handleTimeout = useCallback(() => {
    setFeedback('wrong');
    setShowAnswer(true);
    setTimeout(() => goToNext(), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound]);

  const goToNext = useCallback(() => {
    setFeedback(null);
    setShowAnswer(false);
    setInput('');

    if (currentRound + 1 >= SPEED_TYPE_ROUNDS) {
      setCurrentRound(currentRound + 1);
    } else {
      setCurrentRound((r) => r + 1);
    }
  }, [currentRound, startTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback || isGameOver) return;
    clearInterval(timerRef.current);

    const answer = input.trim().toLowerCase();
    const correct = currentWord.meaning.toLowerCase();

    // check if answer matches (allow partial match for compound meanings like "to eat")
    const correctParts = correct.split(',').map((s) => s.trim());
    const isCorrect = correctParts.some(
      (part) => part === answer || part.startsWith(answer) || answer.startsWith(part),
    );

    if (isCorrect) {
      setFeedback('correct');
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      setTimeout(() => goToNext(), 800);
    } else {
      setFeedback('wrong');
      setShowAnswer(true);
      setTimeout(() => goToNext(), 1500);
    }
  };

  // Handle game over
  useEffect(() => {
    if (isGameOver) {
      const finalTime = Math.floor((Date.now() - startTime) / 1000);
      const accuracy = Math.round((correctCount / SPEED_TYPE_ROUNDS) * 100);
      const t = setTimeout(
        () =>
          onFinish({
            game: 'スピードタイプ — Speed Type',
            score,
            maxScore: SPEED_TYPE_ROUNDS * 10,
            time: finalTime,
            extra: `${accuracy}%`,
          }),
        500,
      );
      return () => clearTimeout(t);
    }
  }, [isGameOver, score, correctCount, startTime, onFinish]);

  if (isGameOver) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Calculating results...</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <GameHeader title="⚡ Speed Type" onBack={onBack}>
        <Badge variant="primary" size="md">
          <Zap size={14} /> {score} pts
        </Badge>
        <Badge variant="default" size="md">
          Round {currentRound + 1}/{SPEED_TYPE_ROUNDS}
        </Badge>
      </GameHeader>

      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Timer Bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: 'var(--bg-tertiary)',
            marginBottom: 28,
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / SECONDS_PER_ROUND) * 100}%` }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{
              height: '100%',
              borderRadius: 3,
              background:
                timeLeft > 5
                  ? 'var(--gradient-success)'
                  : timeLeft > 2
                    ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                    : 'linear-gradient(90deg, #ef4444, #dc2626)',
            }}
          />
        </div>

        {/* Word Display */}
        <Card padding="lg">
          <motion.div
            key={currentRound}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ textAlign: 'center' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-japanese)',
                fontSize: '2.8rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              {currentWord.word}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-japanese)',
                fontSize: '1.1rem',
                color: 'var(--text-tertiary)',
                marginBottom: 24,
              }}
            >
              {currentWord.reading}
            </p>

            {/* Timer display */}
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color:
                    timeLeft > 5
                      ? 'var(--text-secondary)'
                      : timeLeft > 2
                        ? '#f59e0b'
                        : '#ef4444',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {timeLeft}s
              </span>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit}>
              <motion.div
                animate={
                  feedback === 'wrong'
                    ? { x: [0, -8, 8, -6, 6, 0] }
                    : feedback === 'correct'
                      ? { scale: [1, 1.03, 1] }
                      : {}
                }
                transition={{ duration: 0.4 }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!!feedback}
                  placeholder="Type the English meaning..."
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-lg, 12px)',
                    border: `2px solid ${
                      feedback === 'correct'
                        ? '#22c55e'
                        : feedback === 'wrong'
                          ? '#ef4444'
                          : 'var(--border-primary)'
                    }`,
                    background:
                      feedback === 'correct'
                        ? 'rgba(34,197,94,0.08)'
                        : feedback === 'wrong'
                          ? 'rgba(239,68,68,0.08)'
                          : 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '1.05rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                />
              </motion.div>
            </form>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {feedback === 'correct' ? (
                    <>
                      <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>Correct! +10</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} style={{ color: '#ef4444' }} />
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        {showAnswer ? `Answer: ${currentWord.meaning}` : 'Wrong!'}
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Card>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export function MiniGamesPage() {
  const [gameState, setGameState] = useState<GameState>('hub');
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [gameKey, setGameKey] = useState(0); // used to force remount for "play again"

  const handleSelectGame = (id: GameState) => {
    setGameState(id);
    setGameResult(null);
    setGameKey((k) => k + 1);
  };

  const handleFinish = useCallback((result: GameResult) => {
    setGameResult(result);
    setGameState('results');
  }, []);

  const handlePlayAgain = () => {
    if (gameResult) {
      const gameId = gameResult.game.includes('Word Match')
        ? 'word-match'
        : gameResult.game.includes('Kanji')
          ? 'kanji-memory'
          : 'speed-type';
      handleSelectGame(gameId as GameState);
    }
  };

  const handleBackToHub = () => {
    setGameState('hub');
    setGameResult(null);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        {gameState === 'hub' && <GameHub key="hub" onSelectGame={handleSelectGame} />}

        {gameState === 'word-match' && (
          <WordMatchGame key={`wm-${gameKey}`} onBack={handleBackToHub} onFinish={handleFinish} />
        )}

        {gameState === 'kanji-memory' && (
          <KanjiMemoryGame key={`km-${gameKey}`} onBack={handleBackToHub} onFinish={handleFinish} />
        )}

        {gameState === 'speed-type' && (
          <SpeedTypeGame key={`st-${gameKey}`} onBack={handleBackToHub} onFinish={handleFinish} />
        )}

        {gameState === 'results' && gameResult && (
          <ResultsScreen
            key="results"
            result={gameResult}
            onPlayAgain={handlePlayAgain}
            onBackToHub={handleBackToHub}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MiniGamesPage;
