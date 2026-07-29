import React, { useState, useEffect } from 'react';
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
import { Sparkles, Mic, ShieldCheck, Zap, Heart, AlertCircle, BookOpen, UserPlus, Clock } from 'lucide-react';

const RULES_STORAGE_KEY = 'bhasha_pronunciation_rules_v1';

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
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rate Limit / Quota Cooldown State
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number>(0);
  const [initialRateLimitMax, setInitialRateLimitMax] = useState<number>(25);
  const [autoRetryPending, setAutoRetryPending] = useState<boolean>(false);

  // Countdown timer effect for rate limiting
  useEffect(() => {
    if (rateLimitSeconds <= 0) return;

    const timer = setInterval(() => {
      setRateLimitSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  // Handle auto-retry when rate limit cooldown completes (if explicitly enabled by user)
  useEffect(() => {
    if (rateLimitSeconds === 0 && autoRetryPending) {
      setAutoRetryPending(false);
      setErrorMessage(null);
      if (activeTab === 'single') {
        handleGenerateSingleAudio();
      } else if (activeTab === 'dialogue') {
        handleGenerateDialogueAudio();
      }
    }
  }, [rateLimitSeconds]);

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

    try {
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
        }),
      });

      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned error (${response.status}): ${text.substring(0, 120)}`);
      }

      if (!response.ok || !data.success || !data.audioBase64) {
        if (response.status === 429 || data?.isQuotaExceeded) {
          const retrySec = data?.retryAfter || 20;
          setRateLimitSeconds(retrySec);
          setInitialRateLimitMax(retrySec);
          setAutoRetryPending(false);
          setErrorMessage(
            data?.error || `Gemini audio rate limit reached. Please wait ~${retrySec} seconds before requesting audio.`
          );
          return;
        }
        throw new Error(data?.error || 'Failed to generate speech audio.');
      }

      setRateLimitSeconds(0);
      setAutoRetryPending(false);
      setErrorMessage(null);

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

      setHistory((prev) => [newItem, ...prev]);
      setCurrentAudioTrack(newItem);
    } catch (err: any) {
      console.error('Error generating audio:', err);
      const msg = err.message || '';
      if (msg.includes('429') || msg.includes('rate limit') || msg.includes('Quota exceeded')) {
        const retrySec = 20;
        setRateLimitSeconds(retrySec);
        setInitialRateLimitMax(retrySec);
        setAutoRetryPending(false);
        setErrorMessage(
          `Gemini audio rate limit reached. Please wait ~${retrySec}s before trying again.`
        );
      } else {
        setErrorMessage(msg || 'An unexpected error occurred while generating audio.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Dialogue Audio Generation
  const handleGenerateDialogueAudio = async () => {
    if (dialogueTurns.length === 0) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
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
        }),
      });

      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned error (${response.status}): ${text.substring(0, 120)}`);
      }

      if (!response.ok || !data.success || !data.audioBase64) {
        if (response.status === 429 || data?.isQuotaExceeded) {
          const retrySec = data?.retryAfter || 20;
          setRateLimitSeconds(retrySec);
          setInitialRateLimitMax(retrySec);
          setAutoRetryPending(false);
          setErrorMessage(
            data?.error || `Gemini audio rate limit reached. Please wait ~${retrySec} seconds before requesting audio.`
          );
          return;
        }
        throw new Error(data?.error || 'Failed to generate dialogue audio.');
      }

      setRateLimitSeconds(0);
      setAutoRetryPending(false);
      setErrorMessage(null);

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

      setHistory((prev) => [newItem, ...prev]);
      setCurrentAudioTrack(newItem);
    } catch (err: any) {
      console.error('Error generating dialogue audio:', err);
      const msg = err.message || '';
      if (msg.includes('429') || msg.includes('rate limit') || msg.includes('Quota exceeded')) {
        const retrySec = 20;
        setRateLimitSeconds(retrySec);
        setInitialRateLimitMax(retrySec);
        setAutoRetryPending(false);
        setErrorMessage(
          `Gemini audio rate limit reached. Please wait ~${retrySec}s before trying again.`
        );
      } else {
        setErrorMessage(msg || 'An unexpected error occurred while generating dialogue audio.');
      }
    } finally {
      setIsGenerating(false);
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
        const text = await response.text();
        throw new Error(`Server returned error (${response.status}): ${text.substring(0, 120)}`);
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
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          {/* Banner */}
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
                    Neural Human Synthesizer Active
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
                onClick={() => setActiveLanguage('auto')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeLanguage === 'auto'
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                ✨ Auto Detect
              </button>
              <button
                onClick={() => setActiveLanguage('hinglish')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeLanguage === 'hinglish'
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                🇮🇳 Hinglish
              </button>
              <button
                onClick={() => setActiveLanguage('hi')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeLanguage === 'hi'
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                🇮🇳 हिंदी
              </button>
              <button
                onClick={() => setActiveLanguage('en')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeLanguage === 'en'
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                🌐 English
              </button>
            </div>
          </div>

          {/* Rate Limit Cooldown Card */}
          {rateLimitSeconds > 0 ? (
            <div className="bg-amber-950/70 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-5 text-amber-100 text-sm space-y-3.5 shadow-2xl animate-fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-amber-200 text-base">Gemini Audio Free Tier Cooldown Active</p>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40">
                        3 Req / Min Limit
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/80 mt-1">
                      Gemini free tier allows 3 audio generation calls per minute. The quota resets automatically every 60 seconds.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
                    {rateLimitSeconds}s
                  </span>
                  <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">Remaining</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-amber-950/80 border border-amber-500/30 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-1000 ease-linear shadow-lg"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((initialRateLimitMax - rateLimitSeconds) / initialRateLimitMax) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer select-none text-amber-200 hover:text-white">
                  <input
                    type="checkbox"
                    checked={autoRetryPending}
                    onChange={(e) => setAutoRetryPending(e.target.checked)}
                    className="rounded border-amber-500/50 bg-amber-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span>⚡ Auto-generate audio automatically when countdown hits 0</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setRateLimitSeconds(0);
                    setErrorMessage(null);
                  }}
                  className="text-amber-400 hover:text-amber-200 font-bold underline text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : errorMessage ? (
            /* Standard Error Alert Box */
            <div className="bg-rose-950/60 backdrop-blur-xl border border-rose-500/50 rounded-2xl p-4 text-rose-200 text-sm flex items-start space-x-3 shadow-xl">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-300">Generation Notice</p>
                <p className="text-xs text-rose-200/80 mt-0.5">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-xs text-rose-400 hover:text-rose-200 font-bold underline"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {/* Active Generated Audio Track Player */}
          {currentAudioTrack && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/50 font-bold uppercase tracking-widest px-1">
                <span className="flex items-center text-[#ff4e00]">
                  <Zap className="w-3.5 h-3.5 mr-1" /> Active Audio Output
                </span>
                <span>High Quality • {currentAudioTrack.durationSeconds}s</span>
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
                rateLimitSeconds={rateLimitSeconds}
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
                rateLimitSeconds={rateLimitSeconds}
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
