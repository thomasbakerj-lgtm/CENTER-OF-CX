import { useEffect, useRef } from "react";
import { hasScenario, syncScenarioHash } from "./scenarioUrl.js";

/**
 * Keeps a tool's inputs in the address bar fragment ("#s=..."), so a refresh or Back reopens them. The fragment never
 * reaches the server. It follows a page that opened from a link at once, and any other page only after the reader has
 * typed or tapped, so values another tool put on the rail are not written there on arrival. The first render runs
 * before a tool that reads its link in an effect has done so, so it may add to the address but never clear it.
 * ReportActions calls it for every tool; a tool whose report sits on a later step calls it too, so the answers given
 * before that step survive a refresh.
 */
export function useScenarioHash(toolId, state, defaults) {
  const openedWithScenario = useRef(hasScenario()).current;
  const actedRef = useRef(false);
  const firstRef = useRef(true);
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const mark = (e) => { if (e.isTrusted) actedRef.current = true; };
    const kinds = ["pointerdown", "keydown", "input", "change"];
    for (const k of kinds) document.addEventListener(k, mark, true);
    return () => { for (const k of kinds) document.removeEventListener(k, mark, true); };
  }, []);
  useEffect(() => {
    if (!state || !defaults) return;
    const clear = !firstRef.current;
    firstRef.current = false;
    if (openedWithScenario || actedRef.current) syncScenarioHash(toolId, state, defaults, { clear });
  });
}
