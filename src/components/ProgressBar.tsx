import React from 'react';
import { RefreshCw, Sparkles, Volume2, CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  isGenerating: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, isGenerating }) => {
  if (!isGenerating && progress <= 0) return null;

  const currentProgress = Math.min(100, Math.max(0, progress));

  let stageLabel = 'Initializing Speech Synthesizer...';
  if (currentProgress < 25) {
    stageLabel = 'Analyzing text script & phonetic rules...';
  } else if (currentProgress < 60) {
    stageLabel = 'Synthesizing voice wave via AI model...';
  } else if (currentProgress < 85) {
    stageLabel = 'Encoding high-fidelity PCM audio stream...';
  } else if (currentProgress < 100) {
    stageLabel = 'Finalizing audio output file...';
  } else {
    stageLabel = 'Audio Generation Complete!';
  }

  return (
    <div className="bg-[#180d07]/90 border border-orange-500/30 rounded-xl p-4 text-white space-y-2.5 shadow-xl animate-fade-in mt-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {currentProgress >= 100 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
          )}
          <span className="font-bold text-orange-200">{stageLabel}</span>
        </div>
        <span className="font-mono font-extrabold text-orange-400 text-sm tracking-tight">
          {Math.round(currentProgress)}%
        </span>
      </div>

      {/* Outer Track */}
      <div className="w-full bg-black/60 border border-white/10 rounded-full h-3 p-0.5 overflow-hidden">
        {/* Animated Inner Bar */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff4e00] via-orange-400 to-[#ec4899] transition-all duration-300 ease-out shadow-lg shadow-orange-500/30 relative"
          style={{ width: `${currentProgress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
};
