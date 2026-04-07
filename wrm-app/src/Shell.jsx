import React, { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import sealImg from './apps/flow/seal.png';
import { clearAllWrmStorage } from './shared/storage.js';

const FlowGuide = lazy(() => import('./apps/flow/FlowGuide.jsx'));
const IrpGenerator = lazy(() => import('./apps/irp/IrpGenerator.jsx'));
const OkaVlhpisa = lazy(() => import('./apps/oka/OkaVlhpisa.jsx'));

const APPS = [
  {
    id: 'flow',
    label: 'Wastewater Flow Guide',
    short: 'Flow Guide',
    blurb: 'Plan, fund, and deliver water / wastewater projects.',
    component: FlowGuide,
  },
  {
    id: 'irp',
    label: 'Impact Response Plan Generator',
    short: 'IRP Generator',
    blurb: 'Build drought, freeze, flood, and heat response plans.',
    component: IrpGenerator,
  },
  {
    id: 'oka',
    label: 'Oka Vlhpisa',
    short: 'Oka Vlhpisa',
    blurb: 'Choctaw water resource reference workspace.',
    component: OkaVlhpisa,
  },
];

const VERSION = '1.0.0';

function readHash() {
  const h = (window.location.hash || '').replace(/^#\/?/, '');
  return APPS.find((a) => a.id === h)?.id || APPS[0].id;
}

export default function Shell() {
  const [active, setActive] = useState(readHash);

  useEffect(() => {
    const onHash = () => setActive(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Keep the URL hash and document title in sync with the active tab
  // so deep links and browser tab labels stay correct.
  useEffect(() => {
    const app = APPS.find((a) => a.id === active);
    if (!app) return;
    document.title = `${app.label} · Choctaw Nation OWRM`;
    if ((window.location.hash || '').replace(/^#\/?/, '') !== active) {
      window.history.replaceState(null, '', `#/${active}`);
    }
  }, [active]);

  const selectApp = useCallback(
    (id) => {
      if (id === active) return;
      setActive(id);
    },
    [active]
  );

  // Arrow-key navigation across the tab row for keyboard users.
  const onTabKeyDown = useCallback(
    (e) => {
      const idx = APPS.findIndex((a) => a.id === active);
      if (idx < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        selectApp(APPS[(idx + 1) % APPS.length].id);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        selectApp(APPS[(idx - 1 + APPS.length) % APPS.length].id);
      } else if (e.key === 'Home') {
        e.preventDefault();
        selectApp(APPS[0].id);
      } else if (e.key === 'End') {
        e.preventDefault();
        selectApp(APPS[APPS.length - 1].id);
      }
    },
    [active, selectApp]
  );

  const onResetAll = useCallback(() => {
    const ok = window.confirm(
      'Reset ALL OWRM toolkit data on this browser?\n\n' +
        'This clears every saved plan, checklist, and form across all three tools. This cannot be undone.'
    );
    if (!ok) return;
    clearAllWrmStorage();
    window.location.reload();
  }, []);

  const Active = APPS.find((a) => a.id === active).component;
  const activeApp = APPS.find((a) => a.id === active);

  return (
    <div className="wrm-shell">
      <header className="wrm-shell-chrome" role="banner">
        <div className="wrm-shell-accent" aria-hidden="true" />
        <div className="wrm-shell-bar">
          <div className="wrm-shell-brand">
            <div className="wrm-shell-seal" aria-hidden="true">
              <img src={sealImg} alt="" />
            </div>
            <div className="wrm-shell-brand-copy">
              <span className="wrm-shell-eyebrow">Choctaw Nation of Oklahoma</span>
              <strong>OWRM Toolkit</strong>
              <span className="wrm-shell-sub">Office of Water Resource Management</span>
            </div>
          </div>
          <nav
            className="wrm-shell-tabs"
            role="tablist"
            aria-label="OWRM tools"
            onKeyDown={onTabKeyDown}
          >
            {APPS.map((a) => {
              const isActive = a.id === active;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  className={`wrm-shell-tab${isActive ? ' is-active' : ''}`}
                  onClick={() => selectApp(a.id)}
                  title={a.blurb}
                >
                  <span className="wrm-shell-tab-label">{a.short}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="wrm-shell-body" role="main" aria-label={activeApp.label}>
        <Suspense
          fallback={
            <div className="wrm-loading" role="status" aria-live="polite">
              <div className="wrm-loading-ring" aria-hidden="true" />
              <div className="wrm-loading-text">Loading {activeApp.label}…</div>
            </div>
          }
        >
          <Active />
        </Suspense>
      </main>
      <footer className="wrm-shell-footer" role="contentinfo">
        <div className="wrm-shell-footer-inner">
          <span className="wrm-shell-footer-mark" aria-hidden="true" />
          <span className="wrm-shell-footer-text">
            © {new Date().getFullYear()} Choctaw Nation of Oklahoma · Environmental Protection Service ·
            OWRM Toolkit v{VERSION}
          </span>
          <button
            type="button"
            className="wrm-shell-footer-link"
            onClick={onResetAll}
            title="Clear all saved data for every tool in this toolkit"
          >
            Reset all data
          </button>
        </div>
      </footer>
    </div>
  );
}
