// src/lib/research/classWords.js
//
// The CCaaS competitive classes in plain words, for readers (copy audit batch 4, 1 Oct 2026). Presentation only: the
// research's own name, definition, buyer and comparison boundary still render beside these, word for word, and nothing
// here changes a class, a finding or an order. `compared` restates the class's comparison boundary, which the research
// writes as an instruction to researchers ("Do not penalize for ..."), as what it means for a reader.

export const PLAIN = {
  "CLS-CC-001": { name: "Full enterprise suites", job: "Run the whole contact center, voice and digital, on one platform with deep administration and operations.",
    compared: "Compared with other full enterprise suites on breadth, how easy it is to run, and the control a large enterprise needs." },
  "CLS-CC-002": { name: "Build on cloud services", job: "Build and run contact center workloads from cloud building blocks, with your own team owning more of the design.",
    compared: "Compared with other build-it-yourself platforms. How much your own team builds and runs is a question of fit; it does not count against the platform." },
  "CLS-CC-003": { name: "Resilience and complex integration", job: "Run complex, integrated or high-stakes operations where uptime, compliance and control come first.",
    compared: "Compared with other platforms for complex, high-stakes operations. How much outside implementation help it needs is judged on its own and is kept out of the class." },
  "CLS-CC-004": { name: "Phone system plus contact center", job: "Run a standard to moderately complex contact center simply, often from the supplier of your phone system.",
    compared: "Compared with other platforms of this kind. Lacking depth that only the largest enterprises need does not count against it unless you need that depth." },
  "CLS-CC-005": { name: "Regional and data sovereignty", job: "Meet a country's or region's hosting, data and sector rules first.",
    compared: "Compared first with platforms that serve the same region and data rules, then with global platforms." },
  "CLS-CC-006": { name: "Moving off an existing system", job: "Move off an installed contact center with less risk, running old and new side by side.",
    compared: "Judged on how well it helps you move off an existing system. How broad it is once you have moved is a separate question." },
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
