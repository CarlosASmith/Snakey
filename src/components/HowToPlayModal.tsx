import React from 'react';
import { X, Crosshair, Zap, Cpu, Sparkles, Clock, Shield, Award } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Mission Protocol & Tactics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Mission 1: Race the Snake */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>01. Intercept Treasures First</span>
            </div>
            <p>
              The cyber-viper occupies 3 to 4 squares and actively hunts down data cores and relics on the grid using automated pathfinding.
              <strong className="text-white block mt-1">Run in front of the snake to collect them before it reaches them!</strong>
              If the snake eats a treasure, it absorbs the energy and speeds up.
            </p>
          </div>

          {/* Mission 2: Attack the Snake */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Crosshair className="w-4 h-4 text-rose-400" />
              <span>02. Blast Snake Segments</span>
            </div>
            <p>
              Use the <strong className="text-rose-400">STRIKE</strong> button (or Spacebar) to fire an energy pulse in the direction you are facing.
              Every hit on a snake segment destroys it, awards points, and reduces the snake length.
            </p>
          </div>

          {/* Mission 3: Escalating Velocity */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>03. Speed Surge Escalation</span>
            </div>
            <p>
              <strong className="text-white">With every segment you destroy, the snake speeds up significantly!</strong>
              When down to its final head segment, it moves at breakneck velocity. Destroy all segments to clear the sector and unlock higher difficulty levels!
            </p>
          </div>

          {/* Powerups legend */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider block">Grid Rewards & Relics</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center text-slate-950 font-bold">
                  <Cpu className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span><strong>Data Core</strong> (+100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-fuchsia-400 flex items-center justify-center text-slate-950 font-bold">
                  <Sparkles className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span><strong>Neon Crystal</strong> (+250)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-sky-400 flex items-center justify-center text-slate-950 font-bold">
                  <Clock className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span><strong>Chrono Slow</strong> (Slows Snake)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-emerald-400 flex items-center justify-center text-slate-950 font-bold">
                  <Zap className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span><strong>EMP Blast</strong> (Stun Wave)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-indigo-400 flex items-center justify-center text-slate-950 font-bold">
                  <Shield className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span><strong>Shield Pod</strong> (+1 Hit)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                  <Award className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span><strong>Combo Meter</strong> (High Score)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Understood · Deploy to Arena
          </button>
        </div>
      </div>
    </div>
  );
};
