import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  BookOpen,
  PenTool,
  FileText,
  Trophy,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Star,
  Zap,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { generateQuizQuestions, type QuizQuestion } from '../../stores/quizStore';
import { useUserStore } from '../../stores/userStore';

// ── Types ──────────────────────────────────────────────────

type ExamScreen = 'setup' | 'exam' | 'results';
type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

interface ExamAnswer {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

interface SectionInfo {
  name: string;
  nameJp: string;
  icon: typeof BookOpen;
  range: [number, number];
  category: 'vocab' | 'kanji' | 'grammar';
}

// ── Constants ──────────────────────────────────────────────

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
const TOTAL_QUESTIONS = 30;
const QUESTIONS_PER_SECTION = 10;
const TIME_LIMIT_SECONDS = 30 * 60; // 30 minutes
const PASSING_SCORE = 60;
const AUTO_ADVANCE_MS = 800;

const SECTIONS: SectionInfo[] = [
  { name: 'Vocabulary', nameJp: '語彙', icon: BookOpen, range: [0, 9], category: 'vocab' },
  { name: 'Kanji', nameJp: '漢字', icon: PenTool, range: [10, 19], category: 'kanji' },
  { name: 'Grammar', nameJp: '文法', icon: FileText, range: [20, 29], category: 'grammar' },
];

function getCurrentSection(questionIndex: number): SectionInfo {
  for (const section of SECTIONS) {
    if (questionIndex >= section.range[0] && questionIndex <= section.range[1]) {
      return section;
    }
  }
  return SECTIONS[0];
}

function getSectionIndex(questionIndex: number): number {
  if (questionIndex <= 9) return 0;
  if (questionIndex <= 19) return 1;
  return 2;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── Setup Screen ───────────────────────────────────────────

function ExamSetup({
  selectedLevel,
  onSelectLevel,
  onStart,
}: {
  selectedLevel: JLPTLevel;
  onSelectLevel: (l: JLPTLevel) => void;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-2xl mx-auto"
    >
      {/* Title */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Shield size={32} style={{ color: 'var(--accent-primary)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            JLPT Mock Exam
          </h1>
        </div>
        <p
          className="text-xl"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-japanese)' }}
        >
          模擬試験
        </p>
      </motion.div>

      {/* Level Selector */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label
          className="text-sm font-medium mb-4 block text-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          Select JLPT Level
        </label>
        <div className="flex justify-center gap-3">
          {JLPT_LEVELS.map((level) => (
            <motion.button
              key={level}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectLevel(level)}
              className="px-6 py-3 rounded-full text-base font-bold transition-all duration-200 cursor-pointer min-w-[64px]"
              style={{
                background:
                  selectedLevel === level ? 'var(--gradient-primary)' : 'var(--bg-card)',
                color: selectedLevel === level ? '#fff' : 'var(--text-secondary)',
                border: `2px solid ${selectedLevel === level ? 'transparent' : 'var(--border-primary)'}`,
                boxShadow: selectedLevel === level ? 'var(--shadow-md)' : 'none',
              }}
            >
              {level}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Exam Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card padding="lg" className="mb-8">
          <h3
            className="text-lg font-semibold mb-5 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
            Exam Details
          </h3>

          <div className="space-y-4">
            {/* Questions breakdown */}
            <div
              className="flex items-start justify-between p-3 rounded-xl"
              style={{ background: 'var(--bg-hover)' }}
            >
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Total Questions
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Vocabulary: 10 · Kanji: 10 · Grammar: 10
                </div>
              </div>
              <Badge variant="primary" size="md">
                30
              </Badge>
            </div>

            {/* Time limit */}
            <div
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'var(--bg-hover)' }}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: 'var(--accent-secondary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Time Limit
                </span>
              </div>
              <Badge variant="default" size="md">
                30 minutes
              </Badge>
            </div>

            {/* Passing score */}
            <div
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'var(--bg-hover)' }}
            >
              <div className="flex items-center gap-2">
                <Star size={16} style={{ color: '#f59e0b' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Passing Score
                </span>
              </div>
              <Badge variant="success" size="md">
                60%
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Start button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          size="lg"
          onClick={onStart}
          className="w-full text-lg py-4"
          leftIcon={<Sparkles size={20} />}
        >
          Start Exam
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ── Section Transition Card ────────────────────────────────

function SectionTransition({
  section,
  sectionNumber,
  onContinue,
}: {
  section: SectionInfo;
  sectionNumber: number;
  onContinue: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(onContinue, 2000);
    return () => clearTimeout(timeout);
  }, [onContinue]);

  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <Card padding="lg" className="text-center max-w-sm w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
          className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Icon size={36} className="text-white" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm font-medium mb-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Section {sectionNumber}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {section.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-japanese)' }}
        >
          {section.nameJp}
        </motion.p>
      </Card>
    </motion.div>
  );
}

// ── Active Exam Screen ─────────────────────────────────────

function ActiveExam({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[];
  onFinish: (answers: ExamAnswer[], timeTaken: number) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT_SECONDS);
  const [showSectionTransition, setShowSectionTransition] = useState(true);
  const [lastSectionIndex, setLastSectionIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  // Timer logic
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-finish when timer hits 0
  useEffect(() => {
    if (timeRemaining === 0) {
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onFinish(answers, timeTaken);
    }
  }, [timeRemaining, answers, onFinish]);

  const currentSectionIndex = getSectionIndex(currentQuestion);
  const currentSection = getCurrentSection(currentQuestion);
  const question = questions[currentQuestion];
  const questionInSection = currentQuestion - currentSection.range[0] + 1;

  const handleAnswer = useCallback(
    (answer: string) => {
      if (showFeedback || !question) return;

      const isCorrect = answer === question.correctAnswer;
      setSelectedAnswer(answer);
      setShowFeedback(true);

      const newAnswer: ExamAnswer = {
        questionIndex: currentQuestion,
        selectedAnswer: answer,
        isCorrect,
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      setTimeout(() => {
        const nextQuestion = currentQuestion + 1;

        if (nextQuestion >= TOTAL_QUESTIONS) {
          // Exam complete
          if (timerRef.current) clearInterval(timerRef.current);
          const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
          onFinish(updatedAnswers, timeTaken);
          return;
        }

        const nextSectionIdx = getSectionIndex(nextQuestion);
        if (nextSectionIdx !== currentSectionIndex) {
          setLastSectionIndex(nextSectionIdx);
          setShowSectionTransition(true);
        }

        setCurrentQuestion(nextQuestion);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }, AUTO_ADVANCE_MS);
    },
    [showFeedback, question, currentQuestion, answers, onFinish, currentSectionIndex]
  );

  const handleSectionContinue = useCallback(() => {
    setShowSectionTransition(false);
  }, []);

  // Show section transition
  if (showSectionTransition) {
    const transitionSection = SECTIONS[lastSectionIndex] || SECTIONS[0];
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <SectionTransition
            key={`section-${lastSectionIndex}`}
            section={transitionSection}
            sectionNumber={lastSectionIndex + 1}
            onContinue={handleSectionContinue}
          />
        </AnimatePresence>
      </div>
    );
  }

  if (!question) return null;

  const timerIsLow = timeRemaining <= 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 max-w-2xl mx-auto"
    >
      {/* Top Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          {/* Section name */}
          <div className="flex items-center gap-2">
            <currentSection.icon size={16} style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {currentSection.name}
            </span>
            <Badge variant="default" size="sm">
              {questionInSection}/{QUESTIONS_PER_SECTION}
            </Badge>
          </div>

          {/* Question counter */}
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Question {currentQuestion + 1}/{TOTAL_QUESTIONS}
          </span>

          {/* Timer */}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold"
            style={{
              background: timerIsLow ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-hover)',
              color: timerIsLow ? '#ef4444' : 'var(--text-primary)',
            }}
            animate={timerIsLow ? { scale: [1, 1.05, 1] } : {}}
            transition={timerIsLow ? { repeat: Infinity, duration: 1 } : {}}
          >
            <Clock size={14} />
            {formatTime(timeRemaining)}
          </motion.div>
        </div>

        {/* Progress bar */}
        <ProgressBar
          value={currentQuestion}
          max={TOTAL_QUESTIONS}
          size="sm"
          gradient="var(--gradient-primary)"
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          <Card padding="lg" className="mb-6 text-center">
            <div className="text-xs font-medium mb-4 flex items-center justify-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
              {currentSection.name} · Multiple Choice
            </div>
            {question.promptJp && (
              <div
                className="text-4xl font-bold mb-3"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)' }}
              >
                {question.promptJp}
              </div>
            )}
            <div className="text-base" style={{ color: 'var(--text-secondary)' }}>
              {question.prompt}
            </div>
          </Card>

          {/* Options Grid (2x2) */}
          {question.options && (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option, i) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === question.correctAnswer;

                let bg = 'var(--bg-card)';
                let borderColor = 'var(--border-primary)';
                let textColor = 'var(--text-primary)';

                if (showFeedback) {
                  if (isCorrect) {
                    bg = 'rgba(34, 197, 94, 0.1)';
                    borderColor = '#22c55e';
                    textColor = '#22c55e';
                  } else if (isSelected && !isCorrect) {
                    bg = 'rgba(239, 68, 68, 0.1)';
                    borderColor = '#ef4444';
                    textColor = '#ef4444';
                  }
                }

                return (
                  <motion.button
                    key={i}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.97 } : {}}
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    className="p-4 rounded-xl text-left font-medium transition-all duration-200 cursor-pointer flex items-center gap-3"
                    style={{
                      background: bg,
                      border: `2px solid ${borderColor}`,
                      color: textColor,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background:
                          showFeedback && isCorrect
                            ? '#22c55e'
                            : showFeedback && isSelected && !isCorrect
                              ? '#ef4444'
                              : 'var(--bg-hover)',
                        color:
                          showFeedback && (isCorrect || (isSelected && !isCorrect))
                            ? '#fff'
                            : 'var(--text-tertiary)',
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span
                      className="flex-1 text-sm"
                      style={{
                        fontFamily: option.match(/[\u3000-\u9fff]/)
                          ? 'var(--font-japanese)'
                          : 'inherit',
                      }}
                    >
                      {option}
                    </span>
                    {showFeedback && isCorrect && <CheckCircle2 size={18} className="flex-shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle size={18} className="flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ── Circular Score Display ─────────────────────────────────

function CircularScore({ percentage, passed }: { percentage: number; passed: boolean }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className="relative w-44 h-44 mx-auto"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
    >
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth="10"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={passed ? '#22c55e' : '#ef4444'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span
          className="text-4xl font-bold"
          style={{ color: passed ? '#22c55e' : '#ef4444' }}
        >
          {percentage}%
        </span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          Score
        </span>
      </motion.div>
    </motion.div>
  );
}

// ── Results Screen ─────────────────────────────────────────

function ExamResults({
  questions,
  answers,
  timeTaken,
  level,
  onTryAgain,
  onDashboard,
}: {
  questions: QuizQuestion[];
  answers: ExamAnswer[];
  timeTaken: number;
  level: JLPTLevel;
  onTryAgain: () => void;
  onDashboard: () => void;
}) {
  const addXP = useUserStore((s) => s.addXP);
  const [showReview, setShowReview] = useState(false);
  const confettiFired = useRef(false);

  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  const percentage = Math.round((totalCorrect / TOTAL_QUESTIONS) * 100);
  const passed = percentage >= PASSING_SCORE;
  const xpEarned = totalCorrect * 2;

  // Section scores
  const sectionScores = useMemo(
    () =>
      SECTIONS.map((section) => {
        const sectionAnswers = answers.filter(
          (a) => a.questionIndex >= section.range[0] && a.questionIndex <= section.range[1]
        );
        const correct = sectionAnswers.filter((a) => a.isCorrect).length;
        return { ...section, correct, total: QUESTIONS_PER_SECTION };
      }),
    [answers]
  );

  // Add XP and fire confetti on mount
  useEffect(() => {
    if (!confettiFired.current) {
      confettiFired.current = true;
      addXP(xpEarned);

      if (passed) {
        const duration = 2500;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'],
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    }
  }, [passed, xpEarned, addXP]);

  const formattedTime = formatTime(timeTaken);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-6 max-w-2xl mx-auto"
    >
      {/* Score Card */}
      <Card padding="lg" className="mb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {passed ? '🎉 Congratulations!' : 'Keep Studying!'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            JLPT {level} Mock Exam Results
          </p>
        </motion.div>

        <CircularScore percentage={percentage} passed={passed} />

        <motion.div
          className="mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Badge variant={passed ? 'success' : 'danger'} size="md" className="text-base px-5 py-1.5">
            {passed ? '✅ PASSED' : '❌ FAILED'}
          </Badge>
        </motion.div>
      </Card>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {[
          {
            label: 'Correct',
            value: `${totalCorrect}/${TOTAL_QUESTIONS}`,
            icon: <CheckCircle2 size={18} />,
            color: '#22c55e',
          },
          {
            label: 'Time Taken',
            value: formattedTime,
            icon: <Clock size={18} />,
            color: 'var(--accent-secondary)',
          },
          {
            label: 'XP Earned',
            value: `+${xpEarned}`,
            icon: <Zap size={18} />,
            color: '#f59e0b',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <Card padding="md" className="text-center">
              <div className="flex justify-center mb-2" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {stat.label}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Section Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card padding="lg" className="mb-6">
          <h3
            className="text-base font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <Trophy size={16} style={{ color: 'var(--accent-primary)' }} />
            Section Breakdown
          </h3>
          <div className="space-y-5">
            {sectionScores.map((section, i) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: 'var(--accent-primary)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {section.name}
                      </span>
                      <span
                        className="text-xs"
                        style={{
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-japanese)',
                        }}
                      >
                        {section.nameJp}
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {section.correct}/{section.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={section.correct}
                    max={section.total}
                    size="md"
                    showPercentage
                    gradient={
                      section.correct >= 8
                        ? 'var(--gradient-success)'
                        : section.correct >= 6
                          ? 'var(--gradient-primary)'
                          : 'linear-gradient(135deg, #ef4444, #dc2626)'
                    }
                  />
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Review Answers */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card padding="md" className="mb-6">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full flex items-center justify-between cursor-pointer"
            style={{ background: 'transparent', border: 'none' }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Review Answers
            </span>
            {showReview ? (
              <ChevronUp size={18} style={{ color: 'var(--text-tertiary)' }} />
            ) : (
              <ChevronDown size={18} style={{ color: 'var(--text-tertiary)' }} />
            )}
          </button>

          <AnimatePresence>
            {showReview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-2">
                  {questions.map((q, i) => {
                    const answer = answers.find((a) => a.questionIndex === i);
                    const isCorrect = answer?.isCorrect ?? false;

                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-lg text-sm"
                        style={{ background: 'var(--bg-hover)' }}
                      >
                        <span className="text-xs font-mono w-6 text-center flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                          {i + 1}
                        </span>
                        {isCorrect ? (
                          <CheckCircle2 size={16} style={{ color: '#22c55e' }} className="flex-shrink-0" />
                        ) : (
                          <XCircle size={16} style={{ color: '#ef4444' }} className="flex-shrink-0" />
                        )}
                        <span
                          className="flex-1 truncate"
                          style={{
                            color: 'var(--text-primary)',
                            fontFamily: q.promptJp ? 'var(--font-japanese)' : 'inherit',
                          }}
                        >
                          {q.promptJp || q.prompt}
                        </span>
                        {!isCorrect && answer && (
                          <span
                            className="text-xs line-through mr-1"
                            style={{ color: '#ef4444' }}
                          >
                            {answer.selectedAnswer}
                          </span>
                        )}
                        <span className="text-xs font-medium flex-shrink-0" style={{ color: '#22c55e' }}>
                          {q.correctAnswer}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Button
          variant="secondary"
          size="lg"
          onClick={onTryAgain}
          leftIcon={<RotateCcw size={18} />}
          className="flex-1"
        >
          Try Again
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onDashboard}
          leftIcon={<ArrowLeft size={18} />}
          className="flex-1"
        >
          Back to Dashboard
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ── Main MockExamPage ──────────────────────────────────────

export function MockExamPage() {
  const [screen, setScreen] = useState<ExamScreen>('setup');
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [examAnswers, setExamAnswers] = useState<ExamAnswer[]>([]);
  const [timeTaken, setTimeTaken] = useState(0);

  const handleStart = useCallback(() => {
    // Generate 10 questions per section
    const vocabQuestions = generateQuizQuestions(
      QUESTIONS_PER_SECTION,
      selectedLevel,
      ['vocab'],
      ['multiple-choice']
    );
    const kanjiQuestions = generateQuizQuestions(
      QUESTIONS_PER_SECTION,
      selectedLevel,
      ['kanji'],
      ['multiple-choice']
    );
    const grammarQuestions = generateQuizQuestions(
      QUESTIONS_PER_SECTION,
      selectedLevel,
      ['grammar'],
      ['multiple-choice']
    );

    const allQuestions = [...vocabQuestions, ...kanjiQuestions, ...grammarQuestions];
    setQuestions(allQuestions);
    setExamAnswers([]);
    setTimeTaken(0);
    setScreen('exam');
  }, [selectedLevel]);

  const handleFinish = useCallback((answers: ExamAnswer[], time: number) => {
    setExamAnswers(answers);
    setTimeTaken(time);
    setScreen('results');
  }, []);

  const handleTryAgain = useCallback(() => {
    setScreen('setup');
    setQuestions([]);
    setExamAnswers([]);
    setTimeTaken(0);
  }, []);

  const handleDashboard = useCallback(() => {
    // Navigate back — in the app context this would use router
    // For now, reset to setup
    window.history.back();
  }, []);

  return (
    <AnimatePresence mode="wait">
      {screen === 'setup' && (
        <ExamSetup
          key="setup"
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onStart={handleStart}
        />
      )}
      {screen === 'exam' && (
        <ActiveExam
          key="exam"
          questions={questions}
          onFinish={handleFinish}
        />
      )}
      {screen === 'results' && (
        <ExamResults
          key="results"
          questions={questions}
          answers={examAnswers}
          timeTaken={timeTaken}
          level={selectedLevel}
          onTryAgain={handleTryAgain}
          onDashboard={handleDashboard}
        />
      )}
    </AnimatePresence>
  );
}

export default MockExamPage;
