/**
 * Audio helpers for Live API (16kHz PCM little-endian) and Audio Transcription
 */

// Convert Float32Array channel data to 16kHz 16-bit PCM Base64
export function float32ToPcm16Base64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to -1.0 .. 1.0
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    // Scale to 16-bit signed integer (-32768 .. 32767)
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // true = little-endian
  }

  // Convert ArrayBuffer to binary string
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Play raw 24kHz 16-bit PCM little-endian audio chunk
export function play24kPcmChunk(
  audioCtx: AudioContext,
  base64Audio: string,
  startTimeRef: { current: number }
) {
  try {
    const binary = atob(base64Audio);
    const byteLen = binary.length;
    const samples = byteLen / 2;
    const buffer = audioCtx.createBuffer(1, samples, 24000);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const byte1 = binary.charCodeAt(i * 2);
      const byte2 = binary.charCodeAt(i * 2 + 1);
      // Combine 16-bit little-endian
      let val = (byte2 << 8) | byte1;
      if (val >= 0x8000) val -= 0x10000;
      channelData[i] = val / 32768.0;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    const currentTime = audioCtx.currentTime;
    if (startTimeRef.current < currentTime) {
      startTimeRef.current = currentTime;
    }

    source.start(startTimeRef.current);
    startTimeRef.current += buffer.duration;
  } catch (err) {
    console.error('Error playing 24k PCM chunk:', err);
  }
}

// Convert Blob or File to Base64 data string (excluding data URI prefix if needed)
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
