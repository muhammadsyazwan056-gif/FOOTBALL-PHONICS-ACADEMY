export interface ScoreConfig {
  soundDetectiveCorrect: number;
  missingLetterCorrect: number;
  soundStrikerCorrect: number;
  cvcGoalChallengeCorrect: number;
  wordBuilderBlendingCorrect: number;
  footballPass: number;
  footballGoal: number;
  activityCompletionBonus: number;
}

export const DEFAULT_SCORING_CONFIG: ScoreConfig = {
  soundDetectiveCorrect: 10,
  missingLetterCorrect: 10,
  soundStrikerCorrect: 10,
  cvcGoalChallengeCorrect: 15,
  wordBuilderBlendingCorrect: 20,
  footballPass: 2,
  footballGoal: 25,
  activityCompletionBonus: 10,
};

export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export function evaluateBadges(params: {
  totalPoints: number;
  goalsScored: number;
  phonicsAccuracy: number;
  gamesCompleted: number;
  existingBadges: string[];
}): string[] {
  const badges = new Set(params.existingBadges);

  if (params.totalPoints >= 50) badges.add('Academy Rookie');
  if (params.totalPoints >= 150) badges.add('Phonics Striker');
  if (params.totalPoints >= 250) badges.add('La Fábrica Star');
  if (params.totalPoints >= 300) badges.add('Golden Champion');
  if (params.totalPoints >= 500) badges.add('Decimoquinta Legend');
  if (params.goalsScored >= 1) badges.add('Bernabéu Debutant');
  if (params.goalsScored >= 3) badges.add('Hat-Trick Hero');
  if (params.goalsScored >= 10) badges.add('Golden Boot');
  if (params.phonicsAccuracy >= 80 && params.gamesCompleted >= 1) badges.add('Precision Detective');
  if (params.gamesCompleted >= 3) badges.add('Cup Veteran');

  return Array.from(badges);
}
