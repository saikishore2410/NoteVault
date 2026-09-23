import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, formatGeminiError } from './_gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, latitude, longitude } = req.body || {};
    const searchPrompt = query || 'Quiet academic libraries, university study spots, and computer labs nearby';

    const ai = getGeminiClient();

    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (latitude !== undefined && longitude !== undefined) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(latitude),
            longitude: Number(longitude),
          },
        },
      };
    }

    const prompt = `User request: ${searchPrompt}
Identify the best academic study spots, campus libraries, late-night research halls, or study-friendly coffee spots.
Include:
1. Place names and specific academic benefits (quiet zones, power outlets, group study rooms)
2. Helpful tips for students studying there
3. Google Maps location references where available.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config,
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places = groundingChunks
      .map((c: any) => c.web || c.place)
      .filter(Boolean);

    return res.status(200).json({
      recommendation: text,
      places,
      model: 'gemini-3.5-flash',
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/maps-grounding:', error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
}
