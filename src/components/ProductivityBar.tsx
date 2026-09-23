import React from 'react';
import { 
  Mic, 
  Film, 
  MapPin, 
  Headphones, 
  Wand2, 
  Radio, 
  Globe, 
  Sparkles 
} from 'lucide-react';

interface ProductivityBarProps {
  onOpenTranscribe: () => void;
  onOpenVeoVideo: () => void;
  onOpenStudySpots: () => void;
  onOpenFocusMusic: () => void;
  onOpenDiagramStudio: () => void;
  onOpenLiveVoice: () => void;
  onOpenSearchGrounding: () => void;
}

export const ProductivityBar: React.FC<ProductivityBarProps> = ({
  onOpenTranscribe,
  onOpenVeoVideo,
  onOpenStudySpots,
  onOpenFocusMusic,
  onOpenDiagramStudio,
  onOpenLiveVoice,
  onOpenSearchGrounding,
}) => {
  return (
    <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-y border-stone-200/80 dark:border-stone-800 py-2 sm:py-2.5 px-3 sm:px-6 lg:px-8 shadow-2xs sticky top-16 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x">
        <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 text-xs font-semibold shrink-0 pr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="uppercase tracking-wider text-[10px] sm:text-[11px] font-bold">
            <span className="hidden sm:inline">AI Study Suite</span>
            <span className="sm:hidden">AI Tools</span>:
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1. Transcribe Audio */}
          <button
            onClick={onOpenTranscribe}
            title="Record lecture audio or speech-to-text with gemini-3.5-transcribe"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-2xs active:scale-95 whitespace-nowrap"
          >
            <Mic className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden md:inline">Voice Transcribe</span>
            <span className="md:hidden">Transcribe</span>
          </button>

          {/* 2. Live Voice Tutor (gemini-3.8-live) */}
          <button
            onClick={onOpenLiveVoice}
            title="Real-time two-way voice tutor conversation with gemini-3.8-live"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-2xs active:scale-95 whitespace-nowrap"
          >
            <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse shrink-0" />
            <span className="hidden md:inline">Live Voice Tutor</span>
            <span className="md:hidden">Live Tutor</span>
          </button>

          {/* 3. Veo 3 Video Generator */}
          <button
            onClick={onOpenVeoVideo}
            title="Generate concept videos and animate note diagrams with veo-3.1-fast-generate-preview"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors shadow-2xs active:scale-95 whitespace-nowrap"
          >
            <Film className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Veo 3 Video</span>
          </button>

          {/* 4. Focus Music (Lyria 3) */}
          <button
            onClick={onOpenFocusMusic}
            title="Generate focus and study music with lyria-3-clip-preview and lyria-3-pro-preview"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-orange-800 dark:text-orange-300 text-xs font-medium hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-2xs active:scale-95 whitespace-nowrap"
          >
            <Headphones className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Focus Music</span>
          </button>

          {/* 5. Diagram Studio (gemini-3.1-flash-image-preview) */}
          <button
            onClick={onOpenDiagramStudio}
            title="Create and edit technical diagrams with gemini-3.1-flash-image-preview"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors shadow-2xs active:scale-95 whitespace-nowrap"
          >
            <Wand2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="hidden md:inline">Diagram Studio</span>
            <span className="md:hidden">Diagrams</span>
          </button>

          {/* 6. Study Spots (Google Maps) */}
          <button
            onClick={onOpenStudySpots}
            title="Locate quiet libraries and campus study spots with Google Maps Grounding"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-2xs active:scale-95 whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="hidden md:inline">Study Spots</span>
            <span className="md:hidden">Campus Maps</span>
          </button>

          {/* 7. Search Grounding */}
          <button
            onClick={onOpenSearchGrounding}
            title="Fact-check and cite academic derivations with Google Search Grounding"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs active:scale-95 whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden md:inline">Search Grounding</span>
            <span className="md:hidden">Google Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};
