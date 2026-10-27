import React, { useState, useEffect } from 'react';
import { FootballCanvas } from './FootballCanvas';
import { INITIAL_PHONEMES, INITIAL_CVC_WORDS } from '../../data/phonicsData';
import { soundManager } from '../../services/audioService';
import { addGameResults } from '../../services/playerService';
import {
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface WordBuilderCupProps {
  onBackToHome: () => void;
  onRefreshProfile: () => void;
}

export const WordBuilderCup: React.FC<WordBuilderCupProps> = ({
  onBackToHome,
  onRefreshProfile,
}) => {
  // Game states: 'ready' | 'playing' | 'paused' | 'phonics_challenge' | 'finished'
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'phonics_challenge' | 'finished'>('ready');

  // Match statistics
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [matchTime, setMatchTime] = useState(90); // 90 match seconds
  const [passesCount, setPassesCount] = useState(0);
  const [phonicsPoints, setPhonicsPoints] = useState(0);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  const [speedBoostTimer, setSpeedBoostTimer] = useState(0);

  // Phonics stats
  const [phonicsAttempted, setPhonicsAttempted] = useState(0);
  const [phonicsCorrect, setPhonicsCorrect] = useState(0);

  // Active Phonics Challenge Modal State
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);
  const [challengeTargetPhoneme, setChallengeTargetPhoneme] = useState(INITIAL_PHONEMES[0]);
  const [challengeTargetWord, setChallengeTargetWord] = useState(INITIAL_CVC_WORDS[0]);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [challengeAnswered, setChallengeAnswered] = useState(false);
  const [challengeIsCorrect, setChallengeIsCorrect] = useState(false);
  const [blendingStep, setBlendingStep] = useState<number>(-1);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  // Match timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setMatchTime(prev => {
          if (prev <= 1) {
            handleMatchEnd();
            return 0;
          }
          return prev - 1;
        });

        // Speed boost countdown
        if (speedBoostTimer > 0) {
          setSpeedBoostTimer(t => {
            if (t <= 1) {
              setSpeedBoostActive(false);
              return 0;
            }
            return t - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, speedBoostTimer]);

  // Handle ESC key for pausing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
          soundManager.playClick();
        } else if (gameState === 'paused') {
          setGameState('playing');
          soundManager.playClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleStartMatch = () => {
    soundManager.playWhistle();
    setPlayerScore(0);
    setOpponentScore(0);
    setMatchTime(90);
    setPassesCount(0);
    setPhonicsPoints(0);
    setPhonicsAttempted(0);
    setPhonicsCorrect(0);
    setSpeedBoostActive(false);
    setGameState('playing');
  };

  const handleGoalScored = (team: 'player' | 'opponent') => {
    if (team === 'player') {
      setPlayerScore(p => p + 1);
      setPhonicsPoints(pts => pts + 25);
    } else {
      setOpponentScore(o => o + 1);
    }
  };

  const handlePassCompleted = () => {
    setPassesCount(p => p + 1);
    setPhonicsPoints(pts => pts + 2);
  };

  const handleTriggerPhonicsChallenge = (stage: 1 | 2 | 3) => {
    setActiveStage(stage);
    setChallengeAnswered(false);
    setChallengeIsCorrect(false);
    setAudioNotice(null);
    setBlendingStep(-1);

    if (stage === 1) {
      // Sound Striker: phoneme challenge
      const target = INITIAL_PHONEMES[Math.floor(Math.random() * INITIAL_PHONEMES.length)];
      setChallengeTargetPhoneme(target);
      const others = INITIAL_PHONEMES.filter(p => p.letter !== target.letter).map(p => p.letter);
      const distractors = Array.from(new Set(others)).sort(() => Math.random() - 0.5).slice(0, 3);
      setChallengeOptions([target.letter, ...distractors].sort(() => Math.random() - 0.5));
      setTimeout(() => {
        soundManager.playPhonicsItem(target.id, target.phoneme);
      }, 300);
    } else if (stage === 2) {
      // CVC Goal Challenge: missing letter
      const targetWord = INITIAL_CVC_WORDS[Math.floor(Math.random() * INITIAL_CVC_WORDS.length)];
      setChallengeTargetWord(targetWord);
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const correctVowel = targetWord.letters[1];
      const dist = vowels.filter(v => v !== correctVowel).sort(() => Math.random() - 0.5).slice(0, 3);
      setChallengeOptions([correctVowel, ...dist].sort(() => Math.random() - 0.5));
      setTimeout(() => {
        soundManager.playPhonicsItem(targetWord.id, targetWord.word);
      }, 300);
    } else {
      // Word Builder Cup Final: Blending sequence
      const targetWord = INITIAL_CVC_WORDS[Math.floor(Math.random() * INITIAL_CVC_WORDS.length)];
      setChallengeTargetWord(targetWord);
      const otherWords = INITIAL_CVC_WORDS.filter(w => w.word !== targetWord.word).map(w => w.word);
      const dist = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
      setChallengeOptions([targetWord.word, ...dist].sort(() => Math.random() - 0.5));
    }

    setGameState('phonics_challenge');
  };

  const handleAnswerChallenge = (selected: string) => {
    if (challengeAnswered) return;

    setChallengeAnswered(true);
    setPhonicsAttempted(prev => prev + 1);

    let match = false;
    if (activeStage === 1) {
      match = selected.toLowerCase() === challengeTargetPhoneme.letter.toLowerCase();
    } else if (activeStage === 2) {
      match = selected.toLowerCase() === challengeTargetWord.letters[1].toLowerCase();
    } else {
      match = selected.toLowerCase() === challengeTargetWord.word.toLowerCase();
    }

    setChallengeIsCorrect(match);

    if (match) {
      soundManager.playCorrect();
      setPhonicsCorrect(prev => prev + 1);

      // Rewards
      if (activeStage === 1) {
        setPhonicsPoints(p => p + 10);
        setSpeedBoostActive(true);
        setSpeedBoostTimer(12); // 12 seconds speed boost
      } else if (activeStage === 2) {
        setPhonicsPoints(p => p + 15);
        setSpeedBoostActive(true);
        setSpeedBoostTimer(15);
      } else {
        setPhonicsPoints(p => p + 20);
        setPlayerScore(p => p + 1); // direct cup goal reward!
        soundManager.playGoalCheer();
      }
    } else {
      soundManager.playIncorrect();
    }
  };

  const handleResumeFromChallenge = () => {
    soundManager.playClick();
    setGameState('playing');
  };

  const handleMatchEnd = () => {
    soundManager.playWhistle();
    soundManager.playGoalCheer();
    setGameState('finished');

    const totalMatchPoints = phonicsPoints + (playerScore > opponentScore ? 20 : 10); // win bonus
    addGameResults({
      activity: 'word_builder_cup',
      pointsEarned: totalMatchPoints,
      questionsAttempted: phonicsAttempted,
      questionsCorrect: phonicsCorrect,
      goalsScored: playerScore,
      passesCompleted: passesCount,
    });
    onRefreshProfile();
  };

  const playBlendingAudioSequence = async () => {
    const word = challengeTargetWord;
    const phonemeIds: [string, string, string] = [
      `p_${word.letters[0]}`,
      `p_${word.letters[1]}`,
      `p_${word.letters[2]}`,
    ];
    const symbols: [string, string, string] = word.phonemes;

    const success = await soundManager.playBlendingSequence(
      phonemeIds,
      symbols,
      word.id,
      word.word,
      step => setBlendingStep(step)
    );

    if (!success) {
      setAudioNotice('One or more blending audio recordings not available yet.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Match Bar - Santiago Bernabéu Scoreboard */}
      <div className="bg-[#001A49] border-2 border-amber-400 rounded-2xl p-4 text-white shadow-xl mb-4 flex flex-wrap items-center justify-between gap-4">
        {/* Teams and Scoreboard */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Real Madrid */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-white border-2 border-amber-400 shadow-xs flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base text-white tracking-wide flex items-center gap-1">
                <span>REAL MADRID</span>
                <span className="text-[10px] bg-amber-400 text-[#001A49] font-black px-1 rounded">15★</span>
              </span>
              <span className="text-[10px] text-amber-300 font-bold hidden sm:inline">Los Blancos</span>
            </div>
          </div>

          <div className="bg-[#001233] border border-amber-400/50 px-4 py-1.5 rounded-xl text-xl sm:text-2xl font-black font-mono text-amber-400 tabular-nums shadow-inner ring-1 ring-amber-400/20">
            {playerScore} - {opponentScore}
          </div>

          {/* Derby Rivals */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-right">
              <span className="font-extrabold text-sm sm:text-base text-slate-200 tracking-wide">
                DERBY RIVALS
              </span>
              <span className="text-[10px] text-rose-300 font-bold hidden sm:inline">Opponents</span>
            </div>
            <span className="w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-xs flex-shrink-0" />
          </div>
        </div>

        {/* Match Timer, Bernabéu Venue & Phonics Points */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-amber-200/90 bg-[#0C2340] border border-amber-400/30 px-2.5 py-1 rounded-xl">
            <span>📍 Bernabéu</span>
          </div>

          <div className="bg-[#0C2340] px-3 py-1.5 rounded-xl text-xs font-bold text-slate-100 border border-amber-400/30 flex items-center gap-1.5 shadow-xs">
            <span className="text-amber-400">⏱ Time:</span>
            <span className="tabular-nums font-mono text-white text-sm">{matchTime}s</span>
          </div>

          <div className="bg-amber-400/20 border border-amber-400/40 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-400" />
            <span className="tabular-nums font-bold">+{phonicsPoints} pts</span>
          </div>

          {speedBoostActive && (
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#001A49] px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 animate-pulse shadow-md">
              <Zap size={14} /> VINI JR SPRINT ({speedBoostTimer}s)
            </div>
          )}

          {/* Pause Button */}
          {gameState === 'playing' && (
            <button
              onClick={() => {
                setGameState('paused');
                soundManager.playClick();
              }}
              className="p-2 bg-[#0C2340] hover:bg-[#15345c] text-slate-200 rounded-xl border border-amber-400/40 transition-colors"
              aria-label="Pause match"
            >
              <Pause size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Pitch Viewport */}
      <div className="relative">
        <FootballCanvas
          isPlaying={gameState === 'playing'}
          isPaused={gameState !== 'playing'}
          onGoalScored={handleGoalScored}
          onPassCompleted={handlePassCompleted}
          onTriggerPhonicsChallenge={handleTriggerPhonicsChallenge}
          speedBoostActive={speedBoostActive}
        />

        {/* Start Match Modal */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-[#001A49]/85 backdrop-blur-xs flex items-center justify-center p-4 z-20 rounded-2xl">
            <div className="bg-white border-3 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl text-slate-900">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600 border border-amber-300 shadow-sm">
                <Trophy size={36} />
              </div>
              <span className="text-xs font-black tracking-widest text-[#702082] uppercase flex items-center justify-center gap-1">
                <span>Real Madrid C.F.</span>
                <span className="text-amber-500">·</span>
                <span className="text-amber-600">Estadio Santiago Bernabéu</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
                Word Builder Cup Final
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
                Lead Los Blancos onto the Bernabéu pitch! Pass to Modrić and Bellingham, sprint with Vini Jr., shoot past Oblak, and solve phonics blending challenges for Super Striker speed boosts!
              </p>

              {/* Controls Key Grid */}
              <div className="grid grid-cols-2 gap-2 my-5 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold shadow-xs">WASD</kbd>
                  <span className="text-slate-700">Move Player</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold shadow-xs">Space</kbd>
                  <span className="text-slate-700">Pass to Teammate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold shadow-xs">Click</kbd>
                  <span className="text-slate-700">Shoot on Goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold shadow-xs">Shift</kbd>
                  <span className="text-slate-700">Vini Jr Sprint</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold shadow-xs">E</kbd>
                  <span className="text-slate-700">Switch Player</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold shadow-xs">Esc</kbd>
                  <span className="text-slate-700">Pause Match</span>
                </div>
              </div>

              <button
                onClick={handleStartMatch}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001A49] font-black rounded-xl text-base shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 border border-amber-200"
              >
                <Play size={20} className="fill-[#001A49]" />
                <span>Kick Off at Santiago Bernabéu</span>
              </button>
            </div>
          </div>
        )}

        {/* Pause Modal */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-20 rounded-2xl">
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl text-slate-900">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Match Paused</h2>
              <p className="text-xs text-slate-500 mb-6">Take a quick breath or return to the academy hub.</p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setGameState('playing');
                    soundManager.playClick();
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-sm"
                >
                  Resume Match
                </button>
                <button
                  onClick={handleStartMatch}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition-colors"
                >
                  Restart Match
                </button>
                <button
                  onClick={onBackToHome}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Exit to Academy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phonics Challenge In-Match Modal */}
        {gameState === 'phonics_challenge' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-30 rounded-2xl">
            <div className="bg-white border-3 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl text-center">
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <Sparkles size={14} className="text-amber-600" />
                {activeStage === 1 && 'Tactical Challenge: Sound Striker'}
                {activeStage === 2 && 'Penalty Area Challenge: CVC Goal'}
                {activeStage === 3 && 'Championship Final: Blending Master'}
              </div>

              {activeStage === 1 && (
                <div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Listen to the sound & find the letter!
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Correct answer awards a 12s Super Striker speed boost!
                  </p>

                  <button
                    onClick={() => soundManager.playPhonicsItem(challengeTargetPhoneme.id, challengeTargetPhoneme.phoneme)}
                    className="p-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-bold inline-flex items-center gap-2 mb-4 shadow-md transition-transform active:scale-95"
                  >
                    <Volume2 size={24} />
                    <span>Play Target Sound ({challengeTargetPhoneme.phoneme})</span>
                  </button>
                </div>
              )}

              {activeStage === 2 && (
                <div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    What is the missing middle vowel?
                  </h3>
                  <div className="text-3xl font-black font-mono tracking-widest my-3 text-amber-600">
                    {challengeTargetWord.letters[0].toUpperCase()} _ {challengeTargetWord.letters[2].toUpperCase()}
                  </div>
                  <button
                    onClick={() => soundManager.playPhonicsItem(challengeTargetWord.id, challengeTargetWord.word)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg mb-4"
                  >
                    <Volume2 size={14} /> Hear word: "{challengeTargetWord.word}"
                  </button>
                </div>
              )}

              {activeStage === 3 && (
                <div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Blend the Phonemes to Score!
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Listen to the sequential sounds and blend them into the final word:
                  </p>

                  {/* Blending Sequence Player */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {challengeTargetWord.phonemes.map((ph, idx) => (
                      <div
                        key={idx}
                        className={`w-12 h-14 rounded-xl flex items-center justify-center font-bold text-base border-2 transition-all ${
                          blendingStep === idx
                            ? 'bg-amber-400 border-slate-900 text-slate-950 scale-110 shadow-lg'
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                      >
                        {ph}
                      </div>
                    ))}
                    <span className="text-lg font-black text-amber-500">=</span>
                    <div
                      className={`px-3 h-14 rounded-xl flex items-center justify-center font-black text-lg border-2 transition-all ${
                        blendingStep === 3
                          ? 'bg-emerald-500 border-slate-900 text-white scale-110 shadow-lg'
                          : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}
                    >
                      {challengeAnswered ? challengeTargetWord.word.toUpperCase() : '???'}
                    </div>
                  </div>

                  <button
                    onClick={playBlendingAudioSequence}
                    className="p-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 mb-4 transition-colors"
                  >
                    <Volume2 size={16} className="text-amber-400" />
                    <span>Play Audio Blending Sequence</span>
                  </button>
                </div>
              )}

              {audioNotice && (
                <div className="text-xs bg-amber-100 text-amber-800 p-2 rounded-lg mb-3">
                  {audioNotice}
                </div>
              )}

              {/* Choice Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                {challengeOptions.map(opt => {
                  let btnStyle = 'bg-slate-50 border-2 border-slate-200 hover:border-amber-400 text-slate-900';
                  if (challengeAnswered) {
                    const isTarget =
                      activeStage === 1
                        ? opt.toLowerCase() === challengeTargetPhoneme.letter.toLowerCase()
                        : activeStage === 2
                        ? opt.toLowerCase() === challengeTargetWord.letters[1].toLowerCase()
                        : opt.toLowerCase() === challengeTargetWord.word.toLowerCase();

                    if (isTarget) {
                      btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-black shadow-md';
                    } else {
                      btnStyle = 'opacity-40 bg-slate-100 border-slate-200 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerChallenge(opt)}
                      disabled={challengeAnswered}
                      className={`h-16 rounded-xl flex items-center justify-center font-black text-2xl font-mono transition-all transform active:scale-95 ${btnStyle}`}
                    >
                      {opt.toUpperCase()}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Resume */}
              {challengeAnswered && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-left">
                    {challengeIsCorrect ? (
                      <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle size={24} className="text-amber-600 flex-shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-700">
                      {challengeIsCorrect
                        ? 'Super Phonics Strike! Advantage unlocked!'
                        : 'Good effort! Returning to match play.'}
                    </span>
                  </div>
                  <button
                    onClick={handleResumeFromChallenge}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Back to Match</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Results Modal */}
        {gameState === 'finished' && (
          <div className="absolute inset-0 bg-[#001438]/90 backdrop-blur-xs flex items-center justify-center p-4 z-30 rounded-2xl">
            <div className="bg-white border-3 border-amber-400 rounded-3xl p-6 sm:p-10 max-w-md w-full text-center shadow-2xl text-slate-900">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500 border-2 border-amber-300 shadow-sm">
                <Award size={48} />
              </div>
              <span className="text-xs font-black tracking-widest text-[#702082] uppercase">
                Full Time at Santiago Bernabéu
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                {playerScore > opponentScore
                  ? '¡Hala Madrid! Champions! 🏆'
                  : playerScore === opponentScore
                  ? 'Hard-Fought Bernabéu Draw!'
                  : 'Valiant Madrid Effort!'}
              </h2>
              <div className="text-2xl font-black font-mono my-2 text-[#001A49] flex items-center justify-center gap-2">
                <span>Real Madrid {playerScore}</span>
                <span className="text-slate-400">-</span>
                <span className="text-slate-700">{opponentScore} Rivals</span>
              </div>

              {/* Stats breakdown */}
              <div className="grid grid-cols-2 gap-2 my-5 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500">Phonics Points:</span>
                  <div className="font-black text-sm text-amber-600">+{phonicsPoints} pts</div>
                </div>
                <div>
                  <span className="text-slate-500">Phonics Accuracy:</span>
                  <div className="font-black text-sm text-[#001A49]">
                    {phonicsAttempted > 0 ? Math.round((phonicsCorrect / phonicsAttempted) * 100) : 100}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Madrid Passes:</span>
                  <div className="font-black text-sm text-slate-900">{passesCount} passes</div>
                </div>
                <div>
                  <span className="text-slate-500">Bernabéu Goals:</span>
                  <div className="font-black text-sm text-emerald-600">{playerScore} goals</div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => soundManager.playMadridFanfare()}
                  className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-[#001A49] font-black rounded-xl text-xs transition-colors border border-amber-300 flex items-center justify-center gap-1.5"
                >
                  <span>🎺 Play ¡Hala Madrid! Fanfare</span>
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    onClick={handleStartMatch}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-[#001A49] font-black rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} /> Play Again
                  </button>
                  <button
                    onClick={onBackToHome}
                    className="w-full py-3 bg-[#001A49] hover:bg-[#0C2340] text-white font-bold rounded-xl text-sm transition-colors"
                  >
                    Academy Hub
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Tips Card for Young Learners */}
      <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 text-xs font-semibold text-slate-600 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black text-[10px] uppercase">
            Controls Hint
          </span>
          <span>Use <strong>WASD</strong> or <strong>Arrows</strong> to dribble · <strong>Space</strong> to pass · <strong>Click pitch</strong> to shoot!</span>
        </div>
        <div className="text-slate-400">
          Press <strong>Esc</strong> to pause anytime
        </div>
      </div>
    </div>
  );
};
