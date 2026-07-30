import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { ToneSelector } from './components/ToneSelector';
import { VoiceTuningControls } from './components/VoiceTuningControls';
import { VoiceCloningStudio } from './components/VoiceCloningStudio';
import { TextInputArea } from './components/TextInputArea';
import { DialogueEditor } from './components/DialogueEditor';
import { AudioPlayerCard } from './components/AudioPlayerCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PronunciationDictionary } from './components/PronunciationDictionary';
import { OpenRouterModal } from './components/OpenRouterModal';
import {
  Language,
  VoiceName,
  EmotionTone,
  AudioHistoryItem,
  DialogueSpeaker,
  DialogueTurn,
  PronunciationRule,
  VoiceTuningConfig,
  CustomVoiceClone,
} from './types';
import { estimatePcmDuration } from './utils/wavEncoder';
import {
  getStoredHistory,
  saveStoredHistory,
  getStoredClones,
  saveStoredClones,
} from './utils/db';
import { Sparkles, Mic, ShieldCheck, Zap, Heart, AlertCircle, BookOpen, UserPlus, Key } from 'lucide-react';

const RULES_STORAGE_KEY = 'bhasha_pronunciation_rules_v1';
const OPENROUTER_KEY1_STORAGE = 'openrouter_key1_v1';
const OPENROUTER_KEY2_STORAGE = 'openrouter_key2_v1';

const DEFAULT_PRONUNCIATION_RULES: PronunciationRule[] = [
  { id: 'p1', word: 'API', phonetic: 'Aay Pee Eye', language: 'all', enabled: true, notes: 'Technical abbreviation' },
  { id: 'p2', word: 'SQL', phonetic: 'Sequel', language: 'all', enabled: true, notes: 'Database term' },
  { id: 'p3', word: 'ChatGPT', phonetic: 'Chat Jee Pee Tee', language: 'all', enabled: true, notes: 'AI Assistant name' },
  { id: 'p4', word: 'YouTube', phonetic: 'You-Tube', language: 'all', enabled: true, notes: 'Platform name' },
  { id: 'p5', word: 'AI', phonetic: 'Aay Eye', language: 'all', enabled: true, notes: 'Artificial Intelligence' },
  { id: 'p6', word: 'Bhasha', phonetic: 'Bhaa-shaa', language: 'hinglish', enabled: true, notes: 'Hindi word for language' },
];

