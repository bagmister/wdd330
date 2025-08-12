import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/geonames': {
        target: 'https://api.geonames.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/geonames/, '')
      }
    }
  }
});