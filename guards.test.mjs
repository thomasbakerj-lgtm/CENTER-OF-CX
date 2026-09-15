/**
 * guards.test.mjs, the shared input guard contract.
 *
 * Doctrine names zero substitution without disclosure as a defect. Before this
 * harness, a blank, a word, a null, or a partial number read as 0 or as a truncated
 * value, and nothing was recorded when the result sat inside the bounds. A bad
 * scenario link could zero a headcount and the document would never say so.
 *
 * What is pinned:
 *   1. isCleanEntry, entryText, and parseEntry at every probed boundary.
 *   2. guard and scaled record every unclean raw value, in bounds or not, with the
 *      raw text as entered. The arithmetic used is unchanged.
 *   3. guard and scaled are identical to the prior rule for every finite input.
 *   4. guardVal and guardLine render an unclean entry without a unit.
 *   5. NumField reads typed input through parseEntry and shows unclean props raw.
 *
 * What is not pinned here: which bounds each tool applies. Bounds belong to each
 * tool's own engine and its own harness.
 */
import { readFileSync } from "fs";
import { createGuards, guardVal, guardLine, isCleanEntry, entryText, parseEntry } from "./src/lib/guards.js";

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ------------------------------------------------ 1. entry classification */
console.log("1. entry classification");
for (const v of [0, 1, -1, 0.5, 1e6, "0", "30", " 30 ", "1e3", "-5", "+5", ".5", "5.", "2.5e-2"])
  A(`clean: ${JSON.stringify(v)}`, isCleanEntry(v) === true);
for (const v of ["", " ", "abc", NaN, Infinity, -Infinity, null, undefined, "12abc", "1,200", "$50", "0x10", "1e", "-", ".", "Infinity", "NaN", {}, [], true])
  A(`unclean: ${String(JSON.stringify(v) ?? v)}`, isCleanEntry(v) === false);

A("entryText: blank string", entryText("") === "blank");
A("entryText: whitespace", entryText("  ") === "blank");
A("entryText: null", entryText(null) === "blank");
A("entryText: undefined", entryText(undefined) === "blank");
A("entryText: a word is quoted", entryText("abc") === '"abc"');
A("entryText: NaN", entryText(NaN) === "NaN");
A("entryText: Infinity", entryText(Infinity) === "Infinity");

A("parseEntry: 1e3 is 1000", parseEntry("1e3") === 1000);
A("parseEntry: a well-formed thousands group", parseEntry("1,200") === 1200 && parseEntry("12,345.5") === 12345.5);
A("parseEntry: a malformed group is refused", Number.isNaN(parseEntry("1,20")) && Number.isNaN(parseEntry("12,00,000")));
for (const v of ["", "abc", "12abc", "$50", "0x10", "1e", "Infinity", NaN, Infinity, null, undefined])
  A(`parseEntry refuses ${String(JSON.stringify(v) ?? v)}`, Number.isNaN(parseEntry(v)));
A("parseEntry: a finite number passes", parseEntry(42.5) === 42.5);

/* --------------------------------------------- 2. disclosure of unclean raw */
console.log("2. disclosure");
const PROBE = [["", "blank", 0], ["abc", '"abc"', 0], [NaN, "NaN", 0], [Infinity, "Infinity", 0],
  [null, "blank", 0], ["12abc", '"12abc"', 12], ["1,200", '"1,200"', 1], ["$50", '"$50"', 0]];
for (const [raw, text, readAs] of PROBE) {
  const g = createGuards();
  const r = g.guard("Agents", raw, 0, null, "");
  A(`guard in bounds records ${text}`, r === readAs && same(g.guards, [{ label: "Agents", entered: text, used: readAs, unit: "", invalid: true }]));
  const h = createGuards();
  const q = h.guard("FCR", raw, 1, 99, "%");
  A(`guard out of bounds records ${text} once`, q === Math.max(1, Math.min(99, readAs)) && h.guards.length === 1 && h.guards[0].entered === text && h.guards[0].invalid === true);
  const k = createGuards();
  const s = k.scaled("Share", raw, 0, 100, "%", 100);
  A(`scaled records ${text} in display units`, k.guards.length === 1 && k.guards[0].entered === text && k.guards[0].used === Math.max(0, Math.min(100, readAs * 100)) && s === Math.max(0, Math.min(1, readAs)));
}
A("Infinity reads as 0, the same as NaN", createGuards().guard("x", Infinity, 0, null, "") === 0);
A("1e3 is clean and records nothing in bounds", (() => { const g = createGuards(); return g.guard("x", "1e3", 0, null, "") === 1000 && g.guards.length === 0; })());

