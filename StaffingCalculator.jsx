import { useState, useEffect } from "react";
import ReportExport from "./ReportExport";
import { COLORS, BENCH, classifyOccupancy, classifyShrinkage } from "./lib/benchmarks";
import { publishToolResult } from "./lib/toolData";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

// Lead capture endpoint (existing). When the Resend guidance system ships in the
// final phase, swap this one line for /api/send-guidance.
const CAPTURE_ENDPOINT = "https://formspree.io/f/maqlvwne";

function LogoMark({ size = 34, light = true }) { const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC; return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>; }

/* ---- Stable Erlang C via the Erlang B recursion (no factorial / no pow;
       overflow-proof to thousands of agents) ---- */
function erlangB(N, A) { let B = 1; for (let n = 1; n <= N; n++) B = (A * B) / (n + A * B); return B; }
function erlangC(N, A) { if (N <= A) return 1; const B = erlangB(N, A); const rho = A / N; return B / (1 - rho * (1 - B)); }

function calc(volume, ahtSec, intMin, slT, slSec, shrink) {
  const A = (volume * ahtSec) / (intMin * 60);
  const minN = Math.ceil(A) + 1;
  let agents = minN, pw = 1, sl = 0, asa = 999, occ = 1;
  for (let n = minN; n < minN + 1000; n++) {
    pw = erlangC(n, A); sl = 1 - pw * Math.exp(-(n - A) * slSec / ahtSec); asa = pw * ahtSec / (n - A);
