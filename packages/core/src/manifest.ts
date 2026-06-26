import {
  SibilityManifestSchema,
  SibilityIndexSchema,
  type SibilityManifest,
  type SibilityIndex,
} from "./types.js";

export function parseManifest(data: unknown): SibilityManifest {
  return SibilityManifestSchema.parse(data);
}

export function parseIndex(data: unknown): SibilityIndex {
  return SibilityIndexSchema.parse(data);
}

export function manifestAudioPath(outputDir: string, id: string): string {
  return `${outputDir}/${id}.mp3`;
}

export function manifestJsonPath(outputDir: string, id: string): string {
  return `${outputDir}/${id}.json`;
}

export function publicAudioUrl(outputDir: string, id: string): string {
  const normalized = outputDir.replace(/\\/g, "/").replace(/\/+$/, "");

  const publicSegment = "/public/";
  const publicIndex = normalized.indexOf(publicSegment);
  if (publicIndex !== -1) {
    const webPath = normalized.slice(publicIndex + publicSegment.length - 1);
    return `${webPath}/${id}.mp3`.replace(/\/+/g, "/");
  }

  const relative = normalized.replace(/^\.\//, "");
  if (relative.startsWith("public/")) {
    return `/${relative.slice("public/".length)}/${id}.mp3`.replace(/\/+/g, "/");
  }

  return `/${relative}/${id}.mp3`.replace(/\/+/g, "/");
}
