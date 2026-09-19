/**
 * categoryRegistry.js
 * Category extension registry for the Phase 2 vendor record schema.
 *
 * The core record in vendorSchema.js is category agnostic. Everything that differs
 * by category lives here: competitive classes, category specific dimensions, the
 * research order, and the lock state.
 *
 * Two rules govern this file.
 *   1. Nothing is invented. A class or dimension appears here only as a draft hypothesis
 *      until the category research validates it. draft is not evidence.
 *   2. No decision record in a category may be published until dimensionsLocked is true.
 *      Locking happens at the category calibration gate, not vendor by vendor.
 */

// @engine-start

export const REGISTRY_VERSION = '2.0.0';

export const CLASS_STATUS = ['draft', 'validated'];

function cat({ id, name, researchOrder, status, competitiveClasses = [], extensionDimensions = [], dimensionsLocked = false, classesStatus = 'draft', notes = '' }) {
  return { id, name, researchOrder, status, competitiveClasses, extensionDimensions, dimensionsLocked, classesStatus, notes };
}

function dim(id, label, whatItDecides) {
  return { id, label, whatItDecides };
}

/**
 * CCaaS is the first technical proof and the first category researched.
 * Classes and dimensions below are DRAFT hypotheses carried from Phase 1 workbooks.
 * They are revalidated by the CCaaS research before dimensionsLocked flips to true.
 */
const CCAAS = cat({
  id: 'ccaas',
  name: 'CCaaS',
  researchOrder: 1,
  status: 'inResearch',
  classesStatus: 'draft',
  dimensionsLocked: false,
  competitiveClasses: [
    { id: 'enterprise-suite-native', label: 'Enterprise suite native CCaaS', status: 'draft', definition: 'Full suite owned end to end, sold to large complex operations.' },
    { id: 'uc-native', label: 'UC native CCaaS', status: 'draft', definition: 'Contact center extended from a unified communications platform.' },
    { id: 'digital-first-cx-native', label: 'Digital first CX native', status: 'draft', definition: 'Built digital first, voice added later or partnered.' },
    { id: 'midmarket-operational', label: 'Mid market operational CCaaS', status: 'draft', definition: 'Speed to deploy and administrative simplicity over configurability.' },
    { id: 'regional-vertical-specialist', label: 'Regional or vertical specialist', status: 'draft', definition: 'Concentrated footprint by geography or industry with specialist depth.' },
    { id: 'bpo-embedded', label: 'BPO and embedded platform', status: 'draft', definition: 'Sold through or inside an outsourced delivery model.' },
  ],
  extensionDimensions: [
    dim('routingArchitecture', 'Routing architecture', 'Whether the operation can express its real routing rules without services work.'),
    dim('voiceInfrastructure', 'Voice infrastructure and carrier model', 'Who owns the carrier relationship, the quality risk and the cost variability.'),
    dim('digitalChannelDepth', 'Digital channel depth', 'Whether non voice channels are first class or bolted on.'),
    dim('workforceSuiteDepth', 'Native workforce suite depth', 'Whether WFM and QM are native, partnered or absent, and what that costs.'),
    dim('aiArchitecture', 'AI architecture and governance', 'Model control, versioning, audit trail and cost exposure.'),
    dim('crmIntegrationDepth', 'CRM and system of record integration', 'Depth beyond a screen pop. Where the data actually lives.'),
    dim('adminChangeControl', 'Administration and change control', 'Who can make a change, how long it takes, and what it costs.'),
    dim('reportingDataAccess', 'Reporting and raw data access', 'Whether the buyer can get their own data out without a professional services request.'),
    dim('deploymentResidency', 'Deployment and data residency', 'Regions, residency guarantees and hybrid options.'),
    dim('complianceControls', 'Compliance controls', 'Regulated controls that function as gates rather than weights.'),
    dim('commercialModel', 'Commercial model and cost exposure', 'Pricing structure, usage exposure and what is not in the base license.'),
    dim('migrationPath', 'Migration and lineage state', 'Whether the sold product is the surviving architecture after acquisition.'),
  ],
  notes: 'First technical proof. Classes and dimensions are Phase 1 hypotheses pending revalidation.',
});

/** The remaining seven. Declared so the registry is complete, deliberately empty until researched. */
const PENDING = [
  { id: 'iva', name: 'IVA and Conversational AI', researchOrder: 2 },
  { id: 'agent-assist', name: 'Agent Assist', researchOrder: 3 },
  { id: 'wfm-qm', name: 'Workforce and Quality Management', researchOrder: 4 },
  { id: 'experience-analytics', name: 'Experience Analytics and VoC', researchOrder: 5 },
  { id: 'cx-orchestration', name: 'CX Orchestration and Workflow', researchOrder: 6 },
  { id: 'digital-engagement', name: 'Digital Engagement', researchOrder: 7 },
  { id: 'payments-identity', name: 'Payments, Identity and Trust', researchOrder: 8 },
].map((c) => cat({
  ...c,
  status: 'pending',
  classesStatus: 'draft',
  dimensionsLocked: false,
  competitiveClasses: [],
  extensionDimensions: [],
  notes: 'Awaiting category research. Phase 1 workbooks are hypothesis sources, not current evidence.',
}));

export const CATEGORY_REGISTRY = Object.fromEntries([CCAAS, ...PENDING].map((c) => [c.id, c]));

export const CATEGORY_IDS = Object.keys(CATEGORY_REGISTRY);

export function getCategory(id) {
  const c = CATEGORY_REGISTRY[id];
  if (!c) throw new Error(`unknown category ${id}`);
  return c;
}

export function researchSequence() {
  return Object.values(CATEGORY_REGISTRY).sort((a, b) => a.researchOrder - b.researchOrder).map((c) => c.id);
}

export function isClassValid(categoryId, classId) {
  const c = CATEGORY_REGISTRY[categoryId];
  return Boolean(c && c.competitiveClasses.some((x) => x.id === classId));
}

/**
 * Lock a category at its calibration gate. Requires classes and dimensions to exist,
 * every class validated, and the gate named. Locking is a decision, not a side effect.
 */
export function lockCategory(categoryId, { gate, date, lockedClasses = [], lockedDimensions = [] }) {
  const c = getCategory(categoryId);
  if (!gate) throw new Error('lockCategory requires the calibration gate that authorized the lock');
  const classes = lockedClasses.length ? lockedClasses : c.competitiveClasses;
  const dims = lockedDimensions.length ? lockedDimensions : c.extensionDimensions;
  if (classes.length === 0) throw new Error(`cannot lock ${categoryId} with no competitive classes`);
  if (dims.length === 0) throw new Error(`cannot lock ${categoryId} with no extension dimensions`);
  return {
    ...c,
    status: 'locked',
    classesStatus: 'validated',
    competitiveClasses: classes.map((x) => ({ ...x, status: 'validated' })),
    extensionDimensions: dims,
    dimensionsLocked: true,
    lockedAt: date,
    lockedByGate: gate,
  };
}

// @engine-end
