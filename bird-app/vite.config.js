import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: 'localhost',
    port: 5173,
    cors: {
      origin: '*',
    },
    proxy: {
      '/api/geonames': {
        target: 'https://secure.geonames.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geonames/, ''),
      },
      '/api/ebird': {
        target: 'https://api.ebird.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ebird/, ''),
      },
      '/api/nps': {
        target: 'https://developer.nps.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nps/, ''),
      },
    },
  },
  base: '/',
  build: {
    publicDir: './images',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nationalPark: resolve(__dirname, './nationalPark/index.html'),
        birdwatching: resolve(__dirname, './birdwatching/index.html'),
      },
    },
  },
});