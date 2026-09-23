import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Upload, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Loader2, 
  Sparkles, 
  BookOpen, 
  Volume2,
  Trash2
} from 'lucide-react';
import { blobToBase64 } from '../utils/audioHelpers';
import { Note, Subject } from '../types/notes';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsNote?: (newNote: Note) => void;
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  onSaveAsNote,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecordingCleanup();
      setError(null);
    }
  }, [isOpen]);

  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setError('Microphone access was denied or not available. Please allow mic permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setError(null);
    try {
      const base64 = await blobToBase64(audioBlob);
      const res = await fetch('/api/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType: audioBlob.type || 'audio/webm',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to transcribe audio');
      }

      const data = await res.json();
      setTranscription(data.transcription || '');
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Error transcribing audio with gemini-3.5-transcribe');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!transcription || !onSaveAsNote) return;

    // Create a new digitized note item from the transcription
    const newNote: Note = {
      id: `voice-note-${Date.now()}`,
      title: 'Voice Lecture & Dictated Notes',
      subject: 'Computer Science' as Subject,
      topic: 'Voice Transcribed STEM Notes',
      author: {
        name: 'You (Dictaphone)',
        institution: 'Live Voice Session',
      },
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readabilityRating: 4.9,
      legibilityScore: 98,
      upvotes: 1,
      views: 1,
      totalPages: 1,
      summary: 'Spoken STEM lecture transcribed with Gemini 3.5 Transcribe model.',
      tags: ['Audio Lecture', 'gemini-3.5-transcribe', 'Voice Note'],
      pages: [
        {
          id: `page-voice-${Date.now()}`,
          pageNumber: 1,
          title: 'Voice Transcribed Lecture Notes',
          paperType: 'ruled',
          inkColor: 'blue',
          visualContent: {
            headerTitle: 'Voice Transcribed Lecture Notes',
            dateText: new Date().toLocaleDateString(),
            sections: [
              {
                heading: 'Audio Transcription Overview',
                paragraphs: [transcription],
              },
            ],
          },
          ocrContent: {
            title: 'Audio Lecture Transcript',
            rawText: transcription,
            sections: [
              {
                heading: 'Transcription Text',
                content: transcription,
                type: 'text',
              },
            ],
            keyTerms: ['Gemini 3.5 Transcribe', 'Lecture Audio'],
          },
        },
      ],
    };

    onSaveAsNote(newNote);
    onClose();
  };

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Lecture &amp; Voice Transcriber</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                  gemini-3.5-transcribe
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Dictate formulas or record lectures to generate structured study notes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Record / Upload Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Live Mic Card */}
            <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 flex flex-col items-center justify-center text-center space-y-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:scale-105'
                }`}
              >
                <Mic className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {isRecording ? `Recording... ${formatTimer(recordingSeconds)}` : 'Microphone Recording'}
                </h4>
                <p className="text-xs text-stone-500">
                  {isRecording ? 'Speak clearly into your microphone' : 'Capture live dictation or lecture audio'}
                </p>
              </div>

              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Recording</span>
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Recording</span>
                </button>
              )}
            </div>

            {/* File Upload Card */}
            <div className="p-5 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Upload Audio File
                </h4>
                <p className="text-xs text-stone-500">
                  Supports MP3, WAV, WebM, M4A up to 25MB
                </p>
              </div>
              <label className="cursor-pointer px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors">
                <span>Browse Audio File</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Audio Preview Strip */}
          {audioUrl && (
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Audio Ready
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {audioBlob ? `${Math.round(audioBlob.size / 1024)} KB` : 'Recorded track'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <audio src={audioUrl} controls className="h-8 max-w-full" />
                <button
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-700"
                  title="Remove audio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Transcribe Action */}
          {audioBlob && !transcription && (
            <div className="flex justify-center">
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transcribing with gemini-3.5-transcribe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Structured Study Notes</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Transcription Result */}
          {transcription && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Transcribed Study Notes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  {onSaveAsNote && (
                    <button
                      onClick={handleSaveToNotes}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Save as New Note</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap font-sans leading-relaxed max-h-72 overflow-y-auto">
                {transcription}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
