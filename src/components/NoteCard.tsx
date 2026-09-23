import React from 'react';
import { 
  BookOpen, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  ThumbsUp, 
  Eye, 
  Sparkles,
  FileText
} from 'lucide-react';
import { Note } from '../types/notes';
import { HandwrittenPageRenderer } from './HandwrittenPageRenderer';

interface NoteCardProps {
  note: Note;
  isBookmarked: boolean;
  onToggleBookmark: (noteId: string) => void;
  onOpenQuickView: (note: Note) => void;
  onDownload: (note: Note) => void;
  onUpvote: (noteId: string) => void;
  hasUpvoted: boolean;
  onOpenOCR: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isBookmarked,
  onToggleBookmark,
  onOpenQuickView,
  onDownload,
  onUpvote,
  hasUpvoted,
  onOpenOCR,
}) => {
  const firstPage = note.pages[0];

  return (
    <div className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Thumbnail / Handwritten Note Preview Area */}
      <div 
        onClick={() => onOpenQuickView(note)}
        className="relative h-56 bg-stone-100 dark:bg-stone-950 overflow-hidden cursor-pointer border-b border-stone-200 dark:border-stone-800"
      >
        {/* Render a scaled-down authentic handwritten page preview */}
        <div className="absolute inset-0 origin-top-left transform scale-[0.44] sm:scale-[0.48] pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
          {firstPage && (
            <div className="w-[680px]">
              <HandwrittenPageRenderer page={firstPage} compact={true} />
            </div>
          )}
        </div>

        {/* Hover Overlay with Quick View hint */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-stone-900/90 text-white text-xs font-medium px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs transform translate-y-1 group-hover:translate-y-0 transition-all">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            Quick View ({note.totalPages} {note.totalPages === 1 ? 'Page' : 'Pages'})
          </span>
        </div>

        {/* Top Badges / Indicators */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="bg-stone-900/80 dark:bg-stone-800/90 text-white backdrop-blur-xs text-[11px] font-medium px-2.5 py-0.5 rounded-md shadow-xs">
            {note.subject}
          </span>
          <div className="flex items-center gap-1">
            <span className="bg-amber-500/90 text-white backdrop-blur-xs text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
              ★ {note.readabilityRating.toFixed(2)}
            </span>
            <span className="bg-emerald-600/90 text-white backdrop-blur-xs text-[10px] font-medium px-1.5 py-0.5 rounded-md">
              {note.legibilityScore}% OCR
            </span>
          </div>
        </div>

        {/* Bottom bar preview indicator */}
        <div className="absolute bottom-2 right-2.5 pointer-events-none">
          <span className="bg-stone-900/80 text-stone-200 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
            <FileText className="w-3 h-3 text-stone-400" />
            {note.totalPages} pages
          </span>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Topic & Title */}
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 line-clamp-1">
            {note.topic}
          </div>
          <h3 
            onClick={() => onOpenQuickView(note)}
            className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
          >
            {note.title}
          </h3>

          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-3">
            {note.summary}
          </p>

          {/* Author & Upload date metadata */}
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800/80">
            <div className="flex items-center gap-2">
              {note.author.avatarUrl ? (
                <img 
                  src={note.author.avatarUrl} 
                  alt={note.author.name}
                  className="w-5 h-5 rounded-full object-cover" 
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-[10px] font-bold">
                  {note.author.name.charAt(0)}
                </div>
              )}
              <span className="font-medium text-stone-700 dark:text-stone-300 truncate max-w-[110px]">
                {note.author.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span>{note.uploadDate}</span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span className="flex items-center gap-0.5 text-stone-400">
                <Eye className="w-3 h-3" />
                {note.views}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Interactive Buttons */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-1.5">
          {/* Left action: Upvote */}
          <button
            onClick={() => onUpvote(note.id)}
            title="Upvote note readability"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              hasUpvoted
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current text-amber-600' : ''}`} />
            <span>{note.upvotes + (hasUpvoted ? 1 : 0)}</span>
          </button>

          {/* Right actions: OCR Inspector, Bookmark, Download, Quick View */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenOCR(note)}
              title="Inspect AI Extracted Text (Gemini OCR)"
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            <button
              onClick={() => onToggleBookmark(note.id)}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this note'}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' 
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-current text-amber-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => onDownload(note)}
              title="Download Note PDF"
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenQuickView(note)}
              className="ml-1 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-1 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
