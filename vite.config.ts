import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'watch-yaml-data',
      configureServer(server) {
        const listener = (file: string) => {
          if (file.includes('cv-data.yaml')) {
            server.ws.send({
              type: 'full-reload',
              path: '*'
            });
          }
        };
        server.watcher.on('add', listener);
        server.watcher.on('change', listener);
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: 'public',
  base: './',
  server: {
    port: 3000,
    open: true
  }
});
