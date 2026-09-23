import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, formatGeminiError } from './_gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, isFullTrack = false } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    const targetModel = isFullTrack ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: `Generate calming, deep-focus instrumental audio for university STEM studying: ${prompt}`,
    });

    let audioBase64: string | null = null;
    let mimeType = 'audio/mp3';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          audioBase64 = part.inlineData.data;
          mimeType = part.inlineData.mimeType || mimeType;
          break;
        }
      }
    }

    const lyrics = response.text || '';

    return res.status(200).json({
      audioBase64,
      mimeType,
      lyrics,
      model: targetModel,
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/generate-music:', error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
}
