// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [
      tailwindcss(),
      ViteImageOptimizer({
        png: { quality: 80 },
        webp: { quality: 75 },
        jpeg: { quality: 75 },
        svg: {
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'sortAttrs' },
          ],
        },
      }),
    ],
  },
});