/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Bookmark, 
  HelpCircle,
  FolderOpen,
  Play,
  RotateCcw,
  Globe,
  Database,
  Headphones
} from 'lucide-react';
import { Note, Subject, StudySession, StudyHistoryItem } from './types/notes';
import { INITIAL_NOTES } from './data/mockNotes';
import { Navbar } from './components/Navbar';
import { SubjectFilter, SortOption } from './components/SubjectFilter';
import { NoteCard } from './components/NoteCard';
import { NoteViewerModal } from './components/NoteViewerModal';
import { DigitizerModal } from './components/DigitizerModal';
import { StudyBot } from './components/StudyBot';
import { SearchGroundingModal } from './components/SearchGroundingModal';
import { AudioTranscribeModal } from './components/AudioTranscribeModal';
import { VeoVideoModal } from './components/VeoVideoModal';
import { StudySpotsModal } from './components/StudySpotsModal';
import { FocusMusicModal } from './components/FocusMusicModal';
import { DiagramStudioModal } from './components/DiagramStudioModal';
import { LiveVoiceTutorModal } from './components/LiveVoiceTutorModal';
import { ProductivityBar } from './components/ProductivityBar';
import { exportNoteToPdf } from './utils/exportPdf';
import { useAuth } from './context/AuthContext';
import { 
  saveStudySessionToFirestore, 
  addStudyHistoryItemToFirestore, 
  fetchUserStudyDataFromFirestore,
  saveCommunityNoteToFirestore,
  fetchCommunityNotesFromFirestore,
  db
} from './services/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function App() {
  const { user } = useAuth();

  // Persisted state
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notevault_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_NOTES;
      }
    }
    return INITIAL_NOTES;
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('notevault_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['note-bst', 'note-linalg'];
      }
    }
    return ['note-bst', 'note-linalg'];
  });

  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('notevault_upvotes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('notevault_darkmode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Study Session Memory (Last Subject & Note where user left off)
  const [lastSession, setLastSession] = useState<StudySession | null>(() => {
    const saved = localStorage.getItem('notevault_last_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    // Default initial session so user has immediate context to resume
    return {
      lastNoteId: 'note-os',
      lastNoteTitle: 'Operating Systems: Virtual Memory & Page Tables',
      lastSubject: 'Operating Systems',
      lastTopic: 'Memory Management, TLB & Paging',
      lastPageIndex: 1,
      totalPages: 2,
      lastUpdated: Date.now() - 1000 * 60 * 18, // 18 mins ago
    };
  });

  const [studyHistory, setStudyHistory] = useState<StudyHistoryItem[]>(() => {
    const saved = localStorage.getItem('notevault_study_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        noteId: 'note-os',
        noteTitle: 'Operating Systems: Virtual Memory & Page Tables',
        subject: 'Operating Systems',
        topic: 'Memory Management, TLB & Paging',
        lastPageIndex: 1,
        totalPages: 2,
        timestamp: Date.now() - 1000 * 60 * 18,
      },
      {
        noteId: 'note-bst',
        noteTitle: 'Binary Search Trees & AVL Balance Properties',
        subject: 'Data Structures',
        topic: 'Trees & Self-Balancing Data Structures',
        lastPageIndex: 2,
        totalPages: 3,
        timestamp: Date.now() - 1000 * 60 * 75,
      },
      {
        noteId: 'note-linalg',
        noteTitle: 'Linear Algebra: Eigenvalues & Diagonalization',
        subject: 'Mathematics',
        topic: 'Spectral Theorem & Matrix Decompositions',
        lastPageIndex: 0,
        totalPages: 2,
        timestamp: Date.now() - 1000 * 60 * 180,
      },
    ];
  });

  // Sync with Firestore when user logs in
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function loadCloudData() {
      try {
        const cloudData = await fetchUserStudyDataFromFirestore(user!.uid);
        if (cloudData && isMounted) {
          if (cloudData.studySession) {
            setLastSession(cloudData.studySession);
          }
          if (cloudData.history && cloudData.history.length > 0) {
            setStudyHistory(cloudData.history);
          }
          if (cloudData.bookmarkedNoteIds && cloudData.bookmarkedNoteIds.length > 0) {
            setBookmarkedIds((prev) => Array.from(new Set([...prev, ...cloudData.bookmarkedNoteIds])));
          }
          if (cloudData.upvotedNoteIds && cloudData.upvotedNoteIds.length > 0) {
            setUpvotedIds((prev) => Array.from(new Set([...prev, ...cloudData.upvotedNoteIds])));
          }
        }
      } catch (e) {
        console.warn('Could not load user data from Firestore:', e);
      }
    }

    loadCloudData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Load community uploaded notes from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCommunity() {
      try {
        const communityNotes = await fetchCommunityNotesFromFirestore();
        if (communityNotes && communityNotes.length > 0 && isMounted) {
          setNotes((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newOnes = communityNotes.filter((cn) => !existingIds.has(cn.id));
            return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
          });
        }
      } catch (err) {
        console.warn('Could not load community notes:', err);
      }
    }
    loadCommunity();
    return () => {
      isMounted = false;
    };
  }, []);

  // UI filters & navigation
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('All');
  const [sortBy, setSortBy] = useState<SortOption>('upvotes');
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState<boolean>(false);

  // Modals state
  const [viewerNote, setViewerNote] = useState<Note | null>(null);
  const [viewerInitialPageIndex, setViewerInitialPageIndex] = useState<number>(0);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [isDigitizerOpen, setIsDigitizerOpen] = useState<boolean>(false);

  // Google Search Grounding Modal state
  const [isSearchGroundingOpen, setIsSearchGroundingOpen] = useState<boolean>(false);
  const [searchGroundingQuery, setSearchGroundingQuery] = useState<string>('');

  // AI Study Suite Modals state
  const [isTranscribeOpen, setIsTranscribeOpen] = useState<boolean>(false);
  const [isVeoVideoOpen, setIsVeoVideoOpen] = useState<boolean>(false);
  const [isStudySpotsOpen, setIsStudySpotsOpen] = useState<boolean>(false);
  const [isFocusMusicOpen, setIsFocusMusicOpen] = useState<boolean>(false);
  const [isDiagramStudioOpen, setIsDiagramStudioOpen] = useState<boolean>(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);
  const [toolContextNote, setToolContextNote] = useState<Note | null>(null);

  // Background Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [currentMusicTrack, setCurrentMusicTrack] = useState<string>('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Sync dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('notevault_darkmode', String(isDarkMode));
  }, [isDarkMode]);

  // Sync bookmarks to localStorage & Firestore
  useEffect(() => {
    localStorage.setItem('notevault_bookmarks', JSON.stringify(bookmarkedIds));
    if (user) {
      setDoc(doc(db, 'users', user.uid), { bookmarkedNoteIds: bookmarkedIds }, { merge: true }).catch(() => {});
    }
  }, [bookmarkedIds, user]);

  // Sync upvotes to localStorage & Firestore
  useEffect(() => {
    localStorage.setItem('notevault_upvotes', JSON.stringify(upvotedIds));
    if (user) {
      setDoc(doc(db, 'users', user.uid), { upvotedNoteIds: upvotedIds }, { merge: true }).catch(() => {});
    }
  }, [upvotedIds, user]);

  // Sync notes when new ones are added
  useEffect(() => {
    localStorage.setItem('notevault_notes', JSON.stringify(notes));
  }, [notes]);

  // Sync study memory
  useEffect(() => {
    if (lastSession) {
      localStorage.setItem('notevault_last_session', JSON.stringify(lastSession));
    } else {
      localStorage.removeItem('notevault_last_session');
    }
  }, [lastSession]);

  useEffect(() => {
    localStorage.setItem('notevault_study_history', JSON.stringify(studyHistory));
  }, [studyHistory]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleBookmark = (noteId: string) => {
    setBookmarkedIds((prev) => {
      const isAlready = prev.includes(noteId);
      if (isAlready) {
        showToast('Removed from Bookmarks');
        return prev.filter((id) => id !== noteId);
      } else {
        showToast('Saved to Bookmarks');
        return [...prev, noteId];
      }
    });
  };

  const handleUpvote = (noteId: string) => {
    setUpvotedIds((prev) => {
      if (prev.includes(noteId)) {
        showToast('Upvote removed');
        return prev.filter((id) => id !== noteId);
      } else {
        showToast('Thank you for upvoting!');
        return [...prev, noteId];
      }
    });
  };

  const handleOpenQuickView = (note: Note, initialPage: number = 0) => {
    setViewerNote(note);
    setViewerInitialPageIndex(initialPage);
    setIsViewerOpen(true);
  };

  const handleOpenOCR = (note: Note) => {
    setViewerNote(note);
    setViewerInitialPageIndex(0);
    setIsViewerOpen(true);
  };

  // Called whenever user reads/turns pages in the note viewer
  const handlePageVisited = (note: Note, pageIndex: number) => {
    const updatedSession: StudySession = {
      lastNoteId: note.id,
      lastNoteTitle: note.title,
      lastSubject: note.subject,
      lastTopic: note.topic,
      lastPageIndex: pageIndex,
      totalPages: note.totalPages,
      lastUpdated: Date.now(),
    };

    setLastSession(updatedSession);

    const newHistoryItem: StudyHistoryItem = {
      noteId: note.id,
      noteTitle: note.title,
      subject: note.subject,
      topic: note.topic,
      lastPageIndex: pageIndex,
      totalPages: note.totalPages,
      timestamp: Date.now(),
    };

    setStudyHistory((prev) => {
      const filtered = prev.filter((item) => item.noteId !== note.id);
      return [newHistoryItem, ...filtered].slice(0, 15);
    });

    // Sync to Firestore if authenticated
    if (user) {
      saveStudySessionToFirestore(user.uid, updatedSession);
      addStudyHistoryItemToFirestore(user.uid, newHistoryItem);
    }
  };

  // Resume note directly at saved page
  const handleResumeNote = (noteId: string, pageIndex: number) => {
    const target = notes.find((n) => n.id === noteId);
    if (target) {
      setViewerNote(target);
      setViewerInitialPageIndex(pageIndex);
      setIsViewerOpen(true);
      showToast(`Resumed "${target.title}" on Page ${pageIndex + 1}`);
    }
  };

  const handleClearHistory = () => {
    setStudyHistory([]);
    setLastSession(null);
    localStorage.removeItem('notevault_study_history');
    localStorage.removeItem('notevault_last_session');
    showToast('Study reading history cleared');
  };

  const handleDownload = (note: Note) => {
    showToast(`Preparing ${note.title} for download...`);
    exportNoteToPdf(note);
  };

  const handleSaveToLibrary = async (newNote: Note) => {
    setNotes((prev) => [newNote, ...prev]);
    showToast(`"${newNote.title}" successfully added to NoteVault!`);
    if (user) {
      await saveCommunityNoteToFirestore(newNote, user.uid);
    }
  };

  const handleOpenSearchGroundingModal = (queryText: string = '', _subject?: Subject) => {
    setSearchGroundingQuery(queryText);
    setIsSearchGroundingOpen(true);
  };

  // Compute subject counts dynamically
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((note) => {
      counts[note.subject] = (counts[note.subject] || 0) + 1;
    });
    return counts;
  }, [notes]);

  // Filter & Sort notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Filter by bookmarks if toggled
    if (showOnlyBookmarks) {
      result = result.filter((n) => bookmarkedIds.includes(n.id));
    }

    // Filter by subject
    if (selectedSubject !== 'All') {
      result = result.filter((n) => n.subject === selectedSubject);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) => {
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesTopic = n.topic.toLowerCase().includes(q);
        const matchesAuthor = n.author.name.toLowerCase().includes(q);
        const matchesSubject = n.subject.toLowerCase().includes(q);
        const matchesTags = n.tags.some((t) => t.toLowerCase().includes(q));
        const matchesOCR = Array.isArray(n.pages) && n.pages.some((p) => 
          (p?.ocrContent?.rawText && p.ocrContent.rawText.toLowerCase().includes(q)) ||
          (Array.isArray(p?.visualContent?.sections) && p.visualContent.sections.some(s => 
            Array.isArray(s?.paragraphs) && s.paragraphs.some(pText => typeof pText === 'string' && pText.toLowerCase().includes(q))
          ))
        );
        return matchesTitle || matchesTopic || matchesAuthor || matchesSubject || matchesTags || matchesOCR;
      });
    }

    // Sort results
    result.sort((a, b) => {
      const upvotesA = a.upvotes + (upvotedIds.includes(a.id) ? 1 : 0);
      const upvotesB = b.upvotes + (upvotedIds.includes(b.id) ? 1 : 0);

      switch (sortBy) {
        case 'upvotes':
          return upvotesB - upvotesA;
        case 'rating':
          return b.readabilityRating - a.readabilityRating;
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [notes, showOnlyBookmarks, bookmarkedIds, selectedSubject, searchQuery, sortBy, upvotedIds]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-200 dark:selection:bg-amber-900 pb-16">
      {/* Global Header with Firebase Auth */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        bookmarkCount={bookmarkedIds.length}
        showOnlyBookmarks={showOnlyBookmarks}
        onToggleShowBookmarks={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
        onOpenDigitizer={() => setIsDigitizerOpen(true)}
      />

      {/* AI Productivity & Study Tools Bar */}
      <ProductivityBar
        onOpenTranscribe={() => setIsTranscribeOpen(true)}
        onOpenVeoVideo={() => {
          setToolContextNote(viewerNote);
          setIsVeoVideoOpen(true);
        }}
        onOpenStudySpots={() => setIsStudySpotsOpen(true)}
        onOpenFocusMusic={() => setIsFocusMusicOpen(true)}
        onOpenDiagramStudio={() => {
          setToolContextNote(viewerNote);
          setIsDiagramStudioOpen(true);
        }}
        onOpenLiveVoice={() => {
          setToolContextNote(viewerNote);
          setIsLiveVoiceOpen(true);
        }}
        onOpenSearchGrounding={() => handleOpenSearchGroundingModal()}
      />

      {/* Hero Banner / Quick Overview with Last Subject Resume Strip & Google Search Grounding action */}
      <section className="border-b border-stone-200/80 dark:border-stone-800 bg-linear-to-b from-amber-500/5 via-stone-100/30 to-transparent dark:from-amber-500/5 dark:via-stone-900/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini Multimodal OCR &amp; Vision</span>
                </div>

                {/* Google Search Grounding Badge / Action */}
                <button
                  onClick={() => handleOpenSearchGroundingModal('', selectedSubject)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-200 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Google Search Grounding (gemini-3.5-flash)</span>
                </button>

                {user && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium">
                    <Database className="w-3 h-3 text-amber-500" />
                    <span>Firestore Cloud Synced</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                Curated handwritten notes for students &amp; engineers.
              </h1>
              <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
                Explore high-resolution, peer-reviewed handwritten notebooks across CS, Math, Physics, and Engineering. Inspect multi-page diagrams, zoom without losing fidelity, and ground your studying with real-time academic search citations.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="text-center px-2">
                <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                  {notes.length}
                </div>
                <div className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">
                  Note Sets
                </div>
              </div>
              <div className="text-center px-2 border-x border-stone-200 dark:border-stone-800">
                <div className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
                  {notes.reduce((acc, curr) => acc + curr.totalPages, 0)}
                </div>
                <div className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">
                  Pages Digitized
                </div>
              </div>
              <div className="text-center px-2">
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  98.4%
                </div>
                <div className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">
                  Avg OCR Score
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Strip: Where you left off */}
          {lastSession && (
            <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-900/60 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Pick Up Where You Left Off ({lastSession.lastSubject})
                    </span>
                    <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.2 rounded-md font-mono">
                      Page {lastSession.lastPageIndex + 1} of {lastSession.totalPages}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                    {lastSession.lastNoteTitle}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <button
                  onClick={() => setSelectedSubject(lastSession.lastSubject)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  View All in {lastSession.lastSubject}
                </button>
                <button
                  onClick={() => handleResumeNote(lastSession.lastNoteId, lastSession.lastPageIndex)}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Page {lastSession.lastPageIndex + 1}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Subject & Category Explorer */}
        <SubjectFilter
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          subjectCounts={subjectCounts}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalNotes={notes.length}
        />

        {/* Active filter pills / indicators if searching or bookmarked */}
        {(searchQuery || selectedSubject !== 'All' || showOnlyBookmarks) && (
          <div className="flex items-center justify-between text-xs text-stone-500 bg-stone-100/70 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Showing:</span>
              {showOnlyBookmarks && (
                <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                  <Bookmark className="w-3 h-3 fill-current" /> Bookmarked Only
                </span>
              )}
              {selectedSubject !== 'All' && (
                <span className="font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                  Subject: {selectedSubject}
                </span>
              )}
              {searchQuery && (
                <span className="font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                  Query: &quot;{searchQuery}&quot;
                </span>
              )}
              <span className="text-stone-400">({filteredNotes.length} matching)</span>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('All');
                setShowOnlyBookmarks(false);
              }}
              className="text-amber-700 dark:text-amber-400 hover:underline font-medium ml-2"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isBookmarked={bookmarkedIds.includes(note.id)}
                onToggleBookmark={handleToggleBookmark}
                onOpenQuickView={(n) => handleOpenQuickView(n, 0)}
                onDownload={handleDownload}
                onUpvote={handleUpvote}
                hasUpvoted={upvotedIds.includes(note.id)}
                onOpenOCR={handleOpenOCR}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 my-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
              No handwritten notes found
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6">
              We couldn&apos;t find any notes matching your current search query or subject filters. Try resetting filters or digitize your own handwritten notes!
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('All');
                  setShowOnlyBookmarks(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsDigitizerOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upload New Note
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Informative Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
              NV
            </div>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              NoteVault · Handwritten STEM Notes Library &amp; AI Digitizer
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => handleOpenSearchGroundingModal()}
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Search Grounding Tool</span>
            </button>
            <span>·</span>
            <span>Multimodal Gemini 3 Series</span>
            <span>·</span>
            <span>Firebase Firestore ABAC</span>
          </div>
        </div>
      </footer>

      {/* Full-Screen Note Viewer Modal with Page Progress Tracking */}
      <NoteViewerModal
        note={viewerNote}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        isBookmarked={viewerNote ? bookmarkedIds.includes(viewerNote.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onDownload={handleDownload}
        onUpvote={handleUpvote}
        hasUpvoted={viewerNote ? upvotedIds.includes(viewerNote.id) : false}
        initialPageIndex={viewerInitialPageIndex}
        onPageVisited={handlePageVisited}
        onOpenSearchGrounding={handleOpenSearchGroundingModal}
        onOpenVeoVideo={(note) => {
          setToolContextNote(note);
          setIsVeoVideoOpen(true);
        }}
        onOpenLiveVoice={(note) => {
          setToolContextNote(note);
          setIsLiveVoiceOpen(true);
        }}
        onOpenDiagramStudio={(note) => {
          setToolContextNote(note);
          setIsDiagramStudioOpen(true);
        }}
      />

      {/* AI Note Digitizer Modal */}
      <DigitizerModal
        isOpen={isDigitizerOpen}
        onClose={() => setIsDigitizerOpen(false)}
        onSaveToLibrary={handleSaveToLibrary}
      />

      {/* Google Search Grounding Modal */}
      <SearchGroundingModal
        isOpen={isSearchGroundingOpen}
        onClose={() => setIsSearchGroundingOpen(false)}
        defaultQuery={searchGroundingQuery}
        defaultSubject={selectedSubject}
      />

      {/* Audio Lecture & Dictation Transcriber (gemini-3.5-transcribe) */}
      <AudioTranscribeModal
        isOpen={isTranscribeOpen}
        onClose={() => setIsTranscribeOpen(false)}
        onSaveAsNote={handleSaveToLibrary}
      />

      {/* Veo 3 Whiteboard & Concept Video Generator (veo-3.1-fast-generate-preview) */}
      <VeoVideoModal
        isOpen={isVeoVideoOpen}
        onClose={() => setIsVeoVideoOpen(false)}
        activeNote={toolContextNote || viewerNote}
      />

      {/* Campus Study Spots & Libraries Finder (Google Maps Grounding) */}
      <StudySpotsModal
        isOpen={isStudySpotsOpen}
        onClose={() => setIsStudySpotsOpen(false)}
      />

      {/* Focus Music & Ambience Soundscapes (Lyria 3) */}
      <FocusMusicModal
        isOpen={isFocusMusicOpen}
        onClose={() => setIsFocusMusicOpen(false)}
        onTrackPlayingChange={(playing, track) => {
          setIsMusicPlaying(playing);
          if (track) setCurrentMusicTrack(track);
        }}
      />

      {/* STEM Diagram & Illustration Studio (gemini-3.1-flash-image-preview) */}
      <DiagramStudioModal
        isOpen={isDiagramStudioOpen}
        onClose={() => setIsDiagramStudioOpen(false)}
      />

      {/* Live Voice STEM Tutor (gemini-3.8-live) */}
      <LiveVoiceTutorModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        activeNote={toolContextNote || viewerNote}
      />

      {/* Persistent Focus Music Mini Player Floating Indicator */}
      {isMusicPlaying && (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 bg-stone-900/95 backdrop-blur-md text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl border border-amber-500/40 flex items-center gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 max-w-[calc(100vw-6rem)] sm:max-w-none">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400">Lyria 3 Playing</div>
            <div className="text-xs font-semibold max-w-[140px] sm:max-w-[200px] truncate">
              {currentMusicTrack || 'Focus Soundscape'}
            </div>
          </div>
          <button
            onClick={() => setIsFocusMusicOpen(true)}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-colors"
            title="Open Focus Music Studio"
          >
            Adjust
          </button>
        </div>
      )}

      {/* StudyBot: Gemini Multi-Turn Chatbot, Search Grounding & Study Trail Navigation */}
      <StudyBot
        lastSession={lastSession}
        studyHistory={studyHistory}
        allNotes={notes}
        currentActiveNote={viewerNote}
        currentActivePageIndex={viewerInitialPageIndex}
        onResumeNote={handleResumeNote}
        onFilterSubject={(subject) => setSelectedSubject(subject)}
        onClearHistory={handleClearHistory}
        onOpenSearchGrounding={handleOpenSearchGroundingModal}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-stone-700 text-xs font-medium flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
