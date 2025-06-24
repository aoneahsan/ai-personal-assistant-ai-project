import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// getting sentry env
config({
  path: './.env.sentry',
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORGANIZATION,
      project: 'ai-personal-assistant',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      debug: true,
      disable: process.env.GENERATE_SOURCEMAP !== 'true',
      telemetry: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3787,
  },
  build: {
    outDir: 'build',
    sourcemap: process.env.GENERATE_SOURCEMAP === 'true',
  },
  define: {
    global: {},
  },
});
