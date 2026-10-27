import React, { useRef, useEffect } from 'react';
import {
  DEFAULT_PITCH,
  updateBallPhysics,
  calculateShotTrajectory,
  findBestPassTarget,
  BallState,
  PlayerState,
  PitchDimensions,
} from '../../game/footballPhysics';
import { soundManager } from '../../services/audioService';

interface FootballCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  onGoalScored: (team: 'player' | 'opponent') => void;
  onPassCompleted: () => void;
  onTriggerPhonicsChallenge: (stage: 1 | 2 | 3) => void;
  speedBoostActive: boolean;
}

export const FootballCanvas: React.FC<FootballCanvasProps> = ({
  isPlaying,
  isPaused,
  onGoalScored,
  onPassCompleted,
  onTriggerPhonicsChallenge,
  speedBoostActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game simulation state held in refs so 60fps loop doesn't re-render React
  const stateRef = useRef<{
    ball: BallState;
    players: PlayerState[];
    activePlayerId: string;
    keys: Record<string, boolean>;
    passCooldown: number;
    shotCooldown: number;
    challengeTimer: number;
    goalAnimationTimer: number;
    justScoredTeam: 'player' | 'opponent' | null;
  }>({
    ball: {
      x: DEFAULT_PITCH.width / 2,
      y: DEFAULT_PITCH.height / 2,
      vx: 0,
      vy: 0,
      radius: 7,
      friction: 0.965,
      isHeld: true,
      holderId: 'p_user',
    },
    players: [],
    activePlayerId: 'p_user',
    keys: {},
    passCooldown: 0,
    shotCooldown: 0,
    challengeTimer: 300, // triggers periodic phonics challenge during match
    goalAnimationTimer: 0,
    justScoredTeam: null,
  });

  // Keep callback refs fresh
  const callbacksRef = useRef({
    onGoalScored,
    onPassCompleted,
    onTriggerPhonicsChallenge,
    speedBoostActive,
  });
  useEffect(() => {
    callbacksRef.current = {
      onGoalScored,
      onPassCompleted,
      onTriggerPhonicsChallenge,
      speedBoostActive,
    };
  }, [onGoalScored, onPassCompleted, onTriggerPhonicsChallenge, speedBoostActive]);

  // Initialize squad positions - Real Madrid C.F. vs Derby Rivals
  const initSquads = () => {
    const p = DEFAULT_PITCH;
    const players: PlayerState[] = [
      // Real Madrid Squad (Pure White & Gold Kit, Purple Sash)
      { id: 'p_gk', name: 'Courtois', number: 1, team: 'player', isUser: false, isGoalkeeper: true, x: 50, y: p.height / 2, vx: 0, vy: 0, speed: 2.8, angle: 0, hasBall: false, homeX: 55, homeY: p.height / 2, kickCooldown: 0 },
      { id: 'p_def1', name: 'Carvajal', number: 2, team: 'player', isUser: false, isGoalkeeper: false, x: 200, y: 140, vx: 0, vy: 0, speed: 3.5, angle: 0, hasBall: false, homeX: 200, homeY: 140, kickCooldown: 0 },
      { id: 'p_def2', name: 'Rüdiger', number: 22, team: 'player', isUser: false, isGoalkeeper: false, x: 200, y: 380, vx: 0, vy: 0, speed: 3.5, angle: 0, hasBall: false, homeX: 200, homeY: 380, kickCooldown: 0 },
      { id: 'p_mid1', name: 'Modrić', number: 10, team: 'player', isUser: false, isGoalkeeper: false, x: 340, y: 170, vx: 0, vy: 0, speed: 3.8, angle: 0, hasBall: false, homeX: 340, homeY: 170, kickCooldown: 0 },
      { id: 'p_mid2', name: 'Bellingham', number: 5, team: 'player', isUser: false, isGoalkeeper: false, x: 360, y: 340, vx: 0, vy: 0, speed: 3.9, angle: 0, hasBall: false, homeX: 360, homeY: 340, kickCooldown: 0 },
      { id: 'p_user', name: 'Vini Jr', number: 7, team: 'player', isUser: true, isGoalkeeper: false, x: p.width / 2, y: p.height / 2, vx: 0, vy: 0, speed: 4.2, angle: 0, hasBall: true, homeX: p.width / 2, homeY: p.height / 2, kickCooldown: 0 },
      { id: 'p_wing', name: 'Mbappé', number: 9, team: 'player', isUser: false, isGoalkeeper: false, x: 490, y: 220, vx: 0, vy: 0, speed: 4.1, angle: 0, hasBall: false, homeX: 490, homeY: 220, kickCooldown: 0 },

      // Opponent Team (Derby Rivals - Red/White Stripes)
      { id: 'o_gk', name: 'Oblak', number: 13, team: 'opponent', isUser: false, isGoalkeeper: true, x: p.width - 50, y: p.height / 2, vx: 0, vy: 0, speed: 2.8, angle: Math.PI, hasBall: false, homeX: p.width - 55, homeY: p.height / 2, kickCooldown: 0 },
      { id: 'o_def1', name: 'Giménez', number: 2, team: 'opponent', isUser: false, isGoalkeeper: false, x: p.width - 190, y: 150, vx: 0, vy: 0, speed: 3.2, angle: Math.PI, hasBall: false, homeX: p.width - 190, homeY: 150, kickCooldown: 0 },
      { id: 'o_def2', name: 'Savic', number: 3, team: 'opponent', isUser: false, isGoalkeeper: false, x: p.width - 190, y: 370, vx: 0, vy: 0, speed: 3.2, angle: Math.PI, hasBall: false, homeX: p.width - 190, homeY: 370, kickCooldown: 0 },
      { id: 'o_mid1', name: 'Koke', number: 6, team: 'opponent', isUser: false, isGoalkeeper: false, x: p.width - 330, y: 190, vx: 0, vy: 0, speed: 3.3, angle: Math.PI, hasBall: false, homeX: p.width - 330, homeY: 190, kickCooldown: 0 },
      { id: 'o_mid2', name: 'De Paul', number: 5, team: 'opponent', isUser: false, isGoalkeeper: false, x: p.width - 330, y: 330, vx: 0, vy: 0, speed: 3.4, angle: Math.PI, hasBall: false, homeX: p.width - 330, homeY: 330, kickCooldown: 0 },
      { id: 'o_fwd', name: 'Griezmann', number: 7, team: 'opponent', isUser: false, isGoalkeeper: false, x: p.width - 450, y: 260, vx: 0, vy: 0, speed: 3.6, angle: Math.PI, hasBall: false, homeX: p.width - 450, homeY: 260, kickCooldown: 0 },
    ];

    stateRef.current.players = players;
    stateRef.current.ball = {
      x: p.width / 2,
      y: p.height / 2,
      vx: 0,
      vy: 0,
      radius: 7,
      friction: 0.965,
      isHeld: true,
      holderId: 'p_user',
    };
    stateRef.current.activePlayerId = 'p_user';
  };

  useEffect(() => {
    initSquads();
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent page scrolling on arrow/space keys during gameplay
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      stateRef.current.keys[e.key.toLowerCase()] = true;

      // 'e' switches player to nearest teammate
      if (e.key.toLowerCase() === 'e') {
        switchPlayer();
      }

      // Spacebar triggers pass
      if (e.key === ' ' || e.code === 'Space') {
        attemptPass();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    const handleBlur = () => {
      stateRef.current.keys = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const switchPlayer = () => {
    const s = stateRef.current;
    const teammates = s.players.filter(p => p.team === 'player' && !p.isGoalkeeper && p.id !== s.activePlayerId);
    if (teammates.length === 0) return;

    // Pick closest to ball
    let nearest = teammates[0];
    let minDist = Infinity;
    teammates.forEach(m => {
      const d = Math.hypot(m.x - s.ball.x, m.y - s.ball.y);
      if (d < minDist) {
        minDist = d;
        nearest = m;
      }
    });

    s.players.forEach(p => {
      p.isUser = p.id === nearest.id;
    });
    s.activePlayerId = nearest.id;
    soundManager.playClick();
  };

  const attemptPass = () => {
    const s = stateRef.current;
    const activePlayer = s.players.find(p => p.id === s.activePlayerId);
    if (!activePlayer || !s.ball.isHeld || s.ball.holderId !== activePlayer.id) return;

    const teammates = s.players.filter(p => p.team === 'player');
    const opponents = s.players.filter(p => p.team === 'opponent');
    const target = findBestPassTarget(activePlayer, teammates, opponents);

    if (target) {
      soundManager.playPass();
      const dx = target.x - activePlayer.x;
      const dy = target.y - activePlayer.y;
      const len = Math.hypot(dx, dy) || 1;
      const passSpeed = 11;

      s.ball.isHeld = false;
      s.ball.holderId = null;
      s.ball.vx = (dx / len) * passSpeed;
      s.ball.vy = (dy / len) * passSpeed;

      // Transfer active control to receiver
      s.players.forEach(p => (p.isUser = p.id === target.id));
      s.activePlayerId = target.id;

      callbacksRef.current.onPassCompleted();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = DEFAULT_PITCH.width / rect.width;
    const scaleY = DEFAULT_PITCH.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const s = stateRef.current;
    const activePlayer = s.players.find(p => p.id === s.activePlayerId);
    if (!activePlayer || !s.ball.isHeld || s.ball.holderId !== activePlayer.id) return;

    // Execute shot towards click target
    const shotPower = callbacksRef.current.speedBoostActive ? 18 : 14;
    const shot = calculateShotTrajectory(activePlayer, { x: clickX, y: clickY }, DEFAULT_PITCH, shotPower);

    soundManager.playKick();
    s.ball.isHeld = false;
    s.ball.holderId = null;
    s.ball.vx = shot.vx;
    s.ball.vy = shot.vy;
    activePlayer.kickCooldown = 25;
  };

  // Main 60fps Animation Loop - only runs when actively playing
  useEffect(() => {
    // Initial paint for static pitch/player positioning
    render();

    if (!isPlaying || isPaused) {
      return;
    }

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      updateSimulation(dt);
      render();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isPaused]);

  // Simulation physics update
  const updateSimulation = (dt: number) => {
    const s = stateRef.current;
    const pitch = DEFAULT_PITCH;
    const speedBoost = callbacksRef.current.speedBoostActive ? 1.4 : 1.0;

    // Periodic phonics challenge check (every ~20 seconds of open play)
    s.challengeTimer -= 1;
    if (s.challengeTimer <= 0) {
      s.challengeTimer = 1100; // reset
      const randomStage = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
      callbacksRef.current.onTriggerPhonicsChallenge(randomStage);
    }

    // Goal celebration cooldown
    if (s.goalAnimationTimer > 0) {
      s.goalAnimationTimer -= 1;
      if (s.goalAnimationTimer === 0) {
        initSquads();
      }
      return;
    }

    // 1. User input movement
    const activePlayer = s.players.find(p => p.id === s.activePlayerId);
    if (activePlayer) {
      let mx = 0;
      let my = 0;
      if (s.keys['w'] || s.keys['arrowup']) my -= 1;
      if (s.keys['s'] || s.keys['arrowdown']) my += 1;
      if (s.keys['a'] || s.keys['arrowleft']) mx -= 1;
      if (s.keys['d'] || s.keys['arrowright']) mx += 1;

      const isSprint = s.keys['shift'];
      const currentSpeed = (isSprint ? activePlayer.speed * 1.35 : activePlayer.speed) * speedBoost;

      if (mx !== 0 || my !== 0) {
        const len = Math.hypot(mx, my);
        activePlayer.vx = (mx / len) * currentSpeed;
        activePlayer.vy = (my / len) * currentSpeed;
        activePlayer.angle = Math.atan2(my, mx);
      } else {
        activePlayer.vx *= 0.8;
        activePlayer.vy *= 0.8;
      }
    }

    // 2. Update players (movement & boundary clamps)
    s.players.forEach(p => {
      // AI behavior
      if (!p.isUser) {
        updateAIPlayer(p, s.ball, s.players, pitch);
      }

      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;

      // Keep in pitch boundaries
      p.x = Math.max(25, Math.min(pitch.width - 25, p.x));
      p.y = Math.max(25, Math.min(pitch.height - 25, p.y));

      if (p.kickCooldown > 0) p.kickCooldown -= 1;
    });

    // 3. Ball Physics & Dribbling
    if (s.ball.isHeld && s.ball.holderId) {
      const holder = s.players.find(p => p.id === s.ball.holderId);
      if (holder) {
        const dribbleDist = 14;
        s.ball.x = holder.x + Math.cos(holder.angle) * dribbleDist;
        s.ball.y = holder.y + Math.sin(holder.angle) * dribbleDist;
        s.ball.vx = holder.vx;
        s.ball.vy = holder.vy;

        // Opponents can tackle
        const opponents = s.players.filter(p => p.team !== holder.team && !p.isGoalkeeper);
        for (const opp of opponents) {
          const dist = Math.hypot(opp.x - s.ball.x, opp.y - s.ball.y);
          if (dist < 18 && opp.kickCooldown === 0) {
            // Tackle! Dislodge ball
            s.ball.isHeld = false;
            s.ball.holderId = null;
            s.ball.vx = (Math.random() - 0.5) * 6;
            s.ball.vy = (Math.random() - 0.5) * 6;
            opp.kickCooldown = 30;
            break;
          }
        }
      } else {
        s.ball.isHeld = false;
        s.ball.holderId = null;
      }
    } else {
      // Free rolling ball physics
      const { ball: nextBall, goalScoredTeam } = updateBallPhysics(s.ball, dt, pitch);
      s.ball = nextBall;

      if (goalScoredTeam) {
        s.goalAnimationTimer = 110;
        s.justScoredTeam = goalScoredTeam;
        if (goalScoredTeam === 'player') {
          soundManager.playMadridFanfare();
        } else {
          soundManager.playGoalCheer();
        }
        callbacksRef.current.onGoalScored(goalScoredTeam);
        return;
      }

      // Check player ball pickup / control
      for (const p of s.players) {
        if (p.kickCooldown > 0) continue;
        const dist = Math.hypot(p.x - s.ball.x, p.y - s.ball.y);
        if (dist < 18) {
          // Player gains possession
          s.ball.isHeld = true;
          s.ball.holderId = p.id;
          s.ball.vx = 0;
          s.ball.vy = 0;
          if (p.team === 'player' && !p.isUser) {
            // Switch active control to teammate with ball
            s.players.forEach(m => (m.isUser = m.id === p.id));
            s.activePlayerId = p.id;
          }
          break;
        }
      }
    }
  };

  const updateAIPlayer = (p: PlayerState, ball: BallState, allPlayers: PlayerState[], pitch: PitchDimensions) => {
    // Goalkeeper AI
    if (p.isGoalkeeper) {
      const targetY = Math.max(
        (pitch.height - pitch.goalWidth) / 2 + 15,
        Math.min((pitch.height + pitch.goalWidth) / 2 - 15, ball.y)
      );
      const dy = targetY - p.y;
      p.vy = Math.sign(dy) * Math.min(Math.abs(dy) * 0.1, p.speed);
      p.vx = 0;
      return;
    }

    // Teammate AI (Real Madrid squad)
    if (p.team === 'player') {
      const ballDist = Math.hypot(ball.x - p.x, ball.y - p.y);
      if (!ball.isHeld && ballDist < 180) {
        // Move to loose ball
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        p.vx = (dx / len) * p.speed;
        p.vy = (dy / len) * p.speed;
        p.angle = Math.atan2(dy, dx);
      } else {
        // Move into attacking formation space relative to home
        const targetX = p.homeX + (ball.x > pitch.width / 2 ? 80 : 0);
        const targetY = p.homeY + (ball.y - pitch.height / 2) * 0.3;
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        if (Math.hypot(dx, dy) > 20) {
          const len = Math.hypot(dx, dy) || 1;
          p.vx = (dx / len) * p.speed * 0.7;
          p.vy = (dy / len) * p.speed * 0.7;
          p.angle = Math.atan2(dy, dx);
        } else {
          p.vx = 0;
          p.vy = 0;
        }
      }
      return;
    }

    // Opponent Squad AI (Defenders & Midfielders)
    if (p.team === 'opponent') {
      const ballDist = Math.hypot(ball.x - p.x, ball.y - p.y);

      // If opponent has ball, pass or shoot
      if (ball.isHeld && ball.holderId === p.id) {
        // Shoot towards left goal if close
        if (p.x < pitch.width * 0.4) {
          soundManager.playKick();
          const targetY = pitch.height / 2 + (Math.random() - 0.5) * 60;
          const dx = -10 - p.x;
          const dy = targetY - p.y;
          const len = Math.hypot(dx, dy) || 1;
          ball.isHeld = false;
          ball.holderId = null;
          ball.vx = (dx / len) * 11;
          ball.vy = (dy / len) * 11;
          p.kickCooldown = 40;
        } else {
          // Dribble towards player goal
          p.vx = -p.speed * 0.8;
          p.vy = (p.homeY - p.y) * 0.05;
          p.angle = Math.PI;
        }
        return;
      }

      // Press ball if within defending zone
      if (ballDist < 190 && p.x > ball.x - 30) {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        p.vx = (dx / len) * p.speed * 0.9;
        p.vy = (dy / len) * p.speed * 0.9;
        p.angle = Math.atan2(dy, dx);
      } else {
        // Return to defensive anchor
        const dx = p.homeX - p.x;
        const dy = p.homeY - p.y;
        if (Math.hypot(dx, dy) > 25) {
          const len = Math.hypot(dx, dy) || 1;
          p.vx = (dx / len) * p.speed * 0.6;
          p.vy = (dy / len) * p.speed * 0.6;
          p.angle = Math.atan2(dy, dx);
        } else {
          p.vx = 0;
          p.vy = 0;
        }
      }
    }
  };

  // 2D Santiago Bernabéu Canvas Renderer
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const p = DEFAULT_PITCH;
    const s = stateRef.current;

    // Pitch Grass Background with Santiago Bernabéu precision turf mowing pattern
    ctx.clearRect(0, 0, p.width, p.height);

    const stripeWidth = 55;
    for (let x = 0; x < p.width; x += stripeWidth) {
      ctx.fillStyle = (x / stripeWidth) % 2 === 0 ? '#15803d' : '#166534';
      ctx.fillRect(x, 0, stripeWidth, p.height);
    }

    // Bernabéu Stadium LED Perimeter Advertising Ribbons along top and bottom
    ctx.fillStyle = '#001A49';
    ctx.fillRect(0, 0, p.width, 18);
    ctx.fillRect(0, p.height - 18, p.width, 18);

    // Gold LED separator pinstripes
    ctx.fillStyle = '#EAB308';
    ctx.fillRect(0, 17, p.width, 1.5);
    ctx.fillRect(0, p.height - 18.5, p.width, 1.5);

    // Top LED Board Text
    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'ESTADIO SANTIAGO BERNABÉU  ⚪  REAL MADRID C.F.  ⚪  ¡HALA MADRID Y NADA MÁS!  ⚪  15★ LA DECIMOQUINTA  ⚪  EMIRATES FLY BETTER',
      p.width / 2,
      12
    );

    // Bottom LED Board Text
    ctx.fillText(
      'CIUDAD REAL MADRID  ⚪  LA FÁBRICA PHONICS ACADEMY  ⚪  ADIDAS  ⚪  YEAR 1 ESL TOURNAMENT  ⚪  REAL MADRID C.F.',
      p.width / 2,
      p.height - 6
    );

    // Touchlines & Markings (crisp white)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.5;

    // Outer boundary line
    ctx.strokeRect(20, 22, p.width - 40, p.height - 44);

    // Halfway line & Centre circle
    ctx.beginPath();
    ctx.moveTo(p.width / 2, 22);
    ctx.lineTo(p.width / 2, p.height - 22);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(p.width / 2, p.height / 2, p.centreCircleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Centre spot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(p.width / 2, p.height / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Bernabéu Center Circle Crown Motif
    ctx.save();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.width / 2, p.height / 2, p.centreCircleRadius - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Penalty Areas
    const penTop = (p.height - p.penaltyAreaHeight) / 2;
    // Left penalty area (Real Madrid defensive box)
    ctx.strokeRect(20, penTop, p.penaltyAreaWidth, p.penaltyAreaHeight);
    // Left penalty spot
    ctx.beginPath();
    ctx.arc(20 + 95, p.height / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Right penalty area (Santiago Bernabéu Fondo Norte / Attacking goal)
    ctx.strokeRect(p.width - 20 - p.penaltyAreaWidth, penTop, p.penaltyAreaWidth, p.penaltyAreaHeight);
    // Right penalty spot
    ctx.beginPath();
    ctx.arc(p.width - 20 - 95, p.height / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Goals (Net & Posts)
    const goalTop = (p.height - p.goalWidth) / 2;
    // Left Goal
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(20 - p.goalDepth, goalTop, p.goalDepth, p.goalWidth);
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(20 - p.goalDepth, goalTop, p.goalDepth, p.goalWidth);

    // Right Goal (Fondo Norte Goal)
    ctx.fillRect(p.width - 20, goalTop, p.goalDepth, p.goalWidth);
    ctx.strokeRect(p.width - 20, goalTop, p.goalDepth, p.goalWidth);

    // Corner Arcs with Real Madrid Purple/Gold Pennants
    [
      [20, 22],
      [p.width - 20, 22],
      [20, p.height - 22],
      [p.width - 20, p.height - 22],
    ].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Bernabéu Corner Floodlight Beams (soft aesthetic lighting)
    ctx.save();
    const cornerGrad = ctx.createRadialGradient(20, 20, 5, 20, 20, 180);
    cornerGrad.addColorStop(0, 'rgba(253, 230, 138, 0.18)');
    cornerGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');
    ctx.fillStyle = cornerGrad;
    ctx.fillRect(0, 0, 200, 200);

    const cornerGradR = ctx.createRadialGradient(p.width - 20, 20, 5, p.width - 20, 20, 180);
    cornerGradR.addColorStop(0, 'rgba(253, 230, 138, 0.18)');
    cornerGradR.addColorStop(1, 'rgba(253, 230, 138, 0)');
    ctx.fillStyle = cornerGradR;
    ctx.fillRect(p.width - 200, 0, 200, 200);
    ctx.restore();

    // Render Players
    s.players.forEach(pl => {
      renderPlayer(ctx, pl, pl.id === s.activePlayerId);
    });

    // Render Ball
    renderBall(ctx, s.ball);

    // Goal celebration banner - Real Madrid Bernabéu Special
    if (s.goalAnimationTimer > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 26, 73, 0.88)';
      ctx.fillRect(0, p.height / 2 - 55, p.width, 110);

      // Gold border
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, p.height / 2 - 55, p.width, 110);

      if (s.justScoredTeam === 'player') {
        // Real Madrid Goal!
        ctx.fillStyle = '#FDE68A';
        ctx.font = 'black 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑 ¡¡¡GOOOOL DEL REAL MADRID!!! ⚽', p.width / 2, p.height / 2);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('¡HALA MADRID Y NADA MÁS! · SANTIAGO BERNABÉU CELEBRATION', p.width / 2, p.height / 2 + 28);
      } else {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OPPONENT GOAL!', p.width / 2, p.height / 2 + 8);
      }
      ctx.restore();
    }
  };

  const renderPlayer = (ctx: CanvasRenderingContext2D, pl: PlayerState, isSelected: boolean) => {
    ctx.save();
    ctx.translate(pl.x, pl.y);

    // Selected indicator ring & gold arrow
    if (isSelected) {
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Above-head arrow
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(-6, -33);
      ctx.lineTo(6, -33);
      ctx.closePath();
      ctx.fill();
    }

    // Player Name Tag & Number above head
    ctx.fillStyle = isSelected ? '#FACC15' : 'rgba(255, 255, 255, 0.9)';
    ctx.font = isSelected ? 'bold 10px sans-serif' : '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${pl.name} (${pl.number})`, 0, -16);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 11, 12, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Player Direction Angle
    ctx.rotate(pl.angle);

    // Legs / Boots
    ctx.fillStyle = pl.team === 'player' ? '#FFFFFF' : '#0F172A';
    ctx.fillRect(3, 4, 4, 7);
    ctx.fillRect(-7, 4, 4, 7);

    // Jersey Body
    if (pl.isGoalkeeper && pl.team === 'player') {
      ctx.fillStyle = '#84CC16'; // Courtois Neon Green Goalkeeper Kit
    } else if (pl.isGoalkeeper && pl.team === 'opponent') {
      ctx.fillStyle = '#0284C7'; // Opponent GK Sky Blue
    } else if (pl.team === 'player') {
      ctx.fillStyle = '#FFFFFF'; // Pure Real Madrid White Kit
    } else {
      ctx.fillStyle = '#DC2626'; // Derby Rivals Red Kit
    }

    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    // Authentic Real Madrid Kit Trim: Gold outer ring & Purple diagonal sash
    if (pl.team === 'player' && !pl.isGoalkeeper) {
      // Real Madrid Gold Trim
      ctx.strokeStyle = '#EAB308';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Authentic Castilian Purple Diagonal Sash across chest
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#702082';
      ctx.fillRect(-10, -3, 20, 6);
      ctx.restore();
    } else if (pl.team === 'opponent' && !pl.isGoalkeeper) {
      // Opponent red & white vertical derby stripes
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-3, -11, 6, 22);
      ctx.restore();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // Head
    ctx.fillStyle = '#FDBA74';
    ctx.beginPath();
    ctx.arc(0, -3, 6, 0, Math.PI * 2);
    ctx.fill();

    // Number
    ctx.fillStyle = pl.team === 'player' ? '#001A49' : '#FFFFFF';
    ctx.font = 'black 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(pl.number), 0, 3.5);

    ctx.restore();
  };

  const renderBall = (ctx: CanvasRenderingContext2D, ball: BallState) => {
    ctx.save();
    // Shadow
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y + 4, ball.radius, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Football Outer Disc
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner pentagon pattern
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 border-4 border-slate-900 shadow-2xl flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={DEFAULT_PITCH.width}
        height={DEFAULT_PITCH.height}
        onClick={handleCanvasClick}
        className="w-full h-auto cursor-crosshair block select-none"
        aria-label="2D Football Pitch"
      />
    </div>
  );
};
