import React, { useState } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bookmark, 
  Sparkles, 
  BookMarked,
  Filter,
  LogIn,
  LogOut,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { Subject } from '../types/notes';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  bookmarkCount: number;
  showOnlyBookmarks: boolean;
  onToggleShowBookmarks: () => void;
  onOpenDigitizer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSelectSubject,
  isDarkMode,
  onToggleDarkMode,
  bookmarkCount,
  showOnlyBookmarks,
  onToggleShowBookmarks,
  onOpenDigitizer,
}) => {
  const { user, login, logout, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-2 sm:gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-xs shadow-amber-500/20 shrink-0">
              <BookMarked className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900 dark:text-stone-100 font-sans">
                  Note<span className="text-amber-600 dark:text-amber-400">Vault</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 hidden sm:block -mt-0.5">
                Digitized STEM Handwritten Notes
              </p>
            </div>
          </div>

          {/* Center Search Bar with Subject Quick-Filter (Desktop & Tablet) */}
          <div className="flex-1 max-w-2xl hidden sm:flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search handwritten notes, formulas, topics, or authors..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Category dropdown for tablet & desktop */}
            <div className="relative hidden md:block shrink-0">
              <select
                value={selectedSubject}
                onChange={(e) => onSelectSubject(e.target.value as Subject)}
                className="pl-3 pr-8 py-2 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-700 dark:text-stone-200 appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="All">All Subjects</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Operating Systems">Operating Systems</option>
              </select>
              <Filter className="w-3 h-3 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              title="Search Notes"
              className="p-2 sm:hidden rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* AI Note Digitizer button */}
            <button
              onClick={onOpenDigitizer}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Upload &amp; Digitize</span>
              <span className="sm:hidden">Digitize</span>
            </button>

            {/* Bookmarks toggle button */}
            <button
              onClick={onToggleShowBookmarks}
              title={showOnlyBookmarks ? 'Show all notes' : 'Show saved bookmarks'}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                showOnlyBookmarks
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${showOnlyBookmarks ? 'fill-current text-amber-600' : ''}`} />
              <span className="hidden lg:inline">Bookmarks</span>
              {bookmarkCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>

            {/* Firebase Auth Google Sign In Button / User Menu */}
            <div className="relative">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse" />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 p-1 rounded-full border border-amber-300 dark:border-amber-800 hover:ring-2 hover:ring-amber-500/30 transition-all"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-stone-200 dark:border-stone-800">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt=""
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-bold text-stone-900 dark:text-stone-100 truncate">
                            {user.displayName || 'STEM Scholar'}
                          </p>
                          <p className="text-[10px] text-stone-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="py-2 text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Firestore Cloud Sync Active</span>
                        </div>
                        <p className="text-[10px] text-stone-400">
                          Reading sessions &amp; bookmarks backed up to Firebase
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full mt-2 pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 text-rose-600 hover:text-rose-700 py-1 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold transition-colors border border-stone-200 dark:border-stone-700"
                  title="Sign in with Google"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        {isMobileSearchOpen && (
          <div className="sm:hidden pb-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search notes, formulas, topics..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
