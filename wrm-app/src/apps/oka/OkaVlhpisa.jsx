import React from 'react';
import okaHtml from './oka.html?raw';

// The Oka Vlhpisa zip ships only the built single-file HTML
// (no source). Until source is recovered we render it inside an
// isolated iframe via srcDoc — this preserves the original
// styling exactly while keeping the unified shell navigation.

export default function OkaVlhpisa() {
  return (
    <iframe
      title="Oka Vlhpisa"
      className="wrm-iframe"
      srcDoc={okaHtml}
      sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-downloads allow-forms"
    />
  );
}