/* ------------------------------------------------- 3. finite neutrality */
console.log("3. finite neutrality");
const oldGuard = (label, raw, min, max, unit, out) => { const p = parseFloat(raw); const v = isNaN(p) ? 0 : p;
  const c = Math.max(min, max === null ? v : Math.min(max, v)); if (c !== v) out.push({ label, entered: v, used: c, unit: unit || "" }); return c; };
const td = (x, f) => Math.round(x * f * 1e6) / 1e6;
const oldScaled = (label, raw, min, max, unit, f, out) => { const p = parseFloat(raw); const v = isNaN(p) ? 0 : p;
  const lo = min === null ? -Infinity : min / f, hi = max === null ? Infinity : max / f; const c = Math.max(lo, Math.min(hi, v));
  if (c !== v) out.push({ label, entered: td(v, f), used: td(c, f), unit: unit || "" }); return c; };
let cases = 0, mism = 0;
for (const v of [0, 1, -1, 0.5, -0.0001, 99.999, 100, 100.0001, 300, 1e6, 1e12, "0", "30", "1e3", "-5", ".5"])
  for (const [lo, hi] of [[0, null], [1, null], [0, 100], [1, 99], [-10, 10]])
    for (const unit of ["", "$", "%"]) {
      const g = createGuards(), o1 = [], o2 = [];
      const a = [g.guard("L", v, lo, hi, unit), g.scaled("S", v, lo, hi, unit, 100)];
      const b = [oldGuard("L", v, lo, hi, unit, o1), oldScaled("S", v, lo, hi, unit, 100, o2)];
      cases++; if (!same([a, g.guards], [b, [...o1, ...o2]])) mism++;
    }
A(`guard and scaled match the prior rule on ${cases} finite cases`, mism === 0 && cases === 240);
A("pick is untouched", (() => { const g = createGuards(); return g.pick("m", "zz", { a: 1 }, "a") === "a" && same(g.guards, [{ label: "m", entered: "zz", used: "a", unit: "" }]); })());

/* ----------------------------------------------------- 4. rendering */
console.log("4. rendering");
A("an unclean money entry renders without a currency mark", guardVal({ entered: '"abc"', used: 0, unit: "$", invalid: true }, "entered") === '"abc"');
A("its used side still renders as money", guardVal({ entered: '"abc"', used: 0, unit: "$", invalid: true }, "used") === "$0");
A("an unclean percent entry renders without a suffix", guardVal({ entered: "blank", used: 1, unit: "%", invalid: true }, "entered") === "blank");
A("guardLine states an unclean entry", guardLine({ label: "Agents", entered: "blank", used: 0, unit: "", invalid: true }) === "Agents: entered blank, computed at 0.");
A("clean records render as before", guardVal({ entered: -5, used: 0, unit: "$" }, "entered") === "-$5" && guardVal({ entered: 300, used: 100, unit: "%" }, "used") === "100%");

/* ------------------------------------------------------ 5. NumField */
console.log("5. NumField");
const NF = readFileSync("./src/lib/NumField.jsx", "utf8");
A("NumField imports the strict reader from guards", /import \{ parseEntry, isCleanEntry \} from "\.\/guards";/.test(NF));
A("typing reads through parseEntry", /const parsed = parseEntry\(raw\);/.test(NF));
A("blur reads through parseEntry", /const parsed = parseEntry\(local\);/.test(NF));
A("no parseFloat reads typed text", !/parseFloat\((raw|local)\)/.test(NF));
A("an unclean prop displays as its raw text", /const toDisp = \(v\) => isCleanEntry\(v\) \?/.test(NF));
A("blank and partial typing still send nothing", /raw\.trim\(\) === "" \|\| raw === "-" \|\| raw === "\." \|\| raw === "-\."\) return;/.test(NF));
const GS = readFileSync("./src/lib/guards.js", "utf8");
A("guards.js carries no em or en dash", GS.indexOf("\u2014") < 0 && GS.indexOf("\u2013") < 0);

console.log("\n" + "=".repeat(78));
console.log("  " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
