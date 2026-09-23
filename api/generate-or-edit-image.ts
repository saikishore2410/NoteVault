import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, formatGeminiError } from './_gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '1:1' } = req.body || {};
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    const parts: any[] = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
      parts.push({
        text: `Based on this technical sketch or note, create or enhance this high-clarity STEM diagram: ${prompt}`,
      });
    } else {
      parts.push({
        text: `Create a pristine, high-clarity academic STEM technical diagram, blueprint, or schematic: ${prompt}. Render text and annotations crisply with black ink and vibrant academic accents on a clean light background.`,
      });
    }

    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const selectedAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: parts,
      config: {
        imageConfig: {
          aspectRatio: selectedAspectRatio,
        },
      },
    });

    let generatedImageBase64: string | null = null;
    let outMimeType = 'image/png';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageBase64 = part.inlineData.data;
          outMimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    }

    return res.status(200).json({
      imageBase64: generatedImageBase64,
      mimeType: outMimeType,
      description: response.text || '',
      model: 'gemini-3.1-flash-image',
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/generate-or-edit-image:', error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
}
