import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, formatGeminiError } from './_gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const ai = getGeminiClient();

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64.replace(/^data:audio\/[a-z0-9-]+;base64,/, ''),
      },
    };

    const promptPart = {
      text: `Transcribe this university lecture or spoken study note with extreme academic accuracy:
1. Capture all technical terms, algorithms, mathematics, and proper names precisely.
2. Structure the output into:
   - ## Lecture Summary
   - ## Key Concepts & Definitions
   - ## Detailed Transcript with Timestamp Indicators (if applicable)
   - ## Practice Questions & Follow-ups
3. Format all math equations in LaTeX notation ($...$).`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [promptPart, audioPart],
    });

    const transcription = response.text || 'No transcription generated';

    return res.status(200).json({
      transcription,
      model: 'gemini-3.5-transcribe',
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/transcribe-audio:', error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
}
