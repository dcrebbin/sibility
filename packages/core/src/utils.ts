import type { WordTiming } from "./types.js";

const WORD_REGEX = /\S+/g;

export function tokenizeText(text: string): string[] {
  return text.match(WORD_REGEX) ?? [];
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^\w']/g, "");
}

export function alignWordsToSource(
  sourceText: string,
  whisperWords: Array<{ word: string; start: number; end: number }>
): WordTiming[] {
  const sourceTokens = tokenizeText(sourceText);
  const aligned: WordTiming[] = [];
  let whisperIndex = 0;

  for (const token of sourceTokens) {
    const normalizedToken = normalizeWord(token);
    if (!normalizedToken) continue;

    let matched = false;
    const searchWindow = 5;

    for (let offset = 0; offset <= searchWindow && whisperIndex + offset < whisperWords.length; offset++) {
      const candidate = whisperWords[whisperIndex + offset];
      const normalizedCandidate = normalizeWord(candidate.word);

      if (
        normalizedCandidate === normalizedToken ||
        normalizedCandidate.includes(normalizedToken) ||
        normalizedToken.includes(normalizedCandidate)
      ) {
        aligned.push({
          word: token,
          start: candidate.start,
          end: candidate.end,
        });
        whisperIndex += offset + 1;
        matched = true;
        break;
      }
    }

    if (!matched && whisperIndex < whisperWords.length) {
      const fallback = whisperWords[whisperIndex];
      aligned.push({
        word: token,
        start: fallback.start,
        end: fallback.end,
      });
      whisperIndex += 1;
    }
  }

  return aligned;
}

export function extractPlainText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>#-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findActiveWordIndex(words: WordTiming[], currentTime: number): number {
  if (words.length === 0) return -1;

  for (let i = words.length - 1; i >= 0; i--) {
    if (currentTime >= words[i].start) {
      return i;
    }
  }

  return -1;
}

export function findSentenceEndIndex(words: WordTiming[], startIndex: number): number {
  for (let i = startIndex; i < words.length; i++) {
    if (/[.!?]$/.test(words[i].word)) {
      return i;
    }
  }
  return words.length - 1;
}
