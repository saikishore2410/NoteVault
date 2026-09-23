import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Volume2, 
  Loader2, 
  X, 
  Radio, 
  Headphones, 
  Repeat,
  Sliders
} from 'lucide-react';

interface FocusMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackPlayingChange?: (isPlaying: boolean, trackName: string) => void;
}

export const FocusMusicModal: React.FC<FocusMusicModalProps> = ({
  isOpen,
  onClose,
  onTrackPlayingChange,
}) => {
  const [prompt, setPrompt] = useState('Chill Lo-Fi study beats with warm Rhodes electric piano chords, gentle vinyl crackle, and soft hip hop drums');
  const [isFullTrack, setIsFullTrack] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [lyrics, setLyrics] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const presets = [
    {
      title: 'Lo-Fi Problem Solving',
      desc: 'Rhodes electric piano, tape hiss, and mellow beats',
      prompt: 'Warm lo-fi hip hop study beat with mellow electric piano, soft muted percussion, and gentle vinyl crackle, 80 BPM',
    },
    {
      title: 'Alpha Wave Binaural Focus',
      desc: 'Ambient pads tuned for deep concentration',
      prompt: 'Deep ambient drone with gentle sine waves, soft sub-bass, atmospheric textures, calm concentration music',
    },
    {
      title: 'Baroque Cello for Note Reading',
      desc: 'Classical counterpoint for memory retention',
      prompt: 'Classical solo cello baroque sonata in D minor, expressive counterpoint, calm academic study ambience',
    },
    {
      title: 'Ambient Modular Synthesis',
      desc: 'Minimalist electronic soundscapes for programming flow',
      prompt: 'Minimalist ambient synthesizer soundscape, tape delay, generative arpeggios, relaxing coding flow music',
    },
  ];

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          isFullTrack,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate study music');
      }

      const data = await res.json();
      if (!data.audioBase64) {
        throw new Error('No audio track received from Lyria model');
      }

      // Decode base64 to Blob URL
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setLyrics(data.lyrics || '');

      // Auto play
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 200);
    } catch (err: any) {
      console.error('Music generation error:', err);
      setError(err.message || 'Error occurred while generating music with Lyria');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onTrackPlayingChange?.(false, prompt.slice(0, 30));
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      onTrackPlayingChange?.(true, prompt.slice(0, 30));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Study Ambience &amp; Focus Music</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                  {isFullTrack ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview'}
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Generate personalized focus soundscapes and study tracks while reading notes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Model / Track Duration Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setIsFullTrack(false)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                !isFullTrack
                  ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Short Focus Clip (lyria-3-clip-preview)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullTrack(true)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isFullTrack
                  ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Full-Length Track (lyria-3-pro-preview)</span>
            </button>
          </div>

          {/* Audio Player Card (If Track Exists) */}
          {audioUrl && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-stone-900 border border-amber-500/30 text-stone-900 dark:text-stone-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      Generated Study Soundtrack
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isLooping ? 'Continuous loop playback enabled' : 'Single playback'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors ${
                      isLooping
                        ? 'border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'border-stone-300 dark:border-stone-700 text-stone-500'
                    }`}
                    title="Toggle continuous loop"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                  <a
                    href={audioUrl}
                    download="notevault-study-music.wav"
                    className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                    title="Download audio WAV"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                loop={isLooping}
                onEnded={() => setIsPlaying(false)}
                controls
                className="w-full h-8"
              />

              {lyrics && (
                <div className="text-xs text-stone-600 dark:text-stone-400 bg-black/10 dark:bg-black/30 p-2.5 rounded-xl">
                  <span className="font-bold">Metadata:</span> {lyrics}
                </div>
              )}
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Music Style &amp; Atmosphere Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Ambient lofi beat with rain, baroque cello, or soothing synth chords for deep focus..."
              rows={3}
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Curated Study Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(preset.prompt)}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 bg-stone-50/50 dark:bg-stone-950/40 text-left transition-all group"
                >
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {preset.title}
                  </div>
                  <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateMusic}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Audio with Lyria 3...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Focus Music</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
