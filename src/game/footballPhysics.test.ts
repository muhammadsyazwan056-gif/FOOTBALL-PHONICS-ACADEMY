import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PITCH,
  updateBallPhysics,
  calculateShotTrajectory,
  findBestPassTarget,
  BallState,
  PlayerState,
} from './footballPhysics';

test('ball decelerates due to friction when rolling', () => {
  const initialBall: BallState = {
    x: 400,
    y: 260,
    vx: 10,
    vy: 0,
    radius: 8,
    friction: 0.95,
    isHeld: false,
    holderId: null,
  };

  const { ball: movedBall } = updateBallPhysics(initialBall, 1 / 60, DEFAULT_PITCH);
  assert.ok(movedBall.x > 400);
  assert.ok(movedBall.vx < 10);
});

test('goal detection triggers when ball enters opponent goal opening', () => {
  const goalCenterY = DEFAULT_PITCH.height / 2;
  const ballEnteringGoal: BallState = {
    x: DEFAULT_PITCH.width - 2,
    y: goalCenterY,
    vx: 8,
    vy: 0,
    radius: 8,
    friction: 0.98,
    isHeld: false,
    holderId: null,
  };

  const result = updateBallPhysics(ballEnteringGoal, 1 / 60, DEFAULT_PITCH);
  assert.equal(result.goalScoredTeam, 'player');
});

test('ball bounces off endline if outside goal opening', () => {
  const ballHittingEndline: BallState = {
    x: DEFAULT_PITCH.width - 2,
    y: 30, // Near top corner, outside goal
    vx: 8,
    vy: 0,
    radius: 8,
    friction: 0.98,
    isHeld: false,
    holderId: null,
  };

  const result = updateBallPhysics(ballHittingEndline, 1 / 60, DEFAULT_PITCH);
  assert.equal(result.goalScoredTeam, null);
  assert.ok(result.ball.vx < 0); // Bounced back
});

test('calculateShotTrajectory directs ball towards opponent goal', () => {
  const shooter: PlayerState = {
    id: 'p1',
    name: 'Player',
    number: 9,
    team: 'player',
    isUser: true,
    isGoalkeeper: false,
    x: 600,
    y: 260,
    vx: 0,
    vy: 0,
    speed: 4,
    angle: 0,
    hasBall: true,
    homeX: 600,
    homeY: 260,
    kickCooldown: 0,
  };

  const shot = calculateShotTrajectory(shooter, { x: 950, y: 260 }, DEFAULT_PITCH, 15);
  assert.ok(shot.vx > 10); // Shot moving fast towards right goal
  assert.ok(Math.abs(shot.vy) < 2); // Straight trajectory
});

test('findBestPassTarget picks teammate ahead in open space', () => {
  const passer: PlayerState = {
    id: 'p1',
    name: 'Passer',
    number: 10,
    team: 'player',
    isUser: true,
    isGoalkeeper: false,
    x: 300,
    y: 250,
    vx: 0,
    vy: 0,
    speed: 4,
    angle: 0,
    hasBall: true,
    homeX: 300,
    homeY: 250,
    kickCooldown: 0,
  };

  const forwardMate: PlayerState = {
    id: 'p2',
    name: 'Striker',
    number: 9,
    team: 'player',
    isUser: false,
    isGoalkeeper: false,
    x: 500,
    y: 200,
    vx: 0,
    vy: 0,
    speed: 4,
    angle: 0,
    hasBall: false,
    homeX: 500,
    homeY: 200,
    kickCooldown: 0,
  };

  const backwardMate: PlayerState = {
    id: 'p3',
    name: 'Defender',
    number: 4,
    team: 'player',
    isUser: false,
    isGoalkeeper: false,
    x: 150,
    y: 250,
    vx: 0,
    vy: 0,
    speed: 4,
    angle: 0,
    hasBall: false,
    homeX: 150,
    homeY: 250,
    kickCooldown: 0,
  };

  const bestTarget = findBestPassTarget(passer, [forwardMate, backwardMate], []);
  assert.equal(bestTarget?.id, 'p2');
});
