import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: 'localhost',
    port: 5173,
    cors: {
      origin: '*',
    },
  },
  base: "/", // Explicitly set base to root
  build: {
    publicDir: './images',
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        nationalPark: resolve(__dirname, "./nationalPark/index.html"),
        birdwatching: resolve(__dirname, "./birdwatching/index.html"),
      },
    },
  },
});