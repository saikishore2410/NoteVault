import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation, Modality } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: '50mb' }));

  // Initialize GoogleGenAI SDK on the server with User-Agent header
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey: apiKey || undefined,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Human-readable API error formatter for GoogleGenAI exceptions and rate limits
  function formatApiError(error: any): string {
    if (!error) return 'An unexpected error occurred';
    let rawMsg = '';
    if (typeof error === 'string') {
      rawMsg = error;
    } else if (error.message) {
      rawMsg = error.message;
    } else {
      rawMsg = String(error);
    }

    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed?.error?.message) {
        rawMsg = parsed.error.message;
      }
    } catch {
      // not JSON string
    }

    if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota') || rawMsg.includes('limit: 0')) {
      return 'Gemini API quota exceeded or billing-enabled API key required for this model. You can select a billing-enabled API key in Settings > Secrets.';
    }

    return rawMsg;
  }

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Multi-Turn Chat with Gemini & Search Grounding
  // Roles: STEM Tutor, Research Scholar, OCR Inspector
  // Models: gemini-3.1-pro-preview (complex), gemini-3.5-flash (general), gemini-3.1-flash-lite (fast)
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        model = 'gemini-3.5-flash',
        useGoogleSearch = false,
        role = 'tutor',
        contextNote,
      } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message string is required' });
        return;
      }

      let systemInstruction = `You are NoteVault AI, a top-tier STEM academic tutor, researcher, and handwritten notes expert.
You help university students and engineers master complex topics across Computer Science, Mathematics, Physics, Electrical Engineering, and Chemistry.
Format formulas using clear LaTeX ($...$ or $$...$$) and code blocks with syntax highlighting.
Always be encouraging, precise, and pedagogically clear.`;

      if (role === 'researcher') {
        systemInstruction = `You are NoteVault Research Scholar, specialized in finding verified, up-to-date scientific publications, latest documentation, academic benchmarks, and real-world implementations.
Provide thorough citations, key formulas, and factual references using Google Search grounding.`;
      } else if (role === 'ocr_inspector') {
        systemInstruction = `You are NoteVault OCR & Diagram Analyst. You specialize in validating handwritten notes, clarifying messy mathematical notation, interpreting block diagrams, and converting handwritten scribbles to clean LaTeX / Markdown.`;
      }

      if (contextNote) {
        systemInstruction += `\n\nCURRENT NOTE CONTEXT:
The user is currently studying the note: "${contextNote.title}" (Subject: ${contextNote.subject}, Topic: ${contextNote.topic}).
${contextNote.currentContent ? `Excerpt from current page: """${contextNote.currentContent}"""` : ''}
Use this context to provide hyper-relevant answers.`;
      }

      const validModels = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
      const targetModel = validModels.includes(model) ? model : 'gemini-3.5-flash';

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history) {
          if (item && item.content) {
            contents.push({
              role: item.role === 'model' || item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: String(item.content) }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const config: any = {
        systemInstruction,
      };

      if (useGoogleSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });

      const replyText = response.text || 'I could not generate a response. Please try again.';

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((w: any) => w && w.uri);

      const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      res.json({
        reply: replyText,
        model: targetModel,
        sources: webSources,
        searchQueries,
      });
    } catch (error: any) {
      console.error('Error in /api/chat:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // 2. Dedicated Google Search Grounding Endpoint (gemini-3.5-flash + googleSearch)
  app.post('/api/search-grounding', async (req, res) => {
    try {
      const { query, subject } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query string is required' });
        return;
      }

      const prompt = `Topic/Question: ${query}
Subject Area: ${subject || 'STEM / Academic Research'}

Use Google Search to find current, verified information, definitions, breakthroughs, or textbook derivations for this topic.
Provide:
1. A concise, authoritative summary (with LaTeX notation where applicable)
2. Practical engineering / academic applications
3. Key reference citations and web sources`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an academic researcher with live Google Search access. Provide factual, rigorous answers with web citations.',
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((w: any) => w && w.uri);
      const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      res.json({
        summary: text,
        sources,
        searchQueries,
        model: 'gemini-3.5-flash',
      });
    } catch (error: any) {
      console.error('Error in /api/search-grounding:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // 3. Audio Transcription (gemini-3.5-transcribe)
  app.post('/api/transcribe-audio', async (req, res) => {
    try {
      const { audioBase64, mimeType = 'audio/webm' } = req.body;

      if (!audioBase64) {
        res.status(400).json({ error: 'audioBase64 is required' });
        return;
      }

      const audioPart = {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text: `Transcribe this lecture, dictation, or student audio into clean, highly readable, structured study notes.
Include:
- Concise Title & Subject classification
- Clean verbatim transcription with clear paragraphing
- Key Formulas / Equations formatted in standard LaTeX ($...$ or $$...$$)
- Bullet points of Key Concept Takeaways & Definitions`,
            },
          ],
        },
      });

      res.json({
        transcription: response.text || '',
        model: 'gemini-3.5-transcribe',
      });
    } catch (error: any) {
      console.error('Error in /api/transcribe-audio:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // 4. Google Maps Grounding (gemini-3.5-flash + googleMaps tool)
  // For finding university libraries, quiet campus study spots, STEM computer labs, research institutes
  app.post('/api/maps-grounding', async (req, res) => {
    try {
      const { query, latitude, longitude } = req.body;

      const searchPrompt = query || 'Quiet academic libraries, university study spots, and computer labs nearby';

      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (typeof latitude === 'number' && typeof longitude === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude,
            },
          },
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `${searchPrompt}. List top study spots with amenities (WiFi, quiet zones, 24/7 hours, power outlets) and why they are great for focused studying.`,
        config,
      });

      const text = response.text || '';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      // Extract map references and place urls
      const places: Array<{ title: string; uri: string; address?: string; snippet?: string }> = [];

      for (const chunk of groundingChunks) {
        const mapsData = (chunk as any).maps;
        if (mapsData) {
          const sources = mapsData.placeAnswerSources;
          const snippet = Array.isArray(sources) && sources[0]?.reviewSnippets?.[0]
            ? sources[0].reviewSnippets[0]
            : (sources?.reviewSnippets?.[0] || '');
          places.push({
            title: mapsData.title || 'Study Location',
            uri: mapsData.uri || '',
            address: mapsData.placeAddress || mapsData.address || '',
            snippet,
          });
        }
      }

      res.json({
        summary: text,
        places,
        groundingChunks,
        model: 'gemini-3.5-flash',
      });
    } catch (error: any) {
      console.error('Error in /api/maps-grounding:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // 5. Veo 3 Video Generation & Animate Images (veo-3.1-lite-generate-preview)
  // Aspect ratio: '16:9' or '9:16'
  // Step 1: Start video generation
  app.post('/api/generate-video', async (req, res) => {
    try {
      const {
        prompt,
        imageBase64,
        mimeType = 'image/png',
        aspectRatio = '16:9',
      } = req.body;

      if (!prompt && !imageBase64) {
        res.status(400).json({ error: 'Prompt or image is required' });
        return;
      }

      const selectedAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

      const videoPayload: any = {
        model: 'veo-3.1-lite-generate-preview',
        prompt: prompt || 'Animate this scientific diagram showing dynamic physical motion and step-by-step processes.',
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: selectedAspectRatio,
        },
      };

      if (imageBase64) {
        videoPayload.image = {
          imageBytes: imageBase64,
          mimeType: mimeType || 'image/png',
        };
      }

      const operation = await ai.models.generateVideos(videoPayload);

      res.json({
        operationName: operation.name,
        aspectRatio: selectedAspectRatio,
        model: 'veo-3.1-lite-generate-preview',
      });
    } catch (error: any) {
      console.error('Error starting video generation:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // Step 2: Poll video status
  app.post('/api/video-status', async (req, res) => {
    try {
      const { operationName } = req.body;

      if (!operationName) {
        res.status(400).json({ error: 'operationName is required' });
        return;
      }

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      res.json({
        done: Boolean(updated.done),
        error: updated.error || null,
      });
    } catch (error: any) {
      console.error('Error checking video status:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // Step 3: Download video
  app.post('/api/video-download', async (req, res) => {
    try {
      const { operationName } = req.body;

      if (!operationName) {
        res.status(400).json({ error: 'operationName is required' });
        return;
      }

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        res.status(404).json({ error: 'Generated video URI not found or video still processing' });
        return;
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey },
      });

      if (!videoRes.ok) {
        res.status(videoRes.status).json({ error: 'Failed to fetch video stream from Google' });
        return;
      }

      res.setHeader('Content-Type', 'video/mp4');
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error('Error downloading video:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // 6. Generate Music (lyria-3-clip-preview for short clips <=30s or lyria-3-pro-preview for full-length)
  app.post('/api/generate-music', async (req, res) => {
    try {
      const { prompt, isFullTrack = false } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Music prompt is required' });
        return;
      }

      const targetModel = isFullTrack ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

      const response = await ai.models.generateContentStream({
        model: targetModel,
        contents: prompt,
      });

      let audioBase64 = '';
      let mimeType = 'audio/wav';
      let lyrics = '';

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      res.json({
        audioBase64,
        mimeType,
        lyrics,
        model: targetModel,
      });
    } catch (error: any) {
      console.error('Error generating music:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // 7. Create & Edit Images (gemini-3.1-flash-image)
  app.post('/api/generate-or-edit-image', async (req, res) => {
    try {
      const {
        prompt,
        imageBase64,
        mimeType = 'image/png',
        aspectRatio = '1:1',
      } = req.body;

      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      const parts: any[] = [];

      if (imageBase64) {
        parts.push({
          inlineData: {
            data: imageBase64,
            mimeType: mimeType || 'image/png',
          },
        });
      }

      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '1:1',
          },
        },
      });

      let generatedBase64 = '';
      let responseMime = 'image/png';
      let textNote = '';

      const contentParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of contentParts) {
        if (part.inlineData) {
          generatedBase64 = part.inlineData.data || '';
          if (part.inlineData.mimeType) {
            responseMime = part.inlineData.mimeType;
          }
        } else if (part.text) {
          textNote += part.text;
        }
      }

      res.json({
        imageBase64: generatedBase64,
        mimeType: responseMime,
        description: textNote,
        model: 'gemini-3.1-flash-image',
      });
    } catch (error: any) {
      console.error('Error generating/editing image:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // 8. Dedicated Handwritten Notes Vision OCR Endpoint (gemini-3.5-flash with image)
  app.post('/api/ocr-handwriting', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;

      if (!imageBase64) {
        res.status(400).json({ error: 'imageBase64 is required' });
        return;
      }

      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

      const prompt = `You are NoteVault's Expert Handwritten OCR & STEM Document Digitizer engine.
Carefully inspect this image of handwritten notes or diagrams.
Extract and transcribe the contents into structured educational study material.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Concise, descriptive title of the notes",
  "subject": "Mathematics | Computer Science | Physics | Electrical Eng | Chemistry | Biology",
  "topic": "Specific chapter or topic title",
  "rawText": "Complete transcription in GitHub-flavored markdown. Use headings (#, ##), bullet points, and code blocks where appropriate.",
  "latex": ["array of key mathematical formulas in LaTeX format without $ symbols"],
  "confidence": 97.5
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        }
      }

      res.json({
        title: parsedData.title || 'Digitized Handwritten Note',
        subject: parsedData.subject || 'Computer Science',
        topic: parsedData.topic || 'Handwritten Study Material',
        rawText: parsedData.rawText || responseText,
        latex: Array.isArray(parsedData.latex) ? parsedData.latex : [],
        confidence: typeof parsedData.confidence === 'number' ? parsedData.confidence : 96.8,
        model: 'gemini-3.5-flash',
      });
    } catch (error: any) {
      console.error('Error in /api/ocr-handwriting:', error);
      res.status(500).json({
        error: formatApiError(error),
      });
    }
  });

  // 9. WebSocket for Live Audio Voice Conversations (gemini-3.8-live)
  const wss = new WebSocketServer({ server, path: '/live-ws' });

  wss.on('connection', async (clientWs: WebSocket) => {
    try {
      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are NoteVault Live Audio STEM Tutor. Speak concisely, clearly, and engagingly. You explain complex algorithms, mathematical derivations, physics intuition, and study material aloud to students.',
        },
        callbacks: {
          onmessage: (message: any) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            clientWs.close();
          },
        },
      });

      clientWs.on('message', (data: any) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
          if (parsed.type === 'init_context' && parsed.note) {
            const notePrompt = `[Context Update] The student is currently studying the note: "${parsed.note.title}" (Subject: ${parsed.note.subject}, Topic: ${parsed.note.topic}). Greet them and ask what concept they would like to review!`;
            session.sendRealtimeInput({
              text: notePrompt,
            });
          }
        } catch (err) {
          console.error('Error processing live audio payload from client:', err);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch {}
      });
    } catch (error) {
      console.error('Failed to initialize Gemini Live session:', error);
      clientWs.send(JSON.stringify({ error: 'Live voice connection error' }));
      clientWs.close();
    }
  });

  // Vite middleware in dev or static serving in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`NoteVault Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
