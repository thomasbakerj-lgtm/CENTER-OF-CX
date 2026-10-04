// src/lib/research/classWords.js
//
// The CCaaS competitive classes in plain words, for readers (copy audit batch 4, 1 Oct 2026). Presentation only: the
// research's own name, definition, buyer and comparison boundary still render beside these, word for word, and nothing
// here changes a class, a finding or an order. `compared` restates the class's comparison boundary, which the research
// writes as an instruction to researchers ("Do not penalize for ..."), as what it means for a reader.
// Research Method v2 (schema 1.1, 1 Oct 2026) re-cut the peer groups: 003 retired into 002; 007, 008 and 009 added.
// A group with no boundary in the research gets a `compared` line drawn only from its own job.

export const PLAIN = {
  "CLS-CC-001": { name: "Full enterprise suites", job: "Run the whole contact center, voice and digital, on one platform with deep administration and operations.",
    compared: "Compared with other full enterprise suites on breadth, how easy it is to run, and the control a large enterprise needs." },
  "CLS-CC-002": { name: "Build on cloud services", job: "Build and own the contact center on cloud building blocks, APIs and integration platforms, with your own team owning more of the design.",
    compared: "Compared with other build-it-yourself platforms. How much your own team builds and runs is a question of fit; it does not count against the platform." },
  "CLS-CC-003": { name: "Resilience and complex integration", retired: true, job: "Retired in Research Method v2; its vendors moved to the build on cloud services group.",
    compared: "Compared with other platforms for complex, high-stakes operations. How much outside implementation help it needs is judged on its own and is kept out of the class." },
  "CLS-CC-004": { name: "Phone system plus contact center", job: "Add a contact center to the cloud phone system you already run.",
    compared: "Compared with other platforms of this kind. Lacking depth that only the largest enterprises need does not count against it unless you need that depth." },
  "CLS-CC-005": { name: "Regional and data sovereignty", job: "Meet a country's or region's hosting, data and sector rules first.",
    compared: "Compared first with platforms that serve the same region and data rules, then with global platforms." },
  "CLS-CC-006": { name: "Moving off an existing system", job: "Move off an installed contact center with less risk, running old and new side by side.",
    compared: "Judged on how well it helps you move off an existing system. How broad it is once you have moved is a separate question." },
  "CLS-CC-007": { name: "Inside Microsoft Teams", job: "Run the contact center inside Microsoft Teams, with Teams as the agent desktop and the phone system.",
    compared: "Compared with other platforms built on Microsoft Teams." },
  "CLS-CC-008": { name: "Standalone for mid-size centers", job: "Run a full voice and digital contact center for a mid-size operation, without tying it to a phone system.",
    compared: "Compared with other standalone platforms for mid-size operations." },
  "CLS-CC-009": { name: "Outbound and dialing compliance", provisional: true, job: "Run outbound-heavy operations where the rules on dialing decide the choice.",
    compared: "A provisional group: vendors appear here only as a second group until three are researched." },
};

/* Research text sometimes names a class by its id ("CLS-CC-004 is the rational peer class"). A reader sees the class's
   name instead: an id followed by its own name keeps the name once; a bare id reads "the <name> class". */
const ID = /\bCLS-CC-\d{3}\b/g;
export function readableIds(text, classes) {
  if (typeof text !== "string" || !text.includes("CLS-CC-")) return text;
  const name = new Map(classes.map((c) => [c.id, c.name]));
  return text.replace(ID, (id, at) => {
    const n = name.get(id);
    if (!n) return id;
    return text.slice(at + id.length).trimStart().startsWith(n) ? "" : `the ${n} class`;
  }).replace(/ class peer comparisons/g, " class for peer comparisons").replace(/\s{2,}/g, " ").replace(/(^|[.!?]\s+)the /g, (m, p) => `${p}The `).trim();
}
