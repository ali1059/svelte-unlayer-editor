import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    svelte(),
    dts({
      insertTypesEntry: true, // generate index.d.ts
    }),
  ],
  build: {
    lib: {
      entry: 'src/lib/UnlayerEditor.svelte', // path to your main component
      name: 'SvelteUnlayerEditor',
      formats: ['es', 'umd'], 
      fileName: (format) => `unlayer-editor.${format}.js`,
    },
    rollupOptions: {
      external: ['svelte'], 
      output: {
        globals: {
          svelte: 'Svelte',
        },
      },
    },
  },
});
