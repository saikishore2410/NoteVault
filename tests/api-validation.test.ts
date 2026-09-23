import test from 'node:test';
import assert from 'node:assert/strict';

type Handler = (req: any, res: any) => Promise<any>;

function mockResponse() {
  const response: any = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(body: unknown) {
      response.body = body;
      return response;
    },
    end() {
      response.ended = true;
      return response;
    },
    setHeader(name: string, value: unknown) {
      response.headers[name] = value;
      return response;
    },
    send(body: unknown) {
      response.body = body;
      return response;
    },
  };
  return response;
}

async function load(path: string): Promise<Handler> {
  const module = await import(path);
  return module.default as Handler;
}

async function expectJson(path: string, method: string, body: unknown, status: number, error: string) {
  const handler = await load(path);
  const res = mockResponse();
  await handler({ method, body }, res);
  assert.equal(res.statusCode, status);
  assert.deepEqual(res.body, { error });
}

const validationCases = [
  ['chat', './chat.ts', { message: '' }, 'Message string is required'],
  ['generate-video', './generate-video.ts', {}, 'Prompt or image is required'],
  ['generate-music', './generate-music.ts', {}, 'Prompt is required'],
  ['generate-or-edit-image', './generate-or-edit-image.ts', {}, 'Prompt is required'],
  ['ocr-handwriting', './ocr-handwriting.ts', {}, 'imageBase64 is required'],
  ['transcribe-audio', './transcribe-audio.ts', {}, 'audioBase64 is required'],
  ['video-status', './video-status.ts', {}, 'operationName is required'],
  ['video-download', './video-download.ts', {}, 'operationName is required'],
  ['search-grounding', './search-grounding.ts', {}, 'Query string is required'],
] as const;

for (const [name, file, body, message] of validationCases) {
  test(`${name}: rejects invalid POST payload`, async () => {
    await expectJson(`../api/${file.slice(2)}`, 'POST', body, 400, message);
  });
}

for (const [name, file] of validationCases) {
  test(`${name}: rejects non-POST requests`, async () => {
    const handler = await load(`../api/${file.slice(2)}`);
    const res = mockResponse();
    await handler({ method: 'GET', body: {} }, res);
    assert.equal(res.statusCode, 405);
    assert.deepEqual(res.body, { error: 'Method not allowed' });
  });
}

test('search-grounding: handles CORS preflight without calling Gemini', async () => {
  const handler = await load('../api/search-grounding.ts');
  const res = mockResponse();
  await handler({ method: 'OPTIONS', body: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.ended, true);
  assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
  assert.match(String(res.headers['Access-Control-Allow-Methods']), /POST/);
});
