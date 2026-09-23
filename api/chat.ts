import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey || undefined,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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
  } catch {}

  if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('resource_exhausted') || rawMsg.includes('quota') || rawMsg.includes('limit: 0')) {
    return 'Gemini API quota exceeded or billing-enabled API key required for this model. You can select a billing-enabled API key in Settings > Secrets.';
  }

  if (rawMsg.includes('overloaded') || rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE')) {
    return 'The Gemini model API is temporarily overloaded with high traffic. Please retry in a few seconds.';
  }

  return rawMsg;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      message,
      history = [],
      model = 'gemini-3.5-flash',
      useGoogleSearch = false,
      role = 'tutor',
      contextNote,
    } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
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

    return res.status(200).json({
      reply: replyText,
      model: targetModel,
      sources: webSources,
      searchQueries,
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/chat:', error);
    return res.status(500).json({
      error: formatApiError(error),
    });
  }
}
