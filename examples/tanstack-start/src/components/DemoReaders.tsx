import { SibilityReader, SibilityReaderGroup, type SibilityManifest } from "@sibility/react";

interface DemoReadersProps {
  heroManifest: SibilityManifest;
  aboutManifest: SibilityManifest;
}

export function DemoReaders({ heroManifest, aboutManifest }: DemoReadersProps) {
  return (
    <SibilityReaderGroup
      playerStyles={{
        style: { background: "rgba(255, 255, 255, 0.95)" },
        playButton: { background: "#2563eb" },
        progressFill: { background: "#2563eb" },
      }}
    >
      <section className="section">
        <h2>Hero</h2>
        <SibilityReader
          manifest={heroManifest}
          title="Hero"
          highlightStyle={{ backgroundColor: "rgba(59, 130, 246, 0.35)" }}
        >
          <p>{heroManifest.text}</p>
        </SibilityReader>
      </section>

      <section className="section">
        <h2>About</h2>
        <SibilityReader
          manifest={aboutManifest}
          title="About"
          highlightStyle={{ backgroundColor: "rgba(59, 130, 246, 0.35)" }}
        >
          <p>{aboutManifest.text}</p>
        </SibilityReader>
      </section>
    </SibilityReaderGroup>
  );
}
