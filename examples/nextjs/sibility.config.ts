import { defineConfig } from "sibility";

export default defineConfig({
  output: "./public/sibility",
  openai: {
    model: "tts-1-hd",
    voice: "nova",
  },
  blocks: [
    {
      id: "hero",
      text: "Welcome to Sibility. Read along as we speak, with each word highlighted in real time.",
    },
    {
      id: "about",
      file: "./src/content/about.md",
    },
  ],
});
