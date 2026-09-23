import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

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
    const { operationName } = req.body || {};
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    return res.status(200).json({
      done: Boolean(updated.done),
      error: updated.error || null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error checking video status' });
  }
}
