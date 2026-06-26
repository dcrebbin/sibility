# sibility

CLI to generate OpenAI TTS audio with Whisper word-level alignment.

## Usage

```bash
npx sibility init
OPENAI_API_KEY=sk-... npx sibility generate
```

## Config

```ts
import { defineConfig } from 'sibility';

export default defineConfig({
  output: './public/sibility',
  openai: { model: 'tts-1-hd', voice: 'nova' },
  blocks: [
    { id: 'hero', text: 'Welcome to our site.' },
  ],
});
```
