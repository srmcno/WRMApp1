
import React, { useEffect, useMemo, useState } from 'react';
import './flow.css';
import sealImg from './seal.png';
import { nsKey } from '../../shared/storage.js';

const STORAGE_KEY = nsKey('flow', 'state-v3');

const STAGES = [
  {
    "id": "determine",
    "order": 1,
    "title": "Determination & Condition Review",
    "eyebrow": "Start here",
    "theme": "blue",
    "summary": "Identify the issue, classify the work, and document what is driving the project forward.",
    "tasks": [
      "Review condition findings, sanitary survey notes, or compliance orders.",
      "Classify the work as maintenance, priority response, capital project, or emergency.",
      "Document the primary driver: health, sanitation, protection, water loss, pressure, treatment, mapping, pump station, tower, or damaged line.",
      "Define the affected assets, service area, and urgency level.",
      "Determine whether an environmental review (NEPA, NHPA, Section 106) may be triggered.",
      "Check for any active consent orders, compliance schedules, or DEQ deadlines."
    ]
  },
  {
    "id": "feasibility",
    "order": 2,
    "title": "Feasibility & Preliminary Engineering",
    "eyebrow": "Scope the work",
    "theme": "green",
    "summary": "Work through early engineering and planning before moving to funding or procurement.",
    "tasks": [
      "Confirm the DEQ flow or permit path that applies to this work.",
      "Complete feasibility study or preliminary engineering review (PER).",
      "Collect supporting field data, inspection observations, and system limitations.",
      "Identify the engineer of record, technical lead, or internal reviewer.",
      "Compare scope options for efficiency, cost, and long-term maintenance.",
      "Assess whether existing infrastructure can support the proposed scope or if upsizing is needed.",
      "Document any right-of-way, easement, or land acquisition requirements."
    ]
  },
  {
    "id": "funding",
    "order": 3,
    "title": "Funding Strategy & Financial Approval",
    "eyebrow": "Secure funding",
    "theme": "gold",
    "summary": "Build the funding path so the project has realistic approval and affordability before design advances.",
    "tasks": [
      "Identify whether the work is local maintenance, loan/grant eligible, or a mixed funding package.",
      "Evaluate tribal-specific funding sources: IHS SFC, USDA Rural Development, EPA DWSRF/CWSRF, HUD ICDBG.",
      "Prepare the FACT meeting or internal approval packet if required.",
      "Review loan and grant programs, match requirements, and application deadlines.",
      "Capture schedule, procurement, and debt service constraints.",
      "Confirm financial approval before final design begins.",
      "Coordinate with grants management on reporting and drawdown requirements."
    ]
  },
  {
    "id": "delivery",
    "order": 4,
    "title": "Design, Procurement & Closeout",
    "eyebrow": "Execute and close",
    "theme": "slate",
    "summary": "Complete final design, manage construction, and close out with all required documentation.",
    "tasks": [
      "Review final design, constructability, and maintenance expectations.",
      "Prepare bidding and procurement documents per applicable requirements (tribal, state, or federal).",
      "Coordinate construction engineering and resident inspection needs.",
      "Collect survey updates, project data, and as-built drawings.",
      "Submit all required progress and closeout reports to funding agencies.",
      "Close out with O&M manuals, punch list resolution, warranty documentation, and final records.",
      "Update GIS/asset inventory with new or modified infrastructure."
    ]
  }
];

