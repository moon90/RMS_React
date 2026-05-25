// vite.config.js
// // eslint-disable-next-line no-undef
// const { defineConfig } = require('vite');
// // eslint-disable-next-line no-undef
// const react = require('@vitejs/plugin-react');

// // eslint-disable-next-line no-undef
// module.exports = defineConfig({
//   plugins: [react()],
//   build: {
//     target: 'es2020',
//   },
// });
// import { defineConfig } from 'vite';

// export default defineConfig({
//   optimizeDeps: {
//     include: ['prop-types', 'react-confirm-alert']
//   },
//   // optional: if you need SSR behavior
//   ssr: {
//     noExternal: ['react-confirm-alert']
//   }
// });

import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5000000,
        navigateFallback: '/index.html'
      },
      manifest: {
        name: 'RMS POS Application',
        short_name: 'RMS POS',
        description: 'Offline-capable POS for RMS',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.ico', // Ensure this exists, or use a default one
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    include: ['prop-types', 'react-confirm-alert']
  },
  resolve: {
    alias: {
      'prop-types': path.resolve(__dirname, 'node_modules/prop-types/index.js')
    }
  },
  ssr: {
    noExternal: ['react-confirm-alert']
  }
});
