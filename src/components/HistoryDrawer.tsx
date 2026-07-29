import React, { useState } from 'react';
import { AudioHistoryItem, Language } from '../types';
import { pcmBase64ToWavUrl } from '../utils/wavEncoder';
import { History, Search, Heart, Trash2, Download, Play, Mic, Sparkles, Filter, Music } from 'lucide-react';

interface HistoryDrawerProps {
  history: AudioHistoryItem[];
  onSelectTrack: (track: AudioHistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  activeTrackId?: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectTrack,
  onToggleFavorite,
  onDeleteItem,
  onClearAll,
  activeTrackId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.voiceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLang === 'all' || item.language === selectedLang;
    const matchesFav = !onlyFavorites || item.isFavorite;
    return matchesSearch && matchesLang && matchesFav;
  });

  const handleDownload = (item: AudioHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = pcmBase64ToWavUrl(item.audioBase64);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhashaVoice_${item.voiceName}_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-[#ff4e00]" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            Generated Audio Library
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
            {history.length} tracks
          </span>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-colors flex items-center"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Library
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search script or voice name..."
            className="w-full pl-9 pr-3 py-2 bg-black/30 text-white text-xs rounded-xl border border-white/10 focus:border-[#ff4e00]/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-black/30 text-white/80 text-xs rounded-xl p-2 border border-white/10 focus:outline-none"
          >
            <option value="all" className="bg-[#1a0c05] text-white">All Languages</option>
            <option value="hinglish" className="bg-[#1a0c05] text-white">Hinglish</option>
            <option value="hi" className="bg-[#1a0c05] text-white">Hindi</option>
            <option value="en" className="bg-[#1a0c05] text-white">English</option>
          </select>

          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`p-2 rounded-xl border text-xs flex items-center transition-all ${
              onlyFavorites
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-black/30 text-white/40 border-white/10 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Track List */}
      {filteredHistory.length === 0 ? (
        <div className="p-8 text-center bg-black/20 rounded-xl border border-dashed border-white/10 text-white/40">
          <Music className="w-8 h-8 mx-auto text-white/30 mb-2" />
          <p className="text-xs font-semibold">No audio tracks found.</p>
          <p className="text-[11px] text-white/30 mt-1">
            Generate audio from the single voice or dialogue generator to fill your library!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredHistory.map((item) => {
            const isActive = activeTrackId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectTrack(item)}
                className={`group p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff4e00]/20 to-transparent border-[#ff4e00]/40 shadow-lg shadow-orange-500/10'
                    : 'bg-black/20 border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#ff4e00] to-[#ec4899] text-white shadow-md flex items-center justify-center shrink-0 mt-0.5">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white truncate">
                        {item.voiceName} Voice
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                        {item.language}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {item.durationSeconds}s
                      </span>
                    </div>

                    <p className="text-xs text-white/80 line-clamp-1 mt-1 font-serif">
                      &quot;{item.text}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.isFavorite
                        ? 'text-rose-400 bg-rose-500/10'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownload(item, e)}
                    className="p-1.5 text-white/40 hover:text-[#ff4e00] hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
