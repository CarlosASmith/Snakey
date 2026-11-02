import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Smartphone, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Trophy, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PhoneChassisProps {
  children: React.ReactNode;
  isFramed: boolean;
  onToggleFrame: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onRestartCurrentGame: () => void;
  levelTitle?: string;
}

export const PhoneChassis: React.FC<PhoneChassisProps> = ({
  children,
  isFramed,
  onToggleFrame,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onRestartCurrentGame,
  levelTitle,
}) => {
  const [timeStr, setTimeStr] = useState('12:00');
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 select-none overflow-hidden">
      {/* Background ambient grid glow */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Desktop / Header Utility Toolbar */}
      <header className="w-full max-w-md hidden sm:flex items-center justify-between px-3 py-2 text-xs text-slate-400 z-20 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-white uppercase text-[13px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            CyberViper
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 truncate max-w-[140px]">{levelTitle || 'Arcade'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors cursor-pointer"
            title="Global Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Rankings</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Game Manual & Rules"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleToggleSound}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            onClick={onRestartCurrentGame}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Restart Level"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleFrame}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title={isFramed ? 'Switch to Fullscreen Phone' : 'Show Phone Chassis Frame'}
          >
            {isFramed ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Container: Mobile phone chassis or Fullscreen responsive frame */}
      <div
        className={`relative transition-all duration-300 z-10 w-full flex flex-col items-center ${
          isFramed
            ? 'max-w-[410px] h-[100dvh] sm:h-[840px] max-h-[100dvh] sm:max-h-[890px] rounded-none sm:rounded-[44px] bg-neutral-900 sm:border-[10px] sm:border-neutral-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08),0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-white/10'
            : 'max-w-md h-[100dvh] bg-slate-950 sm:border sm:border-slate-800/80 sm:rounded-2xl shadow-2xl'
        }`}
      >
        {/* Hardware Buttons Simulated on Sides (only visible on framed desktop) */}
        {isFramed && (
          <>
            {/* Left Volume rocker & Action button */}
            <div className="hidden sm:block absolute -left-[14px] top-28 w-[4px] h-9 bg-neutral-700 rounded-l-sm" />
            <div className="hidden sm:block absolute -left-[14px] top-42 w-[4px] h-12 bg-neutral-700 rounded-l-sm" />
            <div className="hidden sm:block absolute -left-[14px] top-58 w-[4px] h-12 bg-neutral-700 rounded-l-sm" />
            {/* Right Power button */}
            <div className="hidden sm:block absolute -right-[14px] top-36 w-[4px] h-16 bg-neutral-700 rounded-r-sm" />
          </>
        )}

        {/* Top Status Bar & Dynamic Island */}
        <div className="w-full h-11 shrink-0 flex items-center justify-between px-5 text-slate-300 text-xs z-30 select-none bg-slate-950/80 backdrop-blur-md pt-1 border-b border-white/5">
          <span className="font-semibold tracking-tight text-[11px] font-mono-numbers">{timeStr}</span>

          {/* Dynamic Island / Camera Punchhole */}
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-5 bg-black rounded-full border border-neutral-800/90 flex items-center justify-between px-2 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700/80 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-cyan-600/60" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-cyan-400 tracking-wider">CYBER</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <button 
              onClick={handleToggleSound} 
              className="sm:hidden text-slate-300 active:text-cyan-400 p-0.5"
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5 text-[10px] font-mono-numbers text-slate-300">
              <span>98%</span>
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Screen Viewport with child Game Component */}
        <div className="relative flex-1 w-full flex flex-col overflow-hidden bg-slate-950">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-full h-4 shrink-0 flex items-center justify-center bg-slate-950/90 z-20">
          <div className="w-28 h-1 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Bottom quick tip on desktop */}
      <footer className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400 mt-2 z-20">
        <span>Controls: <strong className="text-slate-300">Arrows / WASD</strong> to Move · <strong className="text-slate-300">Spacebar</strong> to Attack · <strong className="text-slate-300">Shift</strong> to Dash</span>
      </footer>
    </div>
  );
};
