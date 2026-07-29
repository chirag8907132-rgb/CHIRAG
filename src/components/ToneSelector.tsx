import React, { useState } from 'react';
import { TONE_PRESETS } from '../data/voicesAndPresets';
import { EmotionTone } from '../types';
import {
  Sliders,
  MessageSquare,
  BookOpen,
  Radio,
  Zap,
  Heart,
  Flame,
  Smile,
  Frown,
  MinusCircle,
  AlertCircle,
  ShieldAlert,
  Megaphone,
} from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: EmotionTone;
  onSelectTone: (tone: EmotionTone) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Smile: <Smile className="w-4 h-4" />,
  Frown: <Frown className="w-4 h-4" />,
  MinusCircle: <MinusCircle className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  AlertCircle: <AlertCircle className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Radio: <Radio className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Megaphone: <Megaphone className="w-4 h-4" />,
};

export const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onSelectTone }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'emotion' | 'style'>('all');

  const filteredPresets = TONE_PRESETS.filter((preset) => {
    if (activeFilter === 'all') return true;
    return preset.category === activeFilter;
  });

  const selectedPresetObj = TONE_PRESETS.find((p) => p.id === selectedTone);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
      {/* Title & Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 flex items-center">
          <Sliders className="w-4 h-4 text-[#ff4e00] mr-2" />
          Emotion & Speaking Style Control
        </label>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            All ({TONE_PRESETS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('emotion')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'emotion'
                ? 'bg-[#ff4e00] text-white font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            🎭 Emotions
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('style')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'style'
                ? 'bg-purple-600 text-white font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            🎙️ Speaking Styles
          </button>
        </div>
      </div>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {filteredPresets.map((preset) => {
          const isSelected = selectedTone === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectTone(preset.id)}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all relative group ${
                isSelected
                  ? 'bg-gradient-to-r from-[#ff4e00]/25 via-orange-950/40 to-transparent border-[#ff4e00]/60 text-white shadow-lg shadow-orange-500/10'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base">{preset.emoji}</span>
                  <span className={isSelected ? 'text-[#ff4e00]' : 'text-white/40'}>
                    {ICON_MAP[preset.icon] || <MessageSquare className="w-4 h-4" />}
                  </span>
                </div>
                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                  preset.category === 'emotion' ? 'bg-orange-500/20 text-orange-300' : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {preset.category}
                </span>
              </div>

              <span className="text-xs font-bold truncate w-full mt-1">{preset.label}</span>
              <p className="text-[10px] text-white/40 line-clamp-1 leading-tight mt-0.5">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Selected Tone Description Banner */}
      {selectedPresetObj && (
        <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{selectedPresetObj.emoji}</span>
            <div>
              <span className="font-bold text-white mr-2">
                Active Expression: {selectedPresetObj.label}
              </span>
              <span className="text-white/60 hidden sm:inline">
                ({selectedPresetObj.description})
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#ff4e00] font-semibold">
            Applied to Hindi, English & Hinglish
          </span>
        </div>
      )}
    </div>
  );
};
