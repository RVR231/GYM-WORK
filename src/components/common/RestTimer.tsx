import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';

interface RestTimerProps {
  onClose?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(90);
  const [initialSeconds, setInitialSeconds] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play brief web audio beep if available
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        // audio context not allowed without interaction, ignore
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const setTimerPreset = (secs: number) => {
    setInitialSeconds(secs);
    setSecondsLeft(secs);
    setIsRunning(true);
  };

  const togglePlay = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 md:bottom-6 right-4 z-40 bg-[#121417] border border-[#CCFF00]/40 text-[#CCFF00] px-3.5 py-2 rounded-full shadow-glow-accent-sm flex items-center gap-2 text-xs font-bold animate-pulse"
      >
        <Timer className="w-4 h-4" />
        <span>REST: {formatTime(secondsLeft)}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 bg-[#121417] border border-[#2F343E] shadow-2xl rounded-2xl p-3 w-[260px] backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#8E95A5]">
          <Timer className="w-3.5 h-3.5 text-[#CCFF00]" />
          <span>REST TIMER</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-[#8E95A5] hover:text-white text-xs px-1"
            title="Minimize"
          >
            _
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#8E95A5] hover:text-white p-0.5 rounded"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="text-center py-1">
        <div className={`text-3xl font-black tracking-tight ${secondsLeft === 0 ? 'text-[#CCFF00] animate-bounce' : 'text-white'}`}>
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* Preset buttons */}
      <div className="grid grid-cols-4 gap-1.5 my-2">
        {[60, 90, 120, 180].map((s) => (
          <button
            key={s}
            onClick={() => setTimerPreset(s)}
            className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              initialSeconds === s && isRunning
                ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                : 'bg-[#181B20] text-[#8E95A5] border-[#242830] hover:text-white hover:border-[#323742]'
            }`}
          >
            {s < 60 ? `${s}s` : `${s / 60}m`}
          </button>
        ))}
      </div>

      {/* Play/Pause & Reset controls */}
      <div className="flex items-center justify-center gap-2 pt-1 border-t border-[#1F2228]">
        <button
          onClick={togglePlay}
          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isRunning 
              ? 'bg-[#1F2228] text-white hover:bg-[#282C34]' 
              : 'bg-[#CCFF00] text-black hover:bg-[#B8E600]'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        <button
          onClick={resetTimer}
          className="p-1.5 rounded-xl bg-[#181B20] text-[#8E95A5] hover:text-white border border-[#242830]"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
