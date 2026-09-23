import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  X, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  Copy, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { fetchGoogleSearchGrounding, SearchGroundingResponse } from '../services/gemini';
import { Subject } from '../types/notes';

interface SearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuery?: string;
  defaultSubject?: Subject;
}

export const SearchGroundingModal: React.FC<SearchGroundingModalProps> = ({
  isOpen,
  onClose,
  defaultQuery = '',
  defaultSubject = 'All',
}) => {
  const [query, setQuery] = useState<string>(defaultQuery);
  const [subject, setSubject] = useState<Subject>(defaultSubject);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SearchGroundingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchGoogleSearchGrounding(
        query.trim(),
        subject !== 'All' ? subject : undefined
      );
      setResult(data);
    } catch (err: any) {
      console.error('Search grounding error:', err);
      setError(err.message || 'Failed to retrieve search grounded results.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleSearches = [
    'Recent breakthroughs in Transformer attention vs State Space Models (Mamba)',
    'Spectral Theorem for Hermitian operators physical interpretations',
    'Modern multi-level TLB latency in ARM Neoverse vs Intel Xeon',
    'Current catalysts for green hydrogen production reactions',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-stone-900 via-stone-800 to-amber-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-stone-100">
                  Google Search Academic Grounding
                </h3>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                  gemini-3.5-flash
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Live web-grounded research, verified formulas, and technical citations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40 shrink-0">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any STEM concept, theorem, or recent paper with live web citations..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="px-3 py-2.5 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300"
              >
                <option value="All">All Disciplines</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Chemistry">Chemistry</option>
              </select>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching Web...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Ground Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Prompt chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider shrink-0 font-semibold">
              Try:
            </span>
            {sampleSearches.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(s);
                }}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-800 dark:hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
              >
                {s.length > 40 ? s.slice(0, 40) + '...' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-600 animate-spin" />
                <Globe className="w-5 h-5 text-amber-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Retrieving Live Web Grounding with Google Search
                </p>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  Gemini 3.5 Flash is querying current academic databases, indexing search chunks, and validating technical citations...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <p className="font-bold">Search Grounding Error</p>
              <p>{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              {/* Actions Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Live Grounded via Google Search
                  </span>
                  {result.sources.length > 0 && (
                    <span className="text-[11px] text-stone-500 font-mono">
                      ({result.sources.length} Verified Sources Found)
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                </button>
              </div>

              {/* Verified Web Sources Carousel */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                    Web Citations &amp; Reference Sources
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60 hover:border-amber-400 transition-all flex items-start justify-between gap-2 group"
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                            {source.title || 'Academic Reference'}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate mt-0.5 font-mono">
                            {source.uri}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Text */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans whitespace-pre-line">
                {result.summary}
              </div>

              {/* Web Search Queries Used */}
              {result.searchQueries && result.searchQueries.length > 0 && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Underlying Google Queries:
                  </span>
                  {result.searchQueries.map((q, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded font-mono text-[10px]"
                    >
                      &quot;{q}&quot;
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="text-center py-12 text-stone-400 text-xs space-y-2">
              <Globe className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700" />
              <p className="font-semibold text-stone-700 dark:text-stone-300">
                Ground your handwritten studies with live Google Search data
              </p>
              <p className="max-w-md mx-auto text-stone-500 text-[11px]">
                Search for modern benchmarks, latest IEEE publications, cross-verify textbook formulations, or explore new proofs directly backed by real-time citations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
