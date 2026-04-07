import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve as pathResolve } from 'node:path';
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

// Strip the `type="module"` and `crossorigin` attributes from the
// inlined bundle script so the resulting single-file HTML executes
// when opened from file://. Module scripts on file:// have a `null`
// origin and the `crossorigin` attribute makes Chrome/Edge silently
// abort them, leaving the page blank. Combined with the IIFE output
// format below, the inlined script becomes a plain classic <script>.
// Rewrite the final dist/index.html on disk after every other plugin
// has finished. We strip `type="module"` and `crossorigin` from any
// remaining <script> tag and remove modulepreload <link>s, so the
// page can execute when opened directly via file://. Running in
// closeBundle (instead of transformIndexHtml) guarantees this runs
// after vite-plugin-singlefile has inlined the bundle contents.
function fileUrlSafeScriptPlugin() {
  let outDir = 'dist';
  return {
    name: 'wrm-file-url-safe-script',
    apply: 'build',
    configResolved(cfg) {
      outDir = cfg.build?.outDir || 'dist';
    },
    closeBundle() {
      const file = pathResolve(process.cwd(), outDir, 'index.html');
      let html;
      try {
        html = readFileSync(file, 'utf8');
      } catch {
        return;
      }
      const before = html;
      // Strip type="module" and crossorigin from any <script ...> tag.
      html = html.replace(/<script\b([^>]*)>/g, (_m, attrs) => {
        let cleaned = attrs
          .replace(/\s+type\s*=\s*"module"/g, '')
          .replace(/\s+crossorigin(?:\s*=\s*"[^"]*")?/g, '');
        return `<script${cleaned}>`;
      });
      // Remove modulepreload links — irrelevant once everything is inlined.
      html = html.replace(/<link\s+rel="modulepreload"[^>]*>\s*/g, '');

      // Move the inlined application bundle out of <head> and into the
      // very end of <body>. With type="module" stripped, the bundle is
      // a classic <script> that runs synchronously while parsing — if
      // it stays in <head>, document.getElementById('root') is null
      // because <body> hasn't been parsed yet, React fails to mount,
      // and the page renders blank.
      //
      // Heuristic: scan all <script>...</script> blocks that sit
      // inside <head>, pick the largest one (the multi-MB bundle),
      // and reinsert it immediately before </body>. Other small
      // scripts in <head> (e.g. iframe storage shims, polyfills)
      // are left in place.
      const headEnd = html.indexOf('</head>');
      const bodyEnd = html.lastIndexOf('</body>');
      if (headEnd !== -1 && bodyEnd !== -1) {
        const headSlice = html.slice(0, headEnd);
        const scriptRe = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
        let m;
        let biggest = null;
        while ((m = scriptRe.exec(headSlice)) !== null) {
          if (!biggest || m[0].length > biggest[0].length) {
            biggest = { start: m.index, end: m.index + m[0].length, text: m[0], len: m[0].length };
          }
        }
        // Only relocate if the candidate is plausibly the bundle
        // (>= 64 KB — anything smaller is a polyfill or shim).
        if (biggest && biggest.len >= 64 * 1024) {
          html =
            html.slice(0, biggest.start) +
            html.slice(biggest.end, bodyEnd) +
            biggest.text +
            '\n' +
            html.slice(bodyEnd);
        }
      }

      if (html !== before) {
        writeFileSync(file, html);
      }
    },
  };
}

export default defineConfig({
  plugins: [htmlBase64Plugin(), react(), viteSingleFile(), fileUrlSafeScriptPlugin()],
  build: {
    outDir: 'dist',
    target: 'es2017',
    modulePreload: false,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'WrmApp',
        inlineDynamicImports: true,
      },
    },
  },
});
