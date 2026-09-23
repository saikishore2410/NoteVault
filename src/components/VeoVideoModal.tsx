import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Upload, 
  Sparkles, 
  Loader2, 
  X, 
  Download, 
  Maximize2,
  Film,
  Play,
  RotateCcw
} from 'lucide-react';
import { blobToBase64 } from '../utils/audioHelpers';
import { Note } from '../types/notes';

interface VeoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNote?: Note | null;
}

export const VeoVideoModal: React.FC<VeoVideoModalProps> = ({
  isOpen,
  onClose,
  activeNote,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setError(null);
    }
  }, [isOpen]);

  // Set default prompt based on active note if available
  useEffect(() => {
    if (activeNote && !prompt) {
      setPrompt(`Dynamic STEM visualization explaining ${activeNote.title}: step-by-step whiteboard animation of ${activeNote.topic}`);
    }
  }, [activeNote]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await blobToBase64(file);
      setSelectedImageBase64(base64);
      setSelectedImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImageBase64(null);
    setSelectedImagePreview(null);
  };

  const samplePrompts = [
    'Dynamic 3D rotation of self-balancing AVL binary search tree with node color heights',
    'Virtual memory paging simulation showing TLB cache hit, page table lookup, and RAM frame swap',
    '3D visualization of matrix eigenvector transformations stretching coordinate grids in linear algebra',
    'Electromagnetic wave propagating through free space with oscillating electric and magnetic field vectors',
  ];

  const handleGenerateVideo = async () => {
    if (!prompt.trim() && !selectedImageBase64) {
      setError('Please provide a prompt or an image to animate.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setLoadingStage('Submitting request to Veo 3 generation engine...');

    try {
      // Step 1: Start video generation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageBase64: selectedImageBase64,
          aspectRatio,
        }),
      });

      if (!startRes.ok) {
        const data = await startRes.json();
        throw new Error(data.error || 'Failed to start video generation');
      }

      const { operationName } = await startRes.json();
      setLoadingStage('Synthesizing frames with veo-3.1-fast-generate-preview...');

      const stages = [
        'Analyzing mathematical motion & dynamics...',
        'Interpolating smooth temporal transitions...',
        'Rendering high-fidelity frames with Veo 3...',
        'Encoding 720p H.264 video stream...',
        'Finalizing render pipeline...',
      ];
      let stageIndex = 0;

      // Step 2: Poll operation status
      pollIntervalRef.current = setInterval(async () => {
        try {
          stageIndex = (stageIndex + 1) % stages.length;
          setLoadingStage(stages[stageIndex]);

          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });

          if (!statusRes.ok) return;

          const statusData = await statusRes.json();
          if (statusData.error) {
            clearInterval(pollIntervalRef.current);
            setIsGenerating(false);
            setError(statusData.error.message || 'Video generation failed');
            return;
          }

          if (statusData.done) {
            clearInterval(pollIntervalRef.current);
            setLoadingStage('Downloading generated MP4 video...');

            // Step 3: Fetch video stream
            const downloadRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName }),
            });

            if (!downloadRes.ok) {
              throw new Error('Failed to download video stream');
            }

            const videoBlob = await downloadRes.blob();
            const url = URL.createObjectURL(videoBlob);
            setVideoUrl(url);
            setIsGenerating(false);
          }
        } catch (pollErr: any) {
          console.error('Polling error:', pollErr);
        }
      }, 5000);
    } catch (err: any) {
      console.error('Video generation error:', err);
      setIsGenerating(false);
      setError(err.message || 'Error occurred during Veo video generation');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span>Veo 3 Concept Animator</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold">
                  veo-3.1
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Transform textbook concepts or handwritten diagrams into dynamic video simulations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Video Preview If Generated */}
          {videoUrl && (
            <div className="space-y-3 p-4 rounded-2xl bg-stone-900 text-white border border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" /> Generated Simulation Video ({aspectRatio})
                </span>
                <a
                  href={videoUrl}
                  download="stem-concept-veo.mp4"
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4</span>
                </a>
              </div>
              <div className="rounded-xl overflow-hidden bg-black flex justify-center max-h-80">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="max-h-80 w-auto rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Loading Reassurance State */}
          {isGenerating && (
            <div className="p-8 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Video className="w-8 h-8 animate-pulse" />
                </div>
                <Loader2 className="w-20 h-20 text-purple-500 animate-spin absolute -top-2 -left-2 opacity-50" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Veo 3 Generating Video
                </h4>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-mono mt-1">
                  {loadingStage}
                </p>
                <p className="text-[11px] text-stone-500 mt-2 max-w-sm mx-auto">
                  High-resolution video synthesis takes ~1 to 2 minutes. Feel free to keep this tab open!
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          {!isGenerating && (
            <div className="space-y-5">
              {/* Aspect Ratio Selector (16:9 or 9:16) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  Aspect Ratio (Standard Veo 3 Specs)
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      aspectRatio === '16:9'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>16:9 Landscape (Whiteboard / Desktop)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      aspectRatio === '9:16'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>9:16 Portrait (Mobile / Shorts)</span>
                  </button>
                </div>
              </div>

              {/* Upload Image to Animate (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  Animate Image or Diagram (Optional)
                </label>
                {selectedImagePreview ? (
                  <div className="relative inline-block border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
                    <img
                      src={selectedImagePreview}
                      alt="To animate"
                      className="h-28 object-contain bg-stone-100 dark:bg-stone-950 p-1"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-purple-500 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-colors max-w-lg">
                    <Upload className="w-5 h-5 text-stone-400" />
                    <div className="text-xs">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        Upload handwritten diagram or photo
                      </span>{' '}
                      <span className="text-stone-500">to bring it to life</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  Concept Prompt / Animation Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the scientific concept, whiteboard steps, or dynamic animation you want Veo 3 to generate..."
                  rows={3}
                  className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Presets */}
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Quick STEM Idea Presets:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(p)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-colors text-left"
                    >
                      {p.slice(0, 48)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleGenerateVideo}
                  disabled={isGenerating || (!prompt.trim() && !selectedImageBase64)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Veo 3 Video ({aspectRatio})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
