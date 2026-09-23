import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Sparkles, 
  Volume2, 
  AlertCircle, 
  Radio, 
  BookOpen, 
  X,
  Bot
} from 'lucide-react';
import { float32ToPcm16Base64, play24kPcmChunk } from '../utils/audioHelpers';
import { Note } from '../types/notes';

interface LiveVoiceTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNote?: Note | null;
}

export const LiveVoiceTutorModal: React.FC<LiveVoiceTutorModalProps> = ({
  isOpen,
  onClose,
  activeNote,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<{ current: number }>({ current: 0 });
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (isOpen) {
      startLiveSession();
    } else {
      endLiveSession();
    }
    return () => {
      endLiveSession();
    };
  }, [isOpen]);

  const startLiveSession = async () => {
    setError(null);
    try {
      // Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        if (activeNote) {
          const excerpt = activeNote.pages?.[0]?.ocrContent?.rawText?.slice(0, 300) || '';
          ws.send(
            JSON.stringify({
              type: 'init_context',
              note: {
                title: activeNote.title,
                subject: activeNote.subject,
                topic: activeNote.topic,
                excerpt,
              },
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setError(msg.error);
            return;
          }
          if (msg.audio) {
            setIsSpeaking(true);
            if (!outputAudioCtxRef.current) {
              outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 24000,
              });
            }
            play24kPcmChunk(outputAudioCtxRef.current, msg.audio, nextPlayTimeRef.current);
          }
          if (msg.interrupted) {
            setIsSpeaking(false);
            if (outputAudioCtxRef.current) {
              nextPlayTimeRef.current.current = outputAudioCtxRef.current.currentTime;
            }
          }
        } catch (err) {
          console.error('Error handling live message:', err);
        }
      };

      ws.onerror = (e) => {
        console.error('Live WS error:', e);
        setError('Could not connect to Gemini Live server. Verify API key and network.');
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      // Mic input setup: 16kHz AudioContext
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
        const channelData = e.inputBuffer.getChannelData(0);

        // Calculate visual level
        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += Math.abs(channelData[i]);
        }
        const avg = sum / channelData.length;
        setAudioLevel(Math.min(100, Math.round(avg * 300)));

        const base64Pcm = float32ToPcm16Base64(channelData);
        ws.send(JSON.stringify({ audio: base64Pcm }));
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: any) {
      console.error('Failed to start Live session:', err);
      setError(err.message || 'Microphone access is required for real-time Live voice tutoring.');
    }
  };

  const endLiveSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
    setAudioLevel(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden text-white">
        {/* Glow ambient background */}
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-500"
          style={{
            background: isSpeaking ? '#f59e0b' : '#3b82f6',
            transform: `scale(${1 + audioLevel / 60})`,
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-xs font-medium text-amber-400 mb-6">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Gemini Live Audio API (gemini-3.8-live)</span>
        </div>

        {/* Animated Voice Orb */}
        <div className="relative my-6 flex items-center justify-center">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              isSpeaking
                ? 'bg-amber-500/20 ring-8 ring-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.5)]'
                : audioLevel > 5
                ? 'bg-blue-500/20 ring-8 ring-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.4)]'
                : 'bg-stone-800 ring-4 ring-stone-700'
            }`}
            style={{
              transform: `scale(${1 + (audioLevel / 120)})`,
            }}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSpeaking
                  ? 'bg-amber-500 text-stone-950 animate-pulse'
                  : audioLevel > 5
                  ? 'bg-blue-500 text-white'
                  : 'bg-stone-700 text-stone-300'
              }`}
            >
              {isSpeaking ? (
                <Volume2 className="w-10 h-10 animate-bounce" />
              ) : (
                <Bot className="w-10 h-10" />
              )}
            </div>
          </div>
        </div>

        {/* State Label */}
        <div className="space-y-1 mb-6">
          <h3 className="text-xl font-bold">
            {isSpeaking
              ? 'Tutor is speaking...'
              : isMuted
              ? 'Microphone muted'
              : isConnected
              ? 'Listening to you...'
              : 'Connecting to Live API...'}
          </h3>
          <p className="text-xs text-stone-400">
            {isConnected
              ? 'Speak naturally to ask questions, explore proofs, or discuss your notes.'
              : 'Establishing low-latency WebSocket connection...'}
          </p>
        </div>

        {/* Context Note Badge */}
        {activeNote && (
          <div className="w-full p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-2 text-xs text-stone-300 mb-6 text-left">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-stone-400">Active Study Subject:</span>{' '}
              <span className="font-semibold text-white">{activeNote.title}</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 mb-6 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-2xl border transition-all ${
              isMuted
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-stone-800 border-stone-700 text-white hover:bg-stone-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={() => {
              endLiveSession();
              onClose();
            }}
            className="px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
