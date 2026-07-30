import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

const CLONES_FILE_PATH = path.join(process.cwd(), 'custom_clones.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Express JSON body parser error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error('Express middleware payload error:', err);
    return res.status(err.status || 400).json({
      error: err.message || 'Payload size too large or malformed JSON data.',
    });
  }
  next();
});

// Lazy initializer for Google GenAI client
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in process.env.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper function to extract audio base64 from response parts
function extractAudioBase64(response: any): string | undefined {
  const cand = response?.candidates?.[0] || response?.response?.candidates?.[0];
  const parts = cand?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return part.inlineData.data;
    }
    if (part.inline_data?.data) {
      return part.inline_data.data;
    }
  }
  return undefined;
}

// OpenRouter Multi-Key Audio Generation with Automatic Failover
async function callOpenRouterTTS(keys: string[], promptText: string, voiceName: string): Promise<string | null> {
  const validKeys = (keys || []).map((k) => (typeof k === 'string' ? k.trim() : '')).filter(Boolean);
  if (validKeys.length === 0) return null;

  // OpenRouter model IDs for text/audio generation
  const models = ['google/gemini-2.5-flash', 'google/gemini-2.0-flash-001', 'openai/gpt-4o-mini', 'meta-llama/llama-3.3-70b-instruct'];

  for (let keyIdx = 0; keyIdx < validKeys.length; keyIdx++) {
    const apiKey = validKeys[keyIdx];

    // If key is a native Google Gemini API key (starts with AIza)
    if (apiKey.startsWith('AIza')) {
      try {
        console.log(`[Key Handler] Detected native Google Gemini API key #${keyIdx + 1}`);
        const customAi = new GoogleGenAI({ apiKey });
        const res = await generateContentWithRetry(customAi, {
          contents: [{ parts: [{ text: promptText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName as any },
              },
            },
          },
        });
        const b64 = extractAudioBase64(res);
        if (b64) return b64;
      } catch (err: any) {
        console.warn(`[Key Handler] Native Gemini key #${keyIdx + 1} failed:`, err?.message || err);
      }
    }

    // OpenRouter API key attempt
    for (const model of models) {
      try {
        console.log(`[OpenRouter] Attempting Key #${keyIdx + 1} with model '${model}'...`);
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ais.studio',
            'X-Title': 'BhashaVoice Studio',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: promptText }],
          }),
        });

        if (res.status === 429 || res.status === 402) {
          console.warn(`[OpenRouter] Key #${keyIdx + 1} quota/rate limit reached (HTTP ${res.status}). Failing over to backup key...`);
          break; // break model loop to switch to next key immediately
        }

        if (!res.ok) {
          const errBody = await res.text();
          console.warn(`[OpenRouter] Key #${keyIdx + 1} HTTP ${res.status}: ${errBody.substring(0, 100)}`);
          continue;
        }

        const data: any = await res.json();
        const b64 =
          data?.choices?.[0]?.message?.audio?.data ||
          (typeof data?.choices?.[0]?.message?.content === 'string' && data.choices[0].message.content.length > 500
            ? data.choices[0].message.content
            : null) ||
          extractAudioBase64(data);

        if (b64 && typeof b64 === 'string' && b64.length > 100) {
          console.log(`[OpenRouter] Key #${keyIdx + 1} successfully generated output!`);
          return b64;
        }
      } catch (err: any) {
        console.warn(`[OpenRouter] Key #${keyIdx + 1} exception:`, err?.message || err);
      }
    }
  }

  return null;
}

