import React, { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import { scenarioLink } from "./src/lib/scenarioUrl";

/**
 * ReportActions, the shared end-of-tool action block.
 *
 * Replaces the bespoke "Send Results & Request Review" block that was copied by
 * hand into four tools and missing from the rest. Every tool renders this and
 * nothing else below the Analyst Read.
 *
 * Doctrine encoded here, deliberately:
 *
 *   1. Download is never gated. The user computed the result; it is theirs. An
 *      email wall on output is a toll, and it suppresses the exact behavior we
 *      are trying to measure.
 *   2. "Email me a copy" is optional, because WE are the ones asking.
 *   3. "Request a review" requires an email, because THEY are asking us. A
 *      review request with no reply address is broken by construction, which is
 *      what every review request on this site was until now.
 *   4. We do not promise what we cannot deliver. Formspree's free tier does not
 *      autorespond, so the copy says a human will send it. A human then sends it.
 *   5. The saved artifact is a scenario link, not an attachment. A PDF is dead
 *      on arrival. A link re-runs, and it forwards to the person with budget.
 *
 * Usage:
 *
 *   <ReportActions
 *     toolId="license-gap"
 *     toolName="License Bundle Gap Checker"
 *     subtitle="Effective License Cost Analysis"
 *     routePath="/tools/license-gap"
 *     state={liveState}
 *     defaults={DEFAULTS}
 *     confidence={confidence}
 *     summary={[{ label: "Effective license seat", value: "$148" }]}
 *     signals={{ severity: "high", mechanism: "avoid hiring" }}
 *     sections={reportSections}
 *   />
 */

const NAVY = "#0B1D3A";
const ELECTRIC = "#0088DD";
const MUTED = "#6B7F99";
const BORDER = "#D8E3ED";
const GREEN = "#10B981";
const RED = "#EF4444";
const WARM = "#F8FAFB";
const SLATE = "#3A4F6A";

const FORMSPREE = "https://formspree.io/f/maqlvwne";
const CONTACT_KEY = "coc:contact";

/** Deliberately permissive. We reject obvious typos, not unusual addresses. */
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

/**
 * Vercel custom events are a Pro feature. On Hobby these calls are inert.
 * They cost nothing to leave in and light up the day the plan changes.
 */
function track(name, props) {
  try {
    if (typeof window !== "undefined" && typeof window.va === "function") {
      window.va("event", { name, data: props || {} });
    }
  } catch { /* analytics must never break a tool */ }
}

const readContact = () => {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return {};
    return JSON.parse(window.sessionStorage.getItem(CONTACT_KEY)) || {};
  } catch { return {}; }
};

const writeContact = (c) => {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    window.sessionStorage.setItem(CONTACT_KEY, JSON.stringify(c));
  } catch { /* private browsing, storage disabled, quota. Not fatal. */ }
};

async function copyText(text) {
  try {
    if (navigator?.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through to the legacy path */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

/* ------------------------------------------------------------- fields ---- */

const labelStyle = { fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 5 };
const inputStyle = (bad) => ({
  width: "100%", padding: "10px 12px", fontSize: 14, color: NAVY,
  border: `1px solid ${bad ? RED : BORDER}`, borderRadius: 6, outline: "none",
  fontFamily: "'DM Sans', sans-serif", background: "#fff",
});

function Field({ label, value, onChange, placeholder, type = "text", required, bad, autoComplete }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: ELECTRIC }}> *</span>}
      </label>
      <input
        type={type} value={value} placeholder={placeholder} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)} style={inputStyle(bad)}
        onFocus={(e) => { e.target.style.borderColor = ELECTRIC; }}
        onBlur={(e) => { e.target.style.borderColor = bad ? RED : BORDER; }}
      />
    </div>
  );
}

/* --------------------------------------------------------------- main ---- */

