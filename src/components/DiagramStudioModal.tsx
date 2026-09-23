import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  X, 
  Loader2, 
  Wand2, 
  Maximize2,
  Trash2
} from 'lucide-react';
import { blobToBase64 } from '../utils/audioHelpers';

interface DiagramStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageBase64?: string | null;
}

export const DiagramStudioModal: React.FC<DiagramStudioModalProps> = ({
  isOpen,
  onClose,
  initialImageBase64,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [inputImageBase64, setInputImageBase64] = useState<string | null>(initialImageBase64 || null);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleIdeas = [
    'Clean schematic of an operational amplifier inverting configuration with labeled resistors',
    'Chalkboard diagram of a balanced AVL tree showing left-right double rotation with balance factors',
    'Architecture diagram of CPU memory hierarchy: L1, L2, L3 caches, main RAM, and SSD storage',
    '3D vector representation of electromagnetic plane wave with E-field, B-field, and Poynting vector',
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await blobToBase64(file);
      setInputImageBase64(base64);
      setInputImagePreview(URL.createObjectURL(file));
      if (!prompt) {
        setPrompt('Clean up this handwritten diagram, enhance line contrast, and make annotations sharp and legible');
      }
    }
  };

  const clearInputImage = () => {
    setInputImageBase64(null);
    setInputImagePreview(null);
  };

  const handleGenerateOrEdit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-or-edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageBase64: inputImageBase64,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate or edit diagram');
      }

      const data = await res.json();
      if (!data.imageBase64) {
        throw new Error('No image was returned from gemini-3.1-flash-image');
      }

      setGeneratedImage(`data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`);
      setDescription(data.description || '');
    } catch (err: any) {
      console.error('Image generation/edit error:', err);
      setError(err.message || 'Error occurred while creating image');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>STEM Diagram &amp; Illustration Studio</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold">
                  gemini-3.1-flash-image
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Generate crisp technical diagrams from scratch or upload handwritten sketches to edit and clarify.
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

          {/* Generated Result Preview */}
          {generatedImage && (
            <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Generated Scientific Diagram ({aspectRatio})
                </span>
                <a
                  href={generatedImage}
                  download="notevault-diagram.png"
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </a>
              </div>
              <div className="flex justify-center p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden max-h-80">
                <img
                  src={generatedImage}
                  alt="Generated Diagram"
                  className="max-h-80 w-auto object-contain rounded-lg"
                />
              </div>
              {description && (
                <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Source Image to Edit (Optional) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Source Diagram to Edit (Optional)
            </label>
            {inputImagePreview ? (
              <div className="relative inline-block border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
                <img
                  src={inputImagePreview}
                  alt="Source to edit"
                  className="h-28 object-contain bg-stone-100 dark:bg-stone-950 p-1"
                />
                <button
                  onClick={clearInputImage}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-teal-500 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-colors max-w-lg">
                <Upload className="w-5 h-5 text-stone-400" />
                <div className="text-xs">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    Upload handwritten diagram
                  </span>{' '}
                  <span className="text-stone-500">to edit or colorize</span>
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

          {/* Aspect Ratio Options */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-2">
              {['1:1', '16:9', '4:3', '3:4', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    aspectRatio === ratio
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Diagram Description or Edit Instructions
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Crisp vector diagram of a binary search tree with colored nodes and balance factors..."
              rows={3}
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Ideas */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Sample Technical Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(idea)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-300 transition-colors text-left"
                >
                  {idea.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateOrEdit}
              disabled={isProcessing || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing with gemini-3.1-flash-image-preview...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{inputImageBase64 ? 'Edit Diagram' : 'Create Diagram'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
