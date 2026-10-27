import React, { useState } from 'react';
import { AcademyEmblem } from './common/AcademyEmblem';
import { soundManager } from '../services/audioService';
import { Volume2, VolumeX, Trophy, User, Menu, X, ShieldAlert } from 'lucide-react';
import { PlayerProfile } from '../types/phonics';

export type ActiveView = 'home' | 'sound_detective' | 'shootout' | 'word_builder_cup' | 'leaderboard' | 'teacher_area';

interface NavbarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  playerProfile: PlayerProfile;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  playerProfile,
  onOpenProfile,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
    if (!next) {
      soundManager.playClick();
    }
  };

  const navItems: { id: ActiveView; label: string; icon?: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'sound_detective', label: 'Sound Detective' },
    { id: 'shootout', label: 'Letter Shootout' },
    { id: 'word_builder_cup', label: 'Word Builder Cup' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'teacher_area', label: 'Teacher Panel' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#001A49] border-b-2 border-amber-400 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">
        {/* Real Madrid Brand & Logo */}
        <button
          onClick={() => {
            onNavigate('home');
            soundManager.playClick();
          }}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg p-1 group"
          aria-label="Real Madrid Football Phonics Academy Home"
        >
          <AcademyEmblem size={46} />
          <div className="hidden sm:block">
            <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>REAL MADRID</span>
              <span className="bg-amber-400 text-[#001A49] text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shadow-sm">
                C.F.
              </span>
              <span className="text-[11px] font-bold text-amber-300 ml-0.5 tracking-tight">
                Phonics
              </span>
            </div>
            <div className="text-[10px] font-bold text-amber-300/90 tracking-widest uppercase flex items-center gap-1.5">
              <span>La Fábrica Academy</span>
              <span className="text-purple-300">·</span>
              <span className="text-white/80 font-medium">Year 1 ESL</span>
            </div>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            const isTeacher = item.id === 'teacher_area';
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  soundManager.playClick();
                }}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-400 text-[#001A49] font-black shadow-md ring-1 ring-amber-300'
                    : isTeacher
                    ? 'text-amber-200/90 hover:bg-[#0C2340] hover:text-white'
                    : 'text-slate-100 hover:bg-[#0C2340] hover:text-amber-300'
                }`}
              >
                {isTeacher && <ShieldAlert size={14} className="text-amber-400" />}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action cluster: Trophy cabinet, Player name, Hala Madrid fanfare & sound toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Madrid 15x UCL Honor pill */}
          <div
            className="hidden md:flex items-center gap-1 bg-[#0C2340] border border-amber-400/40 rounded-lg px-2.5 py-1 text-[11px] font-bold text-amber-300 shadow-sm"
            title="Real Madrid - 15 European Cups / Champions League (La Decimoquinta)"
          >
            <Trophy size={13} className="text-amber-400 fill-amber-400" />
            <span>15× UCL</span>
          </div>

          {/* Hala Madrid Fanfare Quick Play button */}
          <button
            onClick={() => {
              soundManager.playMadridFanfare();
            }}
            className="hidden sm:flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-[#001A49] px-2.5 py-1.5 rounded-lg text-xs font-black shadow-sm transition-transform active:scale-95"
            title="Play Santiago Bernabéu Fanfare (¡Hala Madrid!)"
            aria-label="Play Madrid Fanfare"
          >
            <span>¡Hala Madrid!</span>
          </button>

          {/* Player profile trigger */}
          <button
            onClick={() => {
              onOpenProfile();
              soundManager.playClick();
            }}
            className="flex items-center gap-2 bg-[#0C2340] hover:bg-[#122b52] border border-amber-400/30 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-100 transition-colors shadow-sm"
            title="Edit player name and view Madrid Academy profile"
            aria-label="Player profile"
          >
            <div className="w-6 h-6 rounded-full bg-amber-400 text-[#001A49] flex items-center justify-center font-black text-xs">
              <User size={13} />
            </div>
            <span className="max-w-[100px] sm:max-w-[120px] truncate">{playerProfile.name}</span>
            <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[11px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30 tabular-nums">
              <Trophy size={11} className="text-amber-400" />
              {playerProfile.totalPoints}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                : 'bg-[#0C2340] border-amber-400/30 text-amber-400 hover:bg-[#122b52]'
            }`}
            title={isMuted ? 'Sound muted (Click to unmute)' : 'Sound enabled (Click to mute)'}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#0C2340] border border-amber-400/30 text-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#00153B] border-b border-amber-400/30 px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Trophy size={13} className="text-amber-400 fill-amber-400" />
              15× European Champions · Santiago Bernabéu
            </span>
            <button
              onClick={() => soundManager.playMadridFanfare()}
              className="px-2 py-0.5 bg-amber-400 text-[#001A49] text-[10px] font-black rounded"
            >
              ¡Hala Madrid! 🎺
            </button>
          </div>
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                  soundManager.playClick();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  isActive ? 'bg-amber-400 text-[#001A49] font-black' : 'text-slate-200 hover:bg-[#0C2340]'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'teacher_area' && (
                  <span className="text-[10px] uppercase tracking-wider bg-[#0C2340] text-amber-400 px-2 py-0.5 rounded border border-amber-400/20">
                    Teacher Only
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
