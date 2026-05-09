import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['three', 'gsap', 'tweakpane', 'three-perf']
        }
      }
    }
  },
  server: {
    sourcemapIgnoreList: false
  }
});