const RESOURCES = [
  {
    "title": "IHS Sanitation Facilities Construction",
    "type": "Funding / construction",
    "agency": "Indian Health Service",
    "description": "SFC program for tribal water and wastewater infrastructure. Primary federal funding source for tribal sanitation deficiency projects.",
    "href": "https://www.ihs.gov/dsfc/",
    "contact": "IHS Oklahoma City Area Office",
    "tag": "Tribal"
  },
  {
    "title": "USDA Rural Development Water Programs",
    "type": "Funding / loan / grant",
    "agency": "USDA Rural Development",
    "description": "Water and waste disposal loans and grants for rural and tribal communities, including predevelopment planning grants.",
    "href": "https://www.rd.usda.gov/programs-services/water-environmental-programs",
    "contact": "USDA RD Oklahoma State Office",
    "tag": "Funding"
  },
  {
    "title": "EPA Tribal Drinking Water & Wastewater",
    "type": "Funding / technical assistance",
    "agency": "US EPA",
    "description": "EPA tribal infrastructure grant programs, DWSRF and CWSRF set-asides, and technical assistance for tribal water systems.",
    "href": "https://www.epa.gov/tribaldrinkingwater",
    "contact": "EPA Region 6 Tribal Program",
    "tag": "Tribal"
  },
  {
    "title": "DEQ Operator Certification",
    "type": "Training / licensing",
    "agency": "Oklahoma DEQ",
    "description": "Training, licensing, study guides, approved courses, and operator forms for water and wastewater staff.",
    "href": "https://www.deq.ok.gov/water-quality-division/operator-certification/",
    "contact": "OpCert Hotline: 405-702-8228",
    "tag": "Operators"
  },
  {
    "title": "DEQ GIS Maps & Data Viewer",
    "type": "Map / data",
    "agency": "Oklahoma DEQ",
    "description": "Map-based reference for DEQ data layers and downloadable GIS content for environmental context validation.",
    "href": "https://www.deq.ok.gov/",
    "contact": "See DEQ GIS Maps & Data",
    "tag": "GIS"
  },
  {
    "title": "DEQ Water Permits",
    "type": "Permitting",
    "agency": "Oklahoma DEQ",
    "description": "Entry point for municipal wastewater, industrial wastewater, stormwater, and construction permit topics.",
    "href": "https://www.deq.ok.gov/water-quality-division/permitting/",
    "contact": "Water Quality Division",
    "tag": "Permits"
  },
  {
    "title": "DEQ Permit Assistance",
    "type": "Process support",
    "agency": "Oklahoma DEQ",
    "description": "Support for projects with unclear permitting paths or stalled environmental permit applications.",
    "href": "https://www.deq.ok.gov/external-affairs-division/permit-assistance/",
    "contact": "Permit Assistance Team",
    "tag": "Support"
  },
  {
    "title": "OWRB Water & Wastewater Financing Viewer",
    "type": "Funding / map",
    "agency": "Oklahoma Water Resources Board",
    "description": "Interactive map for water and wastewater financing, recipient status, and public water supply references.",
    "href": "https://www.owrb.ok.gov/maps/pmg/owrbdata_WS.html",
    "contact": "OWRB general office",
    "tag": "Funding"
  },
  {
    "title": "OWRB Data & Maps",
    "type": "Reference data",
    "agency": "Oklahoma Water Resources Board",
    "description": "Oklahoma water rights, wells, watersheds, floodplain, and other map layers for planning support.",
    "href": "https://www.owrb.ok.gov/maps/pmg/DMindex.html",
    "contact": "OWRB data & maps",
    "tag": "Reference"
  },
  {
    "title": "DEQ Laboratory Accreditation",
    "type": "Lab verification",
    "agency": "Oklahoma DEQ",
    "description": "Confirm accredited lab support for water, wastewater, or sludge analytical needs on a project.",
    "href": "https://www.deq.ok.gov/state-environmental-laboratory-services/laboratory-accreditation/",
    "contact": "405-702-1000",
    "tag": "Lab"
  },
  {
    "title": "DEQ 401 Water Quality Certification",
    "type": "Jurisdiction trigger",
    "agency": "Oklahoma DEQ",
    "description": "Applies when work involves waters of the U.S. and a federal Section 404 permit may trigger state water quality review.",
    "href": "https://www.deq.ok.gov/water-quality-division/watershed-planning/water-quality-certification/",
    "contact": "Watershed Planning",
    "tag": "Wetlands"
  }
];

const SIGNALS = [
  {
    "title": "Permit status tracking",
    "copy": "Link permit pages, public review notices, and application documents here for centralized reference."
  },
  {
    "title": "Funding map cross-check",
    "copy": "Verify whether similar projects or systems appear in OWRB financing layers before finalizing the funding path."
  },
  {
    "title": "GIS context review",
    "copy": "Overlay service area, nearby waters, wetlands, or environmental features before scope is finalized."
  },
  {
    "title": "Training / licensing check",
    "copy": "Verify operator certification requirements early when startup or O&M responsibilities will change."
  },
  {
    "title": "Environmental review triggers",
    "copy": "Flag NEPA, NHPA, or Section 106 requirements tied to federal funding or impacts on tribal resources."
  }
];

