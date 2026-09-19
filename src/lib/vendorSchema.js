/**
 * vendorSchema.js
 * Phase 2 vendor record schema for ContactCenterCX.
 *
 * Schema version 2.0.0. Authority: AI Builder Handoff V3 plus Addendum 1,
 * Market Position Index and Tool Separation Rules, 19 September 2026.
 *
 * Two record types. They are separate objects joined only by identity keys.
 *   IndexRecord     truth type: market.   Feeds the Market Position Index only.
 *   DecisionRecord  truth type: research. Feeds Vendor Intelligence and Vendor Match only.
 *
 * The wall is one way and absolute. An IndexRecord field may never reach Vendor Match.
 * See assertSeparation and toVendorMatchInput.
 *
 * Doctrine rules enforced here:
 *   Unknown does not equal weak. null plus a stated reason is valid. Zero is not a synonym for unknown.
 *   Confidence travels separately. Evidence state is never blended into a capability or position value.
 *   Date everything. Every rating carries sources and a last validated date.
 *   No precision beyond the evidence. Positions are integers and bands. No composite decimal is exposed.
 */

// @engine-start

export const SCHEMA_VERSION = '2.0.0';

export const TRUTH_TYPES = ['market', 'research', 'buyer', 'operational'];

export const RECORD_STATUS = ['draft', 'calibrated', 'normalized', 'published', 'stale'];

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

export const EVIDENCE_STATES = ['unrated', 'claimed', 'inferred', 'stronglySupported', 'verified'];

export const EVIDENCE_RANK = {
  unrated: 0,
  claimed: 1,
  inferred: 2,
  stronglySupported: 3,
  verified: 4,
};

/**
 * Source tiers per Addendum 1 Section 7.
 * maxInternal  highest evidence state this tier may reach in the internal corpus.
 * maxPublished highest evidence state this tier may reach on a public surface.
 * scorable     whether this tier may move a rating at all.
 */
export const SOURCE_TIERS = {
  publicDocumentation: {
    maxInternal: 'verified', maxPublished: 'verified',
    confidentialByDefault: false, scorable: true, requiresPermission: false,
  },
  publicDisclosure: {
    maxInternal: 'verified', maxPublished: 'verified',
    confidentialByDefault: false, scorable: true, requiresPermission: false,
  },
  vendorCollateral: {
    maxInternal: 'claimed', maxPublished: 'claimed',
    confidentialByDefault: false, scorable: true, requiresPermission: false,
    publishLabel: 'vendor stated',
  },
  vendorDemo: {
    maxInternal: 'stronglySupported', maxPublished: 'unrated',
    confidentialByDefault: true, scorable: true, requiresPermission: true,
  },
  rfpResponse: {
    maxInternal: 'inferred', maxPublished: 'unrated',
    confidentialByDefault: true, scorable: false, requiresPermission: true,
  },
  buyerTranscript: {
    maxInternal: 'inferred', maxPublished: 'unrated',
    confidentialByDefault: true, scorable: false, requiresPermission: true,
  },
  fieldIntelligence: {
    maxInternal: 'inferred', maxPublished: 'unrated',
    confidentialByDefault: true, scorable: false, requiresPermission: true,
  },
  analystReport: {
    maxInternal: 'unrated', maxPublished: 'unrated',
    confidentialByDefault: false, scorable: false, requiresPermission: false,
    factOfInclusionOnly: true,
  },
};

export const SOURCE_TIER_IDS = Object.keys(SOURCE_TIERS);

/* ------------------------------------------------------------------ */
/* Rating axes and index dimensions                                    */
/* ------------------------------------------------------------------ */

/** Five separate axes. Never summed. Never blended. Research Operating Standard. */
export const RATING_AXES = [
  'productCapability',
  'evidenceConfidence',
  'buyerFit',
  'operatingRisk',
  'implementationChange',
];

/** Five equally weighted index dimensions. Addendum 1 Section 4. */
export const INDEX_DIMENSIONS = [
  'marketFootprint',
  'customerEvidence',
  'solutionBreadth',
  'ecosystemInteroperability',
  'commercialMaturity',
];

export const RATING_MIN = 0;
export const RATING_MAX = 4;

/** Near ties are displayed as ties. Threshold in component points on a 0 to 20 sum. */
export const NEAR_TIE_THRESHOLD = 1;

