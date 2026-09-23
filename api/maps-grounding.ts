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
    const { query, latitude, longitude } = req.body || {};
    const searchPrompt = query || 'Quiet academic libraries, university study spots, and computer labs nearby';

    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude,
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Find and describe the best study environments and academic study spaces for university students: ${searchPrompt}.
Include:
1. Exact Name & Place description
2. Amenities (Quiet zones, WiFi, Power outlets, Whiteboards, Group study rooms)
3. Noise level rating and best hours to study`,
      config,
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places = groundingChunks
      .filter((c: any) => c.place)
      .map((c: any) => ({
        name: c.place.title || 'Study Spot',
        uri: c.place.uri || '',
        formattedAddress: c.place.formattedAddress || '',
      }));

    return res.status(200).json({
      recommendations: response.text || '',
      places,
      model: 'gemini-3.5-flash',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Maps grounding error' });
  }
}
