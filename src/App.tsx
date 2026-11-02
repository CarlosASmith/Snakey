import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Position, 
  Direction, 
  Snake, 
  Treasure, 
  TreasureType, 
  Obstacle, 
  Projectile, 
  Particle, 
  FloatingText, 
  PlayerStats, 
  GameState 
} from './types/game';
import { GAME_LEVELS } from './data/levels';
import { GRID_COLS, GRID_ROWS, findNextSnakeDirection, isWithinBounds } from './utils/pathfinding';
import { soundEngine } from './utils/audio';

import { PhoneChassis } from './components/PhoneChassis';
import { GameHUD } from './components/GameHUD';
import { GameBoard } from './components/GameBoard';
import { TouchControls } from './components/TouchControls';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelClearedModal } from './components/LevelClearedModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { Play, Trophy, HelpCircle, Flame, Crosshair, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation & Frame Mode
  const [isFramed, setIsFramed] = useState(true);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(() => {
    const saved = localStorage.getItem('cyberviper_unlocked_level');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Modals
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  // Game Engine State
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [playerPos, setPlayerPos] = useState<Position>({ x: 4, y: 14 });
  const [playerFacing, setPlayerFacing] = useState<Direction>('UP');
  const [playerInvulnerable, setPlayerInvulnerable] = useState(false);
  const [canDash, setCanDash] = useState(true);

  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    combo: 1,
    maxCombo: 1,
    treasuresCollected: 0,
    treasuresLostToSnake: 0,
    segmentsDestroyed: 0,
    lives: 3,
    shields: 0,
    empCharges: 0,
  });

  const [snake, setSnake] = useState<Snake | null>(null);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [levelBonus, setLevelBonus] = useState(0);
  const [activePowerup, setActivePowerup] = useState<{ name: string; secondsLeft: number } | null>(null);

  const currentLevelConfig = GAME_LEVELS[currentLevelIndex] || GAME_LEVELS[0];

  // Helper references for mutable loop logic
  const stateRef = useRef({
    gameState,
    playerPos,
    playerFacing,
    playerInvulnerable,
    snake,
    treasures,
    obstacles,
    stats,
    projectiles,
  });

  useEffect(() => {
    stateRef.current = {
      gameState,
      playerPos,
      playerFacing,
      playerInvulnerable,
      snake,
      treasures,
      obstacles,
      stats,
      projectiles,
    };
  }, [gameState, playerPos, playerFacing, playerInvulnerable, snake, treasures, obstacles, stats, projectiles]);

  // Add particles utility
  const spawnParticles = (x: number, y: number, color: string, count = 12) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      newParticles.push({
        id: 'p-' + Math.random(),
        x,
        y,
        color,
        size: 3 + Math.random() * 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Add floating text utility
  const addFloatingText = (x: number, y: number, text: string, color = '#22d3ee') => {
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: 'ft-' + Math.random(),
        x,
        y,
        text,
        color,
        createdAt: Date.now(),
      },
    ]);
  };

  // Spawn a new treasure in an unoccupied square
  const spawnTreasure = useCallback((currentTreasures: Treasure[], currentObstacles: Obstacle[], currentSnake: Snake | null, currentPPos: Position) => {
    const occupied = new Set<string>();
    currentTreasures.forEach((t) => occupied.add(`${t.pos.x},${t.pos.y}`));
    currentObstacles.forEach((o) => occupied.add(`${o.x},${o.y}`));
    if (currentSnake) {
      currentSnake.segments.forEach((s) => occupied.add(`${s.x},${s.y}`));
    }
    occupied.add(`${currentPPos.x},${currentPPos.y}`);

    const freeSlots: Position[] = [];
    for (let y = 1; y < GRID_ROWS - 1; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        if (!occupied.has(`${x},${y}`)) {
          freeSlots.push({ x, y });
        }
      }
    }

    if (freeSlots.length === 0) return null;
    const chosen = freeSlots[Math.floor(Math.random() * freeSlots.length)];

    // Weighted type selector
    const roll = Math.random();
    let type: TreasureType = 'DATA_CORE';
    let scoreVal = 100;

    if (roll < 0.5) {
      type = 'DATA_CORE';
      scoreVal = 100;
    } else if (roll < 0.72) {
      type = 'NEON_CRYSTAL';
      scoreVal = 250;
    } else if (roll < 0.84) {
      type = 'CHRONO_SPHERE';
      scoreVal = 200;
    } else if (roll < 0.93) {
      type = 'EMP_BLAST';
      scoreVal = 300;
    } else {
      type = 'SHIELD_POD';
      scoreVal = 150;
    }

    const newTreasure: Treasure = {
      id: 'tr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      pos: chosen,
      type,
      scoreVal,
      spawnTime: Date.now(),
    };
    return newTreasure;
  }, []);

  // Initialize a level
  const initLevel = useCallback((lvlIndex: number, retainScore = false) => {
    const lvl = GAME_LEVELS[lvlIndex] || GAME_LEVELS[0];
    setCurrentLevelIndex(lvlIndex);

    // Initial Snake segments (occupies 3 or 4 squares moving right across row 2)
    const initialLength = lvl.initialSnakeLength;
    const initialSegments = [];
    for (let i = 0; i < initialLength; i++) {
      initialSegments.push({
        id: `seg-${i}`,
        x: initialLength - 1 - i,
        y: 2,
        isHead: i === 0,
        isTail: i === initialLength - 1,
        order: i,
      });
    }

    const newSnake: Snake = {
      id: 'viper-main',
      name: lvl.themeName,
      color: '#f43f5e',
      segments: initialSegments,
      direction: 'RIGHT',
      speedMs: lvl.initialSpeedMs,
      baseSpeedMs: lvl.initialSpeedMs,
      stunnedUntil: 0,
      slowedUntil: 0,
      targetTreasureId: null,
    };

    const initialObstacles: Obstacle[] = lvl.obstacles.map((p, idx) => ({
      id: `obs-${idx}`,
      x: p.x,
      y: p.y,
      type: 'WALL',
    }));

    const pPos: Position = { x: 4, y: 14 };
    setPlayerPos(pPos);
    setPlayerFacing('UP');
    setPlayerInvulnerable(false);
    setSnake(newSnake);
    setObstacles(initialObstacles);
    setProjectiles([]);
    setParticles([]);
    setFloatingTexts([]);
    setActivePowerup(null);

    // Reset or keep stats
    setStats((prev) => ({
      score: retainScore ? prev.score : 0,
      combo: 1,
      maxCombo: retainScore ? prev.maxCombo : 1,
      treasuresCollected: retainScore ? prev.treasuresCollected : 0,
      treasuresLostToSnake: retainScore ? prev.treasuresLostToSnake : 0,
      segmentsDestroyed: retainScore ? prev.segmentsDestroyed : 0,
      lives: retainScore ? Math.min(3, prev.lives + 1) : 3,
      shields: retainScore ? prev.shields : 0,
      empCharges: retainScore ? prev.empCharges : 0,
    }));

    // Spawn initial treasures
    const initialTreasures: Treasure[] = [];
    for (let t = 0; t < lvl.maxSimultaneousTreasures; t++) {
      const tr = spawnTreasure(initialTreasures, initialObstacles, newSnake, pPos);
      if (tr) initialTreasures.push(tr);
    }
    setTreasures(initialTreasures);

    setGameState('PLAYING');
  }, [spawnTreasure]);

  // Player Movement Handler
  const handleMove = useCallback((dir: Direction, isDash = false) => {
    if (stateRef.current.gameState !== 'PLAYING') return;

    setPlayerFacing(dir);
    soundEngine.playStep();

    setPlayerPos((curr) => {
      const step = isDash ? 2 : 1;
      let nx = curr.x;
      let ny = curr.y;

      if (dir === 'UP') ny -= step;
      if (dir === 'DOWN') ny += step;
      if (dir === 'LEFT') nx -= step;
      if (dir === 'RIGHT') nx += step;

      // Bound checks
      nx = Math.max(0, Math.min(GRID_COLS - 1, nx));
      ny = Math.max(0, Math.min(GRID_ROWS - 1, ny));

      // Obstacle collision check
      const hitsObs = stateRef.current.obstacles.some((o) => o.x === nx && o.y === ny);
      if (hitsObs) {
        return curr; // can't walk into obstacle
      }

      // Check if stepped on a treasure!
      const currentTreasures = stateRef.current.treasures;
      const hitTreasure = currentTreasures.find((t) => t.pos.x === nx && t.pos.y === ny);

      if (hitTreasure) {
        // Collect treasure!
        soundEngine.playTreasure(hitTreasure.type);
        spawnParticles(nx, ny, '#38bdf8', 16);

        setStats((prevStats) => {
          const addedScore = hitTreasure.scoreVal * prevStats.combo;
          const nextCombo = prevStats.combo + 1;
          const nextMax = Math.max(prevStats.maxCombo, nextCombo);

          // Powerup application
          if (hitTreasure.type === 'CHRONO_SPHERE') {
            setSnake((s) => s ? { ...s, slowedUntil: Date.now() + 5000 } : null);
            setActivePowerup({ name: 'CHRONO SLOW (5s)', secondsLeft: 5 });
            addFloatingText(nx, ny, 'CHRONO SLOW!', '#38bdf8');
          } else if (hitTreasure.type === 'EMP_BLAST') {
            addFloatingText(nx, ny, 'EMP CHARGE ACQUIRED!', '#34d399');
            return {
              ...prevStats,
              score: prevStats.score + addedScore,
              combo: nextCombo,
              maxCombo: nextMax,
              treasuresCollected: prevStats.treasuresCollected + 1,
              empCharges: prevStats.empCharges + 1,
            };
          } else if (hitTreasure.type === 'SHIELD_POD') {
            addFloatingText(nx, ny, '+1 SHIELD AURA!', '#818cf8');
            return {
              ...prevStats,
              score: prevStats.score + addedScore,
              combo: nextCombo,
              maxCombo: nextMax,
              treasuresCollected: prevStats.treasuresCollected + 1,
              shields: Math.min(3, prevStats.shields + 1),
            };
          } else {
            addFloatingText(nx, ny, `+${addedScore} PTS`, '#facc15');
          }

          return {
            ...prevStats,
            score: prevStats.score + addedScore,
            combo: nextCombo,
            maxCombo: nextMax,
            treasuresCollected: prevStats.treasuresCollected + 1,
          };
        });

        // Remove collected treasure and replenish
        const remaining = currentTreasures.filter((t) => t.id !== hitTreasure.id);
        const replacement = spawnTreasure(
          remaining,
          stateRef.current.obstacles,
          stateRef.current.snake,
          { x: nx, y: ny }
        );
        if (replacement) {
          setTreasures([...remaining, replacement]);
        } else {
          setTreasures(remaining);
        }
      }

      return { x: nx, y: ny };
    });
  }, [spawnTreasure]);

  // Tactical Dash
  const handleDash = useCallback(() => {
    if (!canDash || stateRef.current.gameState !== 'PLAYING') return;
    setCanDash(false);
    handleMove(stateRef.current.playerFacing, true);
    addFloatingText(stateRef.current.playerPos.x, stateRef.current.playerPos.y, 'DASH INTERCEPT!', '#06b6d4');
    setTimeout(() => {
      setCanDash(true);
    }, 1200);
  }, [canDash, handleMove]);

  // EMP Shockwave detonation
  const handleUseEMP = useCallback(() => {
    if (stateRef.current.stats.empCharges <= 0 || !stateRef.current.snake) return;
    setStats((s) => ({ ...s, empCharges: s.empCharges - 1 }));

    // Stun snake for 3.5 seconds
    setSnake((s) => s ? { ...s, stunnedUntil: Date.now() + 3500 } : null);
    soundEngine.playSegmentHit();
    addFloatingText(stateRef.current.playerPos.x, stateRef.current.playerPos.y, 'EMP SHOCKWAVE DETONATED!', '#10b981');
    setActivePowerup({ name: 'EMP STUN (3.5s)', secondsLeft: 3.5 });

    // Spawn massive shockwave particles across center
    spawnParticles(GRID_COLS / 2, GRID_ROWS / 2, '#34d399', 30);
  }, []);

  // Attack Action (Blast Viper Segment)
  const handleAttack = useCallback(() => {
    if (stateRef.current.gameState !== 'PLAYING') return;

    soundEngine.playAttack();
    const currPPos = stateRef.current.playerPos;
    const facing = stateRef.current.playerFacing;

    // Check if player is right next to a snake segment (point-blank strike)
    const currentSnake = stateRef.current.snake;
    if (!currentSnake || currentSnake.segments.length === 0) return;

    let targetSegmentIndex = -1;
    let hitPos: Position | null = null;

    // Raycast in facing direction to find the first snake segment in line of sight
    let checkX = currPPos.x;
    let checkY = currPPos.y;
    const dx = facing === 'RIGHT' ? 1 : facing === 'LEFT' ? -1 : 0;
    const dy = facing === 'DOWN' ? 1 : facing === 'UP' ? -1 : 0;

    for (let dist = 1; dist <= 6; dist++) {
      checkX += dx;
      checkY += dy;

      if (!isWithinBounds(checkX, checkY)) break;
      // Stop if hit wall obstacle
      if (stateRef.current.obstacles.some((o) => o.x === checkX && o.y === checkY)) {
        break;
      }

      // Check if matches any snake segment
      const segIndex = currentSnake.segments.findIndex((s) => s.x === checkX && s.y === checkY);
      if (segIndex !== -1) {
        targetSegmentIndex = segIndex;
        hitPos = { x: checkX, y: checkY };
        break;
      }
    }

    if (targetSegmentIndex !== -1 && hitPos) {
      // Direct Hit on segment!
      soundEngine.playSegmentHit();
      spawnParticles(hitPos.x, hitPos.y, '#f43f5e', 24);

      // Destroy the hit segment!
      const remainingSegments = currentSnake.segments.filter((_, idx) => idx !== targetSegmentIndex);
      // Reassign head/tail flags
      const updatedSegments = remainingSegments.map((s, idx) => ({
        ...s,
        isHead: idx === 0,
        isTail: idx === remainingSegments.length - 1,
        order: idx,
      }));

      // Calculate speed acceleration:
      // "increasing the game's overall speed and difficulty"
      const currentLevel = GAME_LEVELS[currentLevelIndex] || GAME_LEVELS[0];
      const newSpeed = Math.max(140, currentSnake.speedMs - currentLevel.speedReductionPerHitMs);

      soundEngine.playSpeedUp();
      addFloatingText(hitPos.x, hitPos.y, '+300 PTS! SPEED SURGE!', '#f43f5e');

      setSnake((s) => s ? {
        ...s,
        segments: updatedSegments,
        speedMs: newSpeed,
      } : null);

      setStats((prev) => ({
        ...prev,
        score: prev.score + 300 * prev.combo,
        segmentsDestroyed: prev.segmentsDestroyed + 1,
      }));

      // Check victory: all segments destroyed!
      if (updatedSegments.length === 0) {
        soundEngine.playLevelCleared();
        const bonus = 1000 * (currentLevelIndex + 1) + stateRef.current.stats.combo * 150;
        setLevelBonus(bonus);

        setStats((prev) => ({
          ...prev,
          score: prev.score + bonus,
        }));

        // Unlock next level
        const nextLvl = currentLevelIndex + 2;
        if (nextLvl > unlockedLevel) {
          setUnlockedLevel(nextLvl);
          localStorage.setItem('cyberviper_unlocked_level', String(nextLvl));
        }

        setGameState('LEVEL_CLEARED');
      }
    } else {
      // Spawn flying projectile visual
      setProjectiles((prev) => [
        ...prev,
        {
          id: 'proj-' + Math.random(),
          x: currPPos.x + dx,
          y: currPPos.y + dy,
          dir: facing,
          distanceLeft: 4,
        },
      ]);
    }
  }, [currentLevelIndex, unlockedLevel]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLeaderboard || showHowToPlay || showLevelSelect) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleMove('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleMove('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMove('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMove('RIGHT');
      } else if (e.key === ' ' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleAttack();
      } else if (e.key === 'Shift' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleDash();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleUseEMP();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setGameState((curr) => curr === 'PLAYING' ? 'PAUSED' : curr === 'PAUSED' ? 'PLAYING' : curr);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, handleAttack, handleDash, handleUseEMP, showLeaderboard, showHowToPlay, showLevelSelect]);

  // Snake Tick Engine (Interval based on dynamic snake.speedMs)
  useEffect(() => {
    if (gameState !== 'PLAYING' || !snake || snake.segments.length === 0) return;

    // Check if snake is slowed
    const effectiveSpeed = snake.slowedUntil > Date.now() ? snake.speedMs * 1.5 : snake.speedMs;

    const timer = setInterval(() => {
      setSnake((currSnake) => {
        if (!currSnake || currSnake.segments.length === 0) return null;
        // If stunned by EMP, don't move
        if (currSnake.stunnedUntil > Date.now()) {
          return currSnake;
        }

        const head = currSnake.segments[0];
        const currentTreasures = stateRef.current.treasures;

        // Find nearest treasure for snake to hunt!
        let targetPos: Position | null = null;
        let minDist = Infinity;
        currentTreasures.forEach((tr) => {
          const dist = Math.abs(tr.pos.x - head.x) + Math.abs(tr.pos.y - head.y);
          if (dist < minDist) {
            minDist = dist;
            targetPos = tr.pos;
          }
        });

        // Calculate next direction via BFS
        const nextDir = findNextSnakeDirection(
          head,
          currSnake.direction,
          currSnake.segments.map((s) => ({ x: s.x, y: s.y })),
          stateRef.current.obstacles,
          targetPos,
          GRID_COLS,
          GRID_ROWS
        );

        const dx = nextDir === 'RIGHT' ? 1 : nextDir === 'LEFT' ? -1 : 0;
        const dy = nextDir === 'DOWN' ? 1 : nextDir === 'UP' ? -1 : 0;

        let nextHeadX = head.x + dx;
        let nextHeadY = head.y + dy;

        // Bounds wrap / clamp
        nextHeadX = Math.max(0, Math.min(GRID_COLS - 1, nextHeadX));
        nextHeadY = Math.max(0, Math.min(GRID_ROWS - 1, nextHeadY));

        // Create updated body: Each segment follows previous position
        const newSegments = [{
          id: `seg-0-${Date.now()}`,
          x: nextHeadX,
          y: nextHeadY,
          isHead: true,
          isTail: false,
          order: 0,
        }];

        for (let i = 0; i < currSnake.segments.length - 1; i++) {
          newSegments.push({
            id: `seg-${i + 1}-${Date.now()}`,
            x: currSnake.segments[i].x,
            y: currSnake.segments[i].y,
            isHead: false,
            isTail: i === currSnake.segments.length - 2,
            order: i + 1,
          });
        }

        // 1. Did the snake eat a treasure before the player?
        const eatenTreasure = currentTreasures.find(
          (t) => t.pos.x === nextHeadX && t.pos.y === nextHeadY
        );

        if (eatenTreasure) {
          soundEngine.playSnakeEat();
          spawnParticles(nextHeadX, nextHeadY, '#f43f5e', 14);
          addFloatingText(nextHeadX, nextHeadY, 'VIPER CONSUMED TREASURE!', '#fb7185');

          setStats((prev) => ({
            ...prev,
            combo: 1, // resets player combo
            treasuresLostToSnake: prev.treasuresLostToSnake + 1,
          }));

          // Remove treasure and spawn replacement
          const remaining = currentTreasures.filter((t) => t.id !== eatenTreasure.id);
          const replacement = spawnTreasure(
            remaining,
            stateRef.current.obstacles,
            currSnake,
            stateRef.current.playerPos
          );
          if (replacement) {
            setTreasures([...remaining, replacement]);
          } else {
            setTreasures(remaining);
          }
        }

        // 2. Did the snake collide with the player?
        const pPos = stateRef.current.playerPos;
        const collidedWithPlayer = newSegments.some((s) => s.x === pPos.x && s.y === pPos.y);

        if (collidedWithPlayer && !stateRef.current.playerInvulnerable) {
          const currentShields = stateRef.current.stats.shields;

          if (currentShields > 0) {
            // Shield absorbed hit!
            soundEngine.playPlayerHit();
            addFloatingText(pPos.x, pPos.y, 'SHIELD BROKEN!', '#38bdf8');
            setStats((prev) => ({ ...prev, shields: prev.shields - 1 }));
            setPlayerInvulnerable(true);
            setTimeout(() => setPlayerInvulnerable(false), 1500);
          } else {
            // Player lost life!
            soundEngine.playPlayerHit();
            addFloatingText(pPos.x, pPos.y, 'CORE DAMAGED! -1 LIFE', '#f43f5e');

            setStats((prev) => {
              const nextLives = prev.lives - 1;
              if (nextLives <= 0) {
                soundEngine.playGameOver();
                setGameState('GAME_OVER');
              }
              return {
                ...prev,
                lives: nextLives,
                combo: 1,
              };
            });

            setPlayerInvulnerable(true);
            setTimeout(() => setPlayerInvulnerable(false), 1800);
          }
        }

        return {
          ...currSnake,
          segments: newSegments,
          direction: nextDir,
        };
      });
    }, effectiveSpeed);

    return () => clearInterval(timer);
  }, [gameState, snake?.speedMs, snake?.slowedUntil, spawnTreasure]);

  // Projectile and Particle physics loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const frameId = requestAnimationFrame(function tick() {
      // Update particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.1,
            y: p.y + p.vy * 0.1,
            life: p.life - 0.04,
          }))
          .filter((p) => p.life > 0)
      );

      // Clean floating texts older than 1.4s
      const now = Date.now();
      setFloatingTexts((prev) => prev.filter((ft) => now - ft.createdAt < 1400));

      // Update projectiles
      setProjectiles((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((p) => {
            const dx = p.dir === 'RIGHT' ? 1 : p.dir === 'LEFT' ? -1 : 0;
            const dy = p.dir === 'DOWN' ? 1 : p.dir === 'UP' ? -1 : 0;
            const nx = p.x + dx;
            const ny = p.y + dy;

            // Check if hit snake segment
            const currentSnake = stateRef.current.snake;
            if (currentSnake) {
              const segIndex = currentSnake.segments.findIndex((s) => s.x === nx && s.y === ny);
              if (segIndex !== -1) {
                // Strike snake segment!
                soundEngine.playSegmentHit();
                soundEngine.playSpeedUp();
                spawnParticles(nx, ny, '#f43f5e', 20);

                const remainingSegments = currentSnake.segments.filter((_, idx) => idx !== segIndex);
                const updatedSegments = remainingSegments.map((s, idx) => ({
                  ...s,
                  isHead: idx === 0,
                  isTail: idx === remainingSegments.length - 1,
                  order: idx,
                }));

                const currentLevel = GAME_LEVELS[currentLevelIndex] || GAME_LEVELS[0];
                const newSpeed = Math.max(140, currentSnake.speedMs - currentLevel.speedReductionPerHitMs);

                setSnake((s) => s ? { ...s, segments: updatedSegments, speedMs: newSpeed } : null);
                addFloatingText(nx, ny, '+300 PTS! SPEED SURGE!', '#f43f5e');

                setStats((st) => ({
                  ...st,
                  score: st.score + 300 * st.combo,
                  segmentsDestroyed: st.segmentsDestroyed + 1,
                }));

                if (updatedSegments.length === 0) {
                  soundEngine.playLevelCleared();
                  const bonus = 1000 * (currentLevelIndex + 1) + stateRef.current.stats.combo * 150;
                  setLevelBonus(bonus);
                  setStats((st) => ({ ...st, score: st.score + bonus }));
                  setGameState('LEVEL_CLEARED');
                }

                return null;
              }
            }

            if (!isWithinBounds(nx, ny) || p.distanceLeft <= 1) {
              return null;
            }
            return {
              ...p,
              x: nx,
              y: ny,
              distanceLeft: p.distanceLeft - 1,
            };
          })
          .filter(Boolean) as Projectile[];
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [gameState, currentLevelIndex]);

  // Powerup countdown display updater
  useEffect(() => {
    if (!activePowerup) return;
    const interval = setInterval(() => {
      setActivePowerup((curr) => {
        if (!curr || curr.secondsLeft <= 1) return null;
        return { ...curr, secondsLeft: Math.round((curr.secondsLeft - 1) * 10) / 10 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activePowerup]);

  return (
    <PhoneChassis
      isFramed={isFramed}
      onToggleFrame={() => setIsFramed(!isFramed)}
      onOpenLeaderboard={() => setShowLeaderboard(true)}
      onOpenHowToPlay={() => setShowHowToPlay(true)}
      onRestartCurrentGame={() => initLevel(currentLevelIndex, false)}
      levelTitle={currentLevelConfig.title}
    >
      {/* Title Screen / Menu */}
      {gameState === 'TITLE_MENU' && (
        <div className="relative flex-1 w-full flex flex-col items-center justify-between p-6 text-center z-20">
          <div className="w-full flex justify-between items-center text-xs text-slate-400">
            <span className="font-mono text-cyan-400 font-bold">V-4.0 ARCADE</span>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>
          </div>

          {/* Hero Branding */}
          <div className="space-y-4 my-auto">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.4)] flex items-center justify-center">
                <Crosshair className="w-10 h-10 text-cyan-400 stroke-[2.5]" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 border border-white flex items-center justify-center shadow-lg">
                <Flame className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                CyberViper
              </h1>
              <p className="text-xs text-cyan-300/90 font-medium max-w-xs mx-auto">
                Run in front of the serpentine AI to snag treasures first. Blast its segments to speed up the arena and climb the global ranks!
              </p>
            </div>

            {/* Feature bullets */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-left space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Beat the 3-4 segment snake to rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Every segment blast accelerates viper velocity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>6+ escalating sectors & global competitive rankings</span>
              </div>
            </div>
          </div>

          {/* Start Actions */}
          <div className="w-full space-y-2.5">
            <button
              onClick={() => initLevel(0, false)}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Launch Mission · Sector 1</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLevelSelect(true)}
                className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Select Sector ({unlockedLevel} Unlocked)
              </button>
              <button
                onClick={() => setShowHowToPlay(true)}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Game Interface */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <div className="relative flex-1 w-full flex flex-col overflow-hidden">
          {/* Top HUD */}
          <GameHUD
            stats={stats}
            snake={snake}
            levelConfig={currentLevelConfig}
            activePowerup={activePowerup}
            isPaused={gameState === 'PAUSED'}
            onPauseToggle={() => setGameState((g) => g === 'PAUSED' ? 'PLAYING' : 'PAUSED')}
          />

          {/* Tactical Game Grid */}
          <GameBoard
            playerPos={playerPos}
            playerFacing={playerFacing}
            playerInvulnerable={playerInvulnerable}
            playerHasShield={stats.shields > 0}
            snake={snake}
            treasures={treasures}
            obstacles={obstacles}
            projectiles={projectiles}
            particles={particles}
            floatingTexts={floatingTexts}
            onSwipeDirection={handleMove}
          />

          {/* Pause Overlay */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Mission Suspended</h2>
              <div className="w-full max-w-xs space-y-2">
                <button
                  onClick={() => setGameState('PLAYING')}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Resume Combat
                </button>
                <button
                  onClick={() => initLevel(currentLevelIndex, false)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Restart Sector
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  View Global Leaderboard
                </button>
                <button
                  onClick={() => setGameState('TITLE_MENU')}
                  className="w-full py-1.5 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  Exit to Main Menu
                </button>
              </div>
            </div>
          )}

          {/* Bottom Mobile Touch Controls */}
          <TouchControls
            onMove={handleMove}
            onAttack={handleAttack}
            onDash={handleDash}
            canDash={canDash}
            empCharges={stats.empCharges}
            onUseEMP={handleUseEMP}
            playerFacing={playerFacing}
          />
        </div>
      )}

      {/* Level Cleared Modal */}
      {gameState === 'LEVEL_CLEARED' && (
        <LevelClearedModal
          levelConfig={currentLevelConfig}
          stats={stats}
          levelBonus={levelBonus}
          hasNextLevel={currentLevelIndex < GAME_LEVELS.length - 1}
          onNextLevel={() => initLevel(currentLevelIndex + 1, true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onReplayLevel={() => initLevel(currentLevelIndex, false)}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={stats}
          currentLevel={currentLevelConfig.levelNumber}
          onRestart={() => initLevel(currentLevelIndex, false)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onSelectLevel={() => setShowLevelSelect(true)}
        />
      )}

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentScore={stats.score}
        currentLevel={currentLevelConfig.levelNumber}
        treasuresCollected={stats.treasuresCollected}
        segmentsDestroyed={stats.segmentsDestroyed}
        timeElapsed={120}
        onScoreSubmitted={() => {}}
      />

      {/* How To Play Modal */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      {/* Level Select Modal */}
      <LevelSelectModal
        isOpen={showLevelSelect}
        onClose={() => setShowLevelSelect(false)}
        unlockedLevel={unlockedLevel}
        currentLevelIndex={currentLevelIndex}
        onSelectLevel={(idx) => initLevel(idx, false)}
      />
    </PhoneChassis>
  );
}
