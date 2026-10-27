import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createPhoneticWavBuffer } from './wavGenerator';

export interface CloudAudioEntry {
  id: string;
  category: 'phonemes' | 'words';
  key: string;            // e.g. 'c', 'a_short', 'cat'
  phonemeOrWord: string;  // e.g. '/k/', '/æ/', 'cat'
  path: string;           // e.g. 'phonemes/c.wav'
  status: 'verified_cloud' | 'unverified_cloud' | 'missing';
  sizeBytes: number;
  mimeType: string;
  updatedAt: string;
  version: number;
}

export interface SharedLeaderboardItem {
  id: string;
  name: string;
  totalPoints: number;
  phonicsAccuracy: number;
  goalsScored: number;
  gamesCompleted: number;
  badgesCount: number;
  updatedAt: string;
}

const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');
const AUDIO_DIR = path.join(STORAGE_ROOT, 'audio');
const PHONEMES_DIR = path.join(AUDIO_DIR, 'phonemes');
const WORDS_DIR = path.join(AUDIO_DIR, 'words');
const REGISTRY_FILE = path.join(STORAGE_ROOT, 'audio-registry.json');
const LEADERBOARD_FILE = path.join(STORAGE_ROOT, 'leaderboard.json');

// Teacher auth secret token (valid for server session or configured via env)
const TEACHER_SECRET_KEY = process.env.TEACHER_KEY || '1234';
const activeTeacherTokens = new Set<string>();

export function initStorage(): void {
  if (!fs.existsSync(STORAGE_ROOT)) fs.mkdirSync(STORAGE_ROOT, { recursive: true });
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
  if (!fs.existsSync(PHONEMES_DIR)) fs.mkdirSync(PHONEMES_DIR, { recursive: true });
  if (!fs.existsSync(WORDS_DIR)) fs.mkdirSync(WORDS_DIR, { recursive: true });

  // Initialize Audio Registry
  if (!fs.existsSync(REGISTRY_FILE)) {
    const defaultRegistry: Record<string, CloudAudioEntry> = {};

    // Standard phonemes
    const phonemesList = [
      { id: 'p_s', key: 's', symbol: '/s/' },
      { id: 'p_a', key: 'a_short', symbol: '/æ/' },
      { id: 'p_t', key: 't', symbol: '/t/' },
      { id: 'p_p', key: 'p', symbol: '/p/' },
      { id: 'p_i', key: 'i_short', symbol: '/ɪ/' },
      { id: 'p_n', key: 'n', symbol: '/n/' },
      { id: 'p_m', key: 'm', symbol: '/m/' },
      { id: 'p_d', key: 'd', symbol: '/d/' },
      { id: 'p_g', key: 'g', symbol: '/ɡ/' },
      { id: 'p_o', key: 'o_short', symbol: '/ɒ/' },
      { id: 'p_c', key: 'c', symbol: '/k/' },
      { id: 'p_k', key: 'k', symbol: '/k/' },
      { id: 'p_e', key: 'e_short', symbol: '/e/' },
      { id: 'p_u', key: 'u_short', symbol: '/ʌ/' },
      { id: 'p_r', key: 'r', symbol: '/r/' },
      { id: 'p_h', key: 'h', symbol: '/h/' },
      { id: 'p_b', key: 'b', symbol: '/b/' },
      { id: 'p_f', key: 'f', symbol: '/f/' },
      { id: 'p_l', key: 'l', symbol: '/l/' },
    ];

    phonemesList.forEach(item => {
      const fileName = `${item.key}.wav`;
      const filePath = path.join(PHONEMES_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        const wav = createPhoneticWavBuffer(item.symbol);
        fs.writeFileSync(filePath, wav);
      }
      defaultRegistry[item.id] = {
        id: item.id,
        category: 'phonemes',
        key: item.key,
        phonemeOrWord: item.symbol,
        path: `phonemes/${fileName}`,
        status: 'verified_cloud',
        sizeBytes: fs.statSync(filePath).size,
        mimeType: 'audio/wav',
        updatedAt: new Date().toISOString(),
        version: 1,
      };
    });

    // Standard CVC words
    const wordsList = ['cat', 'mat', 'sat', 'map', 'tap', 'cap', 'pin', 'sit', 'fin', 'sun', 'run', 'cup', 'pen', 'hen', 'bed', 'pot', 'dog'];
    wordsList.forEach(word => {
      const id = `w_${word}`;
      const fileName = `${word}.wav`;
      const filePath = path.join(WORDS_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        const wav = createPhoneticWavBuffer(word);
        fs.writeFileSync(filePath, wav);
      }
      defaultRegistry[id] = {
        id,
        category: 'words',
        key: word,
        phonemeOrWord: word,
        path: `words/${fileName}`,
        status: 'verified_cloud',
        sizeBytes: fs.statSync(filePath).size,
        mimeType: 'audio/wav',
        updatedAt: new Date().toISOString(),
        version: 1,
      };
    });

    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(defaultRegistry, null, 2));
  }

  // Initialize Leaderboard
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    const defaultPeers: SharedLeaderboardItem[] = [
      { id: 'peer_1', name: 'Zidane Al-Hadi', totalPoints: 340, phonicsAccuracy: 95, goalsScored: 8, gamesCompleted: 6, badgesCount: 5, updatedAt: new Date().toISOString() },
      { id: 'peer_2', name: 'Maya Chen', totalPoints: 280, phonicsAccuracy: 90, goalsScored: 5, gamesCompleted: 4, badgesCount: 4, updatedAt: new Date().toISOString() },
      { id: 'peer_3', name: 'Leo Fernandez', totalPoints: 220, phonicsAccuracy: 85, goalsScored: 6, gamesCompleted: 3, badgesCount: 3, updatedAt: new Date().toISOString() },
      { id: 'peer_4', name: 'Amir Rahman', totalPoints: 175, phonicsAccuracy: 82, goalsScored: 3, gamesCompleted: 2, badgesCount: 2, updatedAt: new Date().toISOString() },
      { id: 'peer_5', name: 'Sofia Bell', totalPoints: 130, phonicsAccuracy: 80, goalsScored: 2, gamesCompleted: 2, badgesCount: 2, updatedAt: new Date().toISOString() },
    ];
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(defaultPeers, null, 2));
  }
}

