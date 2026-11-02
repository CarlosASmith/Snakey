import React from 'react';
import { Skull, RotateCcw, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface GameOverModalProps {
  stats: PlayerStats;
  currentLevel: number;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
  onSelectLevel: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  currentLevel,
  onRestart,
  onOpenLeaderboard,
  onSelectLevel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(244,63,94,0.2)] flex flex-col items-center text-center gap-4">
        {/* Skull Icon */}
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg">
          <Skull className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-white tracking-tight uppercase">System Compromised</h2>
          <p className="text-xs text-rose-400 font-medium">The cyber-viper intercepted your core in Sector {currentLevel}.</p>
        </div>

        {/* Stats card */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Final Score</span>
            <span className="text-lg font-black text-cyan-400 font-mono-numbers">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Treasures Snagged</span>
            <span className="font-semibold text-emerald-400 font-mono-numbers">
              {stats.treasuresCollected}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Segments Destroyed</span>
            <span className="font-semibold text-rose-400 font-mono-numbers">
              {stats.segmentsDestroyed}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Max Combo Streak</span>
            <span className="font-semibold text-amber-400 font-mono-numbers">
              {stats.maxCombo}x
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 pt-1">
          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reboot & Try Again</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Submit to Global Leaderboard</span>
          </button>

          <button
            onClick={onSelectLevel}
            className="w-full py-1.5 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            Change Sector
          </button>
        </div>
      </div>
    </div>
  );
};