export default function ReportActions({
  toolId, toolName, subtitle, routePath,
  state, defaults, confidence, summary = [], signals = {}, sections = [],
}) {
  const saved = useRef(readContact()).current;

  const [email, setEmail] = useState(saved.email || "");
  const [first, setFirst] = useState(saved.first || "");
  const [last, setLast] = useState(saved.last || "");
  const [company, setCompany] = useState(saved.company || "");
  const [role, setRole] = useState(saved.role || "");
  const [mobile, setMobile] = useState(saved.mobile || "");

  const [copyEmail, setCopyEmail] = useState(saved.email || "");
  const [copyState, setCopyState] = useState("idle");   // idle | sending | sent | error
  const [reviewState, setReviewState] = useState("idle");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);

  const [link, setLink] = useState(null);
  useEffect(() => {
    setLink(scenarioLink(toolId, state, defaults, routePath));
  }, [toolId, state, defaults, routePath]);

  const emailBad = touchedEmail && !validEmail(email);

  const persist = () => writeContact({ email, first, last, company, role, mobile });

  const basePayload = (intent) => {
    const b = new FormData();
    b.append("_subject", `${intent === "review" ? "REVIEW REQUEST" : "Report copy"}: ${toolName}`);
    b.append("intent", intent);
    b.append("tool", toolName);
    b.append("tool_id", toolId);
    if (confidence) b.append("confidence", confidence);
    Object.entries(signals || {}).forEach(([k, v]) => b.append(`signal_${k}`, String(v)));
    (summary || []).forEach((s) => b.append(s.label, String(s.value)));
    b.append("scenario_link", link || "TOO LARGE TO ENCODE");
    if (typeof window !== "undefined") b.append("page", window.location.href.split("?")[0]);
    return b;
  };

  const post = async (b) => {
    const r = await fetch(FORMSPREE, { method: "POST", body: b, headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("formspree " + r.status);
  };

  const sendCopy = async () => {
    if (!validEmail(copyEmail)) { setTouchedEmail(true); return; }
    setCopyState("sending");
    try {
      const b = basePayload("copy");
      b.append("email", copyEmail.trim());
      b.append("_replyto", copyEmail.trim());
      await post(b);
      writeContact({ ...readContact(), email: copyEmail.trim() });
      setCopyState("sent");
      track("report_copy_requested", { tool: toolId, confidence: confidence || "n/a" });
    } catch { setCopyState("error"); }
  };

  const sendReview = async () => {
    setTouchedEmail(true);
    if (!validEmail(email)) return;
    setReviewState("sending");
    try {
      const b = basePayload("review");
      b.append("email", email.trim());
      b.append("_replyto", email.trim());
      if (first) b.append("first_name", first.trim());
      if (last) b.append("last_name", last.trim());
      if (company) b.append("company", company.trim());
      if (role) b.append("role", role.trim());
      if (mobile) b.append("mobile", mobile.trim());
      await post(b);
      persist();
      setReviewState("sent");
      track("review_requested", { tool: toolId, confidence: confidence || "n/a" });
    } catch { setReviewState("error"); }
  };

  const onCopyLink = async () => {
    if (!link) return;
    const ok = await copyText(link);
    if (ok) { setLinkCopied(true); track("scenario_link_copied", { tool: toolId }); setTimeout(() => setLinkCopied(false), 2400); }
  };

  const card = {
    background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12,
    padding: "22px 22px 20px", flex: 1, minWidth: 300,
  };
  const h3 = {
    fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400,
    color: NAVY, margin: "0 0 6px",
  };
  const sub = { fontSize: 13, color: MUTED, lineHeight: 1.6, margin: "0 0 18px" };
  const ghostBtn = {
    display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 20px",
    fontSize: 14, fontWeight: 600, color: NAVY, background: WARM,
    border: `1px solid ${BORDER}`, borderRadius: 8, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  };
  const primaryBtn = (disabled) => ({
    width: "100%", padding: "13px", fontSize: 14, fontWeight: 600, color: "#fff",
    background: disabled ? SLATE : ELECTRIC, border: "none", borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
    fontFamily: "'DM Sans', sans-serif",
  });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 32, fontFamily: "'DM Sans', sans-serif" }}>

      {/* -------------------------------------------------- take it with you */}
      <div style={card}>
        <h3 style={h3}>Take this with you</h3>
        <p style={sub}>
          The report downloads immediately. No email required, no wall.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <ReportExport
            toolName={toolName}
            subtitle={subtitle}
            userName={[first, last].filter(Boolean).join(" ")}
            userEmail={email || copyEmail}
            sections={sections}
          />

          {link ? (
            <button onClick={onCopyLink} style={ghostBtn}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = ELECTRIC; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = BORDER; }}>
              {linkCopied ? <span style={{ color: GREEN }}>✓ Link copied</span> : <>🔗 Copy scenario link</>}
            </button>
          ) : (
            <span style={{ ...ghostBtn, cursor: "default", color: MUTED, fontWeight: 400, fontSize: 12.5 }}>
              This scenario is too detailed to fit in a link. Download instead.
            </span>
          )}
        </div>

        {link && (
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: "0 0 18px" }}>
            The scenario link reopens this tool with every input exactly as you left it. Bookmark it,
            or send it to a colleague so they can change one assumption and see what moves.
            It carries your numbers only. It never carries your name or email.
          </p>
        )}

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
          {copyState === "sent" ? (
            <div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>
              ✓ Got it. Your copy is on its way within one business day.
            </div>
          ) : (
            <>
              <label style={labelStyle}>Also email me a copy (optional)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email" value={copyEmail} placeholder="you@company.com" autoComplete="email"
                  onChange={(e) => setCopyEmail(e.target.value)}
                  style={{ ...inputStyle(false), flex: 1 }}
                />
                <button
                  onClick={sendCopy}
                  disabled={copyState === "sending" || !validEmail(copyEmail)}
                  style={{
                    padding: "10px 18px", fontSize: 13, fontWeight: 600, color: "#fff",
                    background: validEmail(copyEmail) ? NAVY : SLATE, border: "none", borderRadius: 6,
                    cursor: validEmail(copyEmail) ? "pointer" : "not-allowed",
                    opacity: validEmail(copyEmail) ? 1 : 0.5, whiteSpace: "nowrap",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                  {copyState === "sending" ? "Sending" : "Send"}
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: MUTED, marginTop: 7, lineHeight: 1.5 }}>
                A person sends this, not a robot. Expect it within one business day.
              </p>
              {copyState === "error" && (
                <p style={{ fontSize: 12, color: RED, marginTop: 6 }}>
                  That did not go through. Please download the report instead, or try again.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------- request review */}
      <div style={card}>
        <h3 style={h3}>Have someone read it</h3>
        <p style={sub}>
          Send this analysis for an independent review. You get a written read on what the numbers
          actually support, what they do not, and which diagnostic is worth running next.
          No sales call. No vendor introduction.
        </p>

        {reviewState === "sent" ? (
          <div style={{ background: WARM, border: `1px solid ${GREEN}40`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontSize: 14, color: GREEN, fontWeight: 700, marginBottom: 6 }}>✓ Sent</div>
            <div style={{ fontSize: 13, color: SLATE, lineHeight: 1.6 }}>
              Your {toolName} results are in. You will hear back at {email}. If you copied your scenario
              link, keep it. The review will refer to it.
            </div>
          </div>
        ) : !reviewOpen ? (
          <button
            onClick={() => { setReviewOpen(true); track("review_form_opened", { tool: toolId }); }}
            style={primaryBtn(false)}>
            Send results and request a review
          </button>
        ) : (
          <>
            <Field
              label="Email" type="email" required autoComplete="email"
              value={email} onChange={setEmail} bad={emailBad}
              placeholder="you@company.com"
            />
            {emailBad && (
              <p style={{ fontSize: 12, color: RED, marginTop: -6, marginBottom: 10 }}>
                A working email is the only thing required. It is where the review goes.
              </p>
            )}

            <p style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, letterSpacing: 0.6, textTransform: "uppercase", margin: "18px 0 10px" }}>
              Optional, and it sharpens the review
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="First name" value={first} onChange={setFirst} autoComplete="given-name" />
              <Field label="Last name" value={last} onChange={setLast} autoComplete="family-name" />
            </div>
            <Field label="Company" value={company} onChange={setCompany} autoComplete="organization" />
            <Field label="Role" value={role} onChange={setRole} placeholder="VP Customer Care, WFM Manager" autoComplete="organization-title" />
            <Field label="Mobile" value={mobile} onChange={setMobile} type="tel" placeholder="Only if you would rather I text than email" autoComplete="tel" />

            <button
              onClick={sendReview}
              disabled={reviewState === "sending" || !validEmail(email)}
              style={{ ...primaryBtn(!validEmail(email)), marginTop: 6 }}>
              {reviewState === "sending" ? "Sending" : "Send results and request a review"}
            </button>

            {reviewState === "error" && (
              <p style={{ fontSize: 12, color: RED, marginTop: 8 }}>
                That did not go through. Download the report and send it over, or try again.
              </p>
            )}

            <p style={{ fontSize: 11.5, color: MUTED, marginTop: 12, lineHeight: 1.55 }}>
              Your inputs and results travel with this request so the review has something to work from.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
