import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config';

// Regenerate icons with `npm run generate-pwa-assets`. Padding uses the theme green, not white.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...preset,
    maskable: { ...preset.maskable, resizeOptions: { background: '#166534' } },
    apple: { ...preset.apple, resizeOptions: { background: '#166534' } },
  },
  images: ['public/pwa-512.svg'],
});
