import React, { useEffect, useMemo, useRef } from 'react';
import irpHtmlB64 from './irp.html?b64';
import { nsKey } from '../../shared/storage.js';

// Base64 prevents nested HTML closing-script tags from breaking the single-file build.
function decodeHtml(b64) {
  const bytes = Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function buildSrcDoc(html) {
  // The app owns its persistence. Do not monkey-patch the browser's Storage object.
  // Read historical keys for migration, but never overwrite them during migration.
  const config = {
    storageKey: nsKey('irp', 'plan-v4'),
    legacyKeys: ['irp_generator_v4', nsKey('irp', 'plan-v3'), 'irp_generator_save', 'IRP_PLAN_v3'],
  };
  const bootstrap = `<script>window.IRP_CONFIG=${JSON.stringify(config)};<\/script>`;
  return html.replace(/<head\b[^>]*>/i, (head) => head + bootstrap);
}

export default function IrpGenerator() {
  const ref = useRef(null);
  const srcDoc = useMemo(() => buildSrcDoc(decodeHtml(irpHtmlB64)), []);

  useEffect(() => {
    function onKey(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        const printPlan = ref.current?.contentWindow?.printPlan;
        if (typeof printPlan === 'function') {
          event.preventDefault();
          printPlan();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <iframe
      ref={ref}
      title="Impact Response Plan Generator"
      className="wrm-iframe"
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-downloads allow-forms"
    />
  );
}
