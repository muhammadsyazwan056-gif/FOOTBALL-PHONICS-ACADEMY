import fs from 'node:fs';
import path from 'node:path';

/**
 * Creates a valid mono 16-bit 22050Hz PCM WAV buffer with phonetic sound synthesis.
 */
export function createPhoneticWavBuffer(phonemeOrWord: string): Buffer {
  const sampleRate = 22050;
  const isWord = phonemeOrWord.length === 3;
  const duration = isWord ? 0.7 : 0.45;
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const clean = phonemeOrWord.toLowerCase().replace(/[\/\[\]]/g, '');

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Amplitude envelope: gentle attack, sustain, smooth decay
    let env = 1.0;
    if (t < 0.04) {
      env = t / 0.04;
    } else if (t > duration - 0.08) {
      env = Math.max(0, (duration - t) / 0.08);
    }

    if (['s', 'f', 'h'].includes(clean)) {
      // Shaped noise for fricatives
      const noise = Math.random() * 2 - 1;
      const freq = clean === 's' ? 5000 : clean === 'f' ? 2800 : 1200;
      sample = noise * Math.sin(2 * Math.PI * freq * t) * 0.4 * env;
    } else if (['m', 'n'].includes(clean)) {
      // Nasal resonant murmur
      const f0 = clean === 'm' ? 120 : 130;
      const f1 = clean === 'm' ? 260 : 380;
      sample = (0.6 * Math.sin(2 * Math.PI * f0 * t) + 0.4 * Math.sin(2 * Math.PI * f1 * t)) * 0.5 * env;
    } else if (['t', 'p', 'k', 'c', 'd', 'b', 'g'].includes(clean)) {
      // Plosive burst
      if (t < 0.12) {
        const decay = Math.exp(-t * 35);
        const freq = clean === 't' ? 1600 : clean === 'p' ? 260 : 850;
        sample = Math.sin(2 * Math.PI * freq * t) * decay * 0.6;
      }
    } else if (isWord) {
      // 3-phoneme blended CVC sequence
      const segT = t / duration;
      let f0 = 140;
      let f1 = 700;
      if (segT < 0.25) {
        f0 = 130;
        f1 = 450;
      } else if (segT < 0.7) {
        f0 = 150;
        f1 = 800; // vowel resonance
      } else {
        f0 = 120;
        f1 = 500;
      }
      sample = (0.6 * Math.sin(2 * Math.PI * f0 * t) + 0.4 * Math.sin(2 * Math.PI * f1 * t)) * 0.45 * env;
    } else {
      // Vowels & Sonorants: English formant blending
      const f0 = 140;
      let f1 = 700;
      let f2 = 1700;
      if (['a', 'æ'].includes(clean)) { f1 = 800; f2 = 1700; }
      else if (['e'].includes(clean)) { f1 = 550; f2 = 1900; }
      else if (['i', 'ɪ'].includes(clean)) { f1 = 400; f2 = 2100; }
      else if (['o', 'ɒ'].includes(clean)) { f1 = 550; f2 = 950; }
      else if (['u', 'ʌ'].includes(clean)) { f1 = 650; f2 = 1250; }

      sample = (0.5 * Math.sin(2 * Math.PI * f0 * t) +
                0.35 * Math.sin(2 * Math.PI * f1 * t) +
                0.15 * Math.sin(2 * Math.PI * f2 * t)) * 0.5 * env;
    }

    // Clamp to 16-bit signed integer
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}
