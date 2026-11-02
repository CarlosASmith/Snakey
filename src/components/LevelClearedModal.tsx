import React from 'react';
import { Award, ArrowRight, Trophy, Zap, Sparkles } from 'lucide-react';
import { LevelConfig, PlayerStats } from '../types/game';

interface LevelClearedModalProps {
  levelConfig: LevelConfig;
  stats: PlayerStats;
  levelBonus: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onOpenLeaderboard: () => void;
  onReplayLevel: () => void;
}

export const LevelClearedModal: React.FC<LevelClearedModalProps> = ({
  levelConfig,
  stats,
  levelBonus,
  hasNextLevel,
  onNextLevel,
  onOpenLeaderboard,
  onReplayLevel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Victory Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">
            Sector Neutralized!
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            {levelConfig.title} Cleared
          </h2>
          <p className="text-xs text-slate-300">
            All cyber-viper segments obliterated before it could drain the grid!
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Sector Clear Bonus</span>
            <span className="font-bold text-emerald-400 font-mono-numbers">
              +{levelBonus.toLocaleString()} PTS
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Current Total Score</span>
            <span className="text-base font-black text-cyan-400 font-mono-numbers">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Treasures Snagged</span>
            <span className="font-semibold text-white font-mono-numbers">
              {stats.treasuresCollected}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Viper Segments Destroyed</span>
            <span className="font-semibold text-rose-400 font-mono-numbers">
              {levelConfig.targetSegmentsToDestroy} / {levelConfig.targetSegmentsToDestroy}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 pt-1">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Advance to Next Sector</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <div className="p-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              Campaign Complete! Enter Endless Mode to set high scores!
            </div>
          )}

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Submit Score to Global Leaderboard</span>
          </button>

          <button
            onClick={onReplayLevel}
            className="w-full py-1.5 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            Replay Sector for Higher Combo
          </button>
        </div>
      </div>
    </div>
  );
};
