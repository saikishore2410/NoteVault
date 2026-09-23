import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Play, 
  History, 
  Compass, 
  Send, 
  BookOpen, 
  Sparkles, 
  Trash2,
  Minimize2,
  Globe,
  ExternalLink,
  Cpu,
  GraduationCap,
  Microscope,
  FileSearch,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Note, Subject, StudySession, StudyHistoryItem } from '../types/notes';
import { 
  sendChatMessage, 
  ChatMessageItem, 
  GeminiModel, 
  BotRole 
} from '../services/gemini';
import { useAuth } from '../context/AuthContext';

interface StudyBotProps {
  lastSession: StudySession | null;
  studyHistory: StudyHistoryItem[];
  allNotes: Note[];
  currentActiveNote?: Note | null;
  currentActivePageIndex?: number;
  onResumeNote: (noteId: string, pageIndex: number) => void;
  onFilterSubject: (subject: Subject) => void;
  onClearHistory: () => void;
  onOpenSearchGrounding?: (query: string, subject?: Subject) => void;
}

export const StudyBot: React.FC<StudyBotProps> = ({
  lastSession,
  studyHistory,
  allNotes,
  currentActiveNote,
  currentActivePageIndex = 0,
  onResumeNote,
  onFilterSubject,
  onClearHistory,
  onOpenSearchGrounding,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'subjects'>('chat');
  const [inputText, setInputText] = useState<string>('');
  const [showNotificationBadge, setShowNotificationBadge] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Gemini Settings
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3.5-flash');
  const [useGoogleSearch, setUseGoogleSearch] = useState<boolean>(false);
  const [botRole, setBotRole] = useState<BotRole>('tutor');

  // Multi-Turn Chat Conversation Thread
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(() => {
    return [
      {
        id: 'msg-init',
        role: 'model',
        content: `👋 Welcome to NoteVault AI! I'm your interactive STEM study companion powered by Gemini.

I can explain handwritten notes, derive complex formulas, verify OCR accuracy, or ground our study sessions with live Google Search web data.

💡 *Tip: I'm currently tracking your study progress so you can resume where you left off anytime!*`,
        modelUsed: 'gemini-3.5-flash',
        timestamp: Date.now(),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, isOpen, isSending]);

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  // Multi-turn message submission to server-side Gemini API
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    const userMessage: ChatMessageItem = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsSending(true);

    // Prepare note context if active
    let contextNoteData = undefined;
    if (currentActiveNote) {
      const pages = Array.isArray(currentActiveNote.pages) ? currentActiveNote.pages : [];
      const activePage = pages[currentActivePageIndex] || pages[0];
      contextNoteData = {
        title: currentActiveNote.title,
        subject: currentActiveNote.subject,
        topic: currentActiveNote.topic,
        currentContent: activePage?.ocrContent?.rawText || activePage?.title,
      };
    } else if (lastSession) {
      contextNoteData = {
        title: lastSession.lastNoteTitle,
        subject: lastSession.lastSubject,
        topic: lastSession.lastTopic,
      };
    }

    // Assemble conversation history for multi-turn chat
    const historyPayload = chatMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await sendChatMessage({
        message: text,
        history: historyPayload,
        model: selectedModel,
        useGoogleSearch: useGoogleSearch,
        role: botRole,
        contextNote: contextNoteData,
      });

      const botMessage: ChatMessageItem = {
        id: `m-${Date.now()}`,
        role: 'model',
        content: response.reply,
        sources: response.sources,
        searchQueries: response.searchQueries,
        modelUsed: response.model,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Error contacting Gemini: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleResumeClick = (noteId: string, pageIndex: number) => {
    onResumeNote(noteId, pageIndex);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        {!isOpen && (
          <div className="relative group">
            <button
              onClick={() => {
                setIsOpen(true);
                setShowNotificationBadge(false);
              }}
              className="flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-amber-600 via-amber-700 to-stone-900 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-amber-400/40"
              title="Open Gemini StudyBot"
            >
              <div className="relative">
                <Bot className="w-5 h-5 text-amber-200" />
                {showNotificationBadge && lastSession && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                )}
              </div>
              <div className="text-left font-sans">
                <span className="text-xs font-bold block leading-none flex items-center gap-1">
                  Gemini StudyBot
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </span>
                {lastSession ? (
                  <span className="text-[10px] text-amber-200 block truncate max-w-[120px] sm:max-w-[140px]">
                    Last: {lastSession.lastSubject} (pg {lastSession.lastPageIndex + 1})
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-300 block hidden xs:block">
                    Ask AI &amp; Jump to note
                  </span>
                )}
              </div>
            </button>

            {/* Hover Tooltip Preview */}
            {lastSession && (
              <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-stone-900 text-stone-100 text-xs rounded-xl shadow-2xl border border-stone-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                <div className="text-[10px] uppercase font-semibold text-amber-400 mb-0.5 flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current text-amber-400" />
                  Pick up where you left off:
                </div>
                <div className="font-bold truncate">{lastSession.lastNoteTitle}</div>
                <div className="text-stone-400 text-[11px] mt-0.5">
                  {lastSession.lastSubject} · Page {lastSession.lastPageIndex + 1} of {lastSession.totalPages} · {formatRelativeTime(lastSession.lastUpdated)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bot Panel */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[460px] h-[85vh] sm:h-[640px] max-h-[92vh] bg-white dark:bg-stone-900 border-t sm:border border-stone-200 dark:border-stone-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-linear-to-r from-stone-900 via-stone-800 to-amber-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-100 flex items-center gap-1.5">
                  NoteVault Gemini Tutor
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-stone-400">
                  <span>Multi-Turn AI</span>
                  <span>·</span>
                  <span className="font-mono text-amber-300">{selectedModel}</span>
                  {user && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-400">Cloud Synced</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                title="Minimize Bot"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Resume Card Banner (Always visible at top of bot) */}
          {lastSession && (
            <div className="p-2.5 px-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 shrink-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current text-amber-600" />
                  Last Studied Subject
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                  {formatRelativeTime(lastSession.lastUpdated)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {lastSession.lastNoteTitle}
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-400">
                    {lastSession.lastSubject} · Page {lastSession.lastPageIndex + 1} of {lastSession.totalPages}
                  </div>
                </div>
                <button
                  onClick={() => handleResumeClick(lastSession.lastNoteId, lastSession.lastPageIndex)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs shrink-0 flex items-center gap-1 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Controls Strip (Model selection, Role, and Google Search Grounding toggle) */}
          <div className="p-2 bg-stone-100/90 dark:bg-stone-950/80 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 text-xs shrink-0 flex-wrap">
            {/* Model Selector */}
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                className="bg-white dark:bg-stone-800 text-[11px] border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 text-stone-700 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (General &amp; Search)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex STEM)</option>
              </select>
            </div>

            {/* Role & Search Grounding Toggle */}
            <div className="flex items-center gap-1.5">
              {/* Role Selector */}
              <select
                value={botRole}
                onChange={(e) => setBotRole(e.target.value as BotRole)}
                className="bg-white dark:bg-stone-800 text-[11px] border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 text-stone-700 dark:text-stone-200"
              >
                <option value="tutor">🎓 STEM Tutor</option>
                <option value="researcher">🔬 Live Researcher</option>
                <option value="ocr_inspector">📝 OCR Inspector</option>
              </select>

              {/* Google Search Grounding Tool Toggle */}
              <button
                type="button"
                onClick={() => setUseGoogleSearch(!useGoogleSearch)}
                title={useGoogleSearch ? 'Disable live Google Search grounding' : 'Enable live Google Search grounding (uses gemini-3.5-flash)'}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all ${
                  useGoogleSearch
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Search</span>
                {useGoogleSearch && <CheckCircle2 className="w-2.5 h-2.5" />}
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-xs font-medium shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-stone-900 font-semibold'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Multi-Turn Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-stone-900 font-semibold'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Study Trail ({studyHistory.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex-1 py-2 px-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'subjects'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-stone-900 font-semibold'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Subjects</span>
            </button>
          </div>

          {/* Tab 1: Multi-Turn Chat Stream */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-stone-900">
              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-amber-600 text-white rounded-br-none'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-bl-none border border-stone-200/60 dark:border-stone-700/60'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.content}</div>

                      {/* Google Search Grounding Sources */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-stone-200 dark:border-stone-700">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                            <Globe className="w-3 h-3" />
                            Grounded via Google Search ({m.sources.length} Sources)
                          </span>
                          <div className="space-y-1">
                            {m.sources.slice(0, 3).map((source, sIdx) => (
                              <a
                                key={sIdx}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between text-[10px] p-1.5 rounded-md bg-white/70 dark:bg-stone-900/70 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors"
                              >
                                <span className="truncate max-w-[280px]">
                                  {source.title || source.uri}
                                </span>
                                <ExternalLink className="w-3 h-3 shrink-0 ml-1 opacity-70" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1 text-[9px] text-stone-400">
                      <span>{formatRelativeTime(m.timestamp)}</span>
                      {m.modelUsed && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{m.modelUsed}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-100 dark:bg-stone-800 p-3 rounded-xl max-w-[80%] border border-stone-200 dark:border-stone-700 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Gemini is generating response {useGoogleSearch ? 'with Google Search...' : '...'}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                  onClick={() => handleSendMessage('Where did I leave off in my notes?')}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-[11px] whitespace-nowrap hover:border-amber-500 hover:text-amber-600 transition-colors"
                >
                  📍 Where did I leave off?
                </button>
                <button
                  onClick={() => handleSendMessage('Explain the main concept on this note page')}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-[11px] whitespace-nowrap hover:border-amber-500 hover:text-amber-600 transition-colors"
                >
                  💡 Explain Current Page
                </button>
                <button
                  onClick={() => {
                    setUseGoogleSearch(true);
                    handleSendMessage('Find recent research papers and benchmarks related to this topic');
                  }}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-[11px] whitespace-nowrap hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
                >
                  <Globe className="w-3 h-3 text-emerald-500" />
                  Search Recent Papers
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 bg-white dark:bg-stone-900 shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    useGoogleSearch
                      ? 'Ask Gemini with live Google Search grounding...'
                      : 'Ask Gemini about formulas, proofs, or notes...'
                  }
                  disabled={isSending}
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Study History Timeline */}
          {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-stone-900">
              <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200 dark:border-stone-800">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Recent Notes Trail
                </span>
                {studyHistory.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-stone-400 hover:text-red-500 text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear History
                  </button>
                )}
              </div>

              {studyHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {studyHistory.map((item, idx) => (
                    <div
                      key={`${item.noteId}-${idx}`}
                      className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60 hover:border-amber-400/80 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-400 block">
                          {item.subject}
                        </span>
                        <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {item.noteTitle}
                        </h4>
                        <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                          <span>Page {item.lastPageIndex + 1} of {item.totalPages}</span>
                          <span>·</span>
                          <span>{formatRelativeTime(item.timestamp)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleResumeClick(item.noteId, item.lastPageIndex)}
                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Resume</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-stone-400 text-xs">
                  <History className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p>No notes opened yet.</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Open any note in the viewer and your reading journey will be recorded here!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Subjects Quick Jump Directory */}
          {activeTab === 'subjects' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-stone-900 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-stone-500 block mb-2">
                Browse &amp; Filter By Subject
              </span>
              {[
                { name: 'Computer Science' as Subject, desc: 'Algorithms, Architecture & Systems' },
                { name: 'Mathematics' as Subject, desc: 'Calculus, Linear Algebra & Geometry' },
                { name: 'Physics' as Subject, desc: 'Electrodynamics & Quantum Mechanics' },
                { name: 'Electrical Engineering' as Subject, desc: 'AC Circuits, Phasors & Signals' },
                { name: 'Chemistry' as Subject, desc: 'Organic Mechanisms & Benzene' },
                { name: 'Data Structures' as Subject, desc: 'Trees, Graphs, Queues & Heaps' },
                { name: 'Operating Systems' as Subject, desc: 'Virtual Memory, TLB & Paging' },
              ].map((sub) => {
                const count = allNotes.filter((n) => n.subject === sub.name).length;
                const isLastRead = lastSession?.lastSubject === sub.name;

                return (
                  <button
                    key={sub.name}
                    onClick={() => {
                      onFilterSubject(sub.name);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isLastRead
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/40 dark:bg-stone-950/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-semibold text-stone-900 dark:text-stone-100">
                          {sub.name}
                        </strong>
                        {isLastRead && (
                          <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                            Last Read
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">{sub.desc}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300 bg-stone-200/70 dark:bg-stone-800 px-2 py-0.5 rounded">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};
