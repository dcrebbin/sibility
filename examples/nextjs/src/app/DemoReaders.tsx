"use client";

import { SibilityReader, SibilityReaderGroup, type SibilityManifest } from "@sibility/react";

interface DemoReadersProps {
  heroManifest: SibilityManifest;
  aboutManifest: SibilityManifest;
}

export function DemoReaders({ heroManifest, aboutManifest }: DemoReadersProps) {
  return (
    <SibilityReaderGroup>
      <section className="section">
        <h2>Hero</h2>
        <SibilityReader
          manifest={heroManifest}
          highlightStyle={{ backgroundColor: "rgba(59, 130, 246, 0.35)" }}
        >
          <p>{heroManifest.text}</p>
        </SibilityReader>
      </section>

      <section className="section">
        <h2>About</h2>
        <SibilityReader
          manifest={aboutManifest}
          highlightStyle={{ backgroundColor: "rgba(59, 130, 246, 0.35)" }}
        >
          <p>{aboutManifest.text}</p>
        </SibilityReader>
      </section>
    </SibilityReaderGroup>
  );
}
