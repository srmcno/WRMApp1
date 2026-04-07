import React, { Suspense, lazy, useEffect, useState } from 'react';

const FlowGuide = lazy(() => import('./apps/flow/FlowGuide.jsx'));
const IrpGenerator = lazy(() => import('./apps/irp/IrpGenerator.jsx'));
const OkaVlhpisa = lazy(() => import('./apps/oka/OkaVlhpisa.jsx'));

const APPS = [
  {
    id: 'flow',
    label: 'Wastewater Flow Guide',
    short: 'Flow Guide',
    component: FlowGuide,
  },
  {
    id: 'irp',
    label: 'Impact Response Plan',
    short: 'IRP Generator',
    component: IrpGenerator,
  },
  {
    id: 'oka',
    label: 'Oka Vlhpisa',
    short: 'Oka Vlhpisa',
    component: OkaVlhpisa,
  },
];

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

  function selectApp(id) {
    if (id === active) return;
    window.location.hash = `#/${id}`;
    setActive(id);
  }

  const Active = APPS.find((a) => a.id === active).component;

  return (
    <div className="wrm-shell">
      <header className="wrm-shell-chrome" role="banner">
        <div className="wrm-shell-bar">
          <div className="wrm-shell-brand">
            <strong>Choctaw Nation OWRM Toolkit</strong>
            <span>Office of Water Resource Management</span>
          </div>
          <nav className="wrm-shell-tabs" aria-label="Tools">
            {APPS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`wrm-shell-tab${a.id === active ? ' is-active' : ''}`}
                onClick={() => selectApp(a.id)}
                aria-current={a.id === active ? 'page' : undefined}
              >
                {a.short}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="wrm-shell-body">
        <Suspense fallback={<div className="wrm-loading">Loading {APPS.find((a) => a.id === active).label}…</div>}>
          <Active />
        </Suspense>
      </main>
    </div>
  );
}
