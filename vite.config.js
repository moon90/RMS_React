// vite.config.js
// eslint-disable-next-line no-undef
const { defineConfig } = require('vite');
// eslint-disable-next-line no-undef
const react = require('@vitejs/plugin-react');

// eslint-disable-next-line no-undef
module.exports = defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
  },
});
