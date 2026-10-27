import React, { useState, useEffect } from 'react';
import { INITIAL_CVC_WORDS } from '../../data/phonicsData';
import { CVCWordItem } from '../../types/phonics';
import { WordIllustration } from '../common/WordIllustrations';
import { soundManager } from '../../services/audioService';
import { addGameResults } from '../../services/playerService';
import { Volume2, Star, CheckCircle2, XCircle, ArrowRight, Award, Target } from 'lucide-react';

interface MissingLetterShootoutProps {
  onBackToHome: () => void;
  onRefreshProfile: () => void;
}

type ChallengeType = 'beginning' | 'middle' | 'ending';

interface QuestionItem {
  wordItem: CVCWordItem;
  type: ChallengeType;
  missingIndex: number; // 0, 1, or 2
  correctLetter: string;
  options: string[];
}

export const MissingLetterShootout: React.FC<MissingLetterShootoutProps> = ({
  onBackToHome,
  onRefreshProfile,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  // Stats by challenge type
  const [typeStats, setTypeStats] = useState({
    beginning: { correct: 0, total: 0 },
    middle: { correct: 0, total: 0 },
    ending: { correct: 0, total: 0 },
  });

  useEffect(() => {
    restartShootout();
  }, []);

  const restartShootout = () => {
    const wordPool = [...INITIAL_CVC_WORDS].sort(() => Math.random() - 0.5).slice(0, 9);
    const types: ChallengeType[] = ['beginning', 'middle', 'ending'];

    const generated: QuestionItem[] = wordPool.map((w, idx) => {
      const type = types[idx % 3];
      const missingIndex = type === 'beginning' ? 0 : type === 'middle' ? 1 : 2;
      const correctLetter = w.letters[missingIndex];

      // Options
      let distractorPool: string[];
      if (type === 'middle') {
        distractorPool = ['a', 'e', 'i', 'o', 'u'].filter(v => v !== correctLetter);
      } else {
        distractorPool = ['s', 't', 'p', 'n', 'm', 'c', 'd', 'b', 'r', 'h'].filter(c => c !== correctLetter);
      }
      const distractors = distractorPool.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [correctLetter, ...distractors].sort(() => Math.random() - 0.5);

      return {
        wordItem: w,
        type,
        missingIndex,
        correctLetter,
        options,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setIsFinished(false);
    setSelectedLetter(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setTypeStats({
      beginning: { correct: 0, total: 0 },
      middle: { correct: 0, total: 0 },
      ending: { correct: 0, total: 0 },
    });
  };

  const currentQ = questions[currentIndex];

  const handleHearWord = async () => {
    if (!currentQ) return;
    setAudioNotice(null);
    const res = await soundManager.playPhonicsItem(currentQ.wordItem.id, currentQ.wordItem.word);
    if (!res.success && res.message) {
      setAudioNotice(res.message);
    }
  };

  const handleShoot = (letter: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedLetter(letter);
    setIsAnswered(true);
    setIsShooting(true);

    const match = letter.toLowerCase() === currentQ.correctLetter.toLowerCase();
    setIsCorrect(match);

    // Update challenge type stats
    setTypeStats(prev => ({
      ...prev,
      [currentQ.type]: {
        total: prev[currentQ.type].total + 1,
        correct: prev[currentQ.type].correct + (match ? 1 : 0),
      },
    }));

    soundManager.playKick();

    setTimeout(() => {
      setIsShooting(false);
      if (match) {
        soundManager.playGoalCheer();
        setScore(prev => prev + 10);
        setCorrectCount(prev => prev + 1);
      } else {
        soundManager.playIncorrect();
      }
    }, 600);
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedLetter(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setAudioNotice(null);
    } else {
      const finalPoints = score + 10; // bonus
      addGameResults({
        activity: 'shootout',
        pointsEarned: finalPoints,
        questionsAttempted: questions.length,
        questionsCorrect: correctCount,
        goalsScored: correctCount,
      });
      onRefreshProfile();
      soundManager.playMadridFanfare();
      setIsFinished(true);
    }
  };

  if (!currentQ) {
    return <div className="p-8 text-center text-slate-600">Loading Bernabéu Shootout...</div>;
  }

  const { wordItem, type, missingIndex } = currentQ;

  const challengeLabel =
    type === 'beginning'
      ? 'First Sound'
      : type === 'middle'
      ? 'Middle Vowel'
      : 'Ending Sound';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Real Madrid Bernabéu Header */}
      <div className="flex items-center justify-between bg-[#001A49] border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-lg mb-6 text-white">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Estadio Santiago Bernabéu · Fondo Norte</span>
            <span className="text-purple-300">·</span>
            <span className="text-white/80 font-medium">Activity 2</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Missing Letter Shootout
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#001233] border border-amber-400/40 text-amber-300 px-3.5 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm">
            <Star className="text-amber-400 fill-amber-400" size={16} />
            <span className="tabular-nums font-mono font-black">+{score} pts</span>
          </div>
          <button
            onClick={onBackToHome}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-400/40 bg-[#0C2340] text-slate-100 hover:bg-[#15345c] transition-colors"
          >
            Exit to Academy
          </button>
        </div>
      </div>

      {!isFinished ? (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Target size={14} className="text-amber-500" />
                Shot {currentIndex + 1} of {questions.length} · Focus: <strong className="text-slate-900">{challengeLabel}</strong>
              </span>
              <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Goal & Target Visual Stage */}
          <div className="relative bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white border-4 border-emerald-950 shadow-inner overflow-hidden mb-8">
            {/* Net Grid overlay */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Top Crossbar & Goalposts frame */}
            <div className="absolute top-2 left-6 right-6 h-3 bg-white/90 rounded-sm shadow-md" />
            <div className="absolute top-2 left-6 w-3 bottom-6 bg-white/90 rounded-sm shadow-md" />
            <div className="absolute top-2 right-6 w-3 bottom-6 bg-white/90 rounded-sm shadow-md" />

            {/* Target Card with Picture */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
              <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-amber-400 flex flex-col items-center justify-center text-slate-900 min-w-[150px]">
                <WordIllustration name={wordItem.svgIcon} size={110} />
                <button
                  onClick={handleHearWord}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors"
                >
                  <Volume2 size={14} className="text-amber-600" /> Listen
                </button>
              </div>

              {/* Word Display with Missing Slot */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider mb-2">
                  Complete the word: {challengeLabel}
                </span>

                <div className="flex items-center gap-2 sm:gap-3 my-2">
                  {wordItem.letters.map((char, i) => {
                    const isMissing = i === missingIndex;
                    return (
                      <div
                        key={i}
                        className={`w-14 h-16 sm:w-18 sm:h-20 rounded-2xl flex items-center justify-center font-mono font-black text-3xl sm:text-4xl shadow-md border-3 transition-all ${
                          isMissing
                            ? selectedLetter
                              ? isCorrect
                                ? 'bg-emerald-500 border-white text-white'
                                : 'bg-rose-500 border-white text-white'
                              : 'bg-amber-400 border-dashed border-white text-slate-950 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        {isMissing ? (selectedLetter ? selectedLetter.toUpperCase() : '?') : char.toUpperCase()}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-emerald-100 font-medium mt-1">
                  Which letter belongs in the golden box?
                </p>

                {audioNotice && (
                  <div className="mt-2 text-xs bg-amber-500/20 text-amber-200 px-3 py-1 rounded-md">
                    {audioNotice}
                  </div>
                )}
              </div>
            </div>

            {/* Ball shoot animation indicator */}
            <div
              className={`mx-auto w-10 h-10 rounded-full bg-white border-2 border-slate-900 shadow-lg flex items-center justify-center font-bold text-xs transition-transform duration-500 ${
                isShooting ? '-translate-y-16 scale-125' : ''
              }`}
            >
              ⚽
            </div>
          </div>

          {/* Letter Options on Football Targets */}
          <div className="mb-8">
            <h3 className="text-center text-sm font-bold text-slate-700 mb-4">
              Select your shot target:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {currentQ.options.map((opt) => {
                const isSelected = selectedLetter === opt;
                const isTargetLetter = opt.toLowerCase() === currentQ.correctLetter.toLowerCase();

                let style = 'bg-slate-50 border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-900';
                if (isAnswered) {
                  if (isTargetLetter) {
                    style = 'bg-emerald-500 border-emerald-600 text-white shadow-lg ring-4 ring-emerald-300';
                  } else if (isSelected) {
                    style = 'bg-rose-500 border-rose-600 text-white';
                  } else {
                    style = 'opacity-40 bg-slate-100 border-slate-200 text-slate-400';
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleShoot(opt)}
                    disabled={isAnswered || isShooting}
                    className={`h-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center transition-all transform active:scale-95 focus:outline-none ${style}`}
                    aria-label={`Shoot letter ${opt.toUpperCase()}`}
                  >
                    <span className="text-3xl sm:text-4xl font-black font-mono">
                      {opt.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-bold mt-1 opacity-75">
                      Target #{opt.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer Feedback */}
          {isAnswered && (
            <div className={`p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
              isCorrect ? 'bg-emerald-50 border border-emerald-300' : 'bg-amber-50 border border-amber-300'
            }`}>
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <CheckCircle2 size={32} className="text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle size={32} className="text-amber-600 flex-shrink-0" />
                )}
                <div>
                  <div className="text-base font-black text-slate-900">
                    {isCorrect ? 'GOAL! Top Corner Strike!' : 'Saved by the Keeper!'}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    {isCorrect
                      ? `"${wordItem.word.toUpperCase()}" starts with or contains letter "${currentQ.correctLetter.toUpperCase()}". +10 pts!`
                      : `The correct missing letter was "${currentQ.correctLetter.toUpperCase()}" to make "${wordItem.word.toUpperCase()}".`}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-sm"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Shot' : 'Finish Shootout'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 text-center shadow-sm">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 border-2 border-amber-300">
            <Award size={48} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Shootout Trophy Awarded
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Penalty Shootout Champion!
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            You scored {correctCount} out of {questions.length} penalty goals! Here is your phonics sound breakdown:
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto my-6">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase">First Sound</div>
              <div className="text-lg font-black text-slate-900 mt-1">
                {typeStats.beginning.correct}/{typeStats.beginning.total}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Middle Vowel</div>
              <div className="text-lg font-black text-slate-900 mt-1">
                {typeStats.middle.correct}/{typeStats.middle.total}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Ending Sound</div>
              <div className="text-lg font-black text-slate-900 mt-1">
                {typeStats.ending.correct}/{typeStats.ending.total}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={restartShootout}
              className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              Play Again
            </button>
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Back to Academy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
