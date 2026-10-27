import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAccuracy, evaluateBadges, DEFAULT_SCORING_CONFIG } from './scoring';

test('calculateAccuracy calculates percentage correctly', () => {
  assert.equal(calculateAccuracy(10, 10), 100);
  assert.equal(calculateAccuracy(8, 10), 80);
  assert.equal(calculateAccuracy(1, 3), 33);
  assert.equal(calculateAccuracy(0, 0), 0);
});

test('evaluateBadges unlocks badges based on thresholds', () => {
  const badges = evaluateBadges({
    totalPoints: 160,
    goalsScored: 3,
    phonicsAccuracy: 85,
    gamesCompleted: 2,
    existingBadges: [],
  });

  assert.ok(badges.includes('Academy Rookie'));
  assert.ok(badges.includes('Phonics Striker'));
  assert.ok(badges.includes('Hat-Trick Hero'));
  assert.ok(badges.includes('Precision Detective'));
  assert.ok(!badges.includes('Golden Champion')); // requires 300 pts
});

test('scoring configuration contains standard point rewards', () => {
  assert.equal(DEFAULT_SCORING_CONFIG.soundDetectiveCorrect, 10);
  assert.equal(DEFAULT_SCORING_CONFIG.footballGoal, 25);
  assert.equal(DEFAULT_SCORING_CONFIG.wordBuilderBlendingCorrect, 20);
});
