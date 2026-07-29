import React, { useState } from 'react';
import { PronunciationRule, Language } from '../types';
import { BookOpen, Plus, Trash2, CheckCircle2, XCircle, Sparkles, AlertCircle, Info, RefreshCw, Volume2 } from 'lucide-react';

interface PronunciationDictionaryProps {
  rules: PronunciationRule[];
  onAddRule: (rule: Omit<PronunciationRule, 'id'>) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onLoadPresets: () => void;
  onClearAll: () => void;
}

const PRESET_RULES: Omit<PronunciationRule, 'id'>[] = [
  { word: 'API', phonetic: 'Aay Pee Eye', language: 'all', enabled: true, notes: 'Technical abbreviation' },
  { word: 'SQL', phonetic: 'Sequel', language: 'all', enabled: true, notes: 'Database term' },
  { word: 'ChatGPT', phonetic: 'Chat Jee Pee Tee', language: 'all', enabled: true, notes: 'AI Assistant name' },
  { word: 'YouTube', phonetic: 'You-Tube', language: 'all', enabled: true, notes: 'Platform name' },
  { word: 'AI', phonetic: 'Aay Eye', language: 'all', enabled: true, notes: 'Artificial Intelligence' },
  { word: 'Bhasha', phonetic: 'Bhaa-shaa', language: 'hinglish', enabled: true, notes: 'Hindi word for language' },
  { word: 'Namaste', phonetic: 'Na-mas-tay', language: 'all', enabled: true, notes: 'Indian greeting' },
];

export const PronunciationDictionary: React.FC<PronunciationDictionaryProps> = ({
  rules,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onLoadPresets,
  onClearAll,
}) => {
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [language, setLanguage] = useState<Language | 'all'>('all');
  const [notes, setNotes] = useState('');
  const [testText, setTestText] = useState('Welcome to AI Studio. We build API & SQL servers for YouTube!');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !phonetic.trim()) return;

    onAddRule({
      word: word.trim(),
      phonetic: phonetic.trim(),
      language,
      enabled: true,
      notes: notes.trim() || undefined,
    });

    setWord('');
    setPhonetic('');
    setNotes('');
  };

  // Process test text against active rules
  const getProcessedPreview = () => {
    if (!testText.trim()) return '';
    let result = testText;
    const activeRules = rules.filter((r) => r.enabled);

    for (const rule of activeRules) {
      if (rule.word) {
        const escapedWord = rule.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
        result = result.replace(regex, `<mark class="bg-[#ff4e00]/30 text-white font-bold px-1 rounded">${rule.phonetic}</mark>`);
      }
    }

    return result;
  };

  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#ff4e00]" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
              Custom Pronunciation Dictionary
            </h2>
            <p className="text-xs text-white/70">
              Map technical jargon, brand names & colloquial terms to phonetic spellings
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full bg-[#ff4e00]/20 text-orange-400 border border-[#ff4e00]/30 text-xs font-mono font-bold">
            {activeCount} / {rules.length} Rules Active
          </span>
          {rules.length === 0 && (
            <button
              type="button"
              onClick={onLoadPresets}
              className="flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-orange-400" />
              Load Starter Presets
            </button>
          )}
        </div>
      </div>

      {/* Add New Word Form */}
      <form onSubmit={handleFormSubmit} className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center">
            <Plus className="w-3.5 h-3.5 text-[#ff4e00] mr-1" /> Add Phonetic Word Mapping
          </span>
          <span className="text-[11px] text-white/40 font-mono">
            e.g., &quot;API&quot; ➔ &quot;Aay-Pee-Eye&quot;
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-white/50 font-medium">Original Word / Acronym</label>
            <input
              type="text"
              required
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g., API, SQL, Bhasha"
              className="w-full mt-1 bg-black/40 text-white text-xs rounded-lg p-2.5 border border-white/10 focus:border-[#ff4e00]/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-white/50 font-medium">Phonetic Target Spelling</label>
            <input
              type="text"
              required
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="e.g., Aay-Pee-Eye, Sequel"
              className="w-full mt-1 bg-black/40 text-white text-xs rounded-lg p-2.5 border border-white/10 focus:border-[#ff4e00]/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-white/50 font-medium">Language Scope</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language | 'all')}
              className="w-full mt-1 bg-black/40 text-white text-xs rounded-lg p-2.5 border border-white/10 focus:outline-none"
            >
              <option value="all" className="bg-[#1a0c05] text-white">All Languages</option>
              <option value="en" className="bg-[#1a0c05] text-white">English Only</option>
              <option value="hi" className="bg-[#1a0c05] text-white">Hindi Only</option>
              <option value="hinglish" className="bg-[#1a0c05] text-white">Hinglish Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional context or note (e.g., Tech term)"
            className="flex-1 max-w-md bg-transparent text-white/70 text-xs rounded-lg p-1.5 border border-white/5 focus:outline-none"
          />

          <button
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-[#ff4e00] to-[#ec4899] rounded-xl font-bold text-white shadow-md text-xs hover:scale-105 active:scale-95 transition-transform flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Rule
          </button>
        </div>
      </form>

      {/* Rules Table / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            Active Dictionary Rules ({rules.length})
          </span>

          {rules.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onLoadPresets}
                className="text-xs text-orange-400 hover:underline flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Reset Presets
              </button>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:underline flex items-center"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Clear All
              </button>
            </div>
          )}
        </div>

        {rules.length === 0 ? (
          <div className="p-8 text-center bg-black/20 rounded-xl border border-dashed border-white/10 text-white/40">
            <BookOpen className="w-8 h-8 mx-auto text-white/30 mb-2" />
            <p className="text-xs font-semibold">No custom pronunciation rules added yet.</p>
            <p className="text-[11px] text-white/30 mt-1">
              Add your first technical word above or click &quot;Load Starter Presets&quot; to import common AI/tech rules!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  rule.enabled
                    ? 'bg-black/30 border-white/10 hover:border-white/20'
                    : 'bg-black/10 border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleRule(rule.id)}
                    className="mt-0.5 text-white/60 hover:text-white"
                  >
                    {rule.enabled ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white/30" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-mono">{rule.word}</span>
                      <span className="text-xs text-white/40">➔</span>
                      <span className="text-xs font-bold text-[#ff4e00] font-mono">{rule.phonetic}</span>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                        {rule.language}
                      </span>
                      {rule.notes && (
                        <span className="text-[10px] text-white/40 truncate italic">{rule.notes}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteRule(rule.id)}
                  className="p-1.5 text-white/40 hover:text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Phonetic Test Sandbox */}
      <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center">
            <Volume2 className="w-3.5 h-3.5 text-orange-400 mr-1.5" /> Pronunciation Sandbox Tester
          </label>
          <span className="text-[10px] text-white/40 font-mono">Live rule replacement preview</span>
        </div>

        <input
          type="text"
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Type a sentence containing your custom terms to test..."
          className="w-full bg-black/40 text-white text-xs rounded-lg p-2.5 border border-white/10 focus:border-[#ff4e00]/50 focus:outline-none font-serif"
        />

        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs leading-relaxed text-white/90">
          <span className="text-white/40 font-mono text-[10px] block mb-1">
            TTS Engine Script Input:
          </span>
          <div
            className="font-serif italic"
            dangerouslySetInnerHTML={{ __html: getProcessedPreview() || testText }}
          />
        </div>
      </div>
    </div>
  );
};
