import React, { useState, useEffect } from 'react';
import { INITIAL_PHONEMES } from '../../data/phonicsData';
import { PhonemeItem } from '../../types/phonics';
import { soundManager } from '../../services/audioService';
import { addGameResults } from '../../services/playerService';
import { Volume2, RotateCcw, CheckCircle2, XCircle, Star, ArrowRight, Award } from 'lucide-react';

interface SoundDetectiveProps {
  onBackToHome: () => void;
  onRefreshProfile: () => void;
}

export const SoundDetective: React.FC<SoundDetectiveProps> = ({ onBackToHome, onRefreshProfile }) => {
  const [questionList, setQuestionList] = useState<PhonemeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Session stats
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize randomized questions
  useEffect(() => {
    restartGame();
  }, []);

  const restartGame = () => {
    const shuffled = [...INITIAL_PHONEMES].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestionList(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setIsFinished(false);
    setupQuestion(shuffled[0], shuffled);
  };

  const setupQuestion = (target: PhonemeItem, all: PhonemeItem[]) => {
    setSelectedLetter(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setAudioNotice(null);

    // Pick 3 distractors
    const otherLetters = all
      .filter(p => p.letter !== target.letter)
      .map(p => p.letter);
    const uniqueOthers = Array.from(new Set(otherLetters)).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [target.letter, ...uniqueOthers].sort(() => Math.random() - 0.5);
    setOptions(opts);

    // Auto-play sound initially
    setTimeout(() => {
      playSound(target);
    }, 250);
  };

  const playSound = async (item: PhonemeItem) => {
    setIsPlayingAudio(true);
    setAudioNotice(null);
    const res = await soundManager.playPhonicsItem(item.id, item.phoneme);
    setIsPlayingAudio(false);
    if (!res.success && res.message) {
      setAudioNotice(res.message);
    }
  };

  const currentItem = questionList[currentIndex];

  const handleSelectOption = (letter: string) => {
    if (isAnswered || !currentItem) return;

    setSelectedLetter(letter);
    setIsAnswered(true);

    const match = letter.toLowerCase() === currentItem.letter.toLowerCase();
    setIsCorrect(match);

    if (match) {
      soundManager.playCorrect();
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
    } else {
      soundManager.playIncorrect();
    }
  };

  const handleNextQuestion = () => {
    soundManager.playClick();
    if (currentIndex + 1 < questionList.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setupQuestion(questionList[nextIdx], questionList);
    } else {
      // Finished
      const finalCorrect = correctCount + (isCorrect ? 1 : 0);
      const finalPoints = score + (isCorrect ? 10 : 0) + 10; // 10 pts completion bonus
      addGameResults({
        activity: 'sound_detective',
        pointsEarned: finalPoints,
        questionsAttempted: questionList.length,
        questionsCorrect: finalCorrect,
      });
      onRefreshProfile();
      soundManager.playMadridFanfare();
      setIsFinished(true);
    }
  };

  if (!currentItem) {
    return <div className="p-8 text-center text-slate-600">Loading Valdebebas Sound Lab...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Real Madrid Valdebebas Top Header */}
      <div className="flex items-center justify-between bg-[#001A49] border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-lg mb-6 text-white">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Ciudad Real Madrid · Valdebebas</span>
            <span className="text-purple-300">·</span>
            <span className="text-white/80 font-medium">Activity 1</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sound Detective
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
              <span>Challenge {currentIndex + 1} of {questionList.length}</span>
              <span>{Math.round(((currentIndex + 1) / questionList.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questionList.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Sound listening laboratory box */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-center text-white relative overflow-hidden mb-8 border border-amber-500/20 shadow-inner">
            <div className="absolute top-3 left-4 text-[11px] font-bold tracking-widest text-amber-400 uppercase">
              Target Sound Transmitter
            </div>

            <p className="text-slate-300 text-sm font-medium mt-3 mb-4">
              Press the golden speaker to hear the letter sound. Find which letter makes this sound!
            </p>

            {/* Big Speaker Button */}
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                onClick={() => playSound(currentItem)}
                disabled={isPlayingAudio}
                className={`relative group p-6 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/30 transform active:scale-95 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${
                  isPlayingAudio ? 'animate-pulse ring-4 ring-amber-300' : 'hover:scale-105'
                }`}
                aria-label={`Listen to sound for ${currentItem.letter}`}
              >
                <Volume2 size={48} className={isPlayingAudio ? 'animate-bounce' : ''} />
              </button>

              <button
                onClick={() => playSound(currentItem)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 underline-offset-4"
              >
                <RotateCcw size={13} /> Replay sound
              </button>
            </div>

            {/* Missing audio banner if applicable */}
            {audioNotice && (
              <div className="mt-4 inline-block bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold px-4 py-1.5 rounded-lg">
                {audioNotice}
              </div>
            )}
          </div>

          {/* Instruction */}
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              Which letter makes this sound?
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Tap the correct letter card below
            </p>
          </div>

          {/* 4 Large Letter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {options.map((letter) => {
              const isSelected = selectedLetter === letter;
              const isTargetLetter = letter.toLowerCase() === currentItem.letter.toLowerCase();

              let cardStyle = 'bg-white border-2 border-slate-200 hover:border-amber-400 hover:shadow-md text-slate-900';
              if (isAnswered) {
                if (isTargetLetter) {
                  cardStyle = 'bg-emerald-50 border-3 border-emerald-500 text-emerald-950 shadow-md ring-2 ring-emerald-400/30';
                } else if (isSelected) {
                  cardStyle = 'bg-rose-50 border-3 border-rose-500 text-rose-950 shadow-md';
                } else {
                  cardStyle = 'opacity-40 border-slate-200 bg-slate-50';
                }
              }

              return (
                <button
                  key={letter}
                  onClick={() => handleSelectOption(letter)}
                  disabled={isAnswered}
                  className={`h-28 sm:h-36 rounded-2xl flex flex-col items-center justify-center transition-all transform active:scale-95 focus:outline-none ${cardStyle}`}
                  aria-label={`Letter ${letter.toUpperCase()}`}
                >
                  <span className="text-4xl sm:text-5xl font-black font-mono">
                    {letter}
                  </span>
                  <span className="text-xs font-bold text-slate-500 mt-1 uppercase">
                    / {letter.toUpperCase()} /
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Action area */}
          {isAnswered && (
            <div className={`p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
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
                    {isCorrect ? 'Goal! Brilliant Listening!' : 'Good Try, Detective!'}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    {isCorrect
                      ? `Letter "${currentItem.letter}" makes the sound ${currentItem.phoneme} as in "${currentItem.exampleWord}". (+10 pts)`
                      : `The sound was ${currentItem.phoneme} represented by letter "${currentItem.letter}". Let's practise!`}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-sm"
              >
                <span>{currentIndex + 1 < questionList.length ? 'Next Challenge' : 'Complete Activity'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Game Over / Results Summary */
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 text-center shadow-sm">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 border-2 border-amber-300">
            <Award size={48} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Academy Badge Earned
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Sound Detective Complete!
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            You completed all phoneme challenges with great accuracy! Your points have been added to the Academy Leaderboard.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto my-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <div className="text-xs text-slate-500 font-semibold">Total Points</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">+{score + 10}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Correct</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums">
                {correctCount} / {questionList.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Accuracy</div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 tabular-nums">
                {Math.round((correctCount / questionList.length) * 100)}%
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={restartGame}
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
