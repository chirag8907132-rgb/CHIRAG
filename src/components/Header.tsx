import React from 'react';
import { Mic, Sparkles, Languages, History, BookOpen, UserPlus, Key } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  activeLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  activeTab: 'single' | 'dialogue' | 'cloning' | 'history' | 'dictionary';
  onSelectTab: (tab: 'single' | 'dialogue' | 'cloning' | 'history' | 'dictionary') => void;
  historyCount: number;
  rulesCount?: number;
  clonesCount?: number;
  onOpenOpenRouterModal?: () => void;
  hasOpenRouterKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeLanguage,
  onSelectLanguage,
  activeTab,
  onSelectTab,
  historyCount,
  rulesCount = 0,
  clonesCount = 0,
  onOpenOpenRouterModal,
  hasOpenRouterKey,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0502]/80 backdrop-blur-2xl border-b border-white/10 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#ff4e00] to-[#ec4899] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                  BHASHA<span className="text-xs text-[#ff4e00] font-mono ml-1 font-semibold">VOICE STUDIO</span>
                </h1>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-emerald-400">
                    Pro Vocal Engine
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">
                Expressive AI Voice Synthesis & Custom Voice Cloning
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-white/5 backdrop-blur-xl p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onSelectTab('single')}
              className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'single'
                  ? 'bg-gradient-to-r from-[#ff4e00] to-[#ec4899] text-white shadow-lg shadow-orange-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mic className="w-3.5 h-3.5 mr-1.5" />
              Single Voice
            </button>
            <button
              onClick={() => onSelectTab('dialogue')}
              className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dialogue'
                  ? 'bg-gradient-to-r from-[#ff4e00] to-[#ec4899] text-white shadow-lg shadow-orange-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Languages className="w-3.5 h-3.5 mr-1.5" />
              Dialogue
            </button>
            <button
              onClick={() => onSelectTab('cloning')}
              className={`relative flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cloning'
                  ? 'bg-gradient-to-r from-[#ff4e00] to-[#ec4899] text-white shadow-lg shadow-orange-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5 text-pink-400" />
              Voice Clone Studio
              {clonesCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-pink-500/30 text-pink-300 border border-pink-500/40 rounded-full font-bold">
                  {clonesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectTab('history')}
              className={`relative flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-[#ff4e00] to-[#ec4899] text-white shadow-lg shadow-orange-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5 mr-1.5" />
              Library
              {historyCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-white/20 text-white rounded-full font-bold">
                  {historyCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectTab('dictionary')}
              className={`relative flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dictionary'
                  ? 'bg-gradient-to-r from-[#ff4e00] to-[#ec4899] text-white shadow-lg shadow-orange-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Dictionary
              {rulesCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-full font-bold">
                  {rulesCount}
                </span>
              )}
            </button>

            {onOpenOpenRouterModal && (
              <button
                onClick={onOpenOpenRouterModal}
                className="relative flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 transition-all shadow-md shadow-orange-500/10"
              >
                <Key className="w-3.5 h-3.5 mr-1.5" />
                <span>API Keys</span>
                {hasOpenRouterKey && (
                  <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            )}
          </nav>

          {/* Quick Language Switcher */}
          <div className="hidden lg:flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onSelectLanguage('auto')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                activeLanguage === 'auto'
                  ? 'bg-white text-black font-semibold shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              ✨ Auto
            </button>
            <button
              onClick={() => onSelectLanguage('hinglish')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                activeLanguage === 'hinglish'
                  ? 'bg-white text-black font-semibold shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🇮🇳 Hinglish
            </button>
            <button
              onClick={() => onSelectLanguage('hi')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                activeLanguage === 'hi'
                  ? 'bg-white text-black font-semibold shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🇮🇳 हिंदी
            </button>
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                activeLanguage === 'en'
                  ? 'bg-white text-black font-semibold shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🌐 English
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
