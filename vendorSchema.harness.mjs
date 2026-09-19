/**
 * vendorSchema.harness.mjs
 * Boundary probe and assertions for the Phase 2 vendor record schema.
 * Run: node tests/vendorSchema.harness.mjs
 */

import {
  SCHEMA_VERSION, EVIDENCE_STATES, EVIDENCE_RANK, SOURCE_TIERS,
  RATING_AXES, INDEX_DIMENSIONS, FIXED_BUYER_FIT_STATEMENT,
  emptyIndexRecord, emptyDecisionRecord, atomicClaim, breakRecord, consequenceRecord,
  rating, unrated, sourceRef, capEvidence,
  validateIndexRecord, validateDecisionRecord,
  assertSeparation, toVendorMatchInput,
  computeIndexPositions, bandFor, completionGate, applyScoreChange, isStale,
} from '../src/lib/vendorSchema.js';

import { CATEGORY_REGISTRY, getCategory, researchSequence, isClassValid, lockCategory } from '../src/lib/categoryRegistry.js';

let pass = 0;
const fails = [];
function ok(cond, label) { if (cond) pass += 1; else fails.push(label); }
function eq(a, b, label) { ok(JSON.stringify(a) === JSON.stringify(b), `${label} (got ${JSON.stringify(a)})`); }
function throws(fn, label) { try { fn(); fails.push(`${label} (did not throw)`); } catch { pass += 1; } }

const TODAY = '2026-09-19';
const doc = () => sourceRef({ tier: 'publicDocumentation', title: 'Product documentation', url: 'https://example.com/docs', retrievedOn: TODAY });
const collateral = () => sourceRef({ tier: 'vendorCollateral', title: 'White paper', retrievedOn: TODAY });
const analyst = () => sourceRef({ tier: 'analystReport', title: 'Firm, report, date', retrievedOn: TODAY });

/* 1. Constants and shape */
ok(SCHEMA_VERSION === '2.0.0', 'schema version pinned');
eq(EVIDENCE_STATES.length, 5, 'five evidence states');
ok(EVIDENCE_RANK.verified > EVIDENCE_RANK.claimed, 'evidence ranks ordered');
eq(RATING_AXES.length, 5, 'five rating axes');
eq(INDEX_DIMENSIONS.length, 5, 'five index dimensions');
ok(!RATING_AXES.some((a) => INDEX_DIMENSIONS.includes(a)), 'axes and index dimensions do not overlap');
ok(SOURCE_TIERS.analystReport.scorable === false, 'analyst reports never score');
ok(SOURCE_TIERS.rfpResponse.maxPublished === 'unrated', 'RFP responses never publish');
ok(SOURCE_TIERS.buyerTranscript.confidentialByDefault === true, 'transcripts confidential by default');

/* 2. Source determination defaults */
const undetermined = sourceRef({ tier: 'vendorDemo', title: 'Recorded demo', retrievedOn: TODAY });
ok(undetermined.confidential === true, 'undetermined confidentiality defaults to confidential');
ok(doc().confidential === false, 'public documentation is not confidential');

/* 3. Evidence capping */
eq(capEvidence('verified', ['vendorCollateral'], 'internal'), 'claimed', 'collateral caps at claimed');
eq(capEvidence('verified', ['vendorDemo'], 'internal'), 'stronglySupported', 'demo caps at strongly supported internally');
eq(capEvidence('stronglySupported', ['vendorDemo'], 'published'), 'unrated', 'demo publishes nothing without permission');
eq(capEvidence('verified', ['publicDocumentation'], 'published'), 'verified', 'documentation may reach verified');
eq(capEvidence('verified', ['analystReport'], 'internal'), 'unrated', 'analyst inclusion is never evidence');
eq(capEvidence('claimed', ['vendorCollateral', 'publicDocumentation'], 'internal'), 'claimed', 'ceiling is the highest tier present');

