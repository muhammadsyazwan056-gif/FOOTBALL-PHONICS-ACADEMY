export interface Vector2D {
  x: number;
  y: number;
}

export interface PitchDimensions {
  width: number;
  height: number;
  goalWidth: number;
  goalDepth: number;
  penaltyAreaWidth: number;
  penaltyAreaHeight: number;
  centreCircleRadius: number;
}

export const DEFAULT_PITCH: PitchDimensions = {
  width: 900,
  height: 520,
  goalWidth: 140, // height of the goal opening in Y
  goalDepth: 35,
  penaltyAreaWidth: 160,
  penaltyAreaHeight: 280,
  centreCircleRadius: 75,
};

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  friction: number;
  isHeld: boolean;
  holderId: string | null;
}

export interface PlayerState {
  id: string;
  name: string;
  number: number;
  team: 'player' | 'opponent';
  isUser: boolean;
  isGoalkeeper: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  angle: number; // in radians
  hasBall: boolean;
  homeX: number;
  homeY: number;
  kickCooldown: number;
}

export function updateBallPhysics(ball: BallState, dt: number, pitch: PitchDimensions): {
  ball: BallState;
  goalScoredTeam: 'player' | 'opponent' | null;
} {
  let goalScoredTeam: 'player' | 'opponent' | null = null;

  if (ball.isHeld) {
    return { ball, goalScoredTeam: null };
  }

  // Update position
  let nextX = ball.x + ball.vx * dt * 60;
  let nextY = ball.y + ball.vy * dt * 60;

  // Apply friction
  const frictionFactor = Math.pow(ball.friction, dt * 60);
  let nextVx = ball.vx * frictionFactor;
  let nextVy = ball.vy * frictionFactor;

  // If very slow, halt
  if (Math.hypot(nextVx, nextVy) < 0.05) {
    nextVx = 0;
    nextVy = 0;
  }

  const goalTop = (pitch.height - pitch.goalWidth) / 2;
  const goalBottom = goalTop + pitch.goalWidth;

  // Check goal on right (player scores into opponent goal)
  if (nextX >= pitch.width - ball.radius) {
    if (nextY >= goalTop && nextY <= goalBottom) {
      if (nextX >= pitch.width + pitch.goalDepth - ball.radius) {
        nextX = pitch.width + pitch.goalDepth - ball.radius;
        nextVx = -nextVx * 0.4;
      }
      goalScoredTeam = 'player';
    } else {
      // Touchline / endline bounce
      nextX = pitch.width - ball.radius;
      nextVx = -nextVx * 0.6;
    }
  }

  // Check goal on left (opponent scores into player goal)
  if (nextX <= ball.radius) {
    if (nextY >= goalTop && nextY <= goalBottom) {
      if (nextX <= -pitch.goalDepth + ball.radius) {
        nextX = -pitch.goalDepth + ball.radius;
        nextVx = -nextVx * 0.4;
      }
      goalScoredTeam = 'opponent';
    } else {
      // Touchline / endline bounce
      nextX = ball.radius;
      nextVx = -nextVx * 0.6;
    }
  }

  // Top and bottom boundaries
  if (nextY <= ball.radius) {
    nextY = ball.radius;
    nextVy = -nextVy * 0.6;
  } else if (nextY >= pitch.height - ball.radius) {
    nextY = pitch.height - ball.radius;
    nextVy = -nextVy * 0.6;
  }

  return {
    ball: {
      ...ball,
      x: nextX,
      y: nextY,
      vx: nextVx,
      vy: nextVy,
    },
    goalScoredTeam,
  };
}

export function findBestPassTarget(
  passer: PlayerState,
  teammates: PlayerState[],
  opponents: PlayerState[]
): PlayerState | null {
  const eligible = teammates.filter(t => t.id !== passer.id && !t.isGoalkeeper);
  if (eligible.length === 0) return null;

  let bestTarget: PlayerState | null = null;
  let highestScore = -Infinity;

  for (const mate of eligible) {
    const dx = mate.x - passer.x;
    const dy = mate.y - passer.y;
    const dist = Math.hypot(dx, dy);

    // Prefer passes ahead towards the opponent goal (larger positive dx)
    // Penalize if too close (< 50) or too far (> 450)
    if (dist < 40 || dist > 500) continue;

    let forwardBonus = dx * 1.5;
    let distanceScore = 150 - Math.abs(dist - 200);

    // Check if path is blocked by opponent
    let blockedPenalty = 0;
    for (const opp of opponents) {
      const oppDist = Math.hypot(opp.x - mate.x, opp.y - mate.y);
      if (oppDist < 60) {
        blockedPenalty += 100;
      }
    }

    const totalScore = forwardBonus + distanceScore - blockedPenalty;
    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestTarget = mate;
    }
  }

  // Fallback to closest teammate ahead or any teammate
  return bestTarget || eligible[0];
}

export function calculateShotTrajectory(
  shooter: PlayerState,
  targetPos: Vector2D,
  pitch: PitchDimensions,
  shotPower: number = 14
): { vx: number; vy: number; targetX: number; targetY: number } {
  // Clamp target towards opponent goal opening
  const goalX = pitch.width;
  const goalTop = (pitch.height - pitch.goalWidth) / 2 + 10;
  const goalBottom = goalTop + pitch.goalWidth - 20;

  // Clamped target in Y inside the goal posts
  const targetY = Math.max(goalTop, Math.min(goalBottom, targetPos.y));
  const targetX = goalX + 15;

  const dx = targetX - shooter.x;
  const dy = targetY - shooter.y;
  const len = Math.hypot(dx, dy) || 1;

  return {
    vx: (dx / len) * shotPower,
    vy: (dy / len) * shotPower,
    targetX,
    targetY,
  };
}
