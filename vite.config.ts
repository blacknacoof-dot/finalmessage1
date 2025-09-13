import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        strictPort: true,
        headers: {
          'Content-Security-Policy': "default-src 'self' https://aistudiocdn.com data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://aistudiocdn.com data: blob:; style-src 'self' 'unsafe-inline' data: blob:; img-src 'self' data: https: blob:; connect-src 'self' https: http://localhost:3002 wss: ws: data: blob:; font-src 'self' data: blob:; object-src 'none'"
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            admin: path.resolve(__dirname, 'admin.html')
          }
        }
      }
    };
});
