/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths so the build works on GitHub Pages project sites.
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
