import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Crosshair, 
  Zap, 
  Wind 
} from 'lucide-react';
import { Direction } from '../types/game';
import { soundEngine } from '../utils/audio';

interface TouchControlsProps {
  onMove: (dir: Direction) => void;
  onAttack: () => void;
  onDash: () => void;
  canDash: boolean;
  empCharges: number;
  onUseEMP: () => void;
  playerFacing: Direction;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onAttack,
  onDash,
  canDash,
  empCharges,
  onUseEMP,
  playerFacing,
}) => {
  const handleDirPress = (dir: Direction, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    soundEngine.triggerHaptic(15);
    onMove(dir);
  };

  const handleAttackPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    soundEngine.triggerHaptic(25);
    onAttack();
  };

  const handleDashPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (canDash) {
      soundEngine.triggerHaptic(30);
      onDash();
    }
  };

  const handleEMPPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (empCharges > 0) {
      soundEngine.triggerHaptic(50);
      onUseEMP();
    }
  };

  return (
    <div className="w-full bg-slate-950/95 border-t border-slate-800/80 px-4 py-3 flex items-center justify-between select-none z-20">
      {/* Left: Ergonomic 4-Way D-Pad */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* D-Pad Background cross */}
        <div className="absolute w-10 h-28 bg-slate-900 rounded-lg border border-slate-800 pointer-events-none" />
        <div className="absolute w-28 h-10 bg-slate-900 rounded-lg border border-slate-800 pointer-events-none" />

        {/* Center Pivot */}
        <div className="absolute w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center pointer-events-none z-10 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
        </div>

        {/* Up Button */}
        <button
          onTouchStart={(e) => handleDirPress('UP', e)}
          onMouseDown={(e) => handleDirPress('UP', e)}
          className={`absolute top-0 w-10 h-10 rounded-t-lg flex items-center justify-center cursor-pointer transition-colors active:bg-cyan-500 active:text-slate-950 ${
            playerFacing === 'UP' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300'
          }`}
          aria-label="Move Up"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Down Button */}
        <button
          onTouchStart={(e) => handleDirPress('DOWN', e)}
          onMouseDown={(e) => handleDirPress('DOWN', e)}
          className={`absolute bottom-0 w-10 h-10 rounded-b-lg flex items-center justify-center cursor-pointer transition-colors active:bg-cyan-500 active:text-slate-950 ${
            playerFacing === 'DOWN' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300'
          }`}
          aria-label="Move Down"
        >
          <ArrowDown className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Left Button */}
        <button
          onTouchStart={(e) => handleDirPress('LEFT', e)}
          onMouseDown={(e) => handleDirPress('LEFT', e)}
          className={`absolute left-0 w-10 h-10 rounded-l-lg flex items-center justify-center cursor-pointer transition-colors active:bg-cyan-500 active:text-slate-950 ${
            playerFacing === 'LEFT' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300'
          }`}
          aria-label="Move Left"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Right Button */}
        <button
          onTouchStart={(e) => handleDirPress('RIGHT', e)}
          onMouseDown={(e) => handleDirPress('RIGHT', e)}
          className={`absolute right-0 w-10 h-10 rounded-r-lg flex items-center justify-center cursor-pointer transition-colors active:bg-cyan-500 active:text-slate-950 ${
            playerFacing === 'RIGHT' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300'
          }`}
          aria-label="Move Right"
        >
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Right: Primary Action Attack & Tactical Dash Buttons */}
      <div className="flex items-center gap-3">
        {/* EMP shockwave / special button if available */}
        {empCharges > 0 && (
          <button
            onTouchStart={handleEMPPress}
            onMouseDown={handleEMPPress}
            className="w-11 h-11 rounded-full bg-amber-500/20 active:bg-amber-500 border border-amber-400 text-amber-300 active:text-slate-950 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse cursor-pointer"
            title="Detonate EMP Shockwave"
          >
            <Zap className="w-5 h-5 fill-amber-400/30" />
            <span className="text-[9px] font-bold font-mono-numbers">{empCharges}</span>
          </button>
        )}

        {/* Dash Button */}
        <button
          onTouchStart={handleDashPress}
          onMouseDown={handleDashPress}
          disabled={!canDash}
          className={`w-13 h-13 rounded-full flex flex-col items-center justify-center border transition-all cursor-pointer ${
            canDash
              ? 'bg-slate-900 border-cyan-500/50 text-cyan-300 active:bg-cyan-500 active:text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
          }`}
          title="Dash Forward (Steal Treasure!)"
        >
          <Wind className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Dash</span>
        </button>

        {/* Main ATTACK Button */}
        <button
          onTouchStart={handleAttackPress}
          onMouseDown={handleAttackPress}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 active:from-rose-400 active:to-rose-600 text-white font-extrabold flex flex-col items-center justify-center border-2 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.6)] active:scale-95 transition-all cursor-pointer"
          title="Attack Viper Segment!"
        >
          <Crosshair className="w-6 h-6 stroke-[2.5]" />
          <span className="text-[10px] font-black uppercase tracking-wider">Strike</span>
        </button>
      </div>
    </div>
  );
};
