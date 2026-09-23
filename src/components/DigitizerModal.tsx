import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Check, 
  Copy, 
  PlusCircle, 
  RefreshCw, 
  Image as ImageIcon,
  Cpu
} from 'lucide-react';
import { Note, Subject } from '../types/notes';

interface DigitizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToLibrary: (newNote: Note) => void;
}

// Sample presets for quick testing without needing an actual image file
const SAMPLE_PRESETS = [
  {
    name: 'Calculus - Integration by Parts',
    subject: 'Mathematics' as Subject,
    previewUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    rawText: `# Calculus III: Integration by Parts (Tabular Method)
Date: Fall Semester

Formula:
int u dv = u*v - int v du

Selection Rule (LIATE):
1. Logarithmic functions (ln x)
2. Inverse trigonometric (arctan x)
3. Algebraic (x^2, 3x)
4. Trigonometric (sin x, cos x)
5. Exponential (e^x)

Example: int x^2 * e^x dx
u = x^2, dv = e^x dx
du = 2x dx, v = e^x
= x^2 * e^x - int 2x * e^x dx
= x^2 * e^x - 2x * e^x + 2e^x + C
= e^x * (x^2 - 2x + 2) + C`,
    latex: [
      '\\int u \\, dv = u v - \\int v \\, du',
      '\\int x^2 e^x \\, dx = e^x (x^2 - 2x + 2) + C',
    ],
    confidence: 98.4,
    tags: ['Calculus', 'Integration by Parts', 'LIATE', 'Math'],
  },
  {
    name: 'Computer Networks - TCP 3-Way Handshake',
    subject: 'Computer Science' as Subject,
    previewUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    rawText: `# Computer Networks: TCP Connection Establishment
Topic: 3-Way Handshake & Sequence Number Synchronization

Client                          Server
  |                               |
  | -------- SYN (seq=x) -------> | (LISTEN -> SYN_RCVD)
  |                               |
  | <--- SYN-ACK (seq=y,ack=x+1)- | 
  |                               |
  | -------- ACK (ack=y+1) -----> | (ESTABLISHED)
  |                               |
[ESTABLISHED]

Key Notes:
- SYN bit consumes 1 sequence number space.
- ISN (Initial Sequence Number) is randomized to prevent replay attacks and overlap with previous incarnation connections.
- Piggybacking: ACK flag combined with SYN from server.`,
    latex: [
      '\\text{ISN} = f(\\text{Clock}, \\text{Secret Key})',
      '\\text{ACK} = \\text{seq}_{\\text{incoming}} + 1',
    ],
    confidence: 97.9,
    tags: ['TCP', 'Networking', '3-Way Handshake', 'Syn-Ack'],
  },
  {
    name: 'Physics - Maxwell Equations Differential Form',
    subject: 'Physics' as Subject,
    previewUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    rawText: `# Classical Electrodynamics: Maxwell's Equations (Differential Form)

1. Gauss's Law (Electrostatics):
   div(E) = rho / epsilon_0
   Physical Meaning: Electric charges are sources/sinks of electric field.

2. Gauss's Law for Magnetism:
   div(B) = 0
   Physical Meaning: No magnetic monopoles exist; B-field lines form closed loops.

3. Faraday's Law of Induction:
   curl(E) = - dB / dt
   Physical Meaning: Time-varying magnetic flux generates circulating electric field.

4. Ampere-Maxwell Law:
   curl(B) = mu_0 * J + mu_0 * epsilon_0 * (dE / dt)
   Physical Meaning: Moving currents AND displacement current dE/dt generate magnetic field.`,
    latex: [
      '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}',
      '\\nabla \\cdot \\mathbf{B} = 0',
      '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}',
      '\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}',
    ],
    confidence: 99.1,
    tags: ['Maxwell Equations', 'Electromagnetism', 'Gauss Law', 'Faraday Law'],
  },
];

