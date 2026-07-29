import React, { useState } from 'react';
import { VOICES } from '../data/voicesAndPresets';
import { VoiceOption, VoiceName, Language, CustomVoiceClone } from '../types';
import { User, Volume2, Check, Sparkles, ShieldCheck, Plus, Mic } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: string; // VoiceName or custom clone id
  onSelectVoice: (voice: string, customClone?: CustomVoiceClone) => void;
  activeLanguage: Language;
  customClones?: CustomVoiceClone[];
  onOpenCloningStudio?: () => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  activeLanguage,
  customClones = [],
  onOpenCloningStudio,
}) => {
  const [activeVoiceTab, setActiveVoiceTab] = useState<'builtin' | 'custom'>('builtin');
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const handlePreview = (voiceId: string, textToSpeak: string, gender: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (playingPreview === voiceId) {
      setPlayingPreview(null);
      return;
    }

    setPlayingPreview(voiceId);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      const voices = window.speechSynthesis.getVoices();
      if (gender === 'female') {
        const fVoice = voices.find(
          (v) => v.name.includes('Female') || v.name.includes('Google') || v.lang.includes('hi')
        );
        if (fVoice) utterance.voice = fVoice;
      } else {
        const mVoice = voices.find(
          (v) => v.name.includes('Male') || v.name.includes('David') || v.lang.includes('en')
        );
        if (mVoice) utterance.voice = mVoice;
      }

      utterance.onend = () => setPlayingPreview(null);
      utterance.onerror = () => setPlayingPreview(null);

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingPreview(null), 2500);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
      {/* Selector Header with Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 flex items-center">
          <User className="w-4 h-4 text-[#ff4e00] mr-2" />
          Voice Profile Selection
        </label>

        <div className="flex items-center space-x-2">
          {/* Tab buttons */}
          <button
            type="button"
            onClick={() => setActiveVoiceTab('builtin')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeVoiceTab === 'builtin'
                ? 'bg-[#ff4e00]/20 text-orange-300 border border-[#ff4e00]/40'
                : 'text-white/50 hover:text-white bg-white/5'
            }`}
          >
            Built-In AI Voices ({VOICES.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveVoiceTab('custom')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center ${
              activeVoiceTab === 'custom'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                : 'text-white/50 hover:text-white bg-white/5'
            }`}
          >
            <Mic className="w-3 h-3 mr-1 text-pink-400" />
            Custom Clones ({customClones.length})
          </button>

          {onOpenCloningStudio && (
            <button
              type="button"
              onClick={onOpenCloningStudio}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500/30 to-pink-500/30 text-orange-200 border border-orange-500/40 hover:scale-105 transition-all flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> Clone Voice
            </button>
          )}
        </div>
      </div>

      {/* Built-in Voices Grid */}
      {activeVoiceTab === 'builtin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {VOICES.map((voice) => {
            const isSelected = selectedVoice === voice.id;
            const isPlaying = playingPreview === voice.id;
            const previewText =
              activeLanguage === 'auto'
                ? voice.previewText.hinglish
                : voice.previewText[activeLanguage] || voice.previewText.en;

            return (
              <div
                key={voice.id}
                onClick={() => onSelectVoice(voice.id)}
                className={`relative cursor-pointer group rounded-xl p-4 transition-all duration-200 border text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#ff4e00]/20 to-transparent border-[#ff4e00]/40 shadow-lg shadow-orange-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-[#ff4e00]">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div>
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 ${
                        voice.gender === 'female'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      }`}
                    >
                      {voice.name.substring(0, 2)}
                    </div>

                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-sm font-bold text-white truncate">{voice.name}</h3>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 capitalize">
                          {voice.gender}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#ff4e00] font-semibold truncate mt-0.5">
                        {voice.accent}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/50 line-clamp-2 mt-2 leading-relaxed">
                    {voice.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => handlePreview(voice.id, previewText, voice.gender, e)}
                    className={`flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      isPlaying
                        ? 'bg-[#ff4e00] text-white animate-pulse'
                        : 'text-white/70 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    <Volume2 className={`w-3 h-3 mr-1 ${isPlaying ? 'animate-spin' : ''}`} />
                    {isPlaying ? 'Auditioning...' : 'Audition Voice'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Clones Tab Grid */}
      {activeVoiceTab === 'custom' && (
        <div>
          {customClones.length === 0 ? (
            <div className="p-8 text-center bg-black/20 rounded-xl border border-dashed border-white/10 space-y-3">
              <Mic className="w-8 h-8 text-pink-400 mx-auto" />
              <div>
                <p className="text-xs font-bold text-white/80">No Custom Cloned Voices Created Yet</p>
                <p className="text-[11px] text-white/50">
                  Upload a 10s recording of your voice to generate a personalized AI voice clone!
                </p>
              </div>
              {onOpenCloningStudio && (
                <button
                  type="button"
                  onClick={onOpenCloningStudio}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg"
                >
                  Open Voice Cloning Studio
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {customClones.map((clone) => {
                const isSelected = selectedVoice === clone.id;
                const isPlaying = playingPreview === clone.id;
                const previewText = `Hello! I am ${clone.name}, your custom cloned voice profile. Ready for high-quality audio generation.`;

                return (
                  <div
                    key={clone.id}
                    onClick={() => onSelectVoice(clone.id, clone)}
                    className={`relative cursor-pointer group rounded-xl p-4 transition-all duration-200 border text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500/20 to-orange-500/10 border-pink-500/50 shadow-lg shadow-pink-500/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-pink-400">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-start space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                          {clone.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center space-x-1">
                            <h3 className="text-sm font-bold text-white truncate">{clone.name}</h3>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-pink-500/30 text-pink-300 font-bold">
                              Clone
                            </span>
                          </div>
                          <p className="text-[11px] text-pink-400 font-semibold truncate mt-0.5">
                            {clone.accent}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-white/50 line-clamp-2 mt-2 leading-relaxed">
                        {clone.description || 'Personal custom voice clone profile'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Consent Verified
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handlePreview(clone.id, previewText, clone.gender, e)}
                        className={`flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                          isPlaying
                            ? 'bg-pink-500 text-white animate-pulse'
                            : 'text-white/70 bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <Volume2 className={`w-3 h-3 mr-1 ${isPlaying ? 'animate-spin' : ''}`} />
                        {isPlaying ? 'Testing...' : 'Audition'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