export function getAudioRegistry(): Record<string, CloudAudioEntry> {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

export function saveAudioRegistry(registry: Record<string, CloudAudioEntry>): void {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

export function getAudioFilePath(subPath: string): string | null {
  // Prevent directory traversal attacks
  const safePath = path.normalize(subPath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(AUDIO_DIR, safePath);
  if (!fullPath.startsWith(AUDIO_DIR)) return null;
  if (!fs.existsSync(fullPath)) return null;
  return fullPath;
}

export function saveUploadedAudio(
  id: string,
  category: 'phonemes' | 'words',
  filename: string,
  buffer: Buffer,
  mimeType: string,
  isVerified: boolean = true
): CloudAudioEntry {
  const targetDir = category === 'phonemes' ? PHONEMES_DIR : WORDS_DIR;
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const targetPath = path.join(targetDir, safeFilename);

  fs.writeFileSync(targetPath, buffer);

  const registry = getAudioRegistry();
  const current = registry[id];
  const version = (current?.version || 0) + 1;

  const entry: CloudAudioEntry = {
    id,
    category,
    key: current?.key || id.replace(/^(p_|w_)/, ''),
    phonemeOrWord: current?.phonemeOrWord || id,
    path: `${category}/${safeFilename}`,
    status: isVerified ? 'verified_cloud' : 'unverified_cloud',
    sizeBytes: buffer.length,
    mimeType: mimeType || 'audio/mpeg',
    updatedAt: new Date().toISOString(),
    version,
  };

  registry[id] = entry;
  saveAudioRegistry(registry);
  return entry;
}

export function updateAudioStatus(id: string, status: 'verified_cloud' | 'unverified_cloud' | 'missing'): CloudAudioEntry | null {
  const registry = getAudioRegistry();
  const entry = registry[id];
  if (!entry) return null;

  entry.status = status;
  entry.updatedAt = new Date().toISOString();
  entry.version += 1;
  saveAudioRegistry(registry);
  return entry;
}

export function removeAudio(id: string): boolean {
  const registry = getAudioRegistry();
  const entry = registry[id];
  if (!entry) return false;

  entry.status = 'missing';
  entry.updatedAt = new Date().toISOString();
  entry.version += 1;

  // We keep backup or mark as missing as required by prompt
  saveAudioRegistry(registry);
  return true;
}

// Teacher Authentication Helpers
export function verifyTeacherPasscode(passcode: string): { success: boolean; token?: string; error?: string } {
  if (passcode.trim() === TEACHER_SECRET_KEY) {
    const token = crypto.randomBytes(32).toString('hex');
    activeTeacherTokens.add(token);
    return { success: true, token };
  }
  return { success: false, error: 'Invalid teacher credentials.' };
}

export function isValidTeacherToken(token: string | undefined): boolean {
  if (!token) return false;
  return activeTeacherTokens.has(token);
}

// Leaderboard Helpers
export function getSharedLeaderboard(): SharedLeaderboardItem[] {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

export function submitLeaderboardScore(item: {
  id: string;
  name: string;
  totalPoints: number;
  phonicsAccuracy: number;
  goalsScored: number;
  gamesCompleted: number;
  badgesCount: number;
}): SharedLeaderboardItem[] {
  const list = getSharedLeaderboard();
  // Sanitize player name: maximum 20 chars, strip HTML/scripts
  const safeName = item.name.replace(/[<>]/g, '').trim().slice(0, 20) || 'Academy Striker';

  const existingIdx = list.findIndex(e => e.id === item.id);
  const entry: SharedLeaderboardItem = {
    id: item.id || `p_${Date.now()}`,
    name: safeName,
    totalPoints: Math.max(0, Math.min(100000, Math.floor(item.totalPoints))),
    phonicsAccuracy: Math.max(0, Math.min(100, Math.floor(item.phonicsAccuracy))),
    goalsScored: Math.max(0, Math.min(1000, Math.floor(item.goalsScored))),
    gamesCompleted: Math.max(0, Math.min(1000, Math.floor(item.gamesCompleted))),
    badgesCount: Math.max(0, Math.min(20, Math.floor(item.badgesCount))),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    list[existingIdx] = entry;
  } else {
    list.push(entry);
  }

  // Keep top 50
  list.sort((a, b) => b.totalPoints - a.totalPoints);
  const trimmed = list.slice(0, 50);

  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(trimmed, null, 2));
  return trimmed;
}
