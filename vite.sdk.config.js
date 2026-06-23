import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/sdk/sdk.js'),
      name: 'DynamicForm',
      formats: ['es', 'umd'],
      fileName: (format) => `dynamic-form-sdk.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        exports: 'named',
      },
    },
    emptyOutDir: false,
  },
});
