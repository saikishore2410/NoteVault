import React from 'react';
import { NotePage } from '../types/notes';

interface HandwrittenPageRendererProps {
  page: NotePage;
  scale?: number;
  inverted?: boolean;
  compact?: boolean;
}

export const HandwrittenPageRenderer: React.FC<HandwrittenPageRendererProps> = ({
  page,
  scale = 1,
  inverted = false,
  compact = false,
}) => {
  const getPaperClass = () => {
    if (inverted) {
      return page.paperType === 'grid' ? 'paper-grid-dark' : 'paper-ruled-dark';
    }
    switch (page.paperType) {
      case 'grid':
        return 'paper-grid';
      case 'legal':
        return 'paper-legal';
      case 'dots':
        return 'paper-dots';
      case 'ruled':
      default:
        return 'paper-ruled';
    }
  };

  const getInkColor = () => {
    if (inverted) return 'text-amber-100';
    switch (page.inkColor) {
      case 'darkblue':
        return 'text-[#1e3a8a]';
      case 'black':
        return 'text-[#18181b]';
      case 'violet':
        return 'text-[#581c87]';
      case 'blue':
      default:
        return 'text-[#1d4ed8]';
    }
  };

  const renderDiagram = (type?: string) => {
    switch (type) {
      case 'bst':
        return (
          <div className="my-4 p-3 bg-white/70 dark:bg-stone-900/60 rounded border border-stone-200/80 dark:border-stone-700/80 shadow-xs">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans mb-1 font-semibold flex items-center justify-between">
              <span>Figure 1: Binary Search Tree Invariant</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">Hand-sketched</span>
            </div>
            <svg viewBox="0 0 380 180" className="w-full max-w-sm mx-auto h-auto text-blue-900 dark:text-blue-200 stroke-current fill-none">
              {/* Root Node 8 */}
              <circle cx="190" cy="30" r="16" strokeWidth="2" strokeDasharray="60" strokeDashoffset="0" className="fill-blue-50 dark:fill-stone-800" />
              <text x="190" y="36" textAnchor="middle" className="text-base font-hand-caveat fill-current stroke-none font-bold">8</text>

              {/* Edge to 3 */}
              <path d="M 178 40 L 112 75" strokeWidth="1.8" strokeLinecap="round" />
              <text x="135" y="52" className="text-xs font-hand-kalam fill-stone-500 stroke-none">&lt; 8</text>

              {/* Edge to 10 */}
              <path d="M 202 40 L 268 75" strokeWidth="1.8" strokeLinecap="round" />
              <text x="240" y="52" className="text-xs font-hand-kalam fill-stone-500 stroke-none">&gt; 8</text>

              {/* Node 3 */}
              <circle cx="100" cy="85" r="15" strokeWidth="2" className="fill-blue-50 dark:fill-stone-800" />
              <text x="100" y="91" textAnchor="middle" className="text-base font-hand-caveat fill-current stroke-none font-bold">3</text>

              {/* Node 10 */}
              <circle cx="280" cy="85" r="15" strokeWidth="2" className="fill-blue-50 dark:fill-stone-800" />
              <text x="280" y="91" textAnchor="middle" className="text-base font-hand-caveat fill-current stroke-none font-bold">10</text>

              {/* Edges from 3 to 1 and 6 */}
              <path d="M 90 97 L 55 135" strokeWidth="1.6" />
              <path d="M 110 97 L 145 135" strokeWidth="1.6" />

              {/* Node 1 */}
              <circle cx="45" cy="145" r="14" strokeWidth="1.8" className="fill-blue-50 dark:fill-stone-800" />
              <text x="45" y="151" textAnchor="middle" className="text-sm font-hand-caveat fill-current stroke-none font-bold">1</text>

              {/* Node 6 */}
              <circle cx="155" cy="145" r="14" strokeWidth="1.8" className="fill-blue-50 dark:fill-stone-800" />
              <text x="155" y="151" textAnchor="middle" className="text-sm font-hand-caveat fill-current stroke-none font-bold">6</text>

              {/* Edges from 10 to 14 */}
              <path d="M 290 97 L 325 135" strokeWidth="1.6" />
              <circle cx="335" cy="145" r="14" strokeWidth="1.8" className="fill-blue-50 dark:fill-stone-800" />
              <text x="335" y="151" textAnchor="middle" className="text-sm font-hand-caveat fill-current stroke-none font-bold">14</text>

              {/* In-order note */}
              <path d="M 40 170 C 120 175, 260 175, 340 170" strokeWidth="1.2" strokeDasharray="3 3" className="stroke-amber-600" />
              <text x="190" y="172" textAnchor="middle" className="text-[11px] font-hand-kalam fill-amber-700 dark:fill-amber-400 stroke-none font-bold">
                In-order: 1 → 3 → 6 → 8 → 10 → 14 (Sorted!)
              </text>
            </svg>
          </div>
        );

      case 'matrix':
        return (
          <div className="my-4 p-3 bg-white/70 dark:bg-stone-900/60 rounded border border-stone-200/80 dark:border-stone-700/80">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans mb-1 font-semibold">
              Figure 1: Matrix Transformation & Eigenspace Scaling
            </div>
            <div className="flex flex-wrap items-center justify-around gap-4 py-2 font-hand-caveat text-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 text-3xl font-light">[</span>
                <div className="text-center font-bold">
                  <div>4 &nbsp; 1</div>
                  <div>2 &nbsp; 3</div>
                </div>
                <span className="text-stone-400 text-3xl font-light">]</span>
                <span className="mx-1">·</span>
                <span className="text-stone-400 text-3xl font-light">[</span>
                <div className="text-center font-bold text-amber-600 dark:text-amber-400">
                  <div>1</div>
                  <div>1</div>
                </div>
                <span className="text-stone-400 text-3xl font-light">]</span>
                <span className="mx-1">=</span>
                <span className="text-stone-400 text-3xl font-light">[</span>
                <div className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                  <div>5</div>
                  <div>5</div>
                </div>
                <span className="text-stone-400 text-3xl font-light">]</span>
                <span className="mx-1">= 5 ·</span>
                <span className="text-stone-400 text-3xl font-light">[</span>
                <div className="text-center font-bold text-amber-600 dark:text-amber-400">
                  <div>1</div>
                  <div>1</div>
                </div>
                <span className="text-stone-400 text-3xl font-light">]</span>
              </div>
            </div>
            <p className="text-xs font-hand-kalam text-stone-600 dark:text-stone-300 mt-1 italic text-center">
              Notice: v = [1, 1]ᵀ is strictly scaled by λ = 5! Direction unchanged.
            </p>
          </div>
        );

      case 'paging':
        return (
          <div className="my-4 p-3 bg-white/70 dark:bg-stone-900/60 rounded border border-stone-200/80 dark:border-stone-700/80">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans mb-1 font-semibold">
              Figure 1: Hardware Address Translation Scheme
            </div>
            <div className="space-y-3 font-hand-caveat text-lg">
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs font-semibold text-stone-500 w-16">Virtual:</span>
                <div className="flex border-2 border-dashed border-blue-600 dark:border-blue-400 rounded overflow-hidden text-center text-sm font-bold">
                  <div className="bg-blue-100 dark:bg-blue-950/80 px-4 py-1.5 border-r border-blue-600">VPN (20 bits)</div>
                  <div className="bg-amber-100 dark:bg-amber-950/80 px-4 py-1.5 text-amber-900 dark:text-amber-200">Offset (12 bits)</div>
                </div>
              </div>
              <div className="flex justify-center my-1 text-sm font-hand-kalam text-stone-500">
                <span>↓ (Index into Page Table via MMU) &nbsp; &nbsp; &nbsp; ↓ (Passed Unchanged)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs font-semibold text-stone-500 w-16">Physical:</span>
                <div className="flex border-2 border-stone-700 dark:border-stone-300 rounded overflow-hidden text-center text-sm font-bold">
                  <div className="bg-emerald-100 dark:bg-emerald-950/80 px-4 py-1.5 border-r border-stone-700 text-emerald-900 dark:text-emerald-200">PPN (20 bits)</div>
                  <div className="bg-amber-100 dark:bg-amber-950/80 px-4 py-1.5 text-amber-900 dark:text-amber-200">Offset (12 bits)</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'benzene':
        return (
          <div className="my-4 p-3 bg-white/70 dark:bg-stone-900/60 rounded border border-stone-200/80 dark:border-stone-700/80">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans mb-1 font-semibold">
              Figure 1: The Arenium Ion (Sigma Complex) Resonance
            </div>
            <svg viewBox="0 0 400 130" className="w-full max-w-md mx-auto h-auto text-blue-900 dark:text-blue-200 stroke-current fill-none">
              {/* Benzene Ring */}
              <polygon points="40,25 65,10 90,25 90,55 65,70 40,55" strokeWidth="2" />
              <circle cx="65" cy="40" r="14" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="105" y="45" className="text-base font-hand-kalam fill-current stroke-none font-bold">+ E⁺ →</text>

              {/* Sigma complex intermediate */}
              <g transform="translate(140, 0)">
                <path d="M 40,25 L 65,10 L 90,25 L 90,55 L 65,70 L 40,55" strokeWidth="2" strokeDasharray="30 10 20" />
                {/* Bonds to H and E */}
                <line x1="65" y1="10" x2="52" y2="-6" strokeWidth="1.8" />
                <line x1="65" y1="10" x2="78" y2="-6" strokeWidth="1.8" />
                <text x="48" y="-9" textAnchor="end" className="text-xs font-hand-kalam fill-current stroke-none font-bold">H</text>
                <text x="82" y="-9" textAnchor="start" className="text-xs font-hand-kalam fill-red-600 dark:fill-red-400 stroke-none font-bold">E</text>
                {/* Delocalized positive charge */}
                <path d="M 46,50 C 46,28 84,28 84,50" strokeWidth="1.5" strokeDasharray="3 2" />
                <text x="65" y="44" textAnchor="middle" className="text-xs font-hand-kalam fill-red-600 dark:fill-red-400 stroke-none font-bold">⊕</text>
                <text x="65" y="86" textAnchor="middle" className="text-[10px] font-sans fill-stone-500 stroke-none font-medium">Arenium Ion (slow)</text>
              </g>

              {/* Deprotonation arrow */}
              <text x="260" y="45" className="text-base font-hand-kalam fill-current stroke-none font-bold">→ -H⁺ →</text>

              {/* Substituted Benzene */}
              <g transform="translate(305, 0)">
                <polygon points="40,25 65,10 90,25 90,55 65,70 40,55" strokeWidth="2" />
                <circle cx="65" cy="40" r="14" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="65" y1="10" x2="65" y2="-6" strokeWidth="2" />
                <text x="65" y="-10" textAnchor="middle" className="text-xs font-hand-kalam fill-red-600 dark:fill-red-400 stroke-none font-bold">E</text>
                <text x="65" y="86" textAnchor="middle" className="text-[10px] font-sans fill-emerald-600 dark:fill-emerald-400 stroke-none font-medium">Aromatic Restored!</text>
              </g>
            </svg>
          </div>
        );

      case 'rlc':
        return (
          <div className="my-4 p-3 bg-white/70 dark:bg-stone-900/60 rounded border border-stone-200/80 dark:border-stone-700/80">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans mb-1 font-semibold">
              Figure 1: Series RLC Circuit & Phasor Triangle
            </div>
            <svg viewBox="0 0 380 120" className="w-full max-w-sm mx-auto h-auto text-blue-900 dark:text-blue-200 stroke-current fill-none">
              {/* AC Source */}
              <circle cx="40" cy="60" r="16" strokeWidth="2" />
              <path d="M 33 60 C 37 54, 43 66, 47 60" strokeWidth="1.8" />
              <text x="40" y="90" textAnchor="middle" className="text-xs font-hand-kalam fill-current stroke-none font-bold">Vs(t)</text>

              {/* Wire up */}
              <path d="M 40 44 L 40 25 L 90 25" strokeWidth="1.8" />

              {/* Resistor R */}
              <path d="M 90 25 L 96 17 L 108 33 L 120 17 L 132 33 L 138 25" strokeWidth="2" />
              <text x="114" y="12" textAnchor="middle" className="text-xs font-hand-kalam fill-current stroke-none font-bold">R</text>

              {/* Wire to Inductor */}
              <path d="M 138 25 L 165 25" strokeWidth="1.8" />

              {/* Inductor L */}
              <path d="M 165 25 C 165 14, 175 14, 175 25 C 175 14, 185 14, 185 25 C 185 14, 195 14, 195 25" strokeWidth="2" />
              <text x="180" y="12" textAnchor="middle" className="text-xs font-hand-kalam fill-current stroke-none font-bold">L (jωL)</text>

              {/* Wire to Capacitor */}
              <path d="M 195 25 L 225 25" strokeWidth="1.8" />

              {/* Capacitor C */}
              <line x1="225" y1="15" x2="225" y2="35" strokeWidth="2.5" />
              <line x1="233" y1="15" x2="233" y2="35" strokeWidth="2.5" />
              <text x="229" y="12" textAnchor="middle" className="text-xs font-hand-kalam fill-current stroke-none font-bold">C (1/jωC)</text>

              {/* Wire down and back */}
              <path d="M 233 25 L 270 25 L 270 95 L 40 95 L 40 76" strokeWidth="1.8" />

              {/* Resonance note */}
              <text x="325" y="55" textAnchor="middle" className="text-xs font-hand-kalam fill-amber-700 dark:fill-amber-300 stroke-none font-bold">
                At ω = 1/√LC:
              </text>
              <text x="325" y="75" textAnchor="middle" className="text-xs font-hand-caveat fill-emerald-600 dark:fill-emerald-400 stroke-none font-bold">
                Z = R + j0 = R
              </text>
            </svg>
          </div>
        );

      case 'dijkstra':
        return (
          <div className="my-4 p-3 bg-white/70 dark:bg-stone-900/60 rounded border border-stone-200/80 dark:border-stone-700/80">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans mb-1 font-semibold">
              Figure 1: Dijkstra Relaxation Step
            </div>
            <svg viewBox="0 0 340 110" className="w-full max-w-xs mx-auto h-auto text-blue-900 dark:text-blue-200 stroke-current fill-none">
              <circle cx="50" cy="55" r="18" strokeWidth="2" className="fill-emerald-100 dark:fill-emerald-950" />
              <text x="50" y="60" textAnchor="middle" className="text-sm font-hand-caveat fill-current stroke-none font-bold">S [0]</text>

              <path d="M 68 55 L 152 25" strokeWidth="2" markerEnd="url(#arrow)" />
              <text x="105" y="32" className="text-xs font-hand-kalam fill-stone-600 stroke-none font-bold">w=4</text>

              <circle cx="170" cy="25" r="18" strokeWidth="2" className="fill-amber-100 dark:fill-amber-950" />
              <text x="170" y="30" textAnchor="middle" className="text-sm font-hand-caveat fill-current stroke-none font-bold">A [4]</text>

              <path d="M 68 55 L 152 85" strokeWidth="2" />
              <text x="105" y="85" className="text-xs font-hand-kalam fill-stone-600 stroke-none font-bold">w=2</text>

              <circle cx="170" cy="85" r="18" strokeWidth="2" className="fill-amber-100 dark:fill-amber-950" />
              <text x="170" y="90" textAnchor="middle" className="text-sm font-hand-caveat fill-current stroke-none font-bold">B [2]</text>

              <path d="M 188 85 L 262 55" strokeWidth="2" />
              <text x="220" y="82" className="text-xs font-hand-kalam fill-stone-600 stroke-none font-bold">w=1</text>

              <circle cx="280" cy="55" r="18" strokeWidth="2" className="fill-blue-100 dark:fill-blue-950" />
              <text x="280" y="60" textAnchor="middle" className="text-sm font-hand-caveat fill-current stroke-none font-bold">C [3]</text>

              <path d="M 188 25 L 262 55" strokeWidth="1.5" strokeDasharray="3 3" className="stroke-stone-400" />
              <text x="230" y="32" className="text-xs font-hand-kalam fill-stone-400 stroke-none">w=5</text>
            </svg>
          </div>
        );

      case 'threads':
        return (
          <div className="my-4 p-3 bg-white/70 dark:bg-stone-900/60 rounded border border-stone-200/80 dark:border-stone-700/80">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans mb-1 font-semibold">
              Figure 1: The Lost Update Race Condition (count++)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-hand-caveat text-base">
              <div className="bg-red-50 dark:bg-red-950/40 p-2 rounded border border-red-200 dark:border-red-900">
                <span className="font-sans font-bold text-red-600 text-xs block mb-1">Thread A</span>
                <div>1. Read count (5)</div>
                <div>2. Add 1 (local reg: 6)</div>
                <div className="text-stone-400">··· sleep / preempted ···</div>
                <div className="font-bold text-red-700 dark:text-red-400">4. Write count = 6</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded border border-blue-200 dark:border-blue-900">
                <span className="font-sans font-bold text-blue-600 text-xs block mb-1">Shared RAM</span>
                <div className="mt-4 font-bold text-lg text-stone-800 dark:text-stone-200">count = 5</div>
                <div className="my-2">↓</div>
                <div className="font-bold text-lg text-red-600">count = 6 ✘</div>
                <div className="text-[10px] text-red-600 font-sans">(Should be 7!)</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-900">
                <span className="font-sans font-bold text-amber-600 text-xs block mb-1">Thread B</span>
                <div className="text-stone-400">··· waiting ···</div>
                <div>2. Read count (5)</div>
                <div>3. Add 1 (local reg: 6)</div>
                <div className="font-bold text-amber-700 dark:text-amber-400">3. Write count = 6</div>
              </div>
            </div>
          </div>
        );

      case 'integral':
        return (
          <div className="my-4 p-3 bg-white/70 dark:bg-stone-900/60 rounded border border-stone-200/80 dark:border-stone-700/80">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans mb-1 font-semibold">
              Figure 1: Green&apos;s Theorem Boundary vs Vortex Cancellation
            </div>
            <svg viewBox="0 0 340 120" className="w-full max-w-xs mx-auto h-auto text-blue-900 dark:text-blue-200 stroke-current fill-none">
              {/* Outer boundary curve C */}
              <ellipse cx="170" cy="60" rx="120" ry="45" strokeWidth="2.5" className="fill-blue-50/50 dark:fill-blue-950/30" />
              {/* Direction arrows CCW */}
              <path d="M 170 15 L 160 11 M 170 15 L 160 19" strokeWidth="2" strokeLinecap="round" />
              <path d="M 170 105 L 180 101 M 170 105 L 180 109" strokeWidth="2" strokeLinecap="round" />
              <text x="170" y="8" textAnchor="middle" className="text-xs font-hand-kalam fill-current stroke-none font-bold">∮_C F · dr (CCW boundary)</text>

              {/* Internal micro vortices */}
              <circle cx="130" cy="55" r="14" strokeWidth="1.4" strokeDasharray="3 2" className="stroke-amber-600" />
              <circle cx="170" cy="55" r="14" strokeWidth="1.4" strokeDasharray="3 2" className="stroke-amber-600" />
              <circle cx="210" cy="55" r="14" strokeWidth="1.4" strokeDasharray="3 2" className="stroke-amber-600" />
              <text x="170" y="58" textAnchor="middle" className="text-xs font-hand-caveat fill-amber-700 dark:fill-amber-300 stroke-none font-bold">
                curl(F) dA
              </text>
              <text x="170" y="78" textAnchor="middle" className="text-[10px] font-sans fill-stone-500 stroke-none">
                Interior arrows cancel out!
              </text>
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  const getHighlightClass = (color?: string) => {
    switch (color) {
      case 'yellow':
        return 'highlighter-yellow';
      case 'cyan':
        return 'highlighter-cyan';
      case 'pink':
        return 'highlighter-pink';
      case 'green':
        return 'highlighter-green';
      default:
        return '';
    }
  };

  const visual = page.visualContent || {
    headerTitle: page.title || 'Handwritten Notes',
    dateText: 'Verified Study Note',
    sections: [
      {
        heading: page.ocrContent?.title || 'Extracted Notes',
        paragraphs: page.ocrContent?.rawText ? page.ocrContent.rawText.split('\n').filter(Boolean) : ['No notes available'],
      },
    ],
  };

  return (
    <div
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
      className={`relative transition-transform duration-150 select-text ${getPaperClass()} ${getInkColor()} rounded-sm shadow-md overflow-hidden ${
        compact ? 'p-4 min-h-[380px] max-h-[460px]' : 'p-6 sm:p-10 min-h-[820px] max-w-3xl mx-auto'
      }`}
    >
      {/* Page Header (Handwritten Style) */}
      <div className="border-b-2 border-stone-300/80 dark:border-stone-700 pb-3 mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-hand-caveat text-2xl sm:text-3xl font-extrabold tracking-wide uppercase">
            {visual.headerTitle}
          </h2>
          <div className="font-hand-kalam text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {visual.dateText}
          </div>
        </div>
        <div className="text-right">
          <div className="font-hand-caveat text-xl sm:text-2xl font-bold text-stone-400">
            pg. {page.pageNumber || 1}
          </div>
        </div>
      </div>

      {/* Page Body Content */}
      <div className="space-y-6">
        {(visual.sections || []).map((sec, idx) => (
          <div key={idx} className="relative group">
            {/* Margin Note if present */}
            {sec.sideMarginNote && !compact && (
              <div className="hidden lg:block absolute -left-36 top-1 w-32 font-hand-architect text-xs text-red-600 dark:text-red-400 leading-snug p-1.5 border-l-2 border-red-400/70 bg-red-50/60 dark:bg-red-950/40 rounded-r">
                <span className="font-bold block text-[10px] uppercase font-sans tracking-wider">Note:</span>
                {sec.sideMarginNote}
              </div>
            )}

            {sec.heading && (
              <h3 className="font-hand-kalam text-lg sm:text-xl font-bold mb-1.5 flex items-center gap-2">
                <span className={getHighlightClass(sec.highlight)}>{sec.heading}</span>
              </h3>
            )}

            <div className="space-y-2 font-hand-caveat text-lg sm:text-xl leading-relaxed">
              {(sec.paragraphs || []).map((p, pIdx) => (
                <p key={pIdx} className="relative pl-1">
                  {p}
                </p>
              ))}
            </div>

            {/* In-line Margin note on small screens */}
            {sec.sideMarginNote && (
              <div className="lg:hidden mt-2 font-hand-architect text-xs text-red-600 dark:text-red-400 p-2 bg-red-50/70 dark:bg-red-950/40 border-l-2 border-red-500 rounded">
                <span className="font-bold">★ Marginalia: </span>
                {sec.sideMarginNote}
              </div>
            )}

            {/* Diagram */}
            {renderDiagram(sec.diagramType)}

            {/* Annotations */}
            {sec.annotations && sec.annotations.length > 0 && (
              <div className="mt-2 pl-3 border-l-2 border-amber-400/80 text-sm font-hand-kalam text-amber-800 dark:text-amber-300">
                {sec.annotations.map((ann, aIdx) => (
                  <div key={aIdx}>✓ {ann}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Page Footer */}
      <div className="mt-12 pt-4 border-t border-stone-300/60 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400 font-hand-kalam">
        <span>Handwritten NoteVault Archive · ID: #{page.id}</span>
        <span>Page {page.pageNumber}</span>
      </div>
    </div>
  );
};