/** A row may not be positioned unless at least this many dimensions are rated. */
export const MIN_RATED_DIMENSIONS_TO_POSITION = 3;

/** DRAFT band cuts, stated on the mean of rated dimensions. Pending sign off. */
export const POSITION_BANDS = [
  { id: 'leading', label: 'Leading Presence', minMean: 3.25 },
  { id: 'established', label: 'Established Presence', minMean: 2.25 },
  { id: 'emerging', label: 'Emerging Presence', minMean: 1.25 },
  { id: 'limited', label: 'Limited or Unproven Presence', minMean: 0 },
];

export const FIXED_BUYER_FIT_STATEMENT =
  'Buyer fit depends on your requirements. Position does not determine fit.';

/* ------------------------------------------------------------------ */
/* Decision record enumerations                                        */
/* ------------------------------------------------------------------ */

export const APPLICABILITY = ['allBuyers', 'conditional', 'narrow', 'notApplicable'];

export const CAPABILITY_MODES = [
  'native',
  'configurable',
  'partnerRequired',
  'customBuild',
  'absent',
  'unknown',
];

export const DECISION_EFFECTS = ['eliminates', 'differentiates', 'tiebreak', 'noMaterialEffect'];

export const REVERSIBILITY = ['reversible', 'costlyToReverse', 'irreversible', 'unknown'];

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(v) {
  return typeof v === 'string' && DATE_RE.test(v);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

/** A source reference. Every rating and every claim carries at least one. */
export function sourceRef({ tier, title, url = null, retrievedOn, confidential = null, publishPermission = 'unknown' }) {
  const tierDef = SOURCE_TIERS[tier];
  return {
    tier,
    title,
    url,
    retrievedOn,
    // An artifact with no confidentiality determination is treated as confidential.
    confidential: confidential === null ? (tierDef ? tierDef.confidentialByDefault : true) : confidential,
    publishPermission,
  };
}

/**
 * A rating on one axis or one index dimension.
 * value null means unrated and requires a reason. It never means zero.
 * value 0 means evidenced absence and requires absenceEvidenced true.
 */
export function rating({ value = null, unratedReason = null, basis = '', sources = [], lastValidated = null, absenceEvidenced = false }) {
  return { value, unratedReason, basis, sources, lastValidated, absenceEvidenced };
}

export function unrated(reason) {
  return rating({ value: null, unratedReason: reason });
}

/* ------------------------------------------------------------------ */
/* Evidence capping                                                    */
/* ------------------------------------------------------------------ */

/**
 * Cap an asserted evidence state to what the source tiers actually license.
 * surface is 'internal' or 'published'.
 */
export function capEvidence(asserted, tiers, surface = 'internal') {
  if (!EVIDENCE_STATES.includes(asserted)) return 'unrated';
  const key = surface === 'published' ? 'maxPublished' : 'maxInternal';
  let ceiling = 0;
  for (const t of tiers) {
    const def = SOURCE_TIERS[t];
    if (!def) continue;
    ceiling = Math.max(ceiling, EVIDENCE_RANK[def[key]]);
  }
  const capped = Math.min(EVIDENCE_RANK[asserted], ceiling);
  return EVIDENCE_STATES[capped];
}

/* ------------------------------------------------------------------ */
/* Record factories                                                    */
/* ------------------------------------------------------------------ */

const IDENTITY_KEYS = ['schemaVersion', 'vendorId', 'vendorName', 'categoryId', 'competitiveClassId'];

export function emptyIndexRecord({ vendorId, vendorName, categoryId, competitiveClassId }) {
  const dims = {};
  for (const d of INDEX_DIMENSIONS) dims[d] = unrated('Not yet researched.');
  return {
    schemaVersion: SCHEMA_VERSION,
    truthType: 'market',
    vendorId,
    vendorName,
    categoryId,
    competitiveClassId,
    status: 'draft',
    dimensions: dims,
    marketRead: {
      whatTheySell: '',
      bestKnownFor: '',
      lineageOwnership: '',
      recentMoves: [],
      marketCaveat: '',
    },
    buyerFitStatement: FIXED_BUYER_FIT_STATEMENT,
    routing: { researchPageUrl: null, vendorMatchUrl: '/vendor-match' },
    methodologyUrl: null,
    lastValidated: null,
  };
}

export function emptyDecisionRecord({ vendorId, vendorName, categoryId, competitiveClassId }) {
  const axes = {};
  for (const a of RATING_AXES) axes[a] = unrated('Not yet researched.');
  return {
    schemaVersion: SCHEMA_VERSION,
    truthType: 'research',
    vendorId,
    vendorName,
    categoryId,
    competitiveClassId,
    status: 'draft',
    axes,
    claims: [],
    breaks: [],
    consequences: [],
    implementationGravity: null,
    dayTwoOwnership: null,
    changeEconomics: null,
    proofRequirements: [],
    lineage: {
      phase1Baseline: null,
      charterVersion: null,
      claimMigrationLedger: [],
      evidenceLedger: [],
      scoreDeltaLedger: [],
      calibrationGate: null,
      publishedAt: null,
      revalidation: { cadenceDays: 180, nextDue: null, trigger: null },
    },
    lastValidated: null,
  };
}

export function atomicClaim({
  id, dimensionId, statement,
  applicability = 'conditional',
  capability = 'unknown',
  evidenceState = 'unrated',
  sources = [],
  proofQuestion = null,
  decisionEffect = 'noMaterialEffect',
  lastValidated = null,
}) {
  return {
    id, dimensionId, statement,
    applicability,
    capability,
    evidence: { state: evidenceState, sources },
    proof: { question: proofQuestion, method: null, owner: null },
    decisionEffect,
    lastValidated,
  };
}

export function breakRecord({ id, condition, threshold = null, symptom, consequenceId = null, workaround = null, evidenceState = 'unrated', sources = [], lastValidated = null }) {
  return { id, condition, threshold, symptom, consequenceId, workaround, evidence: { state: evidenceState, sources }, lastValidated };
}

export function consequenceRecord({ id, trigger, operationalConsequence, costConsequence = null, ownerAfterGoLive = null, reversibility = 'unknown', evidenceState = 'unrated', sources = [], lastValidated = null }) {
  return { id, trigger, operationalConsequence, costConsequence, ownerAfterGoLive, reversibility, evidence: { state: evidenceState, sources }, lastValidated };
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function validateRating(r, path, errors) {
  if (!r || typeof r !== 'object') { errors.push(`${path}: missing rating object`); return; }
  if (r.value === null) {
    if (!isNonEmptyString(r.unratedReason)) errors.push(`${path}: unrated requires a stated reason`);
    return;
  }
  if (!Number.isInteger(r.value)) { errors.push(`${path}: rating must be an integer or null`); return; }
  if (r.value < RATING_MIN || r.value > RATING_MAX) errors.push(`${path}: rating out of range ${RATING_MIN} to ${RATING_MAX}`);
  if (r.value === 0 && r.absenceEvidenced !== true) {
    errors.push(`${path}: zero requires evidenced absence. Unknown is null with a reason, never zero`);
  }
  if (!Array.isArray(r.sources) || r.sources.length === 0) errors.push(`${path}: rated value requires at least one source`);
  if (!isIsoDate(r.lastValidated)) errors.push(`${path}: rated value requires lastValidated as YYYY-MM-DD`);
  if (Array.isArray(r.sources)) {
    for (const s of r.sources) {
      const def = SOURCE_TIERS[s.tier];
      if (!def) { errors.push(`${path}: unknown source tier ${s.tier}`); continue; }
      if (!isIsoDate(s.retrievedOn)) errors.push(`${path}: source ${s.title} requires retrievedOn`);
    }
    const scorable = r.sources.some((s) => SOURCE_TIERS[s.tier] && SOURCE_TIERS[s.tier].scorable);
    if (!scorable) errors.push(`${path}: no scorable source. Analyst, RFP, transcript and field sources never move a rating`);
  }
}

export function validateIndexRecord(rec, registry = null) {
  const errors = [];
  const warnings = [];
  if (!rec || typeof rec !== 'object') return { ok: false, errors: ['record is not an object'], warnings };
  if (rec.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion must be ${SCHEMA_VERSION}`);
  if (rec.truthType !== 'market') errors.push('index record truthType must be market');
  for (const k of ['vendorId', 'vendorName', 'categoryId', 'competitiveClassId']) {
    if (!isNonEmptyString(rec[k])) errors.push(`${k} is required`);
  }
  if (rec.buyerFitStatement !== FIXED_BUYER_FIT_STATEMENT) errors.push('buyerFitStatement must use the fixed language');
  for (const d of INDEX_DIMENSIONS) validateRating(rec.dimensions && rec.dimensions[d], `dimensions.${d}`, errors);
  const extra = Object.keys(rec.dimensions || {}).filter((k) => !INDEX_DIMENSIONS.includes(k));
  if (extra.length) errors.push(`index record carries non index dimensions: ${extra.join(', ')}`);
  if (registry) {
    const cat = registry[rec.categoryId];
    if (!cat) errors.push(`unknown categoryId ${rec.categoryId}`);
    else if (!cat.competitiveClasses.some((c) => c.id === rec.competitiveClassId)) {
      errors.push(`competitiveClassId ${rec.competitiveClassId} is not declared for ${rec.categoryId}`);
    }
  }
  if (!isNonEmptyString(rec.marketRead && rec.marketRead.marketCaveat)) {
    warnings.push('marketRead.marketCaveat is empty. A ranked row without a market read is not a deliverable');
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function validateDecisionRecord(rec, registry = null) {
  const errors = [];
  const warnings = [];
  if (!rec || typeof rec !== 'object') return { ok: false, errors: ['record is not an object'], warnings };
  if (rec.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion must be ${SCHEMA_VERSION}`);
  if (rec.truthType !== 'research') errors.push('decision record truthType must be research');
  for (const k of ['vendorId', 'vendorName', 'categoryId', 'competitiveClassId']) {
    if (!isNonEmptyString(rec[k])) errors.push(`${k} is required`);
  }
  for (const a of RATING_AXES) validateRating(rec.axes && rec.axes[a], `axes.${a}`, errors);
  const extraAxes = Object.keys(rec.axes || {}).filter((k) => !RATING_AXES.includes(k));
  if (extraAxes.length) errors.push(`undeclared axes: ${extraAxes.join(', ')}`);

  const declared = registry && registry[rec.categoryId] ? registry[rec.categoryId].extensionDimensions.map((d) => d.id) : null;
  for (const c of rec.claims || []) {
    if (!isNonEmptyString(c.id)) errors.push('claim missing id');
    if (!APPLICABILITY.includes(c.applicability)) errors.push(`claim ${c.id}: bad applicability`);
    if (!CAPABILITY_MODES.includes(c.capability)) errors.push(`claim ${c.id}: bad capability mode`);
    if (!DECISION_EFFECTS.includes(c.decisionEffect)) errors.push(`claim ${c.id}: bad decisionEffect`);
    if (!EVIDENCE_STATES.includes(c.evidence && c.evidence.state)) errors.push(`claim ${c.id}: bad evidence state`);
    if (c.evidence && c.evidence.state !== 'unrated') {
      const tiers = (c.evidence.sources || []).map((s) => s.tier);
      if (tiers.length === 0) errors.push(`claim ${c.id}: evidence state above unrated requires a source`);
      const capped = capEvidence(c.evidence.state, tiers, 'internal');
      if (capped !== c.evidence.state) errors.push(`claim ${c.id}: evidence state ${c.evidence.state} exceeds source tier ceiling ${capped}`);
    }
    if (c.capability === 'unknown' && c.decisionEffect === 'eliminates') {
      errors.push(`claim ${c.id}: unknown capability may not eliminate a vendor. Unknown does not equal weak`);
    }
    if (declared && c.dimensionId && !declared.includes(c.dimensionId)) {
      errors.push(`claim ${c.id}: dimension ${c.dimensionId} is not declared for ${rec.categoryId}`);
    }
  }
  for (const b of rec.breaks || []) {
    if (b.consequenceId && !(rec.consequences || []).some((x) => x.id === b.consequenceId)) {
      errors.push(`break ${b.id}: consequenceId ${b.consequenceId} does not resolve`);
    }
  }
  if ((rec.claims || []).length > 0 && (rec.proofRequirements || []).length === 0) {
    warnings.push('no proof requirements generated. Vendor stated and unresolved claims should produce proof questions');
  }
  return { ok: errors.length === 0, errors, warnings };
}

/* ------------------------------------------------------------------ */
/* The separation wall                                                 */
/* ------------------------------------------------------------------ */

export const INDEX_ONLY_KEYS = ['dimensions', 'marketRead', 'buyerFitStatement', 'routing', 'methodologyUrl'];
export const DECISION_ONLY_KEYS = ['axes', 'claims', 'breaks', 'consequences', 'implementationGravity', 'dayTwoOwnership', 'changeEconomics', 'proofRequirements', 'lineage'];

/** Fails if either record has leaked into the other. Static check for the acceptance criteria. */
export function assertSeparation(indexRecord, decisionRecord) {
  const errors = [];
  for (const k of DECISION_ONLY_KEYS) {
    if (indexRecord && Object.prototype.hasOwnProperty.call(indexRecord, k)) errors.push(`index record carries decision key ${k}`);
  }
  for (const k of INDEX_ONLY_KEYS) {
    if (decisionRecord && Object.prototype.hasOwnProperty.call(decisionRecord, k)) errors.push(`decision record carries index key ${k}`);
  }
  if (indexRecord && decisionRecord && indexRecord.vendorId !== decisionRecord.vendorId) {
    errors.push('records do not describe the same vendor');
  }
  return { ok: errors.length === 0, errors };
}

/**
 * The only supported path into Vendor Match. Whitelist projection.
 * Throws on an index record. No market position field exists downstream of this function.
 */
export function toVendorMatchInput(decisionRecord) {
  if (!decisionRecord || decisionRecord.truthType !== 'research') {
    throw new Error('toVendorMatchInput requires a research truth type record. Market position never feeds Vendor Match');
  }
  for (const k of INDEX_ONLY_KEYS) {
    if (Object.prototype.hasOwnProperty.call(decisionRecord, k)) {
      throw new Error(`separation violation: ${k} present on a decision record`);
    }
  }
  return {
    vendorId: decisionRecord.vendorId,
    vendorName: decisionRecord.vendorName,
    categoryId: decisionRecord.categoryId,
    competitiveClassId: decisionRecord.competitiveClassId,
    axes: decisionRecord.axes,
    claims: decisionRecord.claims,
    breaks: decisionRecord.breaks,
    proofRequirements: decisionRecord.proofRequirements,
    lastValidated: decisionRecord.lastValidated,
  };
}

/* ------------------------------------------------------------------ */
/* Index ordering. Class scoped. Ties exposed. No composite decimal.   */
/* ------------------------------------------------------------------ */

export function bandFor(mean) {
  for (const b of POSITION_BANDS) if (mean >= b.minMean) return b;
  return POSITION_BANDS[POSITION_BANDS.length - 1];
}

/**
 * Order one competitive class. Never call across classes.
 * Returns rows with integer position, tie group, band and visible components.
 */
export function computeIndexPositions(records) {
  const classIds = new Set(records.map((r) => r.competitiveClassId));
  if (classIds.size > 1) throw new Error('index positions are scoped to one competitive class');

  const scored = records.map((r) => {
    const rated = INDEX_DIMENSIONS.map((d) => r.dimensions[d]).filter((x) => x && x.value !== null);
    const sum = rated.reduce((a, x) => a + x.value, 0);
    const mean = rated.length ? sum / rated.length : 0;
    return {
      vendorId: r.vendorId,
      vendorName: r.vendorName,
      competitiveClassId: r.competitiveClassId,
      components: Object.fromEntries(INDEX_DIMENSIONS.map((d) => [d, r.dimensions[d].value])),
      ratedCount: rated.length,
      _sum: sum,
      _mean: mean,
      positionable: rated.length >= MIN_RATED_DIMENSIONS_TO_POSITION,
      partiallyRated: rated.length < INDEX_DIMENSIONS.length,
      band: rated.length >= MIN_RATED_DIMENSIONS_TO_POSITION ? bandFor(mean).label : 'Insufficient evidence to position',
      lastValidated: r.lastValidated,
    };
  });

  const positionable = scored.filter((s) => s.positionable).sort((a, b) => b._sum - a._sum);
  const unpositioned = scored.filter((s) => !s.positionable);

  let position = 0;
  let anchor = null;
  const out = [];
  for (const row of positionable) {
    if (anchor === null || anchor - row._sum > NEAR_TIE_THRESHOLD) {
      position = out.length + 1;
      anchor = row._sum;
    }
    out.push({ ...row, position });
  }
  const total = out.length;
  for (const row of out) {
    row.tiedWith = out.filter((o) => o.position === row.position && o.vendorId !== row.vendorId).map((o) => o.vendorId);
    row.positionLabel = `Market Position: ${row.position} of ${total}`;
    delete row._sum;
    delete row._mean;
  }
  for (const row of unpositioned) {
    row.position = null;
    row.tiedWith = [];
    row.positionLabel = 'Unpositioned. Insufficient rated dimensions';
    delete row._sum;
    delete row._mean;
  }
  return [...out, ...unpositioned];
}

/* ------------------------------------------------------------------ */
/* Gates                                                               */
/* ------------------------------------------------------------------ */

/**
 * Completion gate. A record may not be published until it passes.
 * Mirrors the V3 lock criteria applied to research artifacts.
 */
export function completionGate(rec, registry = null) {
  const failures = [];
  const isIndex = rec.truthType === 'market';
  const v = isIndex ? validateIndexRecord(rec, registry) : validateDecisionRecord(rec, registry);
  failures.push(...v.errors);

  if (!isIsoDate(rec.lastValidated)) failures.push('lastValidated is required before publication');

  if (isIndex) {
    if (!isNonEmptyString(rec.methodologyUrl)) failures.push('methodology page link is required on every index row');
    if (!isNonEmptyString(rec.routing && rec.routing.vendorMatchUrl)) failures.push('index row requires routing into Vendor Match');
    for (const f of ['whatTheySell', 'bestKnownFor', 'lineageOwnership', 'marketCaveat']) {
      if (!isNonEmptyString(rec.marketRead && rec.marketRead[f])) failures.push(`marketRead.${f} is required. A ranked row without a market read is not a deliverable`);
    }
  } else {
    if (!rec.lineage || !isNonEmptyString(rec.lineage.charterVersion)) failures.push('lineage.charterVersion is required');
    if (!rec.lineage || !isNonEmptyString(rec.lineage.calibrationGate)) failures.push('record must clear a calibration or normalization gate before publication');
    if (!rec.implementationGravity) failures.push('implementationGravity is required');
    if (!rec.dayTwoOwnership) failures.push('dayTwoOwnership is required');
    if (!rec.changeEconomics) failures.push('changeEconomics is required');
    if (registry && registry[rec.categoryId] && registry[rec.categoryId].dimensionsLocked !== true) {
      failures.push(`category ${rec.categoryId} dimensions are not locked. Lock the extension set before publishing records`);
    }
  }
  return { ok: failures.length === 0, failures };
}

/**
 * Score change control. The only supported way to move a rated value.
 * Every material change carries a reason, evidence and a gate, and is appended to the lineage.
 */
export function applyScoreChange(rec, { path, to, reason, evidenceRefs = [], gate, date, absenceEvidenced = false }) {
  if (!isNonEmptyString(reason)) throw new Error('score change requires a stated reason');
  if (!Array.isArray(evidenceRefs) || evidenceRefs.length === 0) throw new Error('score change requires evidence references');
  if (!isNonEmptyString(gate)) throw new Error('score change requires the calibration or normalization gate it cleared');
  if (!isIsoDate(date)) throw new Error('score change requires a date');

  const isIndex = rec.truthType === 'market';
  const bucket = isIndex ? rec.dimensions : rec.axes;
  const current = bucket[path];
  if (!current) throw new Error(`unknown rating path ${path}`);
  if (to !== null && (!Number.isInteger(to) || to < RATING_MIN || to > RATING_MAX)) {
    throw new Error(`value out of range for ${path}`);
  }
  if (to === 0 && absenceEvidenced !== true) throw new Error('zero requires evidenced absence');

  const from = current.value;
  const next = {
    ...rec,
    [isIndex ? 'dimensions' : 'axes']: {
      ...bucket,
      [path]: {
        ...current,
        value: to,
        unratedReason: to === null ? (current.unratedReason || reason) : null,
        sources: evidenceRefs,
        lastValidated: date,
        absenceEvidenced,
      },
    },
    lastValidated: date,
  };
  if (!isIndex) {
    next.lineage = {
      ...rec.lineage,
      scoreDeltaLedger: [...rec.lineage.scoreDeltaLedger, { date, path, from, to, reason, evidenceRefs, gate }],
    };
  }
  return next;
}

/** Freshness. Stale is flagged, never silently presented as current. */
export function isStale(rec, today, cadenceDays = 180) {
  if (!isIsoDate(rec.lastValidated) || !isIsoDate(today)) return true;
  const ms = Date.parse(today) - Date.parse(rec.lastValidated);
  return ms / 86400000 > cadenceDays;
}

// @engine-end
