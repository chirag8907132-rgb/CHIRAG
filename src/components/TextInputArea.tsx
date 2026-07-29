import React, { useState } from 'react';
import { Language } from '../types';
import { LANGUAGE_OPTIONS, SAMPLE_SCRIPTS } from '../data/voicesAndPresets';
import { Sparkles, Languages, Volume2, RefreshCw, Trash2, Clock, FileText, Wand2, PlusCircle, Check } from 'lucide-react';

interface TextInputAreaProps {
  text: string;
  onChangeText: (text: string) => void;
  activeLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onGenerateAudio: () => void;
  isGenerating: boolean;
  onEnhanceScript: (action: 'enhance' | 'translate_hinglish' | 'translate_hindi' | 'add_emotions' | 'auto_pauses') => void;
  isEnhancing: boolean;
  rateLimitSeconds?: number;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  text,
  onChangeText,
  activeLanguage,
  onSelectLanguage,
  onGenerateAudio,
  isGenerating,
  onEnhanceScript,
  isEnhancing,
  rateLimitSeconds,
}) => {
  const [copiedSample, setCopiedSample] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  // Average speech rate ~150 words per minute -> 2.5 words per second
  const estimatedSeconds = Math.max(1, Math.round(wordCount / 2.5));

  const handleInsertTag = (tag: string) => {
    onChangeText(text + (text.endsWith(' ') || !text ? '' : ' ') + tag + ' ');
  };

  const handleLoadSample = (sampleText: string) => {
    onChangeText(sampleText);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5 relative">
      {/* Top Header & Language Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-[#ff4e00]" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            Script & Text Input Area
          </h2>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => onSelectLanguage(lang.id)}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLanguage === lang.id
                  ? 'bg-white text-black font-semibold shadow'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-1.5">{lang.flag}</span>
              {lang.id === 'hinglish' ? 'Hinglish' : lang.id === 'hi' ? 'हिंदी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* AI Enhancer & Pause Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/5 p-3.5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
          <span className="text-xs font-semibold text-white/60 mr-1 flex items-center">
            <Wand2 className="w-3.5 h-3.5 text-orange-400 mr-1" /> AI Script Tools:
          </span>

          <button
            type="button"
            disabled={!text || isEnhancing}
            onClick={() => onEnhanceScript('auto_pauses')}
            className="flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-orange-300 hover:from-orange-500/40 hover:to-amber-500/40 border border-orange-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 mr-1 text-orange-400 animate-pulse" />
            AI Auto-Pauses Control
          </button>

          <button
            type="button"
            disabled={!text || isEnhancing}
            onClick={() => onEnhanceScript('enhance')}
            className="flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white/90 hover:bg-white/20 border border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3 h-3 mr-1 text-amber-300" />
            Polishing Script
          </button>

          <button
            type="button"
            disabled={!text || isEnhancing}
            onClick={() => onEnhanceScript('translate_hinglish')}
            className="flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🇮🇳 Make Hinglish
          </button>

          <button
            type="button"
            disabled={!text || isEnhancing}
            onClick={() => onEnhanceScript('translate_hindi')}
            className="flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🇮🇳 Make Hindi
          </button>

          <button
            type="button"
            disabled={!text || isEnhancing}
            onClick={() => onEnhanceScript('add_emotions')}
            className="flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🎭 Expressive Cues
          </button>
        </div>

        {text && (
          <button
            type="button"
            onClick={() => onChangeText('')}
            className="flex items-center text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
          </button>
        )}
      </div>

      {/* Main Text Area with Long Script YouTube Mode Support */}
      <div className="relative min-h-[180px] bg-black/20 rounded-xl p-3.5 border border-white/10 focus-within:border-[#ff4e00]/50 transition-colors space-y-2">
        <textarea
          rows={8}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={
            activeLanguage === 'hinglish'
              ? 'Paste or type your script here (50k–100k words supported)... Auto-chunking will combine everything into 1 single output file.'
              : activeLanguage === 'hi'
              ? 'यहाँ अपना लंबा हिंदी स्क्रिप्ट दर्ज करें (50k-100k शब्द समर्थित)... ऑटो-चंकिंग इसे 1 सिंगल MP3/WAV आउटपुट में संयोजित करेगी।'
              : 'Type or paste your YouTube narration script here (50k–100k words supported)...'
          }
          className="w-full bg-transparent border-none outline-none resize-y text-base sm:text-lg leading-relaxed text-white/90 placeholder:text-white/20 font-serif focus:ring-0 p-1"
        />

        {/* Long Script YouTube Narration Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs font-mono text-white/60">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] uppercase font-bold">
              🎬 YouTube Long Script Mode
            </span>
            <span>Supports 50k–100k words</span>
          </div>

          <div className="flex items-center space-x-2 text-white/50">
            <span>
              Auto Chunking:{' '}
              <strong className="text-white font-bold">
                {Math.ceil(Math.max(1, wordCount / 220))} Part(s)
              </strong>
            </span>
            <span>•</span>
            <span className="text-[#ff4e00] font-semibold">
              Output: 1 Combined Single Audio
            </span>
          </div>
        </div>

        {isEnhancing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-orange-400 space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#ff4e00]" />
            <span className="text-sm font-semibold">Processing AI script & pause control...</span>
          </div>
        )}
      </div>

      {/* Manual Pause & Vocal Cues Insertion Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Expression & Pause Duration Tags */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
          <span className="text-xs text-white/40 font-medium mr-1 flex items-center">
            <Clock className="w-3 h-3 text-orange-400 mr-1" /> Pause Controls:
          </span>
          {[
            { tag: '[pause 0.5s]', label: '⏱️ 0.5s Pause' },
            { tag: '[pause 1s]', label: '⏱️ 1.0s Pause' },
            { tag: '[pause 2s]', label: '⏱️ 2.0s Pause' },
            { tag: '[breath]', label: '💨 Breath' },
            { tag: '[dramatic pause]', label: '🎭 Dramatic Pause' },
          ].map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => handleInsertTag(item.tag)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 text-orange-300 border border-white/10 hover:bg-white/10 hover:border-[#ff4e00]/40 transition-colors font-mono"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sample Scripts selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-white/40">Try sample:</span>
          {SAMPLE_SCRIPTS[activeLanguage].slice(0, 2).map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(sample.text)}
              className="text-xs text-white/80 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-white/10 transition-colors"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Word Count Metrics & Generate Audio Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10 gap-4">
        <div className="flex items-center space-x-4 text-xs font-mono text-white/40">
          <span>Words: {wordCount}</span>
          <span>•</span>
          <span>Chars: {charCount}</span>
          <span>•</span>
          <span className="flex items-center text-orange-400 font-semibold">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Est. Duration: {estimatedSeconds}s
          </span>
        </div>

        <button
          type="button"
          disabled={!text.trim() || isGenerating || (rateLimitSeconds !== undefined && rateLimitSeconds > 0)}
          onClick={onGenerateAudio}
          className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-xl uppercase tracking-widest text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            rateLimitSeconds && rateLimitSeconds > 0
              ? 'bg-amber-600/80 border border-amber-400/50 shadow-amber-500/20'
              : 'bg-gradient-to-r from-[#ff4e00] to-[#ec4899] shadow-orange-500/20'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>Synthesizing Audio...</span>
            </>
          ) : rateLimitSeconds && rateLimitSeconds > 0 ? (
            <>
              <Clock className="w-5 h-5 animate-pulse text-amber-200" />
              <span>Quota Cooldown ({rateLimitSeconds}s)</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-white" />
              <span>Generate Audio</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
