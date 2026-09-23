import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, formatGeminiError } from './_gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '16:9' } = req.body || {};
    if ((prompt !== undefined && typeof prompt !== 'string') || (imageBase64 !== undefined && typeof imageBase64 !== 'string')) {
      return res.status(400).json({ error: 'Prompt and image must be strings' });
    }
    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image is required' });
    }

    const ai = getGeminiClient();
    const selectedAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    const params: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt || 'Animate this STEM concept with smooth academic transitions and pedagogical clarity',
      config: {
        aspectRatio: selectedAspectRatio,
      },
    };

    if (imageBase64) {
      params.image = {
        imageBytes: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        mimeType,
      };
    }

    const operation = await ai.models.generateVideos(params);

    return res.status(200).json({
      operationName: operation.name,
      done: operation.done || false,
      model: 'veo-3.1-lite-generate-preview',
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/generate-video:', error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
}
