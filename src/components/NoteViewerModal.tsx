import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Columns, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun,
  Copy,
  Check,
  FileText,
  ThumbsUp,
  Globe,
  Film,
  Radio,
  Wand2
} from 'lucide-react';
import { Note } from '../types/notes';
import { HandwrittenPageRenderer } from './HandwrittenPageRenderer';

interface NoteViewerModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (noteId: string) => void;
  onDownload: (note: Note) => void;
  onUpvote: (noteId: string) => void;
  hasUpvoted: boolean;
  initialPageIndex?: number;
  onPageVisited?: (note: Note, pageIndex: number) => void;
  onOpenSearchGrounding?: (query: string, subject?: any) => void;
  onOpenVeoVideo?: (note: Note) => void;
  onOpenLiveVoice?: (note: Note) => void;
  onOpenDiagramStudio?: (note: Note) => void;
}

export const NoteViewerModal: React.FC<NoteViewerModalProps> = ({
  note,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onDownload,
  onUpvote,
  hasUpvoted,
  initialPageIndex = 0,
  onPageVisited,
  onOpenSearchGrounding,
  onOpenVeoVideo,
  onOpenLiveVoice,
  onOpenDiagramStudio,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(initialPageIndex);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [splitViewMode, setSplitViewMode] = useState<'notes' | 'split' | 'ocr'>('notes');
  const [invertedPaper, setInvertedPaper] = useState<boolean>(false);
  const [copiedRawText, setCopiedRawText] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showMobileTools, setShowMobileTools] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync to initialPageIndex when opened or note changes
  useEffect(() => {
    if (isOpen && note) {
      const validIndex = Math.min(Math.max(0, initialPageIndex), note.pages.length - 1);
      setCurrentPageIndex(validIndex);
      setZoomLevel(1);
    }
  }, [isOpen, note?.id, initialPageIndex]);

  // Notify parent on page visit
  useEffect(() => {
    if (isOpen && note && onPageVisited) {
      onPageVisited(note, currentPageIndex);
    }
  }, [isOpen, note, currentPageIndex, onPageVisited]);

  const handlePrevPage = useCallback(() => {
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    if (!note) return;
    setCurrentPageIndex((prev) => Math.min(note.pages.length - 1, prev + 1));
  }, [note]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((z) => Math.min(2.0, z + 0.15));
      } else if (e.key === '-') {
        setZoomLevel((z) => Math.max(0.6, z - 0.15));
      } else if (e.key === '0') {
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrevPage, handleNextPage]);

  if (!isOpen || !note) return null;

  const currentPage = note.pages[currentPageIndex] || note.pages[0];

  const handleCopyOCRText = () => {
    if (currentPage?.ocrContent?.rawText) {
      navigator.clipboard.writeText(currentPage.ocrContent.rawText);
      setCopiedRawText(true);
      setTimeout(() => setCopiedRawText(false), 2000);
    }
  };

  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    if (!document.fullscreenElement) {
      modalRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex flex-col overflow-hidden text-stone-100"
    >
      {/* Top Header Bar */}
      <header className="h-16 border-b border-stone-800 bg-stone-900/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Left: Note Info & Author */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                {note.subject}
              </span>
              <span className="text-stone-600 text-xs">·</span>
              <span className="text-xs text-stone-400 truncate hidden md:inline">
                by {note.author.name} ({note.author.institution})
              </span>
            </div>
            <h2 className="font-bold text-sm sm:text-base text-stone-100 truncate">
              {note.title}
            </h2>
          </div>
        </div>

        {/* Center: View Controls */}
        <div className="flex items-center gap-1.5 bg-stone-800/80 p-1 rounded-lg border border-stone-700/60">
          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            title="Zoom Out (-)"
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-700 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono w-12 text-center text-stone-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
            title="Zoom In (+)"
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-700 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title="Reset Zoom (0)"
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-700 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-stone-700 mx-1 hidden sm:block" />

          {/* Split Mode / OCR Inspector Toggle */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => setSplitViewMode('notes')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                splitViewMode === 'notes' ? 'bg-stone-700 text-white font-medium' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Handwritten
            </button>
            <button
              onClick={() => setSplitViewMode('split')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                splitViewMode === 'split' ? 'bg-emerald-800/60 text-emerald-200 font-medium' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Columns className="w-3 h-3" />
              Split OCR
            </button>
            <button
              onClick={() => setSplitViewMode('ocr')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                splitViewMode === 'ocr' ? 'bg-emerald-800/60 text-emerald-200 font-medium' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              OCR Text
            </button>
          </div>
        </div>

        {/* Right: Actions & Close */}
        <div className="flex items-center gap-1.5">
          {onOpenLiveVoice && (
            <button
              onClick={() => onOpenLiveVoice(note)}
              title="Speak with live AI voice tutor about this note"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-700/60 text-red-300 text-xs hover:bg-red-900 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" />
              <span>Voice Tutor</span>
            </button>
          )}

          {onOpenVeoVideo && (
            <button
              onClick={() => onOpenVeoVideo(note)}
              title="Generate a dynamic concept video animation for this note with Veo 3"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/60 border border-purple-700/60 text-purple-300 text-xs hover:bg-purple-900 transition-colors"
            >
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>Veo 3 Video</span>
            </button>
          )}

          {onOpenDiagramStudio && (
            <button
              onClick={() => onOpenDiagramStudio(note)}
              title="Edit or generate diagrams for this note"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-950/60 border border-teal-700/60 text-teal-300 text-xs hover:bg-teal-900 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Diagram Studio</span>
            </button>
          )}

          {onOpenSearchGrounding && (
            <button
              onClick={() => onOpenSearchGrounding(`${note.title} ${currentPage?.title || note.topic}`, note.subject)}
              title="Ground this topic with live Google Search citations"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs hover:bg-emerald-900 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Search Grounding</span>
            </button>
          )}

          {/* Contrast Toggle (Tablet & Desktop) */}
          <button
            onClick={() => setInvertedPaper(!invertedPaper)}
            title={invertedPaper ? 'Switch to Natural Paper' : 'Switch to Dark Paper Mode'}
            className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors hidden sm:inline-flex"
          >
            {invertedPaper ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Upvote button */}
          <button
            onClick={() => onUpvote(note.id)}
            title="Upvote note"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center gap-1 text-xs ${
              hasUpvoted ? 'text-amber-400 bg-amber-950/40' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span className="hidden md:inline">{note.upvotes + (hasUpvoted ? 1 : 0)}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(note.id)}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Note'}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              isBookmarked ? 'text-amber-400 bg-amber-950/40' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Download (Tablet & Desktop) */}
          <button
            onClick={() => onDownload(note)}
            title="Download PDF"
            className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors hidden sm:inline-flex"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Mobile Tools Menu Button */}
          <div className="relative xl:hidden">
            <button
              onClick={() => setShowMobileTools(!showMobileTools)}
              title="AI Study Tools & Actions"
              className="p-1.5 sm:p-2 rounded-lg text-amber-400 hover:bg-stone-800 transition-colors flex items-center gap-1 bg-amber-950/40 border border-amber-800/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold hidden xs:inline">AI Tools</span>
            </button>

            {/* Mobile Tools Dropdown Popover */}
            {showMobileTools && (
              <div className="absolute right-0 mt-2 w-56 bg-stone-900 rounded-2xl shadow-2xl border border-stone-700 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                  AI Study Features
                </div>

                {onOpenLiveVoice && (
                  <button
                    onClick={() => {
                      setShowMobileTools(false);
                      onOpenLiveVoice(note);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-xl hover:bg-stone-800 text-red-300 transition-colors"
                  >
                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>Live Voice Tutor</span>
                  </button>
                )}

                {onOpenVeoVideo && (
                  <button
                    onClick={() => {
                      setShowMobileTools(false);
                      onOpenVeoVideo(note);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-xl hover:bg-stone-800 text-purple-300 transition-colors"
                  >
                    <Film className="w-4 h-4 text-purple-400" />
                    <span>Veo 3 Diagram Animator</span>
                  </button>
                )}

                {onOpenDiagramStudio && (
                  <button
                    onClick={() => {
                      setShowMobileTools(false);
                      onOpenDiagramStudio(note);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-xl hover:bg-stone-800 text-teal-300 transition-colors"
                  >
                    <Wand2 className="w-4 h-4 text-teal-400" />
                    <span>Diagram Studio</span>
                  </button>
                )}

                {onOpenSearchGrounding && (
                  <button
                    onClick={() => {
                      setShowMobileTools(false);
                      onOpenSearchGrounding(`${note.title} ${currentPage?.title || note.topic}`, note.subject);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-xl hover:bg-stone-800 text-emerald-300 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Search Grounding</span>
                  </button>
                )}

                <div className="my-1 border-t border-stone-800" />

                <button
                  onClick={() => {
                    setInvertedPaper(!invertedPaper);
                    setShowMobileTools(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-xl hover:bg-stone-800 text-stone-300 transition-colors"
                >
                  {invertedPaper ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  <span>{invertedPaper ? 'Natural Paper' : 'Dark Mode Paper'}</span>
                </button>

                <button
                  onClick={() => {
                    onDownload(note);
                    setShowMobileTools(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-xl hover:bg-stone-800 text-stone-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Note PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Fullscreen (Desktop) */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors hidden sm:inline-flex"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close Viewer (Esc)"
            className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors ml-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Workspace: Page Viewer + OCR Inspector Side-by-side or Single */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Page Thumbnails Sidebar */}
        <aside className="w-44 bg-stone-900 border-r border-stone-800 p-3 hidden md:flex flex-col shrink-0 overflow-y-auto">
          <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3 px-1 flex items-center justify-between">
            <span>Pages ({note.pages.length})</span>
            <span className="text-[10px] text-stone-500 font-mono">100% OCR</span>
          </div>
          <div className="space-y-3">
            {note.pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentPageIndex(idx)}
                className={`w-full text-left rounded-lg p-2 transition-all border ${
                  currentPageIndex === idx
                    ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                    : 'border-stone-800 hover:border-stone-700 bg-stone-950/60'
                }`}
              >
                <div className="h-28 bg-stone-100 dark:bg-stone-900 rounded overflow-hidden relative mb-1.5 border border-stone-700/60 pointer-events-none">
                  <div className="origin-top-left transform scale-[0.18] w-[600px]">
                    <HandwrittenPageRenderer page={p} compact={true} inverted={invertedPaper} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${currentPageIndex === idx ? 'text-amber-400' : 'text-stone-300'}`}>
                    Page {p.pageNumber}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {p.paperType}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Center: Interactive Handwritten Note Canvas */}
        {(splitViewMode === 'notes' || splitViewMode === 'split') && (
          <div className={`flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-stone-950 ${
            splitViewMode === 'split' ? 'border-r border-stone-800' : ''
          }`}>
            <div className="transition-transform duration-100 max-w-full">
              {currentPage && (
                <HandwrittenPageRenderer 
                  page={currentPage} 
                  scale={zoomLevel} 
                  inverted={invertedPaper} 
                />
              )}
            </div>
          </div>
        )}

        {/* Right / Split: OCR Extracted Text & LaTeX Inspector */}
        {(splitViewMode === 'ocr' || splitViewMode === 'split') && (
          <div className={`${
            splitViewMode === 'split' ? 'w-full md:w-[480px] lg:w-[540px]' : 'flex-1'
          } bg-stone-900 flex flex-col overflow-hidden shrink-0 border-stone-800`}>
            {/* OCR Inspector Header */}
            <div className="p-4 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-sm text-stone-100 flex items-center gap-2">
                    Gemini Vision OCR Inspector
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                      {note.legibilityScore}% Confidence
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Digitized Markdown, LaTeX, and Structural Elements
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyOCRText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors border border-stone-700"
              >
                {copiedRawText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {/* OCR Extracted Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 font-sans text-sm text-stone-300">
              {/* Document Title extracted */}
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block mb-1">
                  Extracted Header
                </span>
                <h4 className="text-lg font-bold text-stone-100">
                  {currentPage?.ocrContent?.title}
                </h4>
              </div>

              {/* Sections Breakdown */}
              {currentPage?.ocrContent?.sections.map((sec, sIdx) => (
                <div key={sIdx} className="bg-stone-950/70 p-4 rounded-lg border border-stone-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-amber-300 text-xs">
                      {sec.heading}
                    </span>
                    {sec.type && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                        {sec.type}
                      </span>
                    )}
                  </div>

                  {sec.type === 'code' ? (
                    <pre className="bg-stone-900 p-3 rounded text-xs font-mono text-emerald-300 overflow-x-auto border border-stone-800">
                      <code>{sec.content}</code>
                    </pre>
                  ) : (
                    <p className="text-xs leading-relaxed text-stone-300 whitespace-pre-line">
                      {sec.content}
                    </p>
                  )}
                </div>
              ))}

              {/* LaTeX Formulas recognized */}
              {currentPage?.ocrContent?.latexFormulas && currentPage.ocrContent.latexFormulas.length > 0 && (
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400 block mb-2">
                    Recognized Mathematical Formulas (LaTeX)
                  </span>
                  <div className="space-y-2">
                    {currentPage.ocrContent.latexFormulas.map((formula, fIdx) => (
                      <div 
                        key={fIdx} 
                        className="p-3 bg-stone-950 rounded-lg border border-stone-800 font-mono text-xs text-amber-200 overflow-x-auto"
                      >
                        {formula}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Terms */}
              {currentPage?.ocrContent?.keyTerms && (
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block mb-2">
                    Key Extracted Concepts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPage.ocrContent.keyTerms.map((term, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="text-xs bg-stone-800 text-stone-300 px-2.5 py-1 rounded-md border border-stone-700/80"
                      >
                        #{term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Navigation Bar */}
      <footer className="h-14 sm:h-16 border-t border-stone-800 bg-stone-900/95 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 gap-2">
        {/* Mobile View Mode Switcher */}
        <div className="flex sm:hidden items-center bg-stone-800/90 p-1 rounded-xl border border-stone-700/60">
          <button
            onClick={() => setSplitViewMode('notes')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              splitViewMode === 'notes' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setSplitViewMode('ocr')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              splitViewMode === 'ocr' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            OCR
          </button>
        </div>

        {/* Page navigation controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-stone-700/60"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-stone-300 font-medium px-1 sm:px-2 whitespace-nowrap">
            Pg <strong className="text-amber-400 font-mono">{currentPageIndex + 1}</strong> of {note.pages.length}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPageIndex === note.pages.length - 1}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-stone-700/60"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Zoom Controls */}
        <div className="flex sm:hidden items-center gap-1 bg-stone-800/80 p-0.5 rounded-lg border border-stone-700/60">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            className="p-1 text-stone-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono w-9 text-center text-stone-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
            className="p-1 text-stone-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Keyboard tips (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-stone-400">
          <span>
            Keyboard: <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-[11px] text-stone-300 font-mono">←</kbd> <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-[11px] text-stone-300 font-mono">→</kbd> turn pages · <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-[11px] text-stone-300 font-mono">+</kbd> <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-[11px] text-stone-300 font-mono">-</kbd> zoom
          </span>
        </div>
      </footer>
    </div>
  );
};
