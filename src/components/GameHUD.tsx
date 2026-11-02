import React from 'react';
import { Shield, Zap, Sparkles, Heart } from 'lucide-react';
import { PlayerStats, Snake, LevelConfig } from '../types/game';

interface GameHUDProps {
  stats: PlayerStats;
  snake: Snake | null;
  levelConfig: LevelConfig;
  activePowerup: { name: string; secondsLeft: number } | null;
  isPaused: boolean;
  onPauseToggle: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  snake,
  levelConfig,
  activePowerup,
  isPaused,
  onPauseToggle,
}) => {
  const currentSegments = snake ? snake.segments.length : 0;
  const initialSegments = levelConfig.initialSnakeLength;
  const speedPercentage = snake 
    ? Math.min(100, Math.round(((levelConfig.initialSpeedMs - snake.speedMs) / (levelConfig.initialSpeedMs - 120)) * 100))
    : 0;

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 py-2 flex flex-col gap-1.5 z-20">
      {/* Top row: Score, Combo, Level, Pause */}
      <div className="flex items-center justify-between text-xs">
        {/* Score & Combo */}
        <div className="flex items-baseline gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Score</span>
            <span className="text-base font-extrabold text-white font-mono-numbers">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {stats.combo > 1 && (
            <div className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[11px] font-mono-numbers border border-amber-500/30 animate-pulse">
              {stats.combo}x
            </div>
          )}
        </div>

        {/* Center: Snake Segments Remaining Meter */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Viper Segments
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: initialSegments }).map((_, idx) => {
              const isAlive = idx < currentSegments;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3 rounded-sm transition-all duration-300 ${
                    isAlive
                      ? idx === 0 
                        ? 'bg-rose-500 border border-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.7)]' 
                        : 'bg-rose-600 border border-rose-400/80 shadow-[0_0_6px_rgba(225,29,72,0.5)]'
                      : 'bg-slate-800 border border-slate-700/60 opacity-30'
                  }`}
                  title={isAlive ? 'Active Segment' : 'Destroyed!'}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Lives, Shields & Pause */}
        <div className="flex items-center gap-2">
          {/* Hearts / Shields */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 transition-all ${
                  i < stats.lives
                    ? 'text-rose-500 fill-rose-500 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]'
                    : 'text-slate-700'
                }`}
              />
            ))}
            {stats.shields > 0 && (
              <div className="flex items-center text-cyan-400 ml-1">
                <Shield className="w-3.5 h-3.5 fill-cyan-500/40" />
                <span className="text-[10px] font-bold ml-0.5">{stats.shields}</span>
              </div>
            )}
          </div>

          {/* Pause Button */}
          <button
            onClick={onPauseToggle}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors"
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      {/* Second row: Velocity & Treasures Intercept Tracker */}
      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5 border-t border-slate-800/60">
        {/* Speed surge metric */}
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-slate-300 text-[10px]">Snake Speed:</span>
          <span className={`font-mono-numbers font-bold text-[11px] ${
            speedPercentage > 60 ? 'text-rose-400' : speedPercentage > 30 ? 'text-amber-400' : 'text-cyan-400'
          }`}>
            {snake?.speedMs || levelConfig.initialSpeedMs}ms
          </span>
          {speedPercentage > 0 && (
            <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300 font-bold">
              +{speedPercentage}%
            </span>
          )}
        </div>

        {/* Treasures comparison counter */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-400 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            Snagged: <strong className="font-mono-numbers text-white ml-0.5">{stats.treasuresCollected}</strong>
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-rose-400/90">
            Lost: <strong className="font-mono-numbers text-slate-300 ml-0.5">{stats.treasuresLostToSnake}</strong>
          </span>
        </div>
      </div>

      {/* Active Powerup Notification Banner */}
      {activePowerup && (
        <div className="w-full bg-cyan-950/80 border border-cyan-500/40 rounded px-2 py-0.5 flex items-center justify-between text-[10px] text-cyan-200 animate-pulse">
          <span className="font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            {activePowerup.name}
          </span>
          <span className="font-mono-numbers font-bold text-cyan-300">
            {activePowerup.secondsLeft}s left
          </span>
        </div>
      )}
    </div>
  );
};