const DOCUMENT_CHECKLIST = [
  { id: 'doc_per', label: 'Preliminary Engineering Report (PER)' },
  { id: 'doc_epa_form', label: 'Environmental review / NEPA documentation' },
  { id: 'doc_survey', label: 'Sanitary survey or condition assessment' },
  { id: 'doc_permits', label: 'Permit applications or approvals' },
  { id: 'doc_funding', label: 'Funding application(s) submitted' },
  { id: 'doc_design', label: 'Final design plans and specifications' },
  { id: 'doc_bid', label: 'Bid documents / procurement package' },
  { id: 'doc_contract', label: 'Executed construction contract' },
  { id: 'doc_asbuilt', label: 'As-built drawings received' },
  { id: 'doc_om', label: 'O&M manual delivered' },
  { id: 'doc_closeout', label: 'Closeout report submitted to funding agency' },
];

const INITIAL = {
  projectName: '',
  systemName: '',
  pws_id: '',
  location: '',
  owner: '',
  estimate: '',
  driver: 'Health / sanitation / protection',
  workClass: 'Priority project',
  severity: 'Moderate',
  fundingSource: '',
  targetStart: '',
  targetComplete: '',
  notes: '',
  contacts: '',
  selectedStage: 'determine',
  checks: Object.fromEntries(STAGES.flatMap(stage => stage.tasks.map((_, idx) => [`${stage.id}:${idx}`, false]))),
  docs: Object.fromEntries(DOCUMENT_CHECKLIST.map(d => [d.id, false])),
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw);
    return { ...INITIAL, ...parsed, checks: { ...INITIAL.checks, ...(parsed.checks || {}) }, docs: { ...INITIAL.docs, ...(parsed.docs || {}) } };
  } catch {
    return INITIAL;
  }
}

function pct(done, total) {
  return total ? Math.round((done / total) * 100) : 0;
}

function Header({ readiness }) {
  return (
    <header className="hero-shell">
      <div className="accent-bar" />
      <div className="hero-bg-orb orb-a" />
      <div className="hero-bg-orb orb-b" />
      <div className="hero-diamond-cluster" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
      </div>
      <div className="shell hero-grid">
        <div className="brand-column">
          <div className="brand-lockup">
            <div className="brand-seal-wrap">
              <img src={sealImg} alt="Great Seal of the Choctaw Nation" className="brand-seal" />
            </div>
            <div className="brand-divider" aria-hidden="true">
              <span />
              <i />
              <span />
            </div>
            <div className="brand-copy">
              <div className="brand-org">Choctaw Nation of Oklahoma</div>
              <div className="brand-dept">Environmental Protection Service</div>
              <div className="brand-rule" />
              <div className="brand-office">Office of Water Resource Management</div>
              <div className="brand-app-row">
                <span className="brand-app-name">Water / Wastewater Project Guide</span>
                <span className="brand-app-dot">&#9670;</span>
                <span className="brand-app-sub">Project Flow Navigator</span>
              </div>
            </div>
          </div>
          <div className="hero-text-block">
            <h1>Plan it right. Build it once.</h1>
            <p>
              A guided workflow for OWRM staff to move water and wastewater projects through
              determination, engineering, funding, and delivery with consistent documentation at every stage.
            </p>
            <div className="hero-chip-row">
              <span className="hero-chip"><b />Maintenance vs. project classification</span>
              <span className="hero-chip"><b />Tribal and state resource links</span>
              <span className="hero-chip"><b />Document checklist and print summary</span>
            </div>
          </div>
        </div>

        <aside className="hero-panel glass">
          <div className="hero-panel-label">Project readiness</div>
          <div className="readiness-ring" style={{ background: `conic-gradient(#009ada 0deg ${readiness * 3.6}deg, rgba(255,255,255,.15) ${readiness * 3.6}deg 360deg)` }}>
            <div className="readiness-ring-inner">
              <div>
                <strong>{readiness}%</strong>
                <span>overall complete</span>
              </div>
            </div>
          </div>
          <div className="hero-facts">
            <div><label>Workflow</label><strong>4 guided stages</strong></div>
            <div><label>Documents</label><strong>{DOCUMENT_CHECKLIST.length}-item checklist</strong></div>
            <div><label>Resources</label><strong>{RESOURCES.length} linked references</strong></div>
            <div><label>Output</label><strong>Print-ready summary</strong></div>
          </div>
        </aside>
      </div>
    </header>
  );
}