export default function App() {
  const [activeLanguage, setActiveLanguage] = useState<Language>('auto');
  const [activeTab, setActiveTab] = useState<'single' | 'dialogue' | 'cloning' | 'history' | 'dictionary'>('single');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedCustomClone, setSelectedCustomClone] = useState<CustomVoiceClone | undefined>(undefined);
  const [selectedTone, setSelectedTone] = useState<EmotionTone>('conversational');

  // OpenRouter API Keys State
  const [openRouterKey1, setOpenRouterKey1] = useState<string>(
    () => localStorage.getItem(OPENROUTER_KEY1_STORAGE) || ''
  );
  const [openRouterKey2, setOpenRouterKey2] = useState<string>(
    () => localStorage.getItem(OPENROUTER_KEY2_STORAGE) || ''
  );
  const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState<boolean>(false);

  const handleSaveOpenRouterKeys = (k1: string, k2: string) => {
    setOpenRouterKey1(k1);
    setOpenRouterKey2(k2);
    localStorage.setItem(OPENROUTER_KEY1_STORAGE, k1);
    localStorage.setItem(OPENROUTER_KEY2_STORAGE, k2);
  };

  // Voice Tuning Configuration State
  const [tuningConfig, setTuningConfig] = useState<VoiceTuningConfig>({
    speed: 1.0,
    pitch: 'medium',
    stability: 0.75,
    expressiveness: 0.85,
    pauseDuration: 0.5,
  });

  // Custom Voice Clones State
  const [customClones, setCustomClones] = useState<CustomVoiceClone[]>([]);

  useEffect(() => {
    getStoredClones().then((clones) => {
      if (clones && clones.length > 0) {
        setCustomClones(clones);
      }
    });
  }, []);

  useEffect(() => {
    saveStoredClones(customClones);
  }, [customClones]);

  // Pronunciation Dictionary Rules
  const [pronunciationRules, setPronunciationRules] = useState<PronunciationRule[]>(() => {
    try {
      const saved = localStorage.getItem(RULES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PRONUNCIATION_RULES;
    } catch {
      return DEFAULT_PRONUNCIATION_RULES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(pronunciationRules));
    } catch (e) {
      console.error('Failed to save pronunciation rules to localStorage', e);
    }
  }, [pronunciationRules]);

  // Single Speaker Text
  const [text, setText] = useState<string>(
    'Namaste dosto! Welcome to BhashaVoice Studio. Expressive human-like AI speech synthesis with auto language detection, emotion control, and custom voice cloning.'
  );

  // Multi-Speaker Dialogue
  const [speakers, setSpeakers] = useState<DialogueSpeaker[]>([
    { id: 's1', name: 'Rahul', voiceName: 'Puck' },
    { id: 's2', name: 'Ananya', voiceName: 'Kore' },
  ]);

  const [dialogueTurns, setDialogueTurns] = useState<DialogueTurn[]>([
    { id: 't1', speakerId: 's1', speakerName: 'Rahul', text: 'Hey Ananya! Ye new AI voice generator kaisa lag raha hai tumhein?' },
    { id: 't2', speakerId: 's2', speakerName: 'Ananya', text: 'Rahul ye toh kamaal hai! Voice cloning, emotion tuning aur pause control ke saath bilkul human sound kar raha hai.' },
  ]);

  // Generation & Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgressSimulation = () => {
    setGenerationProgress(5);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 92) return 92;
        const step = prev < 30 ? 6 : prev < 70 ? 4 : 2;
        return prev + step;
      });
    }, 300);
  };

  const finishProgressSimulation = (onComplete?: () => void) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setGenerationProgress(100);
    setTimeout(() => {
      setIsGenerating(false);
      if (onComplete) onComplete();
      setTimeout(() => setGenerationProgress(0), 1000);
    }, 400);
  };

  const cancelProgressSimulation = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setIsGenerating(false);
    setGenerationProgress(0);
  };

  // History & Active Track
  const [history, setHistory] = useState<AudioHistoryItem[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<AudioHistoryItem | null>(null);

  useEffect(() => {
    getStoredHistory().then((items) => {
      if (items && items.length > 0) {
        setHistory(items);
        setCurrentAudioTrack((prev) => prev || items[0]);
      }
    });
  }, []);

  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  // Voice Selection Handler
  const handleSelectVoice = (voiceId: string, customClone?: CustomVoiceClone) => {
    setSelectedVoice(voiceId);
    setSelectedCustomClone(customClone);
  };

  // Custom Voice Clone Save Handler
  const handleSaveClone = (newClone: CustomVoiceClone) => {
    setCustomClones((prev) => [newClone, ...prev]);
    setSelectedVoice(newClone.id);
    setSelectedCustomClone(newClone);
    setActiveTab('single');
  };

  const handleDeleteClone = (cloneId: string) => {
    setCustomClones((prev) => prev.filter((c) => c.id !== cloneId));
    if (selectedVoice === cloneId) {
      setSelectedVoice('Kore');
      setSelectedCustomClone(undefined);
    }
  };

  // Pronunciation Dictionary Handlers
  const handleAddRule = (newRule: Omit<PronunciationRule, 'id'>) => {
    const ruleItem: PronunciationRule = {
      ...newRule,
      id: 'rule_' + Date.now(),
    };
    setPronunciationRules((prev) => [ruleItem, ...prev]);
  };

  const handleToggleRule = (id: string) => {
    setPronunciationRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    );
  };

  const handleDeleteRule = (id: string) => {
    setPronunciationRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  const handleLoadPresets = () => {
    setPronunciationRules(DEFAULT_PRONUNCIATION_RULES);
  };

  const handleClearAllRules = () => {
    setPronunciationRules([]);
  };

  // Single Voice Audio Generation
  const handleGenerateSingleAudio = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);
    startProgressSimulation();

    try {
      const openRouterKeys = [openRouterKey1, openRouterKey2].filter(Boolean);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: activeLanguage,
          voiceName: selectedCustomClone ? selectedCustomClone.baseVoice : selectedVoice,
          tone: selectedTone,
          mode: 'single',
          tuningConfig,
          customVoiceClone: selectedCustomClone,
          pronunciationRules: pronunciationRules.filter((r) => r.enabled),
          openRouterKeys,
        }),
      });

      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textErr = await response.text();
        throw new Error(`Server error (${response.status}): ${textErr.substring(0, 120)}`);
      }

      if (!response.ok || !data.success || !data.audioBase64) {
        throw new Error(
          data?.error || 'Rate limit reached or generation failed. Add an OpenRouter API key to bypass limits.'
        );
      }

      const wordCount = text.trim().split(/\s+/).length;
      const durationSeconds = estimatePcmDuration(data.audioBase64);
      const displayVoiceName = selectedCustomClone ? selectedCustomClone.name : selectedVoice;

      const newItem: AudioHistoryItem = {
        id: Date.now().toString(),
        title: `${displayVoiceName} (${activeLanguage.toUpperCase()})`,
        text: text.trim(),
        language: activeLanguage,
        voiceName: displayVoiceName as VoiceName,
        tone: selectedTone,
        audioBase64: data.audioBase64,
        createdAt: Date.now(),
        durationSeconds,
        mode: 'single',
        wordCount,
        tuningConfig,
        customVoiceClone: selectedCustomClone,
      };

      finishProgressSimulation(() => {
        setHistory((prev) => [newItem, ...prev]);
        setCurrentAudioTrack(newItem);
        setErrorMessage(null);
      });
    } catch (err: any) {
      console.error('Error generating audio:', err);
      cancelProgressSimulation();
      setErrorMessage(
        err.message || 'Error generating audio. Consider adding OpenRouter API keys in settings.'
      );
    }
  };

  // Dialogue Audio Generation
  const handleGenerateDialogueAudio = async () => {
    if (dialogueTurns.length === 0) return;
    setIsGenerating(true);
    setErrorMessage(null);
    startProgressSimulation();

    try {
      const openRouterKeys = [openRouterKey1, openRouterKey2].filter(Boolean);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: activeLanguage,
          tone: selectedTone,
          mode: 'dialogue',
          tuningConfig,
          dialogueTurns,
          speakers: speakers.map((s) => ({
            name: s.name,
            voiceName: s.customVoiceClone ? s.customVoiceClone.baseVoice : s.voiceName,
            customVoiceClone: s.customVoiceClone,
          })),
          pronunciationRules: pronunciationRules.filter((r) => r.enabled),
          openRouterKeys,
        }),
      });

      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textErr = await response.text();
        throw new Error(`Server error (${response.status}): ${textErr.substring(0, 120)}`);
      }

      if (!response.ok || !data.success || !data.audioBase64) {
        throw new Error(data?.error || 'Failed to generate dialogue audio.');
      }

      const combinedText = dialogueTurns.map((t) => `${t.speakerName}: ${t.text}`).join(' ');
      const wordCount = combinedText.split(/\s+/).length;
      const durationSeconds = estimatePcmDuration(data.audioBase64);

      const newItem: AudioHistoryItem = {
        id: Date.now().toString(),
        title: `Dialogue: ${speakers[0]?.name || 'S1'} & ${speakers[1]?.name || 'S2'}`,
        text: combinedText,
        language: activeLanguage,
        voiceName: `${speakers[0]?.voiceName || 'Kore'}` as VoiceName,
        tone: selectedTone,
        audioBase64: data.audioBase64,
        createdAt: Date.now(),
        durationSeconds,
        mode: 'dialogue',
        wordCount,
        tuningConfig,
      };

      finishProgressSimulation(() => {
        setHistory((prev) => [newItem, ...prev]);
        setCurrentAudioTrack(newItem);
        setErrorMessage(null);
      });
    } catch (err: any) {
      console.error('Error generating dialogue audio:', err);
      cancelProgressSimulation();
      setErrorMessage(err.message || 'An unexpected error occurred while generating dialogue.');
    }
  };

  // AI Script Enhancement
  const handleEnhanceScript = async (
    action: 'enhance' | 'translate_hinglish' | 'translate_hindi' | 'add_emotions' | 'auto_pauses'
  ) => {
    if (!text.trim()) return;
    setIsEnhancing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: activeLanguage,
          action,
        }),
      });

      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textErr = await response.text();
        throw new Error(`Server error (${response.status}): ${textErr.substring(0, 120)}`);
      }

      if (!response.ok || !data.success || !data.enhancedText) {
        throw new Error(data.error || 'Failed to enhance script');
      }

      setText(data.enhancedText);
      if (action === 'translate_hinglish') setActiveLanguage('hinglish');
      if (action === 'translate_hindi') setActiveLanguage('hi');
    } catch (err: any) {
      console.error('Error enhancing script:', err);
      setErrorMessage(err.message || 'Could not refine text script.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
    if (currentAudioTrack && currentAudioTrack.id === id) {
      setCurrentAudioTrack((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentAudioTrack?.id === id) {
      setCurrentAudioTrack(null);
    }
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    setCurrentAudioTrack(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-slate-100 font-sans selection:bg-[#ff4e00] selection:text-white pb-16 relative overflow-x-hidden">
      {/* Background glow elements */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 70% 20%, #3a1510 0%, transparent 60%), radial-gradient(circle at 10% 80%, #ff4e00 0%, transparent 50%)',
          filter: 'blur(90px)',
          opacity: 0.35,
        }}
      />

      <div className="relative z-10">
        {/* Top Header */}
        <Header
          activeLanguage={activeLanguage}
          onSelectLanguage={setActiveLanguage}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          historyCount={history.length}
          rulesCount={pronunciationRules.filter((r) => r.enabled).length}
          clonesCount={customClones.length}
          onOpenOpenRouterModal={() => setIsOpenRouterModalOpen(true)}
          hasOpenRouterKey={Boolean(openRouterKey1 || openRouterKey2)}
        />

        {/* OpenRouter Multi-Key Settings Modal */}
        <OpenRouterModal
          isOpen={isOpenRouterModalOpen}
          onClose={() => setIsOpenRouterModalOpen(false)}
          openRouterKey1={openRouterKey1}
          openRouterKey2={openRouterKey2}
          onSaveKeys={handleSaveOpenRouterKeys}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          {/* Prominent OpenRouter API Key Input Banner */}
          {(!openRouterKey1 && !openRouterKey2) ? (
            <div className="bg-gradient-to-r from-orange-950/80 via-[#180d07] to-pink-950/80 backdrop-blur-xl border border-orange-500/40 rounded-2xl p-5 text-white shadow-2xl space-y-4 animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0 text-orange-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>Enter OpenRouter API Keys (Recommended)</span>
                      <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-mono">
                        Dual Key Failover
                      </span>
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Enter 2 OpenRouter keys so if Key #1 hits usage limits, Key #2 automatically takes over without stopping generation.
                    </p>
                  </div>
                </div>

                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-orange-300 transition-colors shrink-0"
                >
                  Get Keys on OpenRouter.ai →
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-orange-200/90 flex items-center justify-between">
                    <span>Primary OpenRouter API Key (#1)</span>
                    <span className="text-[10px] text-orange-400/80 font-mono">sk-or-v1-...</span>
                  </label>
                  <input
                    type="password"
                    value={openRouterKey1}
                    onChange={(e) => handleSaveOpenRouterKeys(e.target.value, openRouterKey2)}
                    placeholder="Paste OpenRouter Key #1 here..."
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-pink-200/90 flex items-center justify-between">
                    <span>Backup OpenRouter API Key (#2)</span>
                    <span className="text-[10px] text-pink-400/80 font-mono">sk-or-v1-...</span>
                  </label>
                  <input
                    type="password"
                    value={openRouterKey2}
                    onChange={(e) => handleSaveOpenRouterKeys(openRouterKey1, e.target.value)}
                    placeholder="Paste OpenRouter Key #2 here..."
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-emerald-200 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold">OpenRouter Keys Active:</span>
                <span className="font-mono text-emerald-300/80">
                  {openRouterKey1 ? 'Key #1 Set' : ''} {openRouterKey1 && openRouterKey2 ? '•' : ''} {openRouterKey2 ? 'Key #2 (Backup) Set' : ''}
                </span>
              </div>
              <button
                onClick={() => setIsOpenRouterModalOpen(true)}
                className="text-xs font-bold text-orange-400 hover:underline flex items-center space-x-1"
              >
                <span>Edit Keys</span>
              </button>
            </div>
          )}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ff4e00]/20 text-orange-400 border border-[#ff4e00]/30 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-orange-400" />
                  Pro Voice Studio
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[11px] font-semibold tracking-wider text-emerald-400">
                    Neural Synthesizer Active
                  </span>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">
                Natural Human-Like AI Speech & Voice Cloning Studio
              </h2>
              <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
                Realistic emotions, speed, pitch, stability, and pause control across Hindi, English & Hinglish.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsOpenRouterModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all border bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30 flex items-center space-x-1.5 shadow-lg shadow-orange-500/10"
              >
                <Key className="w-3.5 h-3.5" />
                <span>API Keys (Failover Active)</span>
              </button>
            </div>
          </div>

          {/* Active Generated Audio Track Player (Only Current Generated Audio shown on Homepage) */}
          {(activeTab === 'single' || activeTab === 'dialogue') && currentAudioTrack && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-white/50 font-bold uppercase tracking-widest px-1">
                <span className="flex items-center text-[#ff4e00]">
                  <Zap className="w-3.5 h-3.5 mr-1" /> Active Generated Audio Track
                </span>
                <span>High Quality PCM • {currentAudioTrack.durationSeconds}s</span>
              </div>
              <AudioPlayerCard item={currentAudioTrack} onToggleFavorite={handleToggleFavorite} />
            </div>
          )}

          {/* Main Content Tabs */}
          {activeTab === 'single' && (
            <div className="space-y-6">
              {/* Voice Selector Grid (Built-in + Custom Clones) */}
              <VoiceSelector
                selectedVoice={selectedVoice}
                onSelectVoice={handleSelectVoice}
                activeLanguage={activeLanguage}
                customClones={customClones}
                onOpenCloningStudio={() => setActiveTab('cloning')}
              />

              {/* Vocal Emotion & Tone Selector */}
              <ToneSelector selectedTone={selectedTone} onSelectTone={setSelectedTone} />

              {/* Voice Speed, Pitch, Stability, Expressiveness & Pause Tuning */}
              <VoiceTuningControls config={tuningConfig} onChangeConfig={setTuningConfig} />

              {/* Active Pronunciation Rules Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-[#ff4e00]" />
                  <span className="font-semibold text-white/90">Custom Pronunciation Dictionary:</span>
                  <span className="text-white/60">
                    {pronunciationRules.filter((r) => r.enabled).length} Active Phonetic Rule(s)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('dictionary')}
                  className="text-orange-400 font-bold hover:underline flex items-center"
                >
                  Manage Dictionary ➔
                </button>
              </div>

              {/* Main Script Input Area */}
              <TextInputArea
                text={text}
                onChangeText={setText}
                activeLanguage={activeLanguage}
                onSelectLanguage={setActiveLanguage}
                onGenerateAudio={handleGenerateSingleAudio}
                isGenerating={isGenerating}
                onEnhanceScript={handleEnhanceScript}
                isEnhancing={isEnhancing}
                generationProgress={generationProgress}
                errorMessage={errorMessage}
                onOpenOpenRouterModal={() => setIsOpenRouterModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'dialogue' && (
            <div className="space-y-6">
              <VoiceTuningControls config={tuningConfig} onChangeConfig={setTuningConfig} />
              <DialogueEditor
                speakers={speakers}
                onChangeSpeakers={setSpeakers}
                turns={dialogueTurns}
                onChangeTurns={setDialogueTurns}
                onGenerateDialogue={handleGenerateDialogueAudio}
                isGenerating={isGenerating}
                activeLanguage={activeLanguage}
                generationProgress={generationProgress}
                errorMessage={errorMessage}
                onOpenOpenRouterModal={() => setIsOpenRouterModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'cloning' && (
            <div className="space-y-6">
              <VoiceCloningStudio
                customClones={customClones}
                onSaveClone={handleSaveClone}
                onDeleteClone={handleDeleteClone}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <HistoryDrawer
                history={history}
                onSelectTrack={(track) => setCurrentAudioTrack(track)}
                onToggleFavorite={handleToggleFavorite}
                onDeleteItem={handleDeleteHistoryItem}
                onClearAll={handleClearAllHistory}
                activeTrackId={currentAudioTrack?.id}
              />
            </div>
          )}

          {activeTab === 'dictionary' && (
            <div className="space-y-6">
              <PronunciationDictionary
                rules={pronunciationRules}
                onAddRule={handleAddRule}
                onToggleRule={handleToggleRule}
                onDeleteRule={handleDeleteRule}
                onLoadPresets={handleLoadPresets}
                onClearAll={handleClearAllRules}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
