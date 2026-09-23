import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not set. Please configure GEMINI_API_KEY in your hosting environment (Vercel Project Settings > Environment Variables or AI Studio Secrets).'
    );
  }

  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function formatGeminiError(error: any): string {
  if (!error) return 'An unexpected error occurred';
  let rawMsg = '';
  if (typeof error === 'string') {
    rawMsg = error;
  } else if (error.message) {
    rawMsg = error.message;
  } else {
    rawMsg = String(error);
  }

  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed?.error?.message) {
      rawMsg = parsed.error.message;
    }
  } catch {}

  if (
    rawMsg.includes('Could not load the default credentials') ||
    rawMsg.includes('credentials') ||
    rawMsg.includes('GEMINI_API_KEY environment variable is not set') ||
    rawMsg.includes('API key not valid') ||
    rawMsg.includes('API key should be set')
  ) {
    return 'Missing or invalid Gemini API Key. Please add your GEMINI_API_KEY to your environment variables (in Vercel Project Settings > Environment Variables or AI Studio Secrets).';
  }

  if (
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('resource_exhausted') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('limit: 0') ||
    rawMsg.includes('429')
  ) {
    return 'Gemini API quota exceeded or billing-enabled API key required for this model. You can select a billing-enabled API key in Settings > Secrets or Google AI Studio.';
  }

  if (
    rawMsg.includes('overloaded') ||
    rawMsg.includes('503') ||
    rawMsg.includes('UNAVAILABLE')
  ) {
    return 'The Gemini model API is temporarily overloaded with high traffic. Please retry in a few seconds.';
  }

  return rawMsg;
}