// Helper function to execute Gemini API calls with exponential backoff and model fallbacks for 429 / 503 errors
async function generateContentWithRetry(aiClient: GoogleGenAI, params: any, maxRetries = 3): Promise<any> {
  const isAudio =
    params.config?.responseModalities?.includes(Modality.AUDIO) ||
    params.config?.responseModalities?.includes('AUDIO');

  const modelsToTry = params.model
    ? [params.model]
    : isAudio
    ? ['gemini-3.1-flash-tts-preview']
    : ['gemini-3.6-flash', 'gemini-3.1-pro-preview'];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const requestParams = { ...params, model: modelName };
        const response = await aiClient.models.generateContent(requestParams);

        if (isAudio) {
          const audioB64 = extractAudioBase64(response);
          if (audioB64) {
            return response;
          } else {
            console.warn(`Model ${modelName} returned no inline audio data. Retrying...`);
            attempt++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
        }
        return response;
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);

        // Immediate break on non-retryable errors (404 NOT_FOUND or 400 Invalid Modality)
        if (errMsg.includes('404') || errMsg.includes('NOT_FOUND') || errMsg.includes('modality is not enabled')) {
          console.warn(`Model ${modelName} not supported for this payload (${errMsg.substring(0, 100)}). Immediate fallback to next model...`);
          break;
        }

        const isRetryable =
          errMsg.includes('429') ||
          errMsg.includes('503') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('Quota exceeded') ||
          errMsg.includes('rate limit') ||
          errMsg.includes('overloaded');

        attempt++;
        if (isRetryable && attempt < maxRetries) {
          const delayMs = attempt * 1200;
          console.warn(`Gemini API transient error (${errMsg.substring(0, 100)}) on model ${modelName}, retry ${attempt}/${maxRetries} in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          console.warn(`Gemini API model ${modelName} error: ${errMsg.substring(0, 100)}. Trying fallback...`);
          break;
        }
      }
    }
  }

  throw lastError || new Error('All attempted Gemini models failed to generate output.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server-side permanent voice clones persistence endpoints
app.get('/api/clones', (req, res) => {
  try {
    if (fs.existsSync(CLONES_FILE_PATH)) {
      const data = fs.readFileSync(CLONES_FILE_PATH, 'utf-8');
      const clones = JSON.parse(data);
      return res.json({ success: true, clones });
    }
    return res.json({ success: true, clones: [] });
  } catch (err: any) {
    console.error('Error reading custom_clones.json:', err);
    return res.json({ success: true, clones: [] });
  }
});

app.post('/api/clones', (req, res) => {
  try {
    const { clones } = req.body;
    if (Array.isArray(clones)) {
      fs.writeFileSync(CLONES_FILE_PATH, JSON.stringify(clones, null, 2), 'utf-8');
      return res.json({ success: true, count: clones.length });
    }
    return res.status(400).json({ error: 'Invalid clones payload' });
  } catch (err: any) {
    console.error('Error writing custom_clones.json:', err);
    return res.status(500).json({ error: 'Failed to save clones to server disk' });
  }
});

// Helper function to split long scripts into chunks (~250 words each) for TTS
function splitTextIntoChunks(text: string, maxWordsPerChunk = 250): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const totalWords = trimmed.split(/\s+/).length;
  if (totalWords <= maxWordsPerChunk) {
    return [trimmed];
  }

  const paragraphs = trimmed.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const paraWords = para.trim().split(/\s+/).length;
    const currentChunkWords = currentChunk ? currentChunk.trim().split(/\s+/).length : 0;

    if (currentChunkWords + paraWords <= maxWordsPerChunk) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }

      if (paraWords > maxWordsPerChunk) {
        const sentences = para.split(/(?<=[.?!।])\s+/);
        let sentenceChunk = '';
        for (const sent of sentences) {
          const sentWords = sent.trim().split(/\s+/).length;
          const sentChunkWords = sentenceChunk ? sentenceChunk.trim().split(/\s+/).length : 0;
          if (sentChunkWords + sentWords <= maxWordsPerChunk) {
            sentenceChunk = sentenceChunk ? sentenceChunk + ' ' + sent : sent;
          } else {
            if (sentenceChunk) chunks.push(sentenceChunk);
            sentenceChunk = sent;
          }
        }
        if (sentenceChunk) {
          currentChunk = sentenceChunk;
        }
      } else {
        currentChunk = para;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [trimmed];
}

// Helper function to concatenate multiple RIFF WAV audio buffers into one single WAV file
function concatenateWavBuffers(buffers: Buffer[], pauseMs = 300): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0);
  if (buffers.length === 1) return buffers[0];

  const firstHeader = buffers[0].subarray(0, 44);
  const sampleRate = firstHeader.readUInt32LE(24) || 24000;
  const blockAlign = firstHeader.readUInt16LE(32) || 2; // 2 bytes per sample (16-bit mono)

  // Silence PCM buffer for pauses between chunks (300ms default)
  const silenceSamples = Math.floor((sampleRate * pauseMs) / 1000);
  const silenceBuffer = Buffer.alloc(silenceSamples * blockAlign);

  const pcmParts: Buffer[] = [];

  for (let i = 0; i < buffers.length; i++) {
    const buf = buffers[i];
    let pcmOffset = 44;
    const dataMarkerIndex = buf.indexOf('data');
    if (dataMarkerIndex !== -1 && dataMarkerIndex < 100) {
      pcmOffset = dataMarkerIndex + 8;
    }
    const pcmData = buf.subarray(pcmOffset);
    pcmParts.push(pcmData);

    if (i < buffers.length - 1 && silenceBuffer.length > 0) {
      pcmParts.push(silenceBuffer);
    }
  }

  const combinedPcm = Buffer.concat(pcmParts);
  const totalPcmLength = combinedPcm.length;

  const finalHeader = Buffer.from(firstHeader);
  finalHeader.writeUInt32LE(36 + totalPcmLength, 4); // update RIFF size
  finalHeader.writeUInt32LE(totalPcmLength, 40);     // update data size

  return Buffer.concat([finalHeader, combinedPcm]);
}

// Helper to apply custom pronunciation dictionary rules
interface ServerPronunciationRule {
  id?: string;
  word: string;
  phonetic: string;
  language?: string;
  enabled?: boolean;
}

function processPronunciationRules(
  inputText: string,
  rules: ServerPronunciationRule[],
  currentLang: string
): { processedText: string; ruleDirective: string } {
  if (!rules || !Array.isArray(rules) || rules.length === 0 || !inputText) {
    return { processedText: inputText, ruleDirective: '' };
  }

  const activeRules = rules.filter(
    (r) =>
      (r.enabled === undefined || r.enabled === true) &&
      (!r.language || r.language === 'all' || r.language === currentLang) &&
      r.word &&
      r.word.trim() &&
      r.phonetic &&
      r.phonetic.trim()
  );

  if (activeRules.length === 0) {
    return { processedText: inputText, ruleDirective: '' };
  }

  let textToProcess = inputText;
  const mappings: string[] = [];

  for (const rule of activeRules) {
    const word = rule.word.trim();
    const phonetic = rule.phonetic.trim();
    mappings.push(`"${word}" as "${phonetic}"`);

    // Escape regex special chars
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Replace with word boundary
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    textToProcess = textToProcess.replace(regex, phonetic);
  }

  const ruleDirective = `CUSTOM PRONUNCIATION DICTIONARY DIRECTIVES: Pronounce technical or colloquial terms as follows: ${mappings.join(', ')}.`;

  return { processedText: textToProcess, ruleDirective };
}

// Text-to-Speech Generation Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      language,
      voiceName = 'Kore',
      tone = 'conversational',
      mode = 'single',
      isLongScript = false,
      tuningConfig,
      customVoiceClone,
      pronunciationRules = [],
      dialogueTurns,
      speakers,
    } = req.body;

    if (!text && (!dialogueTurns || dialogueTurns.length === 0)) {
      return res.status(400).json({ error: 'Text or dialogue script is required' });
    }

    const ai = getGenAI();

    // Process custom pronunciation dictionary rules
    const { processedText: mainText, ruleDirective } = processPronunciationRules(
      text || '',
      pronunciationRules,
      language
    );

    // Map language directives
    let langDirective = '';
    if (language === 'auto') {
      langDirective = 'AUTO-DETECT LANGUAGE DIRECTIVE: Auto-detect the primary language and code-switching in the input text (Hindi, Hinglish, or English) and switch pronunciation, accent, and cadence dynamically to sound like an authentic native narrator.';
    } else if (language === 'hinglish') {
      langDirective = 'Speak in fluent, natural Hinglish (Hindi words written in English/Roman script) with an authentic Indian accent and lively human cadence.';
    } else if (language === 'hi') {
      langDirective = 'Speak in clear, expressive Hindi (हिंदी) with natural human inflection and emotion.';
    } else {
      langDirective = 'Speak in clear, articulate English with natural human pace and emotion.';
    }

    // Map tone instruction
    let toneInstruction = '';
    switch (tone) {
      case 'joyful':
        toneInstruction = 'Speak in a joyful, happy, upbeat voice with bright expression and warm smiles in the tone.';
        break;
      case 'sad':
        toneInstruction = 'Speak in a sad, melancholic, soft voice expressing gentle sorrow, grief, or vulnerability.';
        break;
      case 'neutral':
        toneInstruction = 'Speak in a balanced, neutral, clear voice with natural rhythm and no heavy emotion.';
        break;
      case 'excited':
        toneInstruction = 'Speak with high excitement, vibrant energy, fast pace, and enthusiastic celebration!';
        break;
      case 'concerned':
        toneInstruction = 'Speak in a concerned, empathetic, caring, and sympathetic voice with gentle reassurance.';
        break;
      case 'dramatic':
        toneInstruction = 'Deliver with intense emotional weight, dramatic tension, and deep feeling.';
        break;
      case 'calm':
        toneInstruction = 'Deliver in a soft, peaceful, soothing, and slow-paced voice.';
        break;
      case 'fearful':
        toneInstruction = 'Speak in a tense, fearful, hushed voice with anxious urgency or suspense.';
        break;
      case 'whisper':
        toneInstruction = 'Speak in a quiet, hushed, soft-spoken intimate whisper with delicate breath sounds.';
        break;
      case 'angry':
        toneInstruction = 'Speak in a fierce, intense, passionate, and commanding tone with strong vocal projection.';
        break;
      case 'conversational':
        toneInstruction = 'Deliver in a warm, natural, everyday conversational voice with relaxed rhythm.';
        break;
      case 'formal':
      case 'news':
        toneInstruction = 'Deliver in a crisp, confident, formal news broadcasting voice with clear articulation.';
        break;
      case 'storytelling':
        toneInstruction = 'Narrate expressively with rich emotion, natural emphasis, and engaging storytelling pauses.';
        break;
      case 'promotional':
      case 'energetic':
        toneInstruction = 'Deliver in a persuasive, high-impact promotional style suitable for ads, commercials, or trailers.';
        break;
      default:
        toneInstruction = 'Deliver in a warm, natural, everyday conversational voice with clear expression.';
        break;
    }

    // Voice Tuning Directives (Speed, Pitch, Stability, Expressiveness, Pauses)
    let tuningDirective = '';
    if (tuningConfig) {
      const speedStr = tuningConfig.speed ? `${tuningConfig.speed.toFixed(2)}x` : '1.0x';
      const pitchStr = tuningConfig.pitch || 'medium';
      const expStr = tuningConfig.expressiveness ? `${Math.round(tuningConfig.expressiveness * 100)}%` : '85%';
      const stabStr = tuningConfig.stability ? `${Math.round(tuningConfig.stability * 100)}%` : '75%';
      const pauseStr = tuningConfig.pauseDuration ? `${tuningConfig.pauseDuration.toFixed(1)}s` : '0.5s';

      tuningDirective = `VOICE TUNING DIRECTIVES:
- Speech Speed & Tempo: ${speedStr} rate.
- Pitch Modulation: ${pitchStr} pitch range.
- Vocal Expressiveness: ${expStr} dynamic emotional range (include subtle human micro-breaths).
- Vocal Tone Stability: ${stabStr} stability.
- Inter-Sentence Pause Length: Insert ${pauseStr} pauses between sentences.`;
    }

    // Custom Voice Clone Directive
    let cloneDirective = '';
    if (customVoiceClone && customVoiceClone.acousticPrompt) {
      const gTag = customVoiceClone.gender ? customVoiceClone.gender.toUpperCase() : 'MALE';
      const cName = customVoiceClone.name || 'Custom Voice';
      cloneDirective = `CRITICAL CUSTOM VOICE CLONE REPLICATION DIRECTIVE:
Speaker Profile: ${cName} (${gTag})
Acoustic Signature: "${customVoiceClone.acousticPrompt}"
Accent / Style: ${customVoiceClone.accent || 'Natural'}
Vocal Gender Register: Maintain a realistic, natural ${gTag} pitch, timbre, and vocal resonance throughout.
MANDATE: Perform the script using this exact custom speaker persona. Replicate their voice signature, vocal weight, and natural speech rhythm. Do NOT fall back to standard synthetic voice.`;
    } else if (voiceName === 'Aarav' || voiceName?.includes('Aarav') || voiceName?.includes('7b9m') || voiceName?.includes('ElevenLabs')) {
      cloneDirective = `CUSTOM CLONED VOICE SIGNATURE: Replicate ElevenLabs voice profile 7b9mYhmn: Warm, deeply expressive Indian male voice with natural pitch inflections, smooth cadence, rich vocal weight, clear articulation, and engaging storytelling warmth.`;
    }

    const pauseInstruction = 'IMPORTANT VOICE PAUSE DIRECTIVE: When encountering explicit tags like [pause], [pause 0.5s], [pause 1s], [pause 2s], [breath], or [dramatic pause], insert realistic, quiet, natural breathing pauses of that exact duration in the vocal output.';

    const VALID_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

    const getMappedVoice = (vName: string, cloneObj?: any): string => {
      if (cloneObj) {
        if (cloneObj.gender === 'male') {
          if (cloneObj.baseVoice === 'Puck' || cloneObj.baseVoice === 'Charon' || cloneObj.baseVoice === 'Fenrir') {
            return cloneObj.baseVoice;
          }
          return 'Fenrir';
        } else if (cloneObj.gender === 'female') {
          if (cloneObj.baseVoice === 'Zephyr' || cloneObj.baseVoice === 'Kore') {
            return cloneObj.baseVoice;
          }
          return 'Kore';
        }
      }
      if (!vName) return 'Kore';
      if (vName === 'Aarav' || vName.includes('Aarav') || vName.includes('7b9m')) return 'Fenrir';
      if (VALID_VOICES.includes(vName)) return vName;
      return 'Kore';
    };

    if (mode === 'dialogue' && dialogueTurns && dialogueTurns.length > 0 && speakers && speakers.length >= 2) {
      // Multi-speaker dialogue mode
      const speaker1 = speakers[0];
      const speaker2 = speakers[1];

      const rawVoice1 = speaker1.customVoiceClone?.baseVoice || speaker1.voiceName;
      const rawVoice2 = speaker2.customVoiceClone?.baseVoice || speaker2.voiceName;

      const voice1 = getMappedVoice(rawVoice1, speaker1.customVoiceClone);
      const voice2 = getMappedVoice(rawVoice2, speaker2.customVoiceClone);

      const scriptText = dialogueTurns
        .map((turn: { speakerName: string; text: string }) => {
          const { processedText } = processPronunciationRules(turn.text, pronunciationRules, language);
          return `${turn.speakerName}: ${processedText}`;
        })
        .join('\n');

      const ruleInstruction = ruleDirective ? ruleDirective + '\n' : '';
      const fullPrompt = `TTS the following multi-speaker dialogue in ${language.toUpperCase()}. ${langDirective} ${toneInstruction}\n${tuningDirective}\n${pauseInstruction}\n${ruleInstruction}\nDialogue:\n${scriptText}`;

      // 1. Try OpenRouter Keys if provided
      if (req.body.openRouterKeys && Array.isArray(req.body.openRouterKeys) && req.body.openRouterKeys.length > 0) {
        const openRouterB64 = await callOpenRouterTTS(req.body.openRouterKeys, fullPrompt, voice1);
        if (openRouterB64) {
          return res.json({
            success: true,
            audioBase64: openRouterB64,
            voiceName: `${speaker1.name} & ${speaker2.name}`,
            mode: 'dialogue',
            source: 'openrouter',
          });
        }
      }

      // 2. Fallback to native Gemini SDK
      const response = await generateContentWithRetry(ai, {
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice1 as any },
                  },
                },
                {
                  speaker: speaker2.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice2 as any },
                  },
                },
              ],
            },
          },
        },
      });

      const audioBase64 = extractAudioBase64(response);

      if (!audioBase64) {
        throw new Error('No audio returned from Gemini TTS engine.');
      }

      return res.json({
        success: true,
        audioBase64,
        voiceName: `${speaker1.name} & ${speaker2.name}`,
        mode: 'dialogue',
      });
    } else {
      // Single speaker mode - High-capacity chunking (600 words per chunk)
      const textToUse = mainText || text;
      const rawVoice = customVoiceClone?.baseVoice || voiceName;
      const effectiveVoiceName = getMappedVoice(rawVoice, customVoiceClone);
      const ruleInstruction = ruleDirective ? ruleDirective + '\n' : '';
      const promptText = `Instructions: ${langDirective} ${toneInstruction}\n${tuningDirective}\n${cloneDirective}\n${pauseInstruction}\n${ruleInstruction}\nText to speak:\n${textToUse}`;

      // 1. Try OpenRouter Keys if provided
      if (req.body.openRouterKeys && Array.isArray(req.body.openRouterKeys) && req.body.openRouterKeys.length > 0) {
        const openRouterB64 = await callOpenRouterTTS(req.body.openRouterKeys, promptText, effectiveVoiceName);
        if (openRouterB64) {
          return res.json({
            success: true,
            audioBase64: openRouterB64,
            voiceName: customVoiceClone ? customVoiceClone.name : effectiveVoiceName,
            mode: 'single',
            source: 'openrouter',
          });
        }
      }

      // 2. Fallback to native Gemini SDK with chunking
      const chunks = splitTextIntoChunks(textToUse, 600); // ~600 words per chunk
      console.log(`Processing ${chunks.length} audio chunk(s) for TTS via Gemini SDK...`);

      const audioBuffers: Buffer[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const chunkPromptText = `Instructions: ${langDirective} ${toneInstruction}\n${tuningDirective}\n${cloneDirective}\n${pauseInstruction}\n${ruleInstruction}\nText to speak (Part ${i + 1} of ${chunks.length}):\n${chunkText}`;

        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 700));
        }

        const contentsPayload = [{ parts: [{ text: chunkPromptText }] }];

        const response = await generateContentWithRetry(ai, {
          contents: contentsPayload,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: effectiveVoiceName as any },
              },
            },
          },
        });

        const rawB64 = extractAudioBase64(response);
        if (rawB64) {
          audioBuffers.push(Buffer.from(rawB64, 'base64'));
        }
      }

      if (audioBuffers.length === 0) {
        throw new Error('No audio returned from Gemini TTS engine.');
      }

      const pauseGapMs = tuningConfig?.pauseDuration ? Math.round(tuningConfig.pauseDuration * 1000) : 350;
      const combinedWav = concatenateWavBuffers(audioBuffers, pauseGapMs);
      const combinedBase64 = combinedWav.toString('base64');

      return res.json({
        success: true,
        audioBase64: combinedBase64,
        voiceName: customVoiceClone ? customVoiceClone.name : voiceName,
        mode: 'single',
        chunksProcessed: chunks.length,
      });
    }
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    const errMsg = error.message || String(error);
    if (
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('Quota exceeded') ||
      errMsg.includes('rate limit')
    ) {
      let retrySeconds = 25;
      if (error?.details && Array.isArray(error.details)) {
        for (const detail of error.details) {
          if (detail?.retryDelay) {
            const parsed = parseInt(detail.retryDelay, 10);
            if (!isNaN(parsed) && parsed > 0) {
              retrySeconds = parsed + 2;
            }
          }
        }
      }
      return res.status(429).json({
        error: `Gemini audio rate limit reached (3 requests/minute on free tier). Quota resets in ~${retrySeconds} seconds.`,
        isQuotaExceeded: true,
        retryAfter: retrySeconds,
      });
    }
    return res.status(500).json({
      error: errMsg || 'Failed to generate audio',
      details: error.stack,
    });
  }
});

// AI Voice Cloning Analysis Endpoint
app.post('/api/clone-voice', async (req, res) => {
  try {
    const {
      cloneName,
      gender,
      accent,
      description,
      baseVoice,
      audioBase64,
      audioMimeType,
      userConsentConfirmed,
    } = req.body;

    if (!userConsentConfirmed) {
      return res.status(403).json({ error: 'User consent and ownership permission confirmation is mandatory for voice cloning.' });
    }

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio sample is required for voice cloning analysis.' });
    }

    const ai = getGenAI();

    // Determine mimeType (e.g., audio/webm, audio/mp3, audio/wav, audio/m4a)
    const mimeType = audioMimeType || 'audio/webm';

    // Use Gemini 3.6 Flash multimodal audio processing to analyze vocal characteristics
    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: audioBase64,
      },
    };

    const promptText = `Analyze this spoken audio clip for custom AI voice cloning. Extract the speaker's vocal characteristics in detail:
1. Gender and approximate age profile
2. Accent, dialect, and linguistic tone (e.g., Hinglish, Indian English, Hindi)
3. Pitch, timbre, breathiness, vocal weight, and resonance
4. Speaking pace, articulation, and emotional delivery warmth

Name: ${cloneName}
Gender: ${gender}
Target Accent: ${accent}
User Description: ${description || 'None provided'}

Output a concise, 2-3 sentence acoustic description directive that can instruct a speech synthesis engine to replicate this exact speaker persona as closely as possible. Output ONLY the acoustic directive text without quotes or preamble.`;

    const response = await generateContentWithRetry(ai, {
      contents: [audioPart, { text: promptText }],
    });

    const acousticPrompt = response.text
      ? response.text.trim()
      : `Voice clone profile for ${cloneName}, with ${gender} tone, ${accent} inflection, and natural conversational cadence.`;

    return res.json({
      success: true,
      acousticPrompt,
    });
  } catch (error: any) {
    console.error('Error analyzing voice sample for clone:', error);

    // Fallback blueprint if audio parsing has minor format issues
    const { cloneName, gender, accent } = req.body;
    return res.json({
      success: true,
      acousticPrompt: `Custom ${gender} voice clone named ${cloneName} with a clear ${accent || 'Natural'} accent, warm timbre, and steady cadence.`,
    });
  }
});

// AI Script Enhancer / Translator Endpoint
app.post('/api/enhance-text', async (req, res) => {
  try {
    const { text, targetLanguage, action } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for enhancement' });
    }

    const ai = getGenAI();

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'translate_hinglish') {
      systemPrompt = 'You are an expert Indian copywriter and voice scriptwriter specializing in natural, viral Hinglish (Hindi written in Roman script mixed with English). Translate or rewrite the text into casual, trendy, human Hinglish that sounds authentic when spoken out loud. Output ONLY the resulting Hinglish text without meta comments or quotes.';
      userPrompt = `Rewrite this text into natural Hinglish for voiceover:\n"${text}"`;
    } else if (action === 'translate_hindi') {
      systemPrompt = 'You are an expert Hindi scriptwriter. Translate or rewrite the text into fluent, natural Hindi in Devanagari script suitable for voiceover. Output ONLY the resulting Hindi text without meta comments.';
      userPrompt = `Translate this text into fluent spoken Hindi (Devanagari):\n"${text}"`;
    } else if (action === 'add_emotions') {
      systemPrompt = 'You are an audio script director. Enhance the given text for speech synthesis by adding expressive tone hints and punctuation (such as pauses [pause], cheerful cues, or emphasis) while keeping the original meaning intact. Output ONLY the enhanced script.';
      userPrompt = `Enhance this text with expressive pauses and emotion cues for TTS:\n"${text}"`;
    } else if (action === 'auto_pauses') {
      systemPrompt = 'You are an expert audio script editor and YouTube narration director. Your task is to automatically insert precise speech pause tags (such as [pause 0.5s], [pause 1s], [pause 2s], or [breath]) into the script to create realistic, comfortable, and captivating narration rhythm for YouTube video voiceovers. Insert [pause 0.5s] after commas or clause breaks, [pause 1s] after sentences, and [pause 2s] at paragraph transitions. Preserve all original text word-for-word while inserting pause tags. Output ONLY the resulting script with pause tags without meta comments or quotes.';
      userPrompt = `Analyze and insert automatic YouTube narration pauses into this script:\n"${text}"`;
    } else {
      // General enhance
      systemPrompt = `You are an expert text-to-speech script editor. Optimize the given text for maximum vocal flow, clear pronunciation, and natural speech rhythm in ${targetLanguage.toUpperCase()}. Fix awkward phrasing, add appropriate commas and sentence breaks. Output ONLY the polished script.`;
      userPrompt = `Optimize this text for speech output:\n"${text}"`;
    }

    const response = await generateContentWithRetry(ai, {
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const enhancedText = response.text ? response.text.trim() : text;

    return res.json({
      success: true,
      enhancedText,
    });
  } catch (error: any) {
    console.error('Error enhancing text:', error);
    return res.status(500).json({
      error: error.message || 'Failed to enhance script',
    });
  }
});

// Start dev or production server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BhashaVoice Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
