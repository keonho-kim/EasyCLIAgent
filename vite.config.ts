import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // 메인 프로세스
        entry: 'src-electron/main.ts',
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: [
                'electron',
                'node-pty', // Add node-pty to external modules
                'node:sqlite',
                'node:fs',
                'node:path',
                'node:process',
                'node:os',
                'node:crypto',
                'node:util',
                'node:events',
                'node:stream',
                'node:buffer',
                'node:url',
                'node:querystring',
                'node:readline',
                'node:child_process',
                'node:http',
                'node:https',
                'node:net',
                'node:tls',
                'node:zlib',
                /^node:/,
              ],
            },
          },
        },
      },
      {
        // Preload 스크립트
        entry: 'src-electron/preload.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: [
                'electron',
                /^node:/,
              ],
            },
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@electron': resolve(__dirname, 'src-electron'),
    },
  },
  build: {
    outDir: 'dist-renderer',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000,
  },
});
