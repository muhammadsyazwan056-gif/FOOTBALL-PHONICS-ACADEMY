import { PlayerProfile, LeaderboardEntry } from '../types/phonics';
import { evaluateBadges } from '../game/scoring';

const PROFILE_KEY = 'fpa_player_profile';
const LEADERBOARD_KEY = 'fpa_academy_leaderboard';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Academy Striker',
  totalPoints: 0,
  gamesCompleted: 0,
  phonicsAccuracy: 0,
  totalQuestionsAttempted: 0,
  totalCorrectAnswers: 0,
  goalsScored: 0,
  passesCompleted: 0,
  badges: ['Academy Rookie'],
  soundDetectiveHighScore: 0,
  shootoutHighScore: 0,
  cupHighScore: 0,
  lastPlayed: new Date().toISOString(),
};

const INITIAL_PEERS: LeaderboardEntry[] = [
  { id: 'p_1', name: 'Zidane Al-Hadi', totalPoints: 340, phonicsAccuracy: 95, goalsScored: 8, gamesCompleted: 6, badgesCount: 5 },
  { id: 'p_2', name: 'Maya Chen', totalPoints: 280, phonicsAccuracy: 90, goalsScored: 5, gamesCompleted: 4, badgesCount: 4 },
  { id: 'p_3', name: 'Leo Fernandez', totalPoints: 220, phonicsAccuracy: 85, goalsScored: 6, gamesCompleted: 3, badgesCount: 3 },
  { id: 'p_4', name: 'Amir Rahman', totalPoints: 175, phonicsAccuracy: 82, goalsScored: 3, gamesCompleted: 2, badgesCount: 2 },
  { id: 'p_5', name: 'Sofia Bell', totalPoints: 130, phonicsAccuracy: 80, goalsScored: 2, gamesCompleted: 2, badgesCount: 2 },
];

export function getPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_PROFILE;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    syncLeaderboardWithPlayer(profile);
  } catch {}
}

export function updatePlayerName(newName: string): { success: boolean; error?: string; profile: PlayerProfile } {
  const trimmed = newName.trim();
  if (!trimmed) {
    return { success: false, error: 'Please enter a player name.', profile: getPlayerProfile() };
  }
  if (trimmed.length > 20) {
    return { success: false, error: 'Name must be 20 characters or fewer.', profile: getPlayerProfile() };
  }

  const profile = getPlayerProfile();
  profile.name = trimmed;
  savePlayerProfile(profile);
  return { success: true, profile };
}

export function addGameResults(params: {
  activity: 'sound_detective' | 'shootout' | 'word_builder_cup';
  pointsEarned: number;
  questionsAttempted: number;
  questionsCorrect: number;
  goalsScored?: number;
  passesCompleted?: number;
}): PlayerProfile {
  const profile = getPlayerProfile();

  profile.totalPoints += params.pointsEarned;
  profile.gamesCompleted += 1;
  profile.totalQuestionsAttempted += params.questionsAttempted;
  profile.totalCorrectAnswers += params.questionsCorrect;
  profile.goalsScored += params.goalsScored || 0;
  profile.passesCompleted += params.passesCompleted || 0;

  if (profile.totalQuestionsAttempted > 0) {
    profile.phonicsAccuracy = Math.round(
      (profile.totalCorrectAnswers / profile.totalQuestionsAttempted) * 100
    );
  }

  if (params.activity === 'sound_detective') {
    profile.soundDetectiveHighScore = Math.max(profile.soundDetectiveHighScore, params.pointsEarned);
  } else if (params.activity === 'shootout') {
    profile.shootoutHighScore = Math.max(profile.shootoutHighScore, params.pointsEarned);
  } else if (params.activity === 'word_builder_cup') {
    profile.cupHighScore = Math.max(profile.cupHighScore, params.pointsEarned);
  }

  profile.badges = evaluateBadges({
    totalPoints: profile.totalPoints,
    goalsScored: profile.goalsScored,
    phonicsAccuracy: profile.phonicsAccuracy,
    gamesCompleted: profile.gamesCompleted,
    existingBadges: profile.badges,
  });

  profile.lastPlayed = new Date().toISOString();
  savePlayerProfile(profile);
  return profile;
}

export function getLeaderboard(): LeaderboardEntry[] {
  let list: LeaderboardEntry[] = INITIAL_PEERS;
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch {}

  const profile = getPlayerProfile();
  const playerIndex = list.findIndex(e => e.id === 'user_player');
  const userEntry: LeaderboardEntry = {
    id: 'user_player',
    name: `${profile.name} (You)`,
    totalPoints: profile.totalPoints,
    phonicsAccuracy: profile.phonicsAccuracy,
    goalsScored: profile.goalsScored,
    gamesCompleted: profile.gamesCompleted,
    badgesCount: profile.badges.length,
  };

  if (playerIndex >= 0) {
    list[playerIndex] = userEntry;
  } else {
    list.push(userEntry);
  }

  return list;
}

function syncLeaderboardWithPlayer(profile: PlayerProfile): void {
  const list = getLeaderboard();
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
  } catch {}

  // Post to shared cloud leaderboard in background
  if (typeof window !== 'undefined') {
    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'user_player',
        name: profile.name,
        totalPoints: profile.totalPoints,
        phonicsAccuracy: profile.phonicsAccuracy,
        goalsScored: profile.goalsScored,
        gamesCompleted: profile.gamesCompleted,
        badgesCount: profile.badges.length,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.leaderboard && Array.isArray(data.leaderboard)) {
          localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data.leaderboard));
        }
      })
      .catch(() => {});
  }
}

export async function fetchRemoteLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      const data: LeaderboardEntry[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {}
  return getLeaderboard();
}
