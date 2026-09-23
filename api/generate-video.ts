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
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '16:9' } = req.body || {};
    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image is required' });
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

    return res.status(200).json({
      operationName: operation.name,
      aspectRatio: selectedAspectRatio,
      model: 'veo-3.1-lite-generate-preview',
    });
  } catch (error: any) {
    console.error('Error starting video generation in Vercel:', error);
    return res.status(500).json({ error: error.message || 'Failed to start video generation' });
  }
}
