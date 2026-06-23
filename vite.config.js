import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        editor: 'editor.html',
        form: 'form.html',
        responses: 'responses.html',
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  test: {
    environment: 'jsdom',
    exclude: ['node_modules', 'e2e'],
  },
});
