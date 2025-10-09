import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

//export default defineConfig({
 // plugins: [react()],
  //resolve: {
  //  alias: {
  //    "@": path.resolve(__dirname, "./src"),
  //  },
  //},
//});


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: {}, // ⚠️ Ajouté pour corriger le problème d'environnement Pusher
  },
  optimizeDeps: {
    include: ['laravel-echo'],
  },
});

