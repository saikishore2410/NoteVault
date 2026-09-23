import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GenerateVideosOperation } from '@google/genai';
import { getGeminiClient, formatGeminiError } from './_gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { operationName } = req.body || {};
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const pollResult = await ai.operations.getVideosOperation({
      operation: op,
    });

    const uri = (pollResult.response as any)?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Generated video URI not found or video still processing' });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ error: 'Failed to fetch video stream from Google' });
    }

    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="stem-concept-veo.mp4"');
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('Error in Vercel /api/video-download:', error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
}
