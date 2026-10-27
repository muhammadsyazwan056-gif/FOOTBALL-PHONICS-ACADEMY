import React from 'react';
import { AcademyEmblem } from '../common/AcademyEmblem';
import { BernabeuAtmosphere } from '../common/BernabeuAtmosphere';
import { PlayerProfile, LeaderboardEntry } from '../../types/phonics';
import { ActiveView } from '../Navbar';
import { soundManager } from '../../services/audioService';
import {
  Trophy,
  Play,
  Volume2,
  Target,
  Gamepad2,
  ShieldAlert,
  Award,
  ChevronRight,
  UserCheck,
  Star,
  Sparkles,
  Flame,
  Music,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: ActiveView) => void;
  playerProfile: PlayerProfile;
  leaderboardPreview: LeaderboardEntry[];
  onOpenProfile: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  playerProfile,
  leaderboardPreview,
  onOpenProfile,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* Santiago Bernabéu Stadium Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001438] via-[#001A49] to-[#0A255C] text-white border-2 border-amber-400 p-6 sm:p-12 shadow-2xl">
        {/* Real Madrid Stadium Atmospheric Background with Floodlights */}
        <BernabeuAtmosphere variant="card" />

        <div className="relative z-10 max-w-3xl">
          {/* Real Madrid Official Academy Badge */}
          <div className="flex items-center gap-3 mb-4">
            <AcademyEmblem size={68} />
            <div>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                Real Madrid C.F. · La Fábrica Academy · Year 1 ESL
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mt-2">
            Train at Real Madrid Academy: Score Goals with Letter Sounds
          </h1>

          <p className="text-slate-200 text-sm sm:text-base font-medium mt-4 leading-relaxed max-w-2xl">
            Welcome to the official <strong>Real Madrid Phonics Academy</strong> for Year 1 ESL pupils.
            Master letter sounds at the Ciudad Real Madrid training lab, take penalty shootouts in front of the
            legendary Santiago Bernabéu <em>Fondo Norte</em>, and lead Los Blancos to victory in the playable 2D Word Builder Cup!
          </p>

          {/* Call to action cluster */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-8">
            <button
              onClick={() => {
                onNavigate('word_builder_cup');
                soundManager.playClick();
              }}
              className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001A49] font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/30 flex items-center gap-2.5 transition-all transform active:scale-95 border border-amber-200"
            >
              <Play size={20} className="fill-[#001A49]" />
              <span>Play Word Builder Cup (Bernabéu)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playMadridFanfare();
              }}
              className="px-4 py-3.5 bg-[#0C2340] hover:bg-[#15345c] border border-amber-400/50 text-amber-300 font-bold text-xs sm:text-sm rounded-2xl transition-colors flex items-center gap-2 shadow-md"
              title="Play Santiago Bernabéu stadium celebration fanfare"
            >
              <Music size={17} className="text-amber-400" />
              <span>¡Hala Madrid! Fanfare</span>
            </button>

            <button
              onClick={() => {
                onOpenProfile();
                soundManager.playClick();
              }}
              className="px-3 py-3.5 text-xs text-amber-200 hover:text-white font-semibold flex items-center gap-1.5 underline underline-offset-4 decoration-amber-400/40"
            >
              <UserCheck size={16} />
              <span>Striker: <strong>{playerProfile.name}</strong></span>
            </button>
          </div>
        </div>
      </section>

      {/* Real Madrid Trophy Cabinet & Honors Strip */}
      <section className="bg-gradient-to-r from-[#001A49] via-[#0C2340] to-[#001A49] text-white border-2 border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center flex-shrink-0 text-amber-400">
              <Trophy size={32} className="fill-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                Real Madrid Trophy Cabinet · Santiago Bernabéu
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                La Decimoquinta Champions
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                15× European Cups & 36× La Liga Titles inspire our Year 1 Phonics Academy Champions!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto text-center">
            <div className="bg-[#00153B] border border-amber-400/30 px-4 py-2.5 rounded-2xl">
              <span className="text-amber-400 font-black text-xl sm:text-2xl block leading-tight">15★</span>
              <span className="text-[10px] uppercase font-bold text-slate-300">Champions League</span>
            </div>
            <div className="bg-[#00153B] border border-amber-400/30 px-4 py-2.5 rounded-2xl">
              <span className="text-white font-black text-xl sm:text-2xl block leading-tight">36</span>
              <span className="text-[10px] uppercase font-bold text-slate-300">La Liga Titles</span>
            </div>
            <div className="bg-[#00153B] border border-amber-400/30 px-4 py-2.5 rounded-2xl">
              <span className="text-amber-300 font-black text-xl sm:text-2xl block leading-tight">100%</span>
              <span className="text-[10px] uppercase font-bold text-slate-300">La Fábrica Spirit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Player Progress Summary Strip */}
      <section className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#702082] flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
              Real Madrid Academy Striker Progress
            </div>
            <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{playerProfile.name}</span>
              <span className="text-xs text-slate-500 font-semibold">({playerProfile.gamesCompleted} matches played)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full sm:w-auto">
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Academy Points</span>
              <span className="text-base font-black text-amber-600 tabular-nums">+{playerProfile.totalPoints}</span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Phonics Accuracy</span>
              <span className="text-base font-black text-[#001A49] tabular-nums">{playerProfile.phonicsAccuracy}%</span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Bernabéu Goals</span>
              <span className="text-base font-black text-emerald-600 tabular-nums">{playerProfile.goalsScored}</span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Madrid Badges</span>
              <span className="text-base font-black text-slate-900 tabular-nums">{playerProfile.badges.length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Activity Cards - Themed with Real Madrid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#702082]">
              Ciudad Real Madrid & Santiago Bernabéu
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Academy Training Grounds & Matches
            </h2>
          </div>
          <span className="text-xs font-bold bg-[#001A49] text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 hidden sm:inline-block">
            Year 1 Primary Curriculum
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Activity 1: Sound Detective (Valdebebas Sound Lab) */}
          <div className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-amber-300">
                <Volume2 size={30} />
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                Valdebebas Lab · Phonemes
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Sound Detective
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Train your ears like a Real Madrid coach! Listen to pure letter sounds like /s/, /a/, /t/, and /p/, and select the correct Madrid letter card to earn Academy points.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">8 Audio Challenges</span>
              <button
                onClick={() => {
                  onNavigate('sound_detective');
                  soundManager.playClick();
                }}
                className="px-4 py-2 bg-[#001A49] group-hover:bg-amber-400 group-hover:text-[#001A49] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Enter Lab</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Activity 2: Missing Letter Shootout (Santiago Bernabéu Penalty Arena) */}
          <div className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-emerald-300">
                <Target size={30} />
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                Bernabéu Shootout · CVC Words
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Missing Letter Shootout
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Step up to the penalty spot facing the famous Bernabéu Fondo Norte. Spot the missing beginning, middle vowel, or ending sound in CVC words and strike the ball into the top corner!
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">9 Penalty Kicks</span>
              <button
                onClick={() => {
                  onNavigate('shootout');
                  soundManager.playClick();
                }}
                className="px-4 py-2 bg-[#001A49] group-hover:bg-amber-400 group-hover:text-[#001A49] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Take Penalties</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Activity 3: Word Builder Cup (Bernabéu 2D Match) */}
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-[#001A49] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
              Estadio Santiago Bernabéu
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-[#001A49] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md">
                <Gamepad2 size={30} />
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                Playable 2D Bernabéu Cup
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Word Builder Cup
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Put on the legendary Real Madrid All-White kit! Play alongside Vini Jr., Bellingham, and Modrić. Pass with Space, click to shoot, and solve in-match phonics blending to unlock Super Striker boost!
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Full 2D Physics Match</span>
              <button
                onClick={() => {
                  onNavigate('word_builder_cup');
                  soundManager.playClick();
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#001A49] font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Kick Off Match</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Real Madrid Squad Inspirations for Young Pupils */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Real Madrid Squad Stars
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Meet Your Real Madrid Teammates
            </h2>
          </div>
          <span className="text-xs text-slate-300">
            Playable in the 2D Word Builder Cup
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Vinícius Jr.', num: 7, pos: 'Forward · Striker', role: 'Speed & Finishing' },
            { name: 'Jude Bellingham', num: 5, pos: 'Midfielder', role: 'Box-to-Box Playmaker' },
            { name: 'Kylian Mbappé', num: 9, pos: 'Forward', role: 'Pace & Precision' },
            { name: 'Luka Modrić', num: 10, pos: 'Midfielder · Captain', role: 'Master Passing' },
            { name: 'Rodrygo', num: 11, pos: 'Winger', role: 'Dribbling & Crosses' },
            { name: 'Thibaut Courtois', num: 1, pos: 'Goalkeeper', role: 'Golden Glove Saves' },
          ].map(player => (
            <div
              key={player.name}
              className="bg-[#001A49] border border-amber-400/20 rounded-2xl p-3.5 text-center flex flex-col justify-between hover:border-amber-400 transition-colors"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-white text-[#001A49] font-black text-sm flex items-center justify-center mx-auto mb-2 border-2 border-amber-400 shadow-sm">
                  #{player.num}
                </div>
                <div className="font-extrabold text-sm text-white leading-tight">
                  {player.name}
                </div>
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-1">
                  {player.pos}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-medium">
                {player.role}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard Preview & Teacher Area Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard preview */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-[#702082] uppercase tracking-wider">
                Top Academy Scorers
              </span>
              <h3 className="text-xl font-black text-slate-900">Madrid Academy Standings</h3>
            </div>
            <button
              onClick={() => {
                onNavigate('leaderboard');
                soundManager.playClick();
              }}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 underline underline-offset-4"
            >
              View Full Standings
            </button>
          </div>

          <div className="space-y-2">
            {leaderboardPreview.slice(0, 4).map((entry, idx) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-400 text-[#001A49]' : 'bg-slate-200 text-slate-700'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="text-slate-900 font-bold">{entry.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500">{entry.phonicsAccuracy}% Acc</span>
                  <span className="text-amber-600 font-mono font-bold">+{entry.totalPoints} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Audio Panel Callout */}
        <div className="bg-gradient-to-b from-[#001A49] to-[#001130] text-white border-2 border-amber-400/30 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#0C2340] border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3">
              <ShieldAlert size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
              For Primary Educators
            </span>
            <h3 className="text-lg font-black mt-1">Teacher Audio Management</h3>
            <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
              Upload custom native pronunciation files (.mp3/.wav) or record directly using your microphone for all letter sounds and CVC words.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                onNavigate('teacher_area');
                soundManager.playClick();
              }}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-[#001A49] rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Open Teacher Panel (PIN: 1234)</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
