// src/lib/research/loadProfile.js
//
// Loads one researched vendor's snapshot file on demand, so a profile carries its own research and nothing else. Vite
// splits each vendor file into its own chunk; the prerender waits for it, so the served page carries the research.
import { lazy } from "react";
import { createElement } from "react";
import manifest from "../../data/research/ccaas/manifest.json";

const FILES = import.meta.glob("../../data/research/ccaas/vendors/*.json");
const SHARED = import.meta.glob("../../data/research/ccaas/shared.json");
const cache = new Map();

/** A lazy component for one vendor's researched profile, or null when no snapshot file exists for it. */
export function researchedProfile(vendorId) {
  const key = `../../data/research/ccaas/vendors/${vendorId}.json`;
  if (!FILES[key]) return null;
  if (!cache.has(vendorId)) {
    cache.set(vendorId, lazy(() => Promise.all([FILES[key](), SHARED["../../data/research/ccaas/shared.json"](), import("../../../ResearchedProfile.jsx")])
      .then(([file, shared, page]) => ({ default: (props) => createElement(page.default, { ...props, file: file.default, shared: shared.default, manifestDate: manifest.generated_date }) }))));
  }
  return cache.get(vendorId);
}
