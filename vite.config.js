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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  optimizeDeps: {
    include: ['prop-types', 'react-confirm-alert']
  },
  resolve: {
    alias: {
      // optional fallback if needed
      'prop-types': path.resolve(__dirname, 'node_modules/prop-types/index.js')
    }
  },
  // if using SSR:
  ssr: {
    noExternal: ['react-confirm-alert']
  }
});
