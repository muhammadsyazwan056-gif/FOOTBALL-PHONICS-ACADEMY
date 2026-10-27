import React, { useState, useEffect } from 'react';
import { Navbar, ActiveView } from './components/Navbar';
import { HomePage } from './components/Home/HomePage';
import { SoundDetective } from './components/SoundDetective/SoundDetective';
import { MissingLetterShootout } from './components/Shootout/MissingLetterShootout';
import { WordBuilderCup } from './components/WordBuilderCup/WordBuilderCup';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { TeacherAudioManagement } from './components/TeacherArea/TeacherAudioManagement';
import { PlayerProfileModal } from './components/Profile/PlayerProfileModal';
import { getPlayerProfile, getLeaderboard } from './services/playerService';
import { PlayerProfile, LeaderboardEntry } from './types/phonics';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(getPlayerProfile());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(getLeaderboard());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Check query params for deep-linking or autostart (supports testability)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const autostart = params.get('autostart');
      const viewParam = params.get('view') as ActiveView;

      if (autostart === '1' || viewParam === 'word_builder_cup') {
        setCurrentView('word_builder_cup');
      } else if (viewParam && ['home', 'sound_detective', 'shootout', 'leaderboard', 'teacher_area'].includes(viewParam)) {
        setCurrentView(viewParam);
      }
    }
  }, []);

  const refreshProfileAndLeaderboard = () => {
    const updated = getPlayerProfile();
    setPlayerProfile(updated);
    setLeaderboard(getLeaderboard());
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans selection:bg-amber-300 selection:text-slate-950 relative">
      {/* Bernabéu Stadium Ambient Floodlight Glows in background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-40">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-amber-300/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-10 w-[500px] h-[500px] bg-purple-300/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        playerProfile={playerProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Surfaces */}
      <main className="flex-1 w-full pb-16">
        {currentView === 'home' && (
          <HomePage
            onNavigate={setCurrentView}
            playerProfile={playerProfile}
            leaderboardPreview={leaderboard}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {currentView === 'sound_detective' && (
          <SoundDetective
            onBackToHome={() => setCurrentView('home')}
            onRefreshProfile={refreshProfileAndLeaderboard}
          />
        )}

        {currentView === 'shootout' && (
          <MissingLetterShootout
            onBackToHome={() => setCurrentView('home')}
            onRefreshProfile={refreshProfileAndLeaderboard}
          />
        )}

        {currentView === 'word_builder_cup' && (
          <WordBuilderCup
            onBackToHome={() => setCurrentView('home')}
            onRefreshProfile={refreshProfileAndLeaderboard}
          />
        )}

        {currentView === 'leaderboard' && (
          <Leaderboard
            onBackToHome={() => setCurrentView('home')}
            onPlayActivity={() => setCurrentView('word_builder_cup')}
          />
        )}

        {currentView === 'teacher_area' && (
          <TeacherAudioManagement
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Player Profile Edit Modal */}
      <PlayerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={playerProfile}
        onProfileUpdated={(updated) => {
          setPlayerProfile(updated);
          setLeaderboard(getLeaderboard());
        }}
      />

      {/* Academic Platform Footer - Real Madrid C.F. Edition */}
      <footer className="bg-[#001438] border-t-2 border-amber-400 text-slate-300 py-6 px-4 text-xs shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-black text-white tracking-wide">REAL MADRID C.F.</span>
            <span className="text-amber-400 font-bold">· La Fábrica Phonics Academy</span>
            <span className="text-slate-400 hidden md:inline">| Primary Year 1 ESL</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <span className="text-amber-300 font-bold">Estadio Santiago Bernabéu</span>
            <span>·</span>
            <span>15× European Cups (La Decimoquinta)</span>
            <span>·</span>
            <span className="font-semibold text-white/90">¡Hala Madrid y nada más!</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