/* 4. Rating validation. Unknown does not equal weak. */
const idx = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
let v = validateIndexRecord(idx, CATEGORY_REGISTRY);
ok(v.ok, 'empty index record with stated unrated reasons is valid');
ok(v.warnings.length > 0, 'empty market read raises a warning');

const noReason = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
noReason.dimensions.marketFootprint = rating({ value: null });
ok(!validateIndexRecord(noReason, CATEGORY_REGISTRY).ok, 'unrated without a reason fails');

const zeroNoEvidence = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
zeroNoEvidence.dimensions.marketFootprint = rating({ value: 0, sources: [doc()], lastValidated: TODAY });
ok(!validateIndexRecord(zeroNoEvidence, CATEGORY_REGISTRY).ok, 'zero without evidenced absence fails');

const zeroEvidenced = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
zeroEvidenced.dimensions.marketFootprint = rating({ value: 0, sources: [doc()], lastValidated: TODAY, absenceEvidenced: true });
ok(validateIndexRecord(zeroEvidenced, CATEGORY_REGISTRY).ok, 'zero with evidenced absence passes');

const outOfRange = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
outOfRange.dimensions.marketFootprint = rating({ value: 5, sources: [doc()], lastValidated: TODAY });
ok(!validateIndexRecord(outOfRange, CATEGORY_REGISTRY).ok, 'rating above four fails');

const undated = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
undated.dimensions.marketFootprint = rating({ value: 3, sources: [doc()] });
ok(!validateIndexRecord(undated, CATEGORY_REGISTRY).ok, 'rated value without a date fails');

const sourceless = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
sourceless.dimensions.marketFootprint = rating({ value: 3, lastValidated: TODAY });
ok(!validateIndexRecord(sourceless, CATEGORY_REGISTRY).ok, 'rated value without a source fails');

const analystOnly = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
analystOnly.dimensions.marketFootprint = rating({ value: 4, sources: [analyst()], lastValidated: TODAY });
ok(!validateIndexRecord(analystOnly, CATEGORY_REGISTRY).ok, 'analyst only source cannot move a rating');

/* 5. Index record structural rules */
const badStatement = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
badStatement.buyerFitStatement = 'Top pick for most buyers.';
ok(!validateIndexRecord(badStatement, CATEGORY_REGISTRY).ok, 'buyer fit statement is fixed language');
ok(idx.buyerFitStatement === FIXED_BUYER_FIT_STATEMENT, 'factory carries the fixed statement');

const badClass = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'invented-class' });
ok(!validateIndexRecord(badClass, CATEGORY_REGISTRY).ok, 'undeclared competitive class fails');

const badCategory = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'nope', competitiveClassId: 'uc-native' });
ok(!validateIndexRecord(badCategory, CATEGORY_REGISTRY).ok, 'unknown category fails');

const smuggled = emptyIndexRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
smuggled.dimensions.buyerFit = rating({ value: 4, sources: [doc()], lastValidated: TODAY });
ok(!validateIndexRecord(smuggled, CATEGORY_REGISTRY).ok, 'buyer fit cannot be smuggled into the index');

/* 6. Decision record */
const dec = emptyDecisionRecord({ vendorId: 'acme', vendorName: 'Acme', categoryId: 'ccaas', competitiveClassId: 'uc-native' });
ok(validateDecisionRecord(dec, CATEGORY_REGISTRY).ok, 'empty decision record is valid');

dec.claims.push(atomicClaim({
  id: 'c1', dimensionId: 'routingArchitecture', statement: 'Attribute based routing configurable by an administrator.',
  applicability: 'allBuyers', capability: 'native', evidenceState: 'verified', sources: [doc()],
  decisionEffect: 'differentiates', lastValidated: TODAY,
}));
ok(validateDecisionRecord(dec, CATEGORY_REGISTRY).ok, 'documented claim at verified passes');

const overstated = JSON.parse(JSON.stringify(dec));
overstated.claims[0].evidence = { state: 'verified', sources: [collateral()] };
ok(!validateDecisionRecord(overstated, CATEGORY_REGISTRY).ok, 'vendor collateral cannot support a verified claim');

