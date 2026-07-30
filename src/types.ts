export type Language = 'en' | 'hi' | 'hinglish' | 'auto';

export type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' | 'Aarav';

export type Gender = 'female' | 'male';

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: Gender;
  accent: string;
  description: string;
  previewText: Record<Exclude<Language, 'auto'>, string>;
  isCustomClone?: boolean;
}

export interface VoiceTuningConfig {
  speed: number; // 0.5 to 2.0 (default 1.0)
  pitch: 'low' | 'medium' | 'high'; // default 'medium'
  stability: number; // 0.1 to 1.0 (default 0.75)
  expressiveness: number; // 0.1 to 1.0 (default 0.85)
  pauseDuration: number; // 0.2 to 2.0 (default 0.5s)
}

export interface CustomVoiceClone {
  id: string;
  name: string;
  gender: Gender;
  accent: string;
  description: string;
  baseVoice: VoiceName;
  acousticPrompt: string;
  sampleAudioBase64?: string;
  createdAt: number;
  userConsentConfirmed: boolean;
}

export type EmotionTone =
  | 'joyful'
  | 'sad'
  | 'neutral'
  | 'excited'
  | 'concerned'
  | 'dramatic'
  | 'calm'
  | 'fearful'
  | 'whisper'
  | 'angry'
  | 'conversational'
  | 'formal'
  | 'storytelling'
  | 'promotional';

export type GenerationMode = 'single' | 'dialogue';

export interface DialogueSpeaker {
  id: string;
  name: string;
  voiceName: VoiceName | string; // VoiceName or custom clone id
  customVoiceClone?: CustomVoiceClone;
}

export interface DialogueTurn {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
}

export interface PronunciationRule {
  id: string;
  word: string;
  phonetic: string;
  language: Language | 'all';
  enabled: boolean;
  notes?: string;
}

export interface AudioHistoryItem {
  id: string;
  title: string;
  text: string;
  language: Language;
  voiceName: string;
  tone: EmotionTone;
  audioBase64: string;
  createdAt: number;
  durationSeconds: number;
  isFavorite?: boolean;
  mode: GenerationMode;
  wordCount: number;
  tuningConfig?: VoiceTuningConfig;
  customVoiceClone?: CustomVoiceClone;
}

export interface TTSRequestPayload {
  text: string;
  language: Language;
  voiceName: string;
  tone: EmotionTone;
  mode: GenerationMode;
  isLongScript?: boolean;
  tuningConfig?: VoiceTuningConfig;
  customVoiceClone?: CustomVoiceClone;
  pronunciationRules?: PronunciationRule[];
  dialogueTurns?: { speaker: string; text: string }[];
  speakers?: { name: string; voiceName: string; customVoiceClone?: CustomVoiceClone }[];
}

export interface EnhanceRequestPayload {
  text: string;
  targetLanguage: Language;
  action: 'enhance' | 'translate_hinglish' | 'translate_hindi' | 'add_emotions' | 'auto_pauses';
}

