import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Custom loader: `import x from './foo.html?b64'` returns the file
// contents base64-encoded. We need this because vite-plugin-singlefile
// inlines the JS bundle inside an HTML <script> tag, and the embedded
// legacy apps contain literal </script> sequences that would
// prematurely close that outer script tag if stored as raw strings.
function htmlBase64Plugin() {
  return {
    name: 'html-base64',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.endsWith('?b64')) return null;
      const clean = source.slice(0, -4);
      // Let Vite resolve the real path relative to the importer.
      return this.resolve(clean, importer, { skipSelf: true }).then((r) =>
        r ? r.id + '?b64' : null
      );
    },
    load(id) {
      if (!id.endsWith('?b64')) return null;
      const filePath = id.slice(0, -4);
      const buf = readFileSync(filePath);
      return `export default ${JSON.stringify(buf.toString('base64'))};`;
    },
  };
}

export default defineConfig({
  plugins: [htmlBase64Plugin(), react(), viteSingleFile()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 10000,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
