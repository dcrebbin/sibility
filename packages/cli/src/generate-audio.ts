import { createReadStream, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import {
  alignWordsToSource,
  type OpenAIConfig,
  type WordTiming,
} from "@sibility/core";

export interface GenerateSpeechResult {
  wavPath: string;
  duration: number;
  words: WordTiming[];
}

export async function generateSpeechWithAlignment(
  text: string,
  options: {
    apiKey: string;
    openai: OpenAIConfig;
    wavPath: string;
  }
): Promise<GenerateSpeechResult> {
  const client = new OpenAI({ apiKey: options.apiKey });

  const response = await client.audio.speech.create({
    model: options.openai.model,
    voice: options.openai.voice,
    input: text,
    response_format: "wav",
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(options.wavPath, buffer);

  const whisperPath = join(tmpdir(), `sibility-whisper-${randomBytes(8).toString("hex")}.wav`);
  writeFileSync(whisperPath, buffer);

  try {
    const transcription = await client.audio.transcriptions.create({
      file: createReadStream(whisperPath),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    const whisperWords =
      "words" in transcription && Array.isArray(transcription.words)
        ? transcription.words.map((w) => ({
            word: w.word,
            start: w.start,
            end: w.end,
          }))
        : [];

    const words = alignWordsToSource(text, whisperWords);
    const duration =
      words.length > 0 ? words[words.length - 1].end : transcription.duration ?? 0;

    return {
      wavPath: options.wavPath,
      duration,
      words,
    };
  } finally {
    try {
      unlinkSync(whisperPath);
    } catch {
      // ignore cleanup errors
    }
  }
}

let ffmpegPathSet = false;

async function ensureFfmpegPath(): Promise<void> {
  if (ffmpegPathSet) return;
  try {
    const ffmpegStatic = await import("ffmpeg-static");
    const path = ffmpegStatic.default;
    if (path) {
      ffmpeg.setFfmpegPath(path);
    }
  } catch {
    // Use system ffmpeg if ffmpeg-static is unavailable
  }
  ffmpegPathSet = true;
}

export async function transcodeWavToMp3(wavPath: string, mp3Path: string): Promise<void> {
  await ensureFfmpegPath();
  mkdirSync(dirname(mp3Path), { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(wavPath)
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
      .on("error", reject)
      .on("end", () => resolve())
      .save(mp3Path);
  });
}
