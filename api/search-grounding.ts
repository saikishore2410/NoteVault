import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, formatGeminiError } from './_gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
