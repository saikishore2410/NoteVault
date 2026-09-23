export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  content: string;
  sources?: Array<{ uri: string; title: string }>;
  searchQueries?: string[];
  modelUsed?: string;
  timestamp: number;
}

export type GeminiModel = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';
export type BotRole = 'tutor' | 'researcher' | 'ocr_inspector';

export interface SendChatOptions {
  message: string;
  history: Array<{ role: 'user' | 'model'; content: string }>;
  model?: GeminiModel;
  useGoogleSearch?: boolean;
  role?: BotRole;
  contextNote?: {
    title: string;
    subject: string;
    topic: string;
    currentContent?: string;
  };
}

export interface ChatResponse {
  reply: string;
  model: string;
  sources: Array<{ uri: string; title: string }>;
  searchQueries: string[];
}

export async function sendChatMessage(options: SendChatOptions): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    let errMsg = '';
    try {
      const errorData = await response.json();
      errMsg = errorData.error;
    } catch {
      const text = await response.text().catch(() => '');
      if (text.includes('FUNCTION_INVOCATION_FAILED')) {
        errMsg = 'Vercel Serverless Function Invocation error. Ensure GEMINI_API_KEY is configured in Vercel Project Settings > Environment Variables, then redeploy.';
      } else if (text) {
        errMsg = text.slice(0, 150);
      }
    }
    throw new Error(errMsg || `Server returned ${response.status}`);
  }

  return response.json();
}

export interface SearchGroundingResponse {
  summary: string;
  sources: Array<{ uri: string; title: string }>;
  searchQueries: string[];
  model: string;
}

export async function fetchGoogleSearchGrounding(
  query: string,
  subject?: string
): Promise<SearchGroundingResponse> {
  const response = await fetch('/api/search-grounding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, subject }),
  });

  if (!response.ok) {
    let errMsg = '';
    try {
      const errorData = await response.json();
      errMsg = errorData.error;
    } catch {
      const text = await response.text().catch(() => '');
      if (text.includes('FUNCTION_INVOCATION_FAILED')) {
        errMsg = 'Vercel Serverless Function Invocation error. Ensure GEMINI_API_KEY is added under Vercel Project Settings > Environment Variables and redeploy.';
      } else if (text) {
        errMsg = text.slice(0, 150);
      }
    }
    throw new Error(errMsg || `Server returned ${response.status}`);
  }

  return response.json();
}
