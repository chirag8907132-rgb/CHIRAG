import React from 'react';
import { VoiceTuningConfig } from '../types';
import { Sliders, Gauge, Volume2, Mic, RotateCcw, Sparkles, Clock, Music } from 'lucide-react';

interface VoiceTuningControlsProps {
  config: VoiceTuningConfig;
  onChangeConfig: (newConfig: VoiceTuningConfig) => void;
  onResetDefaults: () => void;
}

export const VoiceTuningControls: React.FC<VoiceTuningControlsProps> = ({
  config,
  onChangeConfig,
  onResetDefaults,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-[#ff4e00]" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              Advanced Voice Tuning Studio
            </h3>
            <p className="text-[11px] text-white/50">
              Fine-tune speed, pitch, stability, and human breath dynamics
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetDefaults}
          className="text-xs text-white/40 hover:text-orange-400 flex items-center transition-colors font-mono"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
        </button>
      </div>

      {/* Grid of Tuning Sliders & Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Speed / Pace Control */}
        <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/80 flex items-center">
              <Gauge className="w-3.5 h-3.5 text-orange-400 mr-1.5" /> Speed & Pace
            </span>
            <span className="text-xs font-mono font-bold text-[#ff4e00]">
              {config.speed.toFixed(2)}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={config.speed}
            onChange={(e) => onChangeConfig({ ...config, speed: parseFloat(e.target.value) })}
            className="w-full accent-[#ff4e00] cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-white/40">
            <span>0.5x (Slow)</span>
            <span>1.0x (Normal)</span>
            <span>2.0x (Fast)</span>
          </div>
        </div>

        {/* Pitch Control */}
        <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/80 flex items-center">
              <Music className="w-3.5 h-3.5 text-pink-400 mr-1.5" /> Pitch Profile
            </span>
            <span className="text-xs font-mono font-bold text-pink-300 capitalize">
              {config.pitch} Pitch
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChangeConfig({ ...config, pitch: p })}
                className={`py-1.5 text-xs font-mono rounded-lg border text-center capitalize transition-all ${
                  config.pitch === p
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 font-bold'
                    : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Vocal Stability */}
        <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/80 flex items-center">
              <Mic className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Vocal Stability
            </span>
            <span className="text-xs font-mono font-bold text-emerald-300">
              {Math.round(config.stability * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={config.stability}
            onChange={(e) => onChangeConfig({ ...config, stability: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-white/40">
            <span>Dynamic (Expressive)</span>
            <span>Steady Tone</span>
          </div>
        </div>

        {/* Emotional Expressiveness */}
        <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/80 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 mr-1.5" /> Expressiveness Range
            </span>
            <span className="text-xs font-mono font-bold text-purple-300">
              {Math.round(config.expressiveness * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={config.expressiveness}
            onChange={(e) => onChangeConfig({ ...config, expressiveness: parseFloat(e.target.value) })}
            className="w-full accent-purple-400 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-white/40">
            <span>Subtle</span>
            <span>Human Max Range</span>
          </div>
        </div>

        {/* Natural Pause Duration */}
        <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/80 flex items-center">
              <Clock className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> Inter-Sentence Pause Gap
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {config.pauseDuration.toFixed(1)} Seconds
            </span>
          </div>

          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.1"
            value={config.pauseDuration}
            onChange={(e) => onChangeConfig({ ...config, pauseDuration: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-white/40">
            <span>0.2s (Fast Flow)</span>
            <span>0.5s (Standard Natural)</span>
            <span>2.0s (Storytelling Dramatic)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
