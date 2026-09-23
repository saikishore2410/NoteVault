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
    const { audioBase64, mimeType = 'audio/webm' } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: `Transcribe this lecture, dictation, or student audio into clean, highly readable, structured study notes.
Include:
- Concise Title & Subject classification
- Clean verbatim transcription with clear paragraphing
- Key Formulas / Equations formatted in standard LaTeX ($...$ or $$...$$)
- Bullet points of Key Concept Takeaways & Definitions`,
          },
        ],
      },
    });

    return res.status(200).json({
      transcription: response.text || '',
      model: 'gemini-3.5-transcribe',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Transcription error' });
  }
}
