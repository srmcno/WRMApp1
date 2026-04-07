import React, { useMemo } from 'react';
import okaHtmlB64 from './oka.html?b64';

// The Oka Vlhpisa zip ships only the built single-file HTML
// (no source). Until source is recovered we render it inside an
// isolated iframe via srcDoc — this preserves the original
// styling exactly while keeping the unified shell navigation.
//
// We base64-encode at build time so the inlined bundle never
// contains a literal </script> sequence (which would break
// vite-plugin-singlefile output and make the page render blank).
function decodeHtml(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}

export default function OkaVlhpisa() {
  const srcDoc = useMemo(() => decodeHtml(okaHtmlB64), []);
  return (
    <iframe
      title="Oka Vlhpisa"
      className="wrm-iframe"
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-downloads allow-forms"
    />
  );
}
