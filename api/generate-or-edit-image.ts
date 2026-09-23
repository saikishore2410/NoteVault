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
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '1:1' } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
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

    return res.status(200).json({
      imageBase64: generatedBase64,
      mimeType: responseMime,
      description: textNote,
      model: 'gemini-3.1-flash-image',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Image generation error' });
  }
}
