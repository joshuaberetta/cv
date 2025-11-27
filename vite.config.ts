import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer']
    }),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        try {
          const yamlPath = resolve(__dirname, 'public/data/cv-data.yaml');
          if (fs.existsSync(yamlPath)) {
            const fileContents = fs.readFileSync(yamlPath, 'utf8');
            const data: any = yaml.load(fileContents);
            const title = data.basics?.name || 'CV';
            const description = data.basics?.tagline || `${title} - CV Website`;
            
            return html
              .replace('%TITLE%', title)
              .replace('%DESCRIPTION%', description);
          }
          return html;
        } catch (e) {
          console.error('Error transforming HTML:', e);
          return html;
        }
      }
    },
    {
      name: 'watch-yaml-data',
      configureServer(server) {
        const listener = (file: string) => {
          if (file.includes('cv-data.yaml') || file.endsWith('.md')) {
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
  assetsInclude: ['**/*.md'],
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
