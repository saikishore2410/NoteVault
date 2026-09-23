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

    return res.status(200).json({
      done: pollResult.done || false,
      response: pollResult.response || null,
      error: pollResult.error || null,
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/video-status:', error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
}