export const DigitizerModal: React.FC<DigitizerModalProps> = ({
  isOpen,
  onClose,
  onSaveToLibrary,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_PRESETS[0].previewUrl);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrStep, setOcrStep] = useState<string>('');
  const [hasExtracted, setHasExtracted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for digitized note
  const [noteTitle, setNoteTitle] = useState<string>(SAMPLE_PRESETS[0].name);
  const [noteSubject, setNoteSubject] = useState<Subject>(SAMPLE_PRESETS[0].subject);
  const [extractedMarkdown, setExtractedMarkdown] = useState<string>(SAMPLE_PRESETS[0].rawText);
  const [recognizedLatex, setRecognizedLatex] = useState<string[]>(SAMPLE_PRESETS[0].latex);
  const [confidenceScore, setConfidenceScore] = useState<number>(SAMPLE_PRESETS[0].confidence);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (index: number) => {
    const preset = SAMPLE_PRESETS[index];
    setSelectedPresetIndex(index);
    setSelectedImage(preset.previewUrl);
    setNoteTitle(preset.name);
    setNoteSubject(preset.subject);
    setExtractedMarkdown(preset.rawText);
    setRecognizedLatex(preset.latex);
    setConfidenceScore(preset.confidence);
    setHasExtracted(false);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedPresetIndex(-1);
      setHasExtracted(false);
      setNoteTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    };
    reader.readAsDataURL(file);
  };

  const handleRunOCR = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setHasExtracted(false);
    setError(null);
    setOcrStep('1. Preprocessing image (deskewing, binarization & contrast boost)...');

    // If it's a sample preset, simulate swift processing then set preset data
    if (selectedPresetIndex >= 0) {
      setTimeout(() => {
        setOcrStep('2. Gemini Vision OCR: Detecting handwriting strokes & character graphs...');
      }, 500);

      setTimeout(() => {
        setOcrStep('3. Semantic parsing: Formatting mathematical formulas & markdown...');
      }, 1000);

      setTimeout(() => {
        const preset = SAMPLE_PRESETS[selectedPresetIndex];
        setNoteTitle(preset.name);
        setNoteSubject(preset.subject);
        setExtractedMarkdown(preset.rawText);
        setRecognizedLatex(preset.latex);
        setConfidenceScore(preset.confidence);
        setIsProcessing(false);
        setHasExtracted(true);
      }, 1500);
      return;
    }

    // Custom uploaded image: Call real Gemini Vision OCR endpoint
    try {
      setOcrStep('2. Sending to Gemini 3.5 Flash Vision for neural handwriting recognition...');
      const response = await fetch('/api/ocr-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process handwritten image with Gemini Vision');
      }

      setOcrStep('3. Extracting LaTeX math formulas and structured markdown...');
      const data = await response.json();

      if (data.title) setNoteTitle(data.title);
      if (data.subject) setNoteSubject(data.subject as Subject);
      if (data.rawText) setExtractedMarkdown(data.rawText);
      if (Array.isArray(data.latex)) setRecognizedLatex(data.latex);
      if (data.confidence) setConfidenceScore(data.confidence);

      setHasExtracted(true);
    } catch (err: any) {
      console.error('OCR Error:', err);
      setError(err.message || 'Gemini Vision OCR encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(extractedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = () => {
    const newNote: Note = {
      id: `custom-note-${Date.now()}`,
      title: noteTitle,
      subject: noteSubject,
      topic: 'Digitized User Submission',
      author: {
        name: 'You (Digitized via Gemini)',
        institution: 'Online Contributor',
      },
      uploadDate: 'Just now',
      readabilityRating: 4.95,
      legibilityScore: Math.round(confidenceScore),
      upvotes: 1,
      views: 1,
      totalPages: 1,
      summary: `Digitized handwritten note processed with Gemini Vision OCR. Contains verified equations and structured markdown.`,
      tags: ['Digitized', noteSubject, 'OCR Verified'],
      pages: [
        {
          id: `p-${Date.now()}`,
          pageNumber: 1,
          title: noteTitle,
          paperType: 'ruled',
          inkColor: 'blue',
          ocrContent: {
            title: noteTitle,
            rawText: extractedMarkdown,
            sections: [
              {
                heading: 'Extracted Content',
                content: extractedMarkdown,
                type: 'text',
              },
            ],
            latexFormulas: recognizedLatex,
            keyTerms: [noteSubject, 'Gemini OCR', 'Digitized'],
          },
          visualContent: {
            headerTitle: noteTitle.toUpperCase(),
            dateText: 'Digitized Today · Verified',
            sections: [
              {
                heading: 'Transcribed Handwritten Notes',
                highlight: 'yellow',
                paragraphs: extractedMarkdown.split('\n').filter(l => l.trim().length > 0 && !l.startsWith('#')).slice(0, 6),
                sideMarginNote: `Confidence score: ${confidenceScore}%`,
              },
            ],
          },
        },
      ],
    };

    onSaveToLibrary(newNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                AI Note Digitizer &amp; Gemini OCR
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Google AI Studio Powered
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Upload handwritten pages to extract clean Markdown, LaTeX math equations, and diagrams.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-xs font-semibold hover:underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Preset scan selection or Custom upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Select a sample handwritten scan or upload your own:
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Image File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(idx)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                    selectedPresetIndex === idx
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded bg-stone-200 dark:bg-stone-800 shrink-0 overflow-hidden relative">
                    <img 
                      src={preset.previewUrl} 
                      alt={preset.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-stone-500 block truncate">{preset.subject}</span>
                    <strong className="font-semibold text-stone-800 dark:text-stone-200 block truncate">
                      {preset.name}
                    </strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      {preset.confidence}% Accuracy
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive OCR Trigger Bar */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                  Multimodal OCR Engine
                </h4>
                <p className="text-xs text-stone-500">
                  Transcribes handwriting, formulas, tables, and sketches into structured code.
                </p>
              </div>
            </div>

            <button
              onClick={handleRunOCR}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Strokes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Text with Gemini OCR</span>
                </>
              )}
            </button>
          </div>

          {/* Real-time processing progress banner */}
          {isProcessing && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 animate-pulse flex items-center gap-3">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <div className="font-medium">{ocrStep}</div>
            </div>
          )}

          {/* Side-by-Side Comparison: Handwritten Scan vs Digitized OCR Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column: Handwritten Scan */}
            <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-950 flex flex-col">
              <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Original Handwritten Document
                </span>
                <span className="text-[10px] text-stone-500 font-mono">Input Scan</span>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center min-h-[340px]">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Handwritten Note"
                    className="max-h-[380px] w-auto object-contain rounded shadow-xs border border-stone-200 dark:border-stone-800"
                  />
                ) : (
                  <div className="text-center text-stone-400 p-8">
                    <Upload className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                    <p className="text-xs">Select or upload a handwritten note</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: OCR Text Output */}
            <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900 flex flex-col">
              <div className="p-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Gemini Extracted Markdown
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded">
                    {confidenceScore}% Accuracy
                  </span>
                </div>
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col min-h-[340px] space-y-4">
                {/* Recognized LaTeX formulas badge list */}
                {recognizedLatex && recognizedLatex.length > 0 && (
                  <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                    <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                      Detected Math Formulations (LaTeX):
                    </span>
                    <div className="space-y-1 font-mono text-xs text-amber-700 dark:text-amber-300">
                      {recognizedLatex.map((f, i) => (
                        <div key={i} className="truncate">{f}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editable Extracted text */}
                <textarea
                  value={extractedMarkdown}
                  onChange={(e) => setExtractedMarkdown(e.target.value)}
                  className="w-full flex-1 min-h-[220px] p-3 text-xs font-mono bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500 leading-relaxed resize-none"
                  placeholder="Extracted OCR Markdown will appear here..."
                />
              </div>
            </div>
          </div>

          {/* Metadata & Save to Library form */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-stone-500">
              Save Digitized Note to NoteVault Library
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Data Structures - AVL Rotations"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                  Subject Category
                </label>
                <select
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value as Subject)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Operating Systems">Operating Systems</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveToVault}
            className="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add to NoteVault Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};
