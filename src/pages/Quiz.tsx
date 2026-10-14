import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, Brain, Sparkles } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { quizzes } from '../data/quizzes';
import { CATEGORY_LABELS } from '../types';
import type { MissionCategory } from '../types';

const categoryEmojis: Record<MissionCategory, string> = {
  waste: '♻️', energy: '⚡', water: '💧',
  transport: '🚲', consumption: '🛍️', nature: '🌿',
};

type QuizState = 'list' | 'playing' | 'result';

export function Quiz() {
  const { completeQuiz, isQuizCompleted, progress } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<MissionCategory | 'all'>('all');
  const [state, setState] = useState<QuizState>('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ correct: number; total: number; xp: number }>({ correct: 0, total: 0, xp: 0 });
  const [currentQuizSet, setCurrentQuizSet] = useState<typeof quizzes>([]);

  const filteredQuizzes = useMemo(() => {
    if (selectedCategory === 'all') return quizzes;
    return quizzes.filter((q) => q.category === selectedCategory);
  }, [selectedCategory]);

  const completedCount = quizzes.filter((q) => isQuizCompleted(q.id)).length;
  const correctCount = (progress.quizCompletions || []).filter((q) => q.correct).length;

  const startQuiz = (category: MissionCategory | 'all') => {
    const available = category === 'all'
      ? quizzes.filter((q) => !isQuizCompleted(q.id))
      : quizzes.filter((q) => q.category === category && !isQuizCompleted(q.id));

    if (available.length === 0) return;

    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 5);
    setCurrentQuizSet(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setSessionResults({ correct: 0, total: 0, xp: 0 });
    setState('playing');
  };

  const handleAnswer = (choiceIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choiceIndex);
    setShowExplanation(true);

    const q = currentQuizSet[currentIndex];
    const correct = choiceIndex === q.correctIndex;
    completeQuiz(q.id, correct, q.xp);

    setSessionResults((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
      xp: prev.xp + (correct ? q.xp : 0),
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < currentQuizSet.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setState('result');
    }
  };

  if (state === 'playing' && currentQuizSet.length > 0) {
    const q = currentQuizSet[currentIndex];
    const isCorrect = selectedAnswer === q.correctIndex;

    return (
      <div className="animate-fade-in">
        <div className="dark-header px-4 pt-6 pb-5 rounded-b-[28px]">
          <button onClick={() => setState('list')} className="flex items-center gap-1 text-green-300 font-medium text-sm mb-3 py-1">
            <ArrowLeft size={18} /><span>ออกจากควิซ</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">ข้อ {currentIndex + 1}/{currentQuizSet.length}</h1>
            <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-green-300">
              {categoryEmojis[q.category]} {CATEGORY_LABELS[q.category]}
            </span>
          </div>
          <div className="bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
            <motion.div className="bg-green-400 h-full rounded-full" initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / currentQuizSet.length) * 100}%` }} />
          </div>
        </div>

        <div className="px-4 -mt-3 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-green-50 p-5 mb-4 shadow-sm">
            <p className="text-base font-bold text-green-900 leading-relaxed">{q.question}</p>
          </div>

          <div className="space-y-2 mb-4">
            {q.choices.map((choice, i) => {
              let style = 'bg-white border-gray-100';
              if (selectedAnswer !== null) {
                if (i === q.correctIndex) style = 'bg-green-50 border-green-400 ring-2 ring-green-400';
                else if (i === selectedAnswer && !isCorrect) style = 'bg-rose-50 border-rose-400 ring-2 ring-rose-400';
              }
              return (
                <motion.button key={i} whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(i)} disabled={selectedAnswer !== null}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${style}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">{choice}</span>
                    {selectedAnswer !== null && i === q.correctIndex && <CheckCircle2 size={18} className="text-green-500 ml-auto shrink-0" />}
                    {selectedAnswer !== null && i === selectedAnswer && !isCorrect && i !== q.correctIndex && <XCircle size={18} className="text-rose-500 ml-auto shrink-0" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`rounded-2xl p-4 mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-rose-50 border border-rose-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? <CheckCircle2 size={16} className="text-green-600" /> : <XCircle size={16} className="text-rose-600" />}
                  <span className={`font-bold text-sm ${isCorrect ? 'text-green-700' : 'text-rose-700'}`}>
                    {isCorrect ? `ถูกต้อง! +${q.xp} XP` : 'ไม่ถูกต้อง'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedAnswer !== null && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={nextQuestion}
              className="w-full text-white py-3 rounded-xl font-bold text-sm shadow-md"
              style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
              {currentIndex < currentQuizSet.length - 1 ? 'ข้อถัดไป' : 'ดูผลลัพธ์'}
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  if (state === 'result') {
    const pct = sessionResults.total > 0 ? Math.round((sessionResults.correct / sessionResults.total) * 100) : 0;
    return (
      <div className="animate-fade-in">
        <div className="dark-header px-4 pt-8 pb-8 rounded-b-[28px] text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3"
              style={{ background: pct >= 60 ? 'rgba(134, 239, 172, 0.2)' : 'rgba(251, 191, 36, 0.2)' }}>
              <span className="text-4xl">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</span>
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">{pct >= 80 ? 'ยอดเยี่ยม!' : pct >= 60 ? 'ดีมาก!' : 'พยายามต่อ!'}</h1>
          <p className="text-green-300/60 text-sm">ตอบถูก {sessionResults.correct} จาก {sessionResults.total} ข้อ ({pct}%)</p>
        </div>

        <div className="px-4 -mt-3 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-green-50 p-5 mb-4 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-500" />
              <span className="text-2xl font-extrabold text-green-800">+{sessionResults.xp} XP</span>
            </div>
            <p className="text-xs text-gray-400">ได้รับจากการตอบถูก</p>
          </div>

          <button onClick={() => setState('list')}
            className="w-full text-white py-3 rounded-xl font-bold text-sm shadow-md mb-3"
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
            กลับหน้าควิซ
          </button>
        </div>
      </div>
    );
  }

  const categories: (MissionCategory | 'all')[] = ['all', 'waste', 'energy', 'water', 'transport', 'consumption', 'nature'];
  const catLabels: Record<string, string> = { all: 'ทั้งหมด', ...CATEGORY_LABELS };
  const catEmojis: Record<string, string> = { all: '📚', ...categoryEmojis };

  const availableInCategory = filteredQuizzes.filter((q) => !isQuizCompleted(q.id)).length;

  return (
    <div className="animate-fade-in">
      <div className="dark-header px-4 pt-8 pb-6 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">ควิซสิ่งแวดล้อม</h1>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
            <Brain size={14} className="text-green-300" />
            <span className="text-white text-sm font-bold">{correctCount}</span>
            <span className="text-white/40 text-sm">/ {quizzes.length}</span>
          </div>
        </div>
        <p className="text-sm text-green-300/60 mb-3">ทดสอบความรู้ด้านสิ่งแวดล้อม รับ XP จากการตอบถูก</p>
        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
          <div className="bg-green-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / quizzes.length) * 100}%` }} />
        </div>
        <p className="text-[10px] text-green-300/40 mt-1">ทำแล้ว {completedCount}/{quizzes.length} ข้อ</p>
      </div>

      <div className="px-4 -mt-3 max-w-lg mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat ? 'text-white shadow-md' : 'bg-gray-100 text-gray-500'
              }`}
              style={selectedCategory === cat ? { background: 'linear-gradient(135deg, #16a34a, #22c55e)' } : {}}>
              {catEmojis[cat]} {catLabels[cat]}
            </button>
          ))}
        </div>

        {availableInCategory > 0 ? (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => startQuiz(selectedCategory)}
            className="w-full text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg mb-4"
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
            <div className="flex items-center justify-center gap-2">
              <Brain size={18} />
              <span>เริ่มทำควิซ ({availableInCategory} ข้อที่ยังไม่ได้ทำ)</span>
            </div>
          </motion.button>
        ) : (
          <div className="bg-green-50 rounded-2xl p-4 mb-4 text-center border border-green-100">
            <CheckCircle2 size={24} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-semibold">ทำครบทุกข้อในหมวดนี้แล้ว!</p>
          </div>
        )}

        <div className="space-y-2 mb-4">
          {filteredQuizzes.map((q) => {
            const done = isQuizCompleted(q.id);
            const record = (progress.quizCompletions || []).find((c) => c.quizId === q.id);
            return (
              <div key={q.id} className={`bg-white rounded-xl border p-3 ${done ? 'border-green-100' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${done ? '' : 'bg-gray-100'}`}
                    style={done ? { background: record?.correct ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fef2f2, #fecaca)' } : {}}>
                    {done ? (record?.correct ? '✅' : '❌') : catEmojis[q.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">{CATEGORY_LABELS[q.category]}</span>
                      {done && record?.correct && (
                        <span className="text-[10px] text-green-600 font-bold">+{q.xp} XP</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
