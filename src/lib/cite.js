// src/lib/cite.js
//
// "How to cite" lines (audit 30 Sep, answer engine basics): one plain sentence a reader, an analyst or a model can copy,
// naming the publisher, the thing cited, its version or validation date and its address. Built from the same records the
// page shows (methodVersions, the research registry), so a citation never names a version the page does not.

import { BASE } from "./seo.js";
import { longDate } from "./methodVersions.js";

export const citeMethod = ({ title, version, published, id }) =>
  `The Center of CX, "${title} method", version ${version}, ${longDate(published)}, ${BASE}/methodology/${id}`;

export const citeResearch = ({ name, validated, slug }) =>
  `The Center of CX, "${name}: contact center platform research", validated ${longDate(validated)}, ${BASE}/vendors/${slug}`;
