import React, { useState } from 'react';
import { Key, ShieldCheck, Zap, X, Check, ExternalLink } from 'lucide-react';

interface OpenRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  openRouterKey1: string;
  openRouterKey2: string;
  onSaveKeys: (key1: string, key2: string) => void;
}

export const OpenRouterModal: React.FC<OpenRouterModalProps> = ({
  isOpen,
  onClose,
  openRouterKey1,
  openRouterKey2,
  onSaveKeys,
}) => {
  const [key1, setKey1] = useState(openRouterKey1);
  const [key2, setKey2] = useState(openRouterKey2);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(key1.trim(), key2.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#140a05] border border-white/20 rounded-2xl p-6 shadow-2xl text-white space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">OpenRouter API Keys</h3>
              <p className="text-xs text-white/50">Multi-Key Automatic Failover & Zero Quota Lockouts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Banner */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3.5 text-xs text-orange-200/90 leading-relaxed space-y-1.5">
          <div className="flex items-center space-x-2 font-bold text-orange-300">
            <Zap className="w-4 h-4 text-orange-400" />
            <span>Dual Key Protection Active</span>
          </div>
          <p>
            Provide up to 2 OpenRouter API keys. If Key #1 hits rate limits or quota caps, VoiceStudio automatically switches to Key #2 seamlessly without interrupting your audio generation!
          </p>
        </div>

        {/* Key Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80 flex items-center justify-between">
              <span>Primary OpenRouter API Key (#1)</span>
              {key1 && <span className="text-[10px] text-emerald-400 font-mono font-bold">Active</span>}
            </label>
            <input
              type="password"
              value={key1}
              onChange={(e) => setKey1(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80 flex items-center justify-between">
              <span>Backup OpenRouter API Key (#2)</span>
              {key2 && <span className="text-[10px] text-pink-400 font-mono font-bold">Failover Backup</span>}
            </label>
            <input
              type="password"
              value={key2}
              onChange={(e) => setKey2(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-orange-400 hover:underline flex items-center font-medium"
            >
              Get OpenRouter Key <ExternalLink className="w-3 h-3 ml-1" />
            </a>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setKey1('');
                  setKey2('');
                  onSaveKeys('', '');
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition-colors"
              >
                Clear Keys
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 font-bold text-xs text-white rounded-xl shadow-lg shadow-orange-500/20 flex items-center space-x-1.5 transition-transform active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Keys Saved!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save API Keys</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
