import React, { useEffect, useMemo, useRef } from 'react';
import irpHtml from './irp.html?raw';
import { nsKey } from '../../shared/storage.js';

// The legacy IRP generator is a self-contained vanilla JS/HTML
// document. We mount it inside a same-origin iframe via srcDoc so
// its global styles, scripts, BroadcastChannel and print CSS stay
// fully isolated from the React shell.
//
// Storage migration: the original app reads/writes
// localStorage['IRP_PLAN_v3']. We map that to the namespaced key
// `wrm:irp:plan-v3` by injecting a tiny shim into the iframe that
// proxies that exact key through to the parent's localStorage.

const IRP_LEGACY_KEY = 'IRP_PLAN_v3';
const IRP_NS_KEY = nsKey('irp', 'plan-v3');

const STORAGE_SHIM = `
<script>
(function () {
  try {
    var LEGACY = ${JSON.stringify(IRP_LEGACY_KEY)};
    var NS = ${JSON.stringify(IRP_NS_KEY)};
    var parentStore = window.parent && window.parent.localStorage;
    if (!parentStore) return;
    // Seed the iframe's own storage from the parent on boot.
    var seed = parentStore.getItem(NS);
    if (seed != null) {
      try { localStorage.setItem(LEGACY, seed); } catch (e) {}
    }
    // Mirror writes back to the parent's namespaced key.
    var origSet = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (k, v) {
      origSet(k, v);
      if (k === LEGACY) {
        try { parentStore.setItem(NS, v); } catch (e) {}
      }
    };
    var origRemove = localStorage.removeItem.bind(localStorage);
    localStorage.removeItem = function (k) {
      origRemove(k);
      if (k === LEGACY) {
        try { parentStore.removeItem(NS); } catch (e) {}
      }
    };
  } catch (e) { /* ignore */ }
})();
</script>
`;

function buildSrcDoc(html) {
  // Inject the storage shim as the very first <head> child so it
  // runs before any of the IRP app's own scripts touch localStorage.
  if (html.includes('<head>')) {
    return html.replace('<head>', '<head>' + STORAGE_SHIM);
  }
  if (html.includes('<head ')) {
    return html.replace(/<head([^>]*)>/, '<head$1>' + STORAGE_SHIM);
  }
  return STORAGE_SHIM + html;
}

export default function IrpGenerator() {
  const ref = useRef(null);
  const srcDoc = useMemo(() => buildSrcDoc(irpHtml), []);

  useEffect(() => {
    // Trigger a print on Ctrl/Cmd+P from the shell context too.
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && ref.current) {
        e.preventDefault();
        try { ref.current.contentWindow.print(); } catch {}
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
