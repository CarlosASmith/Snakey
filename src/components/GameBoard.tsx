import React, { useRef, useEffect } from 'react';
import { 
  Position, 
  Direction, 
  Snake, 
  Treasure, 
  Obstacle, 
  Projectile, 
  Particle, 
  FloatingText 
} from '../types/game';
import { GRID_COLS, GRID_ROWS } from '../utils/pathfinding';
import { Shield, Sparkles, Clock, Zap, Cpu } from 'lucide-react';

interface GameBoardProps {
  playerPos: Position;
  playerFacing: Direction;
  playerInvulnerable: boolean;
  playerHasShield: boolean;
  snake: Snake | null;
  treasures: Treasure[];
  obstacles: Obstacle[];
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  onSwipeDirection: (dir: Direction) => void;
  onGridTap?: (pos: Position) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  playerPos,
  playerFacing,
  playerInvulnerable,
  playerHasShield,
  snake,
  treasures,
  obstacles,
  projectiles,
  particles,
  floatingTexts,
  onSwipeDirection,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Touch Swipe listener across entire board
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Minimum swipe threshold
      if (Math.max(absDx, absDy) > 20) {
        if (absDx > absDy) {
          onSwipeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          onSwipeDirection(dy > 0 ? 'DOWN' : 'UP');
        }
      }
      touchStartRef.current = null;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeDirection]);

  // Fast coordinate lookup maps
  const obstacleMap = new Map<string, Obstacle>();
  obstacles.forEach((obs) => obstacleMap.set(`${obs.x},${obs.y}`, obs));

  const treasureMap = new Map<string, Treasure>();
  treasures.forEach((tr) => treasureMap.set(`${tr.pos.x},${tr.pos.y}`, tr));

  // Snake segments map
  const snakeMap = new Map<string, { segmentIndex: number; isHead: boolean; isTail: boolean }>();
  if (snake && snake.segments.length > 0) {
    snake.segments.forEach((seg, idx) => {
      snakeMap.set(`${seg.x},${seg.y}`, {
        segmentIndex: idx,
        isHead: seg.isHead,
        isTail: seg.isTail,
      });
    });
  }

  // Projectiles map
  const projectileMap = new Map<string, Projectile>();
  projectiles.forEach((p) => projectileMap.set(`${p.x},${p.y}`, p));

  const isSnakeStunned = snake && snake.stunnedUntil > Date.now();
  const isSnakeSlowed = snake && snake.slowedUntil > Date.now();

  return (
    <div 
      ref={boardRef}
      className="relative flex-1 w-full bg-slate-950 flex items-center justify-center p-2 game-touch-area overflow-hidden"
    >
      {/* Rectangular Grid Container */}
      <div 
        className="relative w-full max-w-[340px] aspect-[10/16] bg-slate-900/80 rounded-xl border border-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.1)] grid grid-cols-10 grid-rows-16 p-1 gap-0.5 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
        }}
      >
        {/* Subtle grid line overlay */}
        <div className="absolute inset-0 cyber-grid-bg opacity-15 pointer-events-none" />

        {/* Generate each square cell */}
        {Array.from({ length: GRID_ROWS }).map((_, y) => (
          Array.from({ length: GRID_COLS }).map((_, x) => {
            const key = `${x},${y}`;
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const snakeInfo = snakeMap.get(key);
            const treasure = treasureMap.get(key);
            const obstacle = obstacleMap.get(key);
            const projectile = projectileMap.get(key);

            return (
              <div
                key={key}
                className="relative w-full h-full rounded-[3px] flex items-center justify-center transition-colors duration-100 bg-slate-950/40"
              >
                {/* 1. Obstacle Square */}
                {obstacle && (
                  <div className="w-full h-full rounded-[2px] bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-inner overflow-hidden">
                    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#1e293b,#1e293b_4px,#334155_4px,#334155_8px)] opacity-60" />
                  </div>
                )}

                {/* 2. Treasure Square */}
                {treasure && (
                  <div className="relative w-full h-full flex items-center justify-center animate-bounce">
                    {/* Glowing outer halo */}
                    <div 
                      className={`absolute inset-0.5 rounded-full blur-[3px] opacity-70 ${
                        treasure.type === 'DATA_CORE'
                          ? 'bg-amber-400'
                          : treasure.type === 'NEON_CRYSTAL'
                          ? 'bg-fuchsia-400'
                          : treasure.type === 'CHRONO_SPHERE'
                          ? 'bg-sky-400'
                          : treasure.type === 'EMP_BLAST'
                          ? 'bg-emerald-400'
                          : 'bg-indigo-400'
                      }`} 
                    />

                    {/* Treasure Glyph */}
                    <div 
                      className={`relative w-4/5 h-4/5 rounded-[4px] flex items-center justify-center text-slate-950 border shadow-md ${
                        treasure.type === 'DATA_CORE'
                          ? 'bg-amber-400 border-amber-200 text-amber-950'
                          : treasure.type === 'NEON_CRYSTAL'
                          ? 'bg-fuchsia-400 border-fuchsia-200 text-fuchsia-950'
                          : treasure.type === 'CHRONO_SPHERE'
                          ? 'bg-sky-400 border-sky-200 text-sky-950'
                          : treasure.type === 'EMP_BLAST'
                          ? 'bg-emerald-400 border-emerald-200 text-emerald-950'
                          : 'bg-indigo-400 border-indigo-200 text-indigo-950'
                      }`}
                    >
                      {treasure.type === 'DATA_CORE' && <Cpu className="w-3 h-3 stroke-[2.5]" />}
                      {treasure.type === 'NEON_CRYSTAL' && <Sparkles className="w-3 h-3 stroke-[2.5]" />}
                      {treasure.type === 'CHRONO_SPHERE' && <Clock className="w-3 h-3 stroke-[2.5]" />}
                      {treasure.type === 'EMP_BLAST' && <Zap className="w-3 h-3 stroke-[2.5]" />}
                      {treasure.type === 'SHIELD_POD' && <Shield className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </div>
                )}

                {/* 3. Snake Segment Square */}
                {snakeInfo && (
                  <div 
                    className={`relative w-full h-full rounded-[3px] flex items-center justify-center transition-all duration-150 ${
                      snakeInfo.isHead
                        ? isSnakeStunned
                          ? 'bg-yellow-400 border border-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.8)]'
                          : isSnakeSlowed
                          ? 'bg-cyan-500 border border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                          : 'bg-rose-500 border border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.9)]'
                        : snakeInfo.isTail
                        ? 'bg-rose-700/90 border border-rose-500/70 shadow-[0_0_6px_rgba(190,18,60,0.6)]'
                        : 'bg-rose-600 border border-rose-400 shadow-[0_0_8px_rgba(225,29,72,0.7)]'
                    }`}
                  >
                    {/* Head Eyes & Visor */}
                    {snakeInfo.isHead ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {/* Directional ocular sensors */}
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            transform: 
                              snake?.direction === 'UP' ? 'rotate(-90deg)' :
                              snake?.direction === 'DOWN' ? 'rotate(90deg)' :
                              snake?.direction === 'LEFT' ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          <div className="flex flex-col gap-1 items-end pr-1 w-full">
                            <div className="w-1.5 h-1 bg-white rounded-full shadow-[0_0_3px_#fff]" />
                            <div className="w-1.5 h-1 bg-white rounded-full shadow-[0_0_3px_#fff]" />
                          </div>
                        </div>
                        {/* Stun sparkle indicator */}
                        {isSnakeStunned && (
                          <div className="absolute -top-1 -right-1 text-yellow-300 text-[10px] font-bold animate-ping">⚡</div>
                        )}
                      </div>
                    ) : (
                      /* Body armor joint & segment index */
                      <div className="flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rose-300/80 shadow-inner" />
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Projectile Square */}
                {projectile && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                  </div>
                )}

                {/* 5. Player Square (Cyber-Runner) */}
                {isPlayer && (
                  <div 
                    className={`relative w-full h-full rounded-[4px] flex items-center justify-center transition-all duration-100 ${
                      playerInvulnerable ? 'opacity-50 animate-pulse' : 'opacity-100'
                    }`}
                  >
                    {/* Shield aura bubble */}
                    {playerHasShield && (
                      <div className="absolute -inset-1 rounded-full border border-cyan-400 bg-cyan-400/20 animate-spin" />
                    )}

                    {/* Cyber Runner Avatar */}
                    <div className="relative w-[90%] h-[90%] rounded-[3px] bg-cyan-400 border border-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.9)] flex items-center justify-center">
                      {/* Directional visor indicator */}
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          transform: 
                            playerFacing === 'UP' ? 'rotate(-90deg)' :
                            playerFacing === 'DOWN' ? 'rotate(90deg)' :
                            playerFacing === 'LEFT' ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        <div className="w-2 h-2 bg-slate-950 rounded-sm flex items-center justify-end pr-0.5">
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ))}

        {/* Particles Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p) => {
            const leftPct = ((p.x + 0.5) / GRID_COLS) * 100;
            const topPct = ((p.y + 0.5) / GRID_ROWS) * 100;
            const alpha = p.life / p.maxLife;

            return (
              <div
                key={p.id}
                className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  opacity: alpha,
                  boxShadow: `0 0 6px ${p.color}`,
                }}
              />
            );
          })}
        </div>

        {/* Floating Scores & Alerts */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingTexts.map((ft) => {
            const leftPct = ((ft.x + 0.5) / GRID_COLS) * 100;
            const topPct = ((ft.y + 0.5) / GRID_ROWS) * 100;
            const ageMs = Date.now() - ft.createdAt;
            const yOffset = (ageMs / 1000) * 30; // drifts upward
            const opacity = Math.max(0, 1 - ageMs / 1200);

            return (
              <div
                key={ft.id}
                className="absolute font-extrabold text-xs whitespace-nowrap -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono-numbers"
                style={{
                  left: `${leftPct}%`,
                  top: `calc(${topPct}% - ${yOffset}px)`,
                  color: ft.color,
                  opacity,
                }}
              >
                {ft.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