export default function FlowGuide() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const stageProgress = useMemo(() => STAGES.map(stage => {
    const total = stage.tasks.length;
    const done = stage.tasks.filter((_, idx) => state.checks[`${stage.id}:${idx}`]).length;
    return { ...stage, total, done, progress: pct(done, total) };
  }), [state.checks]);

  const docsComplete = useMemo(() => DOCUMENT_CHECKLIST.filter(d => state.docs[d.id]).length, [state.docs]);

  const readiness = useMemo(() => {
    const requiredFields = ['projectName', 'systemName', 'location', 'workClass', 'driver'];
    const fieldScore = requiredFields.filter(key => String(state[key] || '').trim()).length;
    const allTasks = STAGES.flatMap(stage => stage.tasks.map((_, idx) => state.checks[`${stage.id}:${idx}`] ? 1 : 0));
    const taskScore = allTasks.reduce((a, b) => a + b, 0);
    const docScore = DOCUMENT_CHECKLIST.filter(d => state.docs[d.id]).length;
    const total = requiredFields.length + allTasks.length + DOCUMENT_CHECKLIST.length;
    return Math.round(((fieldScore + taskScore + docScore) / total) * 100);
  }, [state]);

  const selectedStage = stageProgress.find(stage => stage.id === state.selectedStage) || stageProgress[0];

  const nextActions = useMemo(() => {
    const actions = [];
    if (!state.projectName) actions.push('Enter a project name and system to identify this effort.');
    if (state.workClass === 'Maintenance') actions.push('Document why this work is classified as maintenance rather than capital.');
    if (state.workClass !== 'Maintenance' && !state.fundingSource) actions.push('Identify the funding source or program before advancing to design.');
    if (state.driver.includes('Mapping')) actions.push('Gather GIS context early to support scope definition.');
    if (state.driver.includes('Pump') || state.driver.includes('Pressure')) actions.push('Document operational impacts and interim service risks.');
    if (selectedStage.done < selectedStage.total) actions.push(`${selectedStage.total - selectedStage.done} item(s) remaining in ${selectedStage.title}.`);
    if (!state.contacts) actions.push('Add key contacts (engineer, DEQ, OWRB, plant lead, etc.).');
    if (!state.targetStart && state.workClass !== 'Maintenance') actions.push('Set target start and completion dates for scheduling.');
    if (docsComplete < 3) actions.push(`${DOCUMENT_CHECKLIST.length - docsComplete} project documents still need attention.`);
    return actions.slice(0, 6);
  }, [state, selectedStage, docsComplete]);

  const summaryText = useMemo(() => {
    const complete = stageProgress.map(stage => `${stage.order}. ${stage.title} -- ${stage.done}/${stage.total} complete`).join('\n');
    const docStatus = DOCUMENT_CHECKLIST.map(d => `  [${state.docs[d.id] ? 'X' : ' '}] ${d.label}`).join('\n');
    return [
      `Project: ${state.projectName || 'Not set'}`,
      `System: ${state.systemName || 'Not set'}`,
      `PWS ID: ${state.pws_id || 'Not set'}`,
      `Location / community: ${state.location || 'Not set'}`,
      `Project owner: ${state.owner || 'Not set'}`,
      `Classification: ${state.workClass}`,
      `Primary driver: ${state.driver}`,
      `Severity: ${state.severity}`,
      `Estimated cost: ${state.estimate || 'Not set'}`,
      `Funding source: ${state.fundingSource || 'Not set'}`,
      `Target start: ${state.targetStart || 'Not set'}`,
      `Target completion: ${state.targetComplete || 'Not set'}`,
      '',
      'Stage Status',
      complete,
      '',
      'Document Checklist',
      docStatus,
      '',
      'Notes',
      state.notes || 'None entered.',
      '',
      'Contacts',
      state.contacts || 'None entered.'
    ].join('\n');
  }, [state, stageProgress]);

  function setField(key, value) { setState(prev => ({ ...prev, [key]: value })); }
  function toggleCheck(stageId, index) {
    const key = `${stageId}:${index}`;
    setState(prev => ({ ...prev, checks: { ...prev.checks, [key]: !prev.checks[key] } }));
  }
  function toggleDoc(docId) {
    setState(prev => ({ ...prev, docs: { ...prev.docs, [docId]: !prev.docs[docId] } }));
  }
  function resetAll() {
    if (!window.confirm('Reset all project guide data for this browser?')) return;
    setState(INITIAL);
  }

  return (
    <div className="app-shell">
      <Header readiness={readiness} />
      <main className="shell main-grid">
        <section className="card intro-card">
          <div className="section-kicker">Project setup</div>
          <div className="form-grid">
            <label><span>Project name</span><input value={state.projectName} onChange={e => setField('projectName', e.target.value)} placeholder="Lift station rehab, line replacement, pressure fix..." /></label>
            <label><span>System / facility</span><input value={state.systemName} onChange={e => setField('systemName', e.target.value)} placeholder="Durant WWTP, collection system, tower..." /></label>
            <label><span>PWS ID (if applicable)</span><input value={state.pws_id} onChange={e => setField('pws_id', e.target.value)} placeholder="OK0000000" /></label>
            <label><span>Location / community</span><input value={state.location} onChange={e => setField('location', e.target.value)} placeholder="Community, district, or affected area" /></label>
            <label><span>Project owner / lead</span><input value={state.owner} onChange={e => setField('owner', e.target.value)} placeholder="Staff lead or manager" /></label>
            <label><span>Estimated cost</span><input value={state.estimate} onChange={e => setField('estimate', e.target.value)} placeholder="$0" /></label>
            <label><span>Funding source</span><input value={state.fundingSource} onChange={e => setField('fundingSource', e.target.value)} placeholder="IHS SFC, USDA RD, CWSRF, tribal funds..." /></label>
            <label><span>Classification</span><select value={state.workClass} onChange={e => setField('workClass', e.target.value)}><option>Priority project</option><option>Maintenance</option><option>Capital project</option><option>Emergency response</option></select></label>
            <label><span>Primary driver</span><select value={state.driver} onChange={e => setField('driver', e.target.value)}><option>Health / sanitation / protection</option><option>Water loss reduction</option><option>Pressure / service reliability</option><option>Treatment process improvement</option><option>Mapping / infrastructure visibility</option><option>Pump station repair / construction</option><option>Tower repair / replacement</option><option>Damaged line repair / replacement</option><option>Regulatory compliance / consent order</option><option>Capacity expansion</option></select></label>
            <label><span>Severity</span><select value={state.severity} onChange={e => setField('severity', e.target.value)}><option>Low</option><option>Moderate</option><option>High</option><option>Critical</option></select></label>
            <label><span>Target start date</span><input type="date" value={state.targetStart} onChange={e => setField('targetStart', e.target.value)} /></label>
            <label><span>Target completion date</span><input type="date" value={state.targetComplete} onChange={e => setField('targetComplete', e.target.value)} /></label>
          </div>
          <div className="decision-banner">
            <div>
              <small>Classification</small>
              <strong>{state.workClass}</strong>
              <p>{state.workClass === 'Maintenance' ? 'Routine or contained scope. Document the work performed, impacts addressed, and rationale for keeping this outside a capital path.' : state.workClass === 'Emergency response' ? 'Immediate response required. Document conditions, interim measures, and transition plan to permanent repair or project if needed.' : 'Scoped project. Complete engineering review, approvals, and funding path before advancing to final design or procurement.'}</p>
            </div>
            <div className="decision-meta">
              <div><span>Driver</span><b>{state.driver}</b></div>
              <div><span>Severity</span><b>{state.severity}</b></div>
              <div><span>Estimate</span><b>{state.estimate || 'Not set'}</b></div>
            </div>
          </div>
        </section>

        <aside className="card action-card">
          <div className="section-kicker">Next actions</div>
          <ul className="action-list">{nextActions.map(item => <li key={item}>{item}</li>)}</ul>
          <div className="mini-panel">
            <div className="mini-panel-label">Reference checks</div>
            {SIGNALS.map(item => <div key={item.title} className="signal-row"><strong>{item.title}</strong><span>{item.copy}</span></div>)}
          </div>
        </aside>

        <section className="card stage-rail-card">
          <div className="section-kicker">Workflow stages</div>
          <div className="stage-rail">{stageProgress.map(stage => <button type="button" key={stage.id} className={`stage-pill ${state.selectedStage === stage.id ? 'is-active' : ''} theme-${stage.theme}`} onClick={() => setField('selectedStage', stage.id)}><span className="stage-pill-order">0{stage.order}</span><span className="stage-pill-main"><strong>{stage.title}</strong><small>{stage.done} / {stage.total} complete</small></span></button>)}</div>
        </section>

        <section className="card selected-stage-card">
          <div className="stage-header-row"><div><div className="section-kicker">{selectedStage.eyebrow}</div><h2>{selectedStage.title}</h2><p>{selectedStage.summary}</p></div><div className={`stage-count theme-${selectedStage.theme}`}><strong>{selectedStage.done} / {selectedStage.total}</strong><span>items checked</span></div></div>
          <div className="check-grid">{selectedStage.tasks.map((task, idx) => { const checked = state.checks[`${selectedStage.id}:${idx}`]; return <button key={task} type="button" className={`check-card ${checked ? 'checked' : ''}`} onClick={() => toggleCheck(selectedStage.id, idx)}><span className="check-box">{checked ? '\u2713' : ''}</span><span>{task}</span></button>; })}</div>
        </section>

        <section className="card doc-checklist-card">
          <div className="stage-header-row"><div><div className="section-kicker">Project documents</div><h2>Document Checklist</h2><p>Track key deliverables and submittals across the project lifecycle.</p></div><div className="stage-count theme-green"><strong>{docsComplete} / {DOCUMENT_CHECKLIST.length}</strong><span>documents</span></div></div>
          <div className="check-grid">{DOCUMENT_CHECKLIST.map(doc => { const checked = state.docs[doc.id]; return <button key={doc.id} type="button" className={`check-card ${checked ? 'checked' : ''}`} onClick={() => toggleDoc(doc.id)}><span className="check-box">{checked ? '\u2713' : ''}</span><span>{doc.label}</span></button>; })}</div>
        </section>

        <section className="card notes-card">
          <div className="section-kicker">Notes & handoff</div>
          <div className="notes-grid"><label><span>Working notes</span><textarea rows="8" value={state.notes} onChange={e => setField('notes', e.target.value)} placeholder="Assumptions, blockers, inspection findings, decisions, compliance deadlines..." /></label><label><span>Key contacts / agencies</span><textarea rows="8" value={state.contacts} onChange={e => setField('contacts', e.target.value)} placeholder="Engineer, DEQ contact, OWRB, IHS, plant lead, operator, vendor, inspector..." /></label></div>
          <div className="summary-box"><div className="summary-head"><div><div className="section-kicker">Print / copy summary</div><strong>Project packet summary</strong></div><div className="summary-actions"><button type="button" className="ghost-btn" onClick={() => navigator.clipboard.writeText(summaryText)}>Copy summary</button><button type="button" className="ghost-btn" onClick={() => window.print()}>Print</button><button type="button" className="ghost-btn danger" onClick={resetAll}>Reset</button></div></div><pre>{summaryText}</pre></div>
        </section>

        <section className="card resource-card">
          <div className="stage-header-row compact"><div><div className="section-kicker">Official resources</div><h2>State and Federal Reference Links</h2><p>Quick access to tribal, state, and federal agencies commonly referenced during water and wastewater project planning.</p></div></div>
          <div className="resource-grid">{RESOURCES.map(item => <a key={item.title} className="resource-tile" href={item.href} target="_blank" rel="noreferrer"><div className="resource-top"><span className="resource-tag">{item.tag}</span><span className="resource-type">{item.type}</span></div><strong>{item.title}</strong><p>{item.description}</p><div className="resource-meta">{item.agency} · {item.contact}</div></a>)}</div>
        </section>
      </main>
      <footer className="app-footer"><div className="shell footer-inner"><div className="footer-diamond" /><div><strong>&copy; 2026 Choctaw Nation of Oklahoma &middot; Environmental Protection Service</strong><p>Water / Wastewater Project Guide. Internal planning tool for OWRM project review, scoping, funding coordination, and delivery tracking.</p></div></div></footer>
    </div>
  );
}