const undeclaredDim = JSON.parse(JSON.stringify(dec));
undeclaredDim.claims[0].dimensionId = 'madeUpDimension';
ok(!validateDecisionRecord(undeclaredDim, CATEGORY_REGISTRY).ok, 'undeclared dimension fails');

const unknownKills = JSON.parse(JSON.stringify(dec));
unknownKills.claims[0].capability = 'unknown';
unknownKills.claims[0].decisionEffect = 'eliminates';
ok(!validateDecisionRecord(unknownKills, CATEGORY_REGISTRY).ok, 'unknown may not eliminate a vendor');

dec.consequences.push(consequenceRecord({ id: 'q1', trigger: 'Routing change request', operationalConsequence: 'Vendor ticket required.', reversibility: 'reversible' }));
dec.breaks.push(breakRecord({ id: 'b1', condition: 'More than 200 queues', symptom: 'Administration console degrades.', consequenceId: 'q1' }));
ok(validateDecisionRecord(dec, CATEGORY_REGISTRY).ok, 'break resolving to a consequence passes');

const orphanBreak = JSON.parse(JSON.stringify(dec));
orphanBreak.breaks[0].consequenceId = 'missing';
ok(!validateDecisionRecord(orphanBreak, CATEGORY_REGISTRY).ok, 'orphan consequence reference fails');
ok(validateDecisionRecord(dec, CATEGORY_REGISTRY).warnings.length > 0, 'claims without proof requirements warn');

/* 7. The separation wall */
const sep = assertSeparation(idx, dec);
ok(sep.ok, 'clean records pass separation');
const leaky = { ...dec, dimensions: idx.dimensions };
ok(!assertSeparation(idx, leaky).ok, 'index dimensions on a decision record fail separation');
const leakyIndex = { ...idx, axes: dec.axes };
ok(!assertSeparation(leakyIndex, dec).ok, 'axes on an index record fail separation');
ok(!assertSeparation(idx, { ...dec, vendorId: 'other' }).ok, 'mismatched vendor ids fail separation');

const matchInput = toVendorMatchInput(dec);
ok(!Object.keys(matchInput).includes('dimensions'), 'match input carries no index dimensions');
ok(!Object.keys(matchInput).includes('marketRead'), 'match input carries no market read');
ok(Object.keys(matchInput).includes('axes'), 'match input carries the rating axes');
throws(() => toVendorMatchInput(idx), 'index record rejected by the match input projection');
throws(() => toVendorMatchInput(leaky), 'leaked index fields rejected by the match input projection');

/* 8. Index ordering */
function ratedIndex(id, values) {
  const r = emptyIndexRecord({ vendorId: id, vendorName: id, categoryId: 'ccaas', competitiveClassId: 'uc-native' });
  INDEX_DIMENSIONS.forEach((d, i) => {
    r.dimensions[d] = values[i] === null
      ? unrated('No public evidence located.')
      : rating({ value: values[i], sources: [doc()], lastValidated: TODAY, absenceEvidenced: values[i] === 0 });
  });
  r.lastValidated = TODAY;
  return r;
}
const rows = computeIndexPositions([
  ratedIndex('alpha', [4, 4, 4, 3, 4]),
  ratedIndex('bravo', [4, 4, 3, 3, 4]),
  ratedIndex('charlie', [2, 2, 2, 2, 2]),
  ratedIndex('delta', [3, null, null, null, null]),
]);
const byId = Object.fromEntries(rows.map((r) => [r.vendorId, r]));
ok(byId.alpha.position === 1, 'highest component sum takes position one');
ok(byId.bravo.position === 1, 'a one point gap displays as a tie');
eq(byId.alpha.tiedWith, ['bravo'], 'tie partner is named');
ok(byId.charlie.position === 3, 'position is ordinal by row, ties consume slots');
ok(byId.delta.position === null, 'a row with too few rated dimensions is unpositioned');
ok(byId.delta.band === 'Insufficient evidence to position', 'unpositioned rows say why');
ok(byId.alpha.band === 'Leading Presence', 'band assigned from the mean of rated dimensions');
ok(byId.charlie.band === 'Emerging Presence', 'lower mean lands in a lower band');
ok(Object.values(byId).every((r) => !('_sum' in r) && !('_mean' in r)), 'no composite score is exposed on the row');
ok(Object.keys(byId.alpha.components).length === 5, 'all five components are visible on every row');
ok(byId.alpha.positionLabel === 'Market Position: 1 of 3', 'position label states the class denominator');
throws(() => computeIndexPositions([ratedIndex('a', [4, 4, 4, 4, 4]), { ...ratedIndex('b', [3, 3, 3, 3, 3]), competitiveClassId: 'enterprise-suite-native' }]), 'positions never computed across classes');
ok(bandFor(3.25).id === 'leading', 'band boundary is inclusive at the lower edge');
ok(bandFor(3.24).id === 'established', 'band boundary excludes below the cut');

