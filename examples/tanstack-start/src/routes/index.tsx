import { createFileRoute } from "@tanstack/react-router";
import { DemoReaders } from "../components/DemoReaders";
import heroManifest from "../../public/sibility/hero.json";
import aboutManifest from "../../public/sibility/about.json";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main>
      <h1>Sibility Demo</h1>
      <p className="lead">
        Karaoke-style read-along powered by pre-generated OpenAI TTS and Whisper word alignment.
        Run <code>pnpm generate</code> with <code>OPENAI_API_KEY</code> to create real audio files.
      </p>

      <DemoReaders heroManifest={heroManifest} aboutManifest={aboutManifest} />
    </main>
  );
}
