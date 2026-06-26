# @sibility/react

React karaoke reader with real-time word highlighting.

## Usage

```tsx
import { SibilityReader } from '@sibility/react';
import manifest from '../public/sibility/hero.json';

<SibilityReader manifest={manifest}>
  <p>{manifest.text}</p>
</SibilityReader>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `manifest` | `SibilityManifest` | required | Pre-generated manifest from `sibility generate` |
| `highlightMode` | `'word' \| 'sentence'` | `'word'` | Highlight granularity |
| `showOverlay` | `boolean` | `true` | Selection-style highlight div |
| `showControls` | `boolean` | `true` | Play/pause button and progress bar |
| `autoPlay` | `boolean` | `false` | Start playback on mount |

## Hook

```tsx
import { useSibilityPlayback } from '@sibility/react';
```