/* 9. Completion gate */
const gateIdx = ratedIndex('alpha', [4, 4, 4, 3, 4]);
ok(!completionGate(gateIdx, CATEGORY_REGISTRY).ok, 'index row without a market read fails the gate');
gateIdx.marketRead = { whatTheySell: 'Suite plus modules.', bestKnownFor: 'Voice reliability.', lineageOwnership: 'Independent.', recentMoves: [], marketCaveat: 'Footprint concentrated in one region.' };
gateIdx.methodologyUrl = '/methodology/market-position-index';
ok(completionGate(gateIdx, CATEGORY_REGISTRY).ok, 'complete index row passes the gate');

const gateDec = JSON.parse(JSON.stringify(dec));
gateDec.lastValidated = TODAY;
gateDec.lineage.charterVersion = 'CCaaS Handoff v1';
gateDec.lineage.calibrationGate = 'CCaaS calibration gate 1';
gateDec.implementationGravity = { typicalDuration: '12 to 16 weeks', vendorServicesDependency: 'high' };
gateDec.dayTwoOwnership = { whoOwnsRoutingChanges: 'vendor', changeLeadTime: '5 business days' };
gateDec.changeEconomics = { costOfChange: 'services rate card', exitCost: 'unknown' };
const decGate = completionGate(gateDec, CATEGORY_REGISTRY);
ok(!decGate.ok, 'decision record cannot publish while category dimensions are unlocked');
ok(decGate.failures.some((f) => f.includes('dimensions are not locked')), 'gate names the lock failure');

const lockedRegistry = { ...CATEGORY_REGISTRY, ccaas: lockCategory('ccaas', { gate: 'CCaaS calibration gate 1', date: TODAY }) };
ok(completionGate(gateDec, lockedRegistry).ok, 'decision record passes once the category is locked');

/* 10. Score change control */
throws(() => applyScoreChange(gateDec, { path: 'productCapability', to: 3, reason: '', evidenceRefs: [doc()], gate: 'g1', date: TODAY }), 'score change without a reason throws');
throws(() => applyScoreChange(gateDec, { path: 'productCapability', to: 3, reason: 'Documented.', evidenceRefs: [], gate: 'g1', date: TODAY }), 'score change without evidence throws');
throws(() => applyScoreChange(gateDec, { path: 'productCapability', to: 3, reason: 'Documented.', evidenceRefs: [doc()], date: TODAY }), 'score change without a gate throws');
throws(() => applyScoreChange(gateDec, { path: 'productCapability', to: 3, reason: 'Documented.', evidenceRefs: [doc()], gate: 'g1' }), 'score change without a date throws');
throws(() => applyScoreChange(gateDec, { path: 'nope', to: 3, reason: 'Documented.', evidenceRefs: [doc()], gate: 'g1', date: TODAY }), 'unknown rating path throws');
throws(() => applyScoreChange(gateDec, { path: 'productCapability', to: 9, reason: 'Documented.', evidenceRefs: [doc()], gate: 'g1', date: TODAY }), 'out of range change throws');
throws(() => applyScoreChange(gateDec, { path: 'productCapability', to: 0, reason: 'Absent.', evidenceRefs: [doc()], gate: 'g1', date: TODAY }), 'zero without evidenced absence throws');

