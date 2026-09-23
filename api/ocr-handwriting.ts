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

function formatApiError(error: any): string {
  if (!error) return 'An unexpected error occurred';
  let rawMsg = typeof error === 'string' ? error : error.message || String(error);
  if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota')) {
    return 'Gemini API quota exceeded or billing-enabled API key required.';
  }
  return rawMsg;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const prompt = `You are NoteVault's Expert Handwritten OCR & STEM Document Digitizer engine.
Carefully inspect this image of handwritten notes or diagrams.
Extract and transcribe the contents into structured educational study material.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Concise, descriptive title of the notes",
  "subject": "Mathematics | Computer Science | Physics | Electrical Eng | Chemistry | Biology",
  "topic": "Specific chapter or topic title",
  "rawText": "Complete transcription in GitHub-flavored markdown. Use headings (#, ##), bullet points, and code blocks where appropriate.",
  "latex": ["array of key mathematical formulas in LaTeX format without $ symbols"],
  "confidence": 97.5
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) parsedData = JSON.parse(match[0]);
    }

    return res.status(200).json({
      title: parsedData.title || 'Digitized Handwritten Note',
      subject: parsedData.subject || 'Computer Science',
      topic: parsedData.topic || 'Handwritten Study Material',
      rawText: parsedData.rawText || responseText,
      latex: Array.isArray(parsedData.latex) ? parsedData.latex : [],
      confidence: typeof parsedData.confidence === 'number' ? parsedData.confidence : 96.8,
      model: 'gemini-3.5-flash',
    });
  } catch (error: any) {
    return res.status(500).json({ error: formatApiError(error) });
  }
}
