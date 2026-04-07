// Namespaced localStorage helpers + one-time migration from the
// legacy standalone-app keys so existing users do not lose work
// when they switch to the unified WRM toolkit.

const NS = 'wrm:';

export function nsKey(app, key) {
  return `${NS}${app}:${key}`;
}

const LEGACY_MAP = [
  // [legacyKey, newKey]
  ['IRP_PLAN_v3', nsKey('irp', 'plan-v3')],
  ['ww-flow-guide-state-v3', nsKey('flow', 'state-v3')],
];

export function clearAllWrmStorage() {
  if (typeof localStorage === 'undefined') return;
  // Remove every wrm:* key plus the legacy standalone-app keys.
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith(NS) || k === 'IRP_PLAN_v3' || k === 'ww-flow-guide-state-v3') {
      toRemove.push(k);
    }
  }
  for (const k of toRemove) {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  }
}

export function runLegacyMigration() {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(nsKey('_meta', 'migrated-v1'))) return;
  for (const [oldKey, newKey] of LEGACY_MAP) {
    try {
      const v = localStorage.getItem(oldKey);
      if (v != null && localStorage.getItem(newKey) == null) {
        localStorage.setItem(newKey, v);
      }
    } catch {
      /* ignore */
    }
  }
  try {
    localStorage.setItem(nsKey('_meta', 'migrated-v1'), '1');
  } catch {
    /* ignore */
  }
}
