# Impact Response Plan workspace 4.0

The active generator is `wrm-app/src/apps/irp/irp.html`. `IRPGenerator.html` is the matching standalone copy; `OWRM-Toolkit.html` is the rebuilt combined toolkit. The original `IRPGeneratorv3_8.html` remains unchanged as an archive, not the current release.

## Use

Open `IRPGenerator.html` in a current desktop browser, or select IRP Generator in the toolkit. No install, external scripts, fonts or network access are needed by the IRP. Browser storage is local, not a shared database. Keep JSON backups, particularly before moving the HTML, changing browsers or clearing browsing data. A populated plan or backup contains operational information; do not publish it to this public repository.

The workspace covers provider/facility information, historical demand, capacity, governance, communications, activation and recovery, optional enforcement/allocations, seasonal outreach, appendices, operations and review. Draft output retains unresolved review items. An adopted output requires recorded approval and no blocking input errors; it is not independent verification of adoption or compliance.

## Model changes

- Missing numeric values stay unknown; zero is a valid observation. Historical baselines use complete calendar years and actual year length. The multiple-year option weights by included days.
- A single documented system-wide growth assumption is either total growth or annual compound growth. Legacy sector percentages are not summed or silently migrated into the new calculation.
- Peak demand uses an observed maximum day or an explicit planning factor. Capacity is the lowest entered production, reliable-source and distribution limit. Source stress reduces available supply rather than inflating demand. Annual permitted/contract volume is checked separately.
- Storage screening deducts a protected reserve and distinguishes no-inflow coverage from projected net drawdown. It is not a hydraulic or water-quality model.
- Demand triggers require both magnitude and duration. Stage 2–6 thresholds increase with severity; recovery thresholds are lower than activation thresholds and require an explicit hold period. The evaluator recommends the highest satisfied demand criterion, never an automatic declaration.
- Contamination and pressure-loss indicators call for an operational response distinct from drought conservation. No advisory type is chosen automatically. Numeric presets are illustrative local planning examples, not regulatory limits.

## Data and integration

Standalone storage uses `irp_generator_v4`; the toolkit supplies `wrm:irp:plan-v4` explicitly. Legacy keys are read without being overwritten. Emails, dates, facilities, operations rows and manual narrative flags are saved. Unknown legacy form values remain in JSON backups. Invalid imports and corrupt current saves are not silently discarded. A recovery snapshot precedes import/reset; cross-tab conflicts pause autosave.

The optional `window.CNOBridge` import contract is retained and only fills empty fields. No working Oka publisher was present in the inspected baseline. The workspace therefore reports that absence rather than implying automatic synchronization. No new backend or live-data service has been added.

## Outputs and verification

The complete plan supports HTML, browser print/PDF, and editable Word-compatible HTML with a `.doc` extension. The latter is not a native `.docx` package. JSON backups preserve generator form data; generated plan HTML is a report, not an editable form backup.

The GitHub build runs a JavaScript syntax gate, real-browser regression tests including save/reload and legacy migration, the existing Vite build, and a combined-toolkit smoke test. Generated standalone/toolkit files are committed only after successful verification. The browser tests use fictional data in temporary files, never in the distributables.

EPA planning sources are linked in the workspace and generated plan, checked November 3, 2026. Provider-specific engineering, public-health, jurisdiction and governing approvals remain necessary.
