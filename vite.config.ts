import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {receiptEmailPlugin} from './server/receiptEmailPlugin';

export default defineConfig(({mode}) => {
  // Load ALL env vars (including non-VITE_ server secrets) so the receipt
  // email plugin can access RESEND_API_KEY without exposing it to the client.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      receiptEmailPlugin({
        resendApiKey: env.RESEND_API_KEY,
        resendEmailDomain: env.RESEND_EMAIL_DOMAIN,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
