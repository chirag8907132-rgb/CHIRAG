/**
 * Utility to convert raw 16-bit PCM base64 string (24kHz, mono) from Gemini TTS
 * into a standard playable WAV Blob and Object URL.
 */

export function pcmBase64ToWavBlob(
  base64Pcm: string,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Blob {
  const binaryString = atob(base64Pcm);
  const len = binaryString.length;
  const pcmBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = createWavHeader(pcmBytes.length, sampleRate, numChannels, bitsPerSample);

  const wavBytes = new Uint8Array(wavHeader.length + pcmBytes.length);
  wavBytes.set(wavHeader, 0);
  wavBytes.set(pcmBytes, wavHeader.length);

  return new Blob([wavBytes], { type: 'audio/wav' });
}

export function pcmBase64ToWavUrl(
  base64Pcm: string,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): string {
  const blob = pcmBase64ToWavBlob(base64Pcm, sampleRate, numChannels, bitsPerSample);
  return URL.createObjectURL(blob);
}

function createWavHeader(
  pcmDataLength: number,
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number
): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // "RIFF"
  writeString(view, 0, 'RIFF');
  // ChunkSize (36 + Subchunk2Size)
  view.setUint32(4, 36 + pcmDataLength, true);
  // "WAVE"
  writeString(view, 8, 'WAVE');
  // "fmt "
  writeString(view, 12, 'fmt ');
  // Subchunk1Size (16 for PCM)
  view.setUint32(16, 16, true);
  // AudioFormat (1 for PCM)
  view.setUint16(20, 1, true);
  // NumChannels
  view.setUint16(22, numChannels, true);
  // SampleRate
  view.setUint32(24, sampleRate, true);
  // ByteRate
  view.setUint32(28, (sampleRate * numChannels * bitsPerSample) / 8, true);
  // BlockAlign
  view.setUint16(32, (numChannels * bitsPerSample) / 8, true);
  // BitsPerSample
  view.setUint16(34, bitsPerSample, true);
  // "data"
  writeString(view, 36, 'data');
  // Subchunk2Size (length of PCM data)
  view.setUint32(40, pcmDataLength, true);

  return new Uint8Array(header);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Estimate audio duration in seconds from PCM base64 length (24kHz 16-bit mono = 48000 bytes/sec)
 */
export function estimatePcmDuration(base64Pcm: string, bytesPerSecond = 48000): number {
  if (!base64Pcm) return 0;
  const rawByteLength = (base64Pcm.length * 3) / 4;
  return Math.max(1, Math.round((rawByteLength / bytesPerSecond) * 10) / 10);
}
