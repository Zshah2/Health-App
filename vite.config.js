import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Health-App/', // 👈 Change this to your GitHub repo name
  plugins: [react()],
});
