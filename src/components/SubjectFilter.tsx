import React from 'react';
import { 
  Layers, 
  Binary, 
  Calculator, 
  Atom, 
  Zap, 
  FlaskConical, 
  Network, 
  HardDrive,
  ArrowUpDown
} from 'lucide-react';
import { Subject } from '../types/notes';

export type SortOption = 'upvotes' | 'rating' | 'newest' | 'title';

interface SubjectFilterProps {
  selectedSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  subjectCounts: Record<string, number>;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalNotes: number;
}

interface SubjectItem {
  id: Subject;
  label: string;
  icon: React.ReactNode;
}

export const SubjectFilter: React.FC<SubjectFilterProps> = ({
  selectedSubject,
  onSelectSubject,
  subjectCounts,
  sortBy,
  onSortChange,
  totalNotes,
}) => {
  const SUBJECTS: SubjectItem[] = [
    { id: 'All', label: 'All Subjects', icon: <Layers className="w-4 h-4" /> },
    { id: 'Computer Science', label: 'Computer Science', icon: <Binary className="w-4 h-4" /> },
    { id: 'Mathematics', label: 'Mathematics', icon: <Calculator className="w-4 h-4" /> },
    { id: 'Physics', label: 'Physics', icon: <Atom className="w-4 h-4" /> },
    { id: 'Electrical Engineering', label: 'Electrical Eng.', icon: <Zap className="w-4 h-4" /> },
    { id: 'Chemistry', label: 'Chemistry', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'Data Structures', label: 'Data Structures', icon: <Network className="w-4 h-4" /> },
    { id: 'Operating Systems', label: 'Operating Systems', icon: <HardDrive className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Category Explorer Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-stone-200/60 dark:border-stone-800">
        {/* Scrollable Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {SUBJECTS.map((sub) => {
            const count = sub.id === 'All' ? totalNotes : (subjectCounts[sub.id] || 0);
            const isSelected = selectedSubject === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/30'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-stone-400 dark:text-stone-500'}>
                  {sub.icon}
                </span>
                <span>{sub.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-amber-700/80 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 font-medium text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          >
            <option value="upvotes">Most Upvoted</option>
            <option value="rating">Highest Readability</option>
            <option value="newest">Recently Added</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