const moved = applyScoreChange(gateDec, { path: 'productCapability', to: 3, reason: 'Documentation confirms native support.', evidenceRefs: [doc()], gate: 'CCaaS calibration gate 1', date: TODAY });
ok(moved.axes.productCapability.value === 3, 'score change applies the value');
ok(moved.lineage.scoreDeltaLedger.length === 1, 'score change appends to the delta ledger');
eq(moved.lineage.scoreDeltaLedger[0].from, null, 'ledger preserves the prior value');
ok(moved.lineage.scoreDeltaLedger[0].gate === 'CCaaS calibration gate 1', 'ledger records the gate');
ok(gateDec.lineage.scoreDeltaLedger.length === 0, 'score change does not mutate the source record');
ok(moved.axes.productCapability.unratedReason === null, 'moving off unrated clears the reason');

const movedBack = applyScoreChange(moved, { path: 'productCapability', to: null, reason: 'Source retracted. Returned to unrated.', evidenceRefs: [doc()], gate: 'CCaaS normalization gate 1', date: TODAY });
ok(movedBack.axes.productCapability.value === null, 'a rating can return to unrated');
ok(movedBack.lineage.scoreDeltaLedger.length === 2, 'both changes are in the ledger');

/* 11. Freshness */
ok(isStale({ lastValidated: '2025-01-01' }, TODAY) === true, 'a year old record is stale');
ok(isStale({ lastValidated: TODAY }, TODAY) === false, 'a record validated today is fresh');
ok(isStale({ lastValidated: null }, TODAY) === true, 'an undated record is treated as stale');

/* 12. Registry */
eq(researchSequence(), ['ccaas', 'iva', 'agent-assist', 'wfm-qm', 'experience-analytics', 'cx-orchestration', 'digital-engagement', 'payments-identity'], 'research order matches the locked sequence');
ok(Object.keys(CATEGORY_REGISTRY).length === 8, 'eight categories declared');
ok(getCategory('ccaas').extensionDimensions.length === 12, 'CCaaS carries draft dimensions');
ok(getCategory('iva').extensionDimensions.length === 0, 'unresearched categories carry no invented dimensions');
ok(getCategory('ccaas').dimensionsLocked === false, 'CCaaS ships unlocked until calibration');
ok(isClassValid('ccaas', 'uc-native'), 'declared class validates');
ok(!isClassValid('ccaas', 'uc-native-x'), 'undeclared class rejected');
throws(() => getCategory('nope'), 'unknown category throws');
throws(() => lockCategory('iva', { gate: 'g', date: TODAY }), 'cannot lock a category with no classes');
throws(() => lockCategory('ccaas', { date: TODAY }), 'cannot lock without naming the gate');
const lockedCcaas = lockCategory('ccaas', { gate: 'CCaaS calibration gate 1', date: TODAY });
ok(lockedCcaas.dimensionsLocked === true, 'lock sets the flag');
ok(lockedCcaas.competitiveClasses.every((c) => c.status === 'validated'), 'lock validates the classes');
ok(CATEGORY_REGISTRY.ccaas.dimensionsLocked === false, 'lock does not mutate the registry in place');

/* 13. Dash sweep on this schema pair */
const files = ['src/lib/vendorSchema.js', 'src/lib/categoryRegistry.js'];
const { readFileSync } = await import('node:fs');
const { fileURLToPath } = await import('node:url');
const root = fileURLToPath(new URL('..', import.meta.url));
for (const f of files) {
  const text = readFileSync(root + f, 'utf8');
  ok(!text.includes(String.fromCharCode(0x2014)), `${f} contains no em dash`);
  ok(!text.includes(String.fromCharCode(0x2013)), `${f} contains no en dash`);
}

console.log(`\nvendorSchema harness: ${pass} passed, ${fails.length} failed`);
if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
