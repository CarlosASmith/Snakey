import React from 'react';
import { X, Play, Lock, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { GAME_LEVELS } from '../data/levels';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedLevel: number;
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  unlockedLevel,
  currentLevelIndex,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Select Grid Sector</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {GAME_LEVELS.map((lvl, idx) => {
            const isUnlocked = lvl.levelNumber <= unlockedLevel;
            const isSelected = idx === currentLevelIndex;

            return (
              <button
                key={lvl.levelNumber}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(idx);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  !isUnlocked
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-40 cursor-not-allowed'
                    : isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono-numbers text-sm ${
                      !isUnlocked
                        ? 'bg-slate-800 text-slate-500'
                        : isSelected
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-cyan-400'
                    }`}
                  >
                    {isUnlocked ? lvl.levelNumber : <Lock className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-white">
                      {lvl.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {lvl.loreKicker}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-rose-400">
                        <Zap className="w-3 h-3" />
                        {lvl.initialSnakeLength} Segments
                      </span>
                      <span>·</span>
                      <span className="text-amber-400">
                        Speed: {lvl.initialSpeedMs}ms
                      </span>
                      {lvl.obstacles.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-slate-400 flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            {lvl.obstacles.length} Obstacles
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isUnlocked && (
                    <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-colors">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400">
          Clear each sector to decrypt deeper sectors with faster viper velocity!
        </div>
      </div>
    </div>
  );
};
