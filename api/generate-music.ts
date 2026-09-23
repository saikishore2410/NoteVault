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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, isFullTrack = false } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
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

    return res.status(200).json({
      audioBase64,
      mimeType,
      lyrics,
      model: targetModel,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Music generation error' });
  }
}
