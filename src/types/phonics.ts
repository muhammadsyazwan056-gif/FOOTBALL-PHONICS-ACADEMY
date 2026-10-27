export type AudioStatus =
  | 'verified_cloud'
  | 'unverified_cloud'
  | 'verified_built_in'
  | 'uploaded'
  | 'missing';

export interface PhonemeItem {
  id: string;
  phoneme: string; // e.g. "/m/"
  letter: string;  // e.g. "m"
  soundDescription: string;
  exampleWord: string;
  audioStatus: AudioStatus;
  customAudioUrl?: string; // base64, object URL, or cloud stream URL
  cloudPath?: string;
  version?: number;
}

export interface CVCWordItem {
  id: string;
  word: string;
  category: 'animals' | 'objects' | 'actions' | 'nature';
  letters: [string, string, string];
  phonemes: [string, string, string];
  initialSound: string;
  vowelSound: string;
  finalSound: string;
  svgIcon: string; // key for visual illustration
  audioStatus: AudioStatus;
  customAudioUrl?: string;
}

export interface PlayerProfile {
  name: string;
  totalPoints: number;
  gamesCompleted: number;
  phonicsAccuracy: number;
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  goalsScored: number;
  passesCompleted: number;
  badges: string[];
  soundDetectiveHighScore: number;
  shootoutHighScore: number;
  cupHighScore: number;
  lastPlayed: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  totalPoints: number;
  phonicsAccuracy: number;
  goalsScored: number;
  gamesCompleted: number;
  badgesCount: number;
}
