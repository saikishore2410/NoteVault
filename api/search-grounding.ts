import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not set. Please configure GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.'
    );
  }

  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(error: any): string {
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

  if (
    rawMsg.includes('Could not load the default credentials') ||
    rawMsg.includes('credentials') ||
    rawMsg.includes('GEMINI_API_KEY environment variable is not set') ||
    rawMsg.includes('API key not valid') ||
    rawMsg.includes('API key should be set')
  ) {
    return 'Missing or invalid Gemini API Key. Please add your GEMINI_API_KEY to your environment variables (in Vercel Project Settings > Environment Variables).';
  }

  if (
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('resource_exhausted') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('limit: 0') ||
    rawMsg.includes('429')
  ) {
    return 'Gemini API quota exceeded or billing-enabled API key required for this model. You can select a billing-enabled API key in Settings > Secrets or Google AI Studio.';
  }

  if (
    rawMsg.includes('overloaded') ||
    rawMsg.includes('503') ||
    rawMsg.includes('UNAVAILABLE')
  ) {
    return 'The Gemini model API is temporarily overloaded with high traffic. Please retry in a few seconds.';
  }

  return rawMsg;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for serverless flexibility
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, subject } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const ai = getGeminiClient();

    const prompt = `Topic/Question: ${query}
Subject Area: ${subject || 'STEM / Academic Research'}

Perform Google Search Grounding to find verified, up-to-date academic research, course materials, equations, or scientific proofs.
Provide:
1. Clear, concise conceptual explanation
2. Key mathematical equations in LaTeX ($...$ or $$...$$)
3. Verified real-world applications and current status in research`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text || 'No search summary available';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri);
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    return res.status(200).json({
      summary,
      sources,
      searchQueries,
      model: 'gemini-3.5-flash',
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/search-grounding:', error);
    return res.status(500).json({ error: formatGeminiError(error) });
  }
}
