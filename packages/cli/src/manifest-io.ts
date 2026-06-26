import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  parseManifest,
  parseIndex,
  type SibilityManifest,
  type SibilityIndex,
} from "@sibility/core";

export function readManifest(path: string): SibilityManifest {
  const raw = readFileSync(path, "utf-8");
  return parseManifest(JSON.parse(raw));
}

export function writeManifest(path: string, manifest: SibilityManifest): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
}

export function readIndex(path: string): SibilityIndex | null {
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf-8");
  return parseIndex(JSON.parse(raw));
}

export function writeIndex(path: string, index: SibilityIndex): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(index, null, 2) + "\n", "utf-8");
}
