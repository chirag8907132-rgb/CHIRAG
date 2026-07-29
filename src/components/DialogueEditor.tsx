import React from 'react';
import { DialogueSpeaker, DialogueTurn, VoiceName, Language } from '../types';
import { VOICES } from '../data/voicesAndPresets';
import { Users, Plus, Trash2, Volume2, RefreshCw, Sparkles, MessageSquare, Clock } from 'lucide-react';

interface DialogueEditorProps {
  speakers: DialogueSpeaker[];
  onChangeSpeakers: (speakers: DialogueSpeaker[]) => void;
  turns: DialogueTurn[];
  onChangeTurns: (turns: DialogueTurn[]) => void;
  onGenerateDialogue: () => void;
  isGenerating: boolean;
  activeLanguage: Language;
  rateLimitSeconds?: number;
}

export const DialogueEditor: React.FC<DialogueEditorProps> = ({
  speakers,
  onChangeSpeakers,
  turns,
  onChangeTurns,
  onGenerateDialogue,
  isGenerating,
  activeLanguage,
  rateLimitSeconds,
}) => {
  const handleUpdateSpeaker = (id: string, field: 'name' | 'voiceName', value: string) => {
    onChangeSpeakers(
      speakers.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleAddTurn = (speakerId: string) => {
    const speaker = speakers.find((s) => s.id === speakerId) || speakers[0];
    const newTurn: DialogueTurn = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      speakerId: speaker.id,
      speakerName: speaker.name,
      text: '',
    };
    onChangeTurns([...turns, newTurn]);
  };

  const handleUpdateTurnText = (id: string, text: string) => {
    onChangeTurns(
      turns.map((t) => (t.id === id ? { ...t, text } : t))
    );
  };

  const handleUpdateTurnSpeaker = (turnId: string, speakerId: string) => {
    const speaker = speakers.find((s) => s.id === speakerId);
    if (!speaker) return;
    onChangeTurns(
      turns.map((t) =>
        t.id === turnId
          ? { ...t, speakerId: speaker.id, speakerName: speaker.name }
          : t
      )
    );
  };

  const handleDeleteTurn = (turnId: string) => {
    onChangeTurns(turns.filter((t) => t.id !== turnId));
  };

  const handleLoadSampleDialogue = () => {
    const s1 = speakers[0] || { id: 's1', name: 'Rahul', voiceName: 'Puck' as VoiceName };
    const s2 = speakers[1] || { id: 's2', name: 'Ananya', voiceName: 'Kore' as VoiceName };

    onChangeSpeakers([
      { id: s1.id, name: 'Rahul', voiceName: 'Puck' },
      { id: s2.id, name: 'Ananya', voiceName: 'Kore' },
    ]);

    if (activeLanguage === 'hinglish') {
      onChangeTurns([
        { id: '1', speakerId: s1.id, speakerName: 'Rahul', text: 'Hey Ananya! Sun, tuning in to this new AI voice generator?' },
        { id: '2', speakerId: s2.id, speakerName: 'Ananya', text: 'Haan Rahul! Ye bilkul human speaker jaisa lagta hai, clear accent ke saath.' },
        { id: '3', speakerId: s1.id, speakerName: 'Rahul', text: 'Sahi me yaar! Reel scripts aur podcasts ke liye to zabardast feature hai.' },
      ]);
    } else if (activeLanguage === 'hi') {
      onChangeTurns([
        { id: '1', speakerId: s1.id, speakerName: 'Rahul', text: 'नमस्ते अनन्या! क्या तुमने नया AI ऑडियो जनरेटर आज़माया?' },
        { id: '2', speakerId: s2.id, speakerName: 'Ananya', text: 'हाँ राहुल! इसमें हिंदी की आवाज़ एकदम स्वाभाविक और साफ़ सुनाई देती है।' },
        { id: '3', speakerId: s1.id, speakerName: 'Rahul', text: 'बिलकुल, अब कहानियों और संवादों को रिकॉर्ड करना बेहद आसान हो गया है।' },
      ]);
    } else {
      onChangeTurns([
        { id: '1', speakerId: s1.id, speakerName: 'Rahul', text: 'Hey Ananya! Have you checked out the new multi-speaker audio synthesis?' },
        { id: '2', speakerId: s2.id, speakerName: 'Ananya', text: 'Yes Rahul! The voice quality sounds amazingly lifelike and natural.' },
        { id: '3', speakerId: s1.id, speakerName: 'Rahul', text: 'Agreed! Perfect for co-hosted podcasts and YouTube script narration.' },
      ]);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-[#ff4e00]" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            Multi-Speaker Dialogue Creator
          </h2>
        </div>
        <button
          type="button"
          onClick={handleLoadSampleDialogue}
          className="flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Load Sample Conversation
        </button>
      </div>

      {/* Speaker Configuration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {speakers.map((speaker, index) => (
          <div
            key={speaker.id}
            className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#ff4e00] uppercase tracking-wider">
                Speaker {index + 1}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-white/50 font-medium">Speaker Name</label>
                <input
                  type="text"
                  value={speaker.name}
                  onChange={(e) => handleUpdateSpeaker(speaker.id, 'name', e.target.value)}
                  className="w-full mt-1 bg-black/30 text-white text-xs rounded-lg p-2.5 border border-white/10 focus:border-[#ff4e00]/50 focus:outline-none"
                  placeholder={`e.g., ${index === 0 ? 'Rahul' : 'Ananya'}`}
                />
              </div>

              <div>
                <label className="text-[11px] text-white/50 font-medium">Assigned AI Voice</label>
                <select
                  value={speaker.voiceName}
                  onChange={(e) => handleUpdateSpeaker(speaker.id, 'voiceName', e.target.value)}
                  className="w-full mt-1 bg-black/30 text-white text-xs rounded-lg p-2.5 border border-white/10 focus:border-[#ff4e00]/50 focus:outline-none"
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#1a0c05] text-white">
                      {v.name} ({v.gender} • {v.accent})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialogue Script Turns */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            Dialogue Script
          </label>
          <div className="flex items-center space-x-2">
            {speakers.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleAddTurn(s.id)}
                className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Plus className="w-3 h-3 mr-1" /> Add {s.name} Line
              </button>
            ))}
          </div>
        </div>

        {turns.length === 0 ? (
          <div className="p-8 text-center bg-black/20 rounded-xl border border-dashed border-white/10 text-white/40">
            <MessageSquare className="w-8 h-8 mx-auto text-white/30 mb-2" />
            <p className="text-xs font-semibold">No dialogue lines added yet.</p>
            <p className="text-[11px] text-white/30 mt-1">
              Click &quot;Load Sample Conversation&quot; above or add lines manually for Speaker 1 and Speaker 2.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {turns.map((turn) => (
              <div
                key={turn.id}
                className="flex items-start space-x-3 p-3.5 rounded-xl bg-black/20 border border-white/10 hover:border-white/20 transition-all"
              >
                <select
                  value={turn.speakerId}
                  onChange={(e) => handleUpdateTurnSpeaker(turn.id, e.target.value)}
                  className="bg-white/10 text-orange-400 font-bold text-xs rounded-lg p-2 border border-white/10 focus:outline-none shrink-0"
                >
                  {speakers.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#1a0c05] text-white">
                      {s.name}
                    </option>
                  ))}
                </select>

                <textarea
                  rows={2}
                  value={turn.text}
                  onChange={(e) => handleUpdateTurnText(turn.id, e.target.value)}
                  placeholder={`Write dialogue line for ${turn.speakerName}...`}
                  className="flex-1 bg-transparent text-white text-xs sm:text-sm rounded-lg p-1 focus:outline-none resize-none leading-relaxed font-serif"
                />

                <button
                  type="button"
                  onClick={() => handleDeleteTurn(turn.id)}
                  className="p-1.5 text-white/40 hover:text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="pt-4 border-t border-white/10 flex justify-end">
        <button
          type="button"
          disabled={turns.length === 0 || turns.some((t) => !t.text.trim()) || isGenerating || (rateLimitSeconds !== undefined && rateLimitSeconds > 0)}
          onClick={onGenerateDialogue}
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
