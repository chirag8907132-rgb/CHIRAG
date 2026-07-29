import React, { useRef, useState, useEffect } from 'react';
import { pcmBase64ToWavUrl } from '../utils/wavEncoder';
import { AudioHistoryItem } from '../types';
import {
  Play,
  Pause,
  Download,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Music,
  Check,
  FileAudio,
} from 'lucide-react';

interface AudioPlayerCardProps {
  item: AudioHistoryItem;
  onToggleFavorite?: (id: string) => void;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({ item, onToggleFavorite }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item.durationSeconds || 0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Generate WAV object URL from base64 PCM
  useEffect(() => {
    if (item.audioBase64) {
      try {
        const url = pcmBase64ToWavUrl(item.audioBase64);
        setAudioUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error encoding WAV audio:', err);
      }
    }
  }, [item.audioBase64]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  // Canvas waveform visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars = 52;
    let step = 0;

    const renderWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        let barHeight;
        if (isPlaying) {
          step += 0.05;
          barHeight = Math.abs(Math.sin(step + i * 0.2)) * (height * 0.7) + 8;
        } else {
          const seed = (item.text.charCodeAt(i % item.text.length) || 50) % 100;
          barHeight = (seed / 100) * (height * 0.6) + 6;
        }

        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        const isPast = i / bars <= currentTime / (duration || 1);

        ctx.fillStyle = isPast ? '#ff4e00' : 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2);
        ctx.fill();
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(renderWaveform);
      }
    };

    renderWaveform();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, currentTime, duration, item.text]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error(e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = (format: 'wav' | 'mp3') => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `BhashaVoice_${item.voiceName}_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <audio ref={audioRef} src={audioUrl} />

      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-[#ff4e00]/20 text-orange-400 border border-[#ff4e00]/30 text-xs font-bold flex items-center">
            <Sparkles className="w-3 h-3 mr-1" /> {item.voiceName}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white/80 text-xs uppercase font-mono border border-white/10">
            {item.language}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-xs capitalize">
            {item.tone}
          </span>
        </div>

        {/* Favorite & Download Formats */}
        <div className="flex items-center space-x-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              className={`p-2 rounded-xl transition-colors ${
                item.isFavorite
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => handleDownload('wav')}
              className="flex items-center px-3 py-1.5 bg-gradient-to-r from-[#ff4e00] to-[#ec4899] rounded-lg font-bold text-white uppercase text-[11px] hover:scale-105 transition-transform"
            >
              <Download className="w-3 h-3 mr-1" /> WAV
            </button>
            <button
              type="button"
              onClick={() => handleDownload('mp3')}
              className="flex items-center px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg uppercase text-[11px] border border-white/10 transition-colors"
            >
              <FileAudio className="w-3 h-3 mr-1 text-pink-400" /> MP3
            </button>
          </div>
        </div>
      </div>

      {/* Script Snippet */}
      <p className="text-sm text-white/90 line-clamp-2 bg-black/30 p-3.5 rounded-xl border border-white/5 italic mb-4 font-serif">
        &quot;{item.text}&quot;
      </p>

      {/* Waveform Canvas */}
      <div className="w-full bg-black/40 rounded-xl p-3 border border-white/10 mb-4">
        <canvas ref={canvasRef} width={600} height={40} className="w-full h-10 block" />
      </div>

      {/* Progress Slider */}
      <div className="space-y-1 mb-4">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-[#ff4e00] h-1.5 bg-white/10 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-xs font-mono text-white/40">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Audio Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {/* Speed Presets */}
          <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-1 rounded-lg ${
                  playbackRate === rate
                    ? 'bg-white text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Volume & Mute */}
        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl border border-white/10">
          <button type="button" onClick={toggleMute} className="text-white/60 hover:text-white">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-orange-400" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 accent-[#ff4e00] h-1 bg-white/20 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
