import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, formatGeminiError } from './_gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};

    if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getGeminiClient();

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Analyze this handwritten student note or technical diagram with extreme precision:
1. Transcribe the handwriting accurately into clean GitHub-flavored Markdown.
2. Convert all mathematical equations, integrals, matrices, summations, and scientific formulas into standard LaTeX notation ($...$ inline or $$...$$ display block).
3. Transcribe code snippets, block diagrams, or pseudo-code into fenced code blocks.
4. Extract key scientific terms, theorems, and definitions.
5. Provide a confidence score (0-100) reflecting legibility.
6. Provide a clean inferred note title and likely academic Subject ('Computer Science', 'Mathematics', 'Physics', 'Electrical Engineering', or 'Chemistry').

Respond strictly in valid JSON format matching this schema:
{
  "title": "Clean Note Title",
  "subject": "Mathematics",
  "confidence": 96,
  "latex": ["\\\\int_{-\\\\infty}^{\\\\infty} e^{-x^2} dx = \\\\sqrt{\\\\pi}"],
  "keyTerms": ["Gaussian Integral", "Calculus"],
  "rawText": "# Transcribed Content\\n\\nMarkdown formatted transcript here with $math$..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { rawText: text, title: 'Digitized Note' };
    }

    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Error in Vercel /api/ocr-handwriting:', error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
}
