import React, { useState } from 'react';
import { PlayerProfile } from '../../types/phonics';
import { updatePlayerName } from '../../services/playerService';
import { soundManager } from '../../services/audioService';
import { User, X, Award, Trophy, Target, Star, Check } from 'lucide-react';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onProfileUpdated: (updated: PlayerProfile) => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const [nameInput, setNameInput] = useState(profile.name);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updatePlayerName(nameInput);
    if (res.success) {
      onProfileUpdated(res.profile);
      setErrorMsg('');
      setSavedSuccess(true);
      soundManager.playCorrect();
      setTimeout(() => setSavedSuccess(false), 2000);
    } else {
      setErrorMsg(res.error || 'Failed to update name.');
      soundManager.playIncorrect();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close profile modal"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#001A49] text-amber-300 border-2 border-amber-400 flex items-center justify-center font-black shadow-md">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Striker Profile
              </h2>
              <span className="bg-amber-400 text-[#001A49] text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                RM C.F.
              </span>
            </div>
            <p className="text-xs text-[#702082] font-bold">Real Madrid · La Fábrica Cadet</p>
          </div>
        </div>

        {/* Change Name Form */}
        <form onSubmit={handleSaveName} className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <label htmlFor="player-name" className="block text-xs font-bold text-slate-700 mb-1.5">
            Academy Display Name:
          </label>
          <div className="flex gap-2">
            <input
              id="player-name"
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              maxLength={20}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Your striker name..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-sm"
            >
              {savedSuccess ? <Check size={14} className="text-amber-400" /> : 'Save'}
            </button>
          </div>
          {errorMsg && <p className="text-xs text-rose-600 mt-1.5 font-semibold">{errorMsg}</p>}
          {savedSuccess && <p className="text-xs text-emerald-600 mt-1.5 font-semibold">Name updated successfully!</p>}
        </form>

        {/* Career Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-center">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Points</div>
            <div className="text-lg font-black text-amber-600 tabular-nums">{profile.totalPoints}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Accuracy</div>
            <div className="text-lg font-black text-slate-900 tabular-nums">{profile.phonicsAccuracy}%</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Goals</div>
            <div className="text-lg font-black text-emerald-600 tabular-nums">{profile.goalsScored}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Passes</div>
            <div className="text-lg font-black text-slate-900 tabular-nums">{profile.passesCompleted}</div>
          </div>
        </div>

        {/* Badges Earned */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            Academy Honors & Badges ({profile.badges.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map(badge => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 bg-amber-100/70 border border-amber-300 text-amber-900 px-3 py-1 rounded-xl text-xs font-bold shadow-xs"
              >
                <Award size={14} className="text-amber-600" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
