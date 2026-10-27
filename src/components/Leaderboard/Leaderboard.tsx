import React, { useState, useEffect } from 'react';
import { getLeaderboard, fetchRemoteLeaderboard } from '../../services/playerService';
import { LeaderboardEntry } from '../../types/phonics';
import { Trophy, Medal, Target, Star, Award, Shield, ArrowUpDown } from 'lucide-react';
import { soundManager } from '../../services/audioService';

interface LeaderboardProps {
  onBackToHome: () => void;
  onPlayActivity: () => void;
}

type SortField = 'totalPoints' | 'phonicsAccuracy' | 'goalsScored' | 'gamesCompleted';

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBackToHome, onPlayActivity }) => {
  const [sortField, setSortField] = useState<SortField>('totalPoints');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(getLeaderboard());

  useEffect(() => {
    fetchRemoteLeaderboard().then(remote => {
      if (remote && remote.length > 0) {
        setEntries(remote);
      }
    });
  }, []);

  const sortedEntries = [...entries].sort((a, b) => {
    return b[sortField] - a[sortField];
  });

  const handleSortChange = (field: SortField) => {
    setSortField(field);
    soundManager.playClick();
  };

  const top3 = sortedEntries.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Real Madrid Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#001A49] border-2 border-amber-400 rounded-2xl p-5 shadow-lg mb-8 text-white">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Real Madrid C.F. · Santiago Bernabéu</span>
            <span className="text-purple-300">·</span>
            <span className="text-white/80 font-medium">La Fábrica Honors Board</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Madrid Academy Leaderboard
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Compare phonics accuracy, goals scored, and badges earned across the Real Madrid Year 1 Academy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => soundManager.playMadridFanfare()}
            className="px-3 py-2 bg-[#0C2340] border border-amber-400/50 hover:bg-[#15345c] text-amber-300 font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            🎺 Fanfare
          </button>
          <button
            onClick={onPlayActivity}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#001A49] font-black rounded-xl text-xs transition-colors shadow-sm"
          >
            Play to Rank Up
          </button>
          <button
            onClick={onBackToHome}
            className="px-3 py-2 bg-[#0C2340] hover:bg-[#15345c] text-slate-200 border border-amber-400/30 font-bold rounded-xl text-xs transition-colors"
          >
            Hub
          </button>
        </div>
      </div>

      {/* Top 3 Podium Visual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {top3.map((entry, idx) => {
          const rank = idx + 1;
          const isGold = rank === 1;
          const isSilver = rank === 2;
          const isBronze = rank === 3;

          const bgStyle = isGold
            ? 'bg-gradient-to-b from-amber-100 to-amber-50 border-2 border-amber-400'
            : isSilver
            ? 'bg-gradient-to-b from-slate-100 to-slate-50 border-2 border-slate-300'
            : 'bg-gradient-to-b from-orange-100 to-orange-50 border-2 border-orange-300';

          return (
            <div
              key={entry.id}
              className={`rounded-2xl p-5 text-center shadow-sm flex flex-col items-center relative ${bgStyle}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-2 shadow-sm ${
                  isGold
                    ? 'bg-amber-400 text-slate-950'
                    : isSilver
                    ? 'bg-slate-300 text-slate-800'
                    : 'bg-orange-300 text-slate-800'
                }`}
              >
                #{rank}
              </div>

              <div className="font-black text-slate-900 text-base truncate max-w-[200px]">
                {entry.name}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 my-1">
                <Trophy size={14} />
                <span>{entry.totalPoints} Points</span>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                {entry.phonicsAccuracy}% Accuracy · {entry.goalsScored} Goals
              </div>
            </div>
          );
        })}
      </div>

      {/* Sorting Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-bold">
        <span className="text-slate-500 mr-2 flex items-center gap-1">
          <ArrowUpDown size={13} /> Sort By:
        </span>
        <button
          onClick={() => handleSortChange('totalPoints')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            sortField === 'totalPoints'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Total Points
        </button>
        <button
          onClick={() => handleSortChange('phonicsAccuracy')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            sortField === 'phonicsAccuracy'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Phonics Accuracy
        </button>
        <button
          onClick={() => handleSortChange('goalsScored')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            sortField === 'goalsScored'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Goals Scored
        </button>
        <button
          onClick={() => handleSortChange('gamesCompleted')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            sortField === 'gamesCompleted'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Games Played
        </button>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Rank</th>
                <th className="px-4 py-3.5">Player Name</th>
                <th className="px-4 py-3.5 text-right">Points</th>
                <th className="px-4 py-3.5 text-right">Phonics Accuracy</th>
                <th className="px-4 py-3.5 text-right">Goals</th>
                <th className="px-4 py-3.5 text-right">Games</th>
                <th className="px-4 py-3.5 text-right">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sortedEntries.map((player, index) => {
                const isUser = player.id === 'user_player';
                return (
                  <tr
                    key={player.id}
                    className={`transition-colors ${
                      isUser ? 'bg-amber-50/70 font-bold' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-4 py-3.5 font-bold">
                      <span className="inline-block w-6 text-slate-500">#{index + 1}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {isUser && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        <span>{player.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-600">
                      {player.totalPoints}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold">
                      {player.phonicsAccuracy}%
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold">
                      {player.goalsScored}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      {player.gamesCompleted}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        <Award size={12} className="text-amber-500" />
                        {player.badgesCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
