// Contribute.jsx
//
// The contributor rules (decision D3, TB 27 Sep 2026) and the form to propose a piece. A proposal goes to the same
// inbox as every other request (Formspree, already an allowed host and named in the Privacy Policy); nothing is
// published from it until the piece is reviewed. Tokens only.
import { useState } from "react";
import { HOUSE, PILLARS, RADIUS, TOUCH } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { Button } from "./src/lib/ui.jsx";
import { RULES, HOUSE_RULES } from "./src/lib/contributorRules.js";

const ACCENT = PILLARS.research.onDark;
const field = { width: "100%", boxSizing: "border-box", minHeight: TOUCH, padding: "10px 12px", fontFamily: FONT, fontSize: 15, color: HOUSE.mist,
  background: HOUSE.navy, border: `1px solid ${K.firm}`, borderRadius: RADIUS.field };
const label = { ...K.small, fontWeight: 600, color: HOUSE.mist, display: "block", marginBottom: 6 };
const check = { ...K.body, display: "flex", alignItems: "flex-start", gap: 10, minHeight: TOUCH };
const CSS = `.cx-con p,.cx-con li{overflow-wrap:anywhere}`;

export const STEPS = [
  "Send a proposal with the form below: the idea, who it is for and what it draws on.",
  "We reply within ten working days. If it fits, you write the piece in your own words.",
  "We review it for facts, sources, originality and disclosure, and send you any changes to agree.",
  "It is published under your name with the Contributor perspective label, and your profile lists it.",
];

export default function Contribute() {
  const [state, setState] = useState("idle");
  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("sending");
    try {
      const res = await fetch("https://formspree.io/f/xvzvdnry", { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      setState(res.ok ? "sent" : "failed");
      if (res.ok) form.reset();
    } catch { setState("failed"); }
  };

  return (
    <div className="cx-con" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Crumbs items={[["Research", "/research"], ["Contribute"]]} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Research · Contributor perspectives</span>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12, color: HOUSE.mist }}>Write for The Center of CX</h1>
          <p style={K.body}>If you run, advise on or study contact centers, you can publish here under your own name. Your piece is reviewed for facts and disclosure, carries your byline and stays yours.</p>
          <p style={K.body}><a href="/perspectives" style={{ color: ACCENT, fontWeight: 600 }}>Read published contributor perspectives</a></p>
        </header>

        <section aria-labelledby="rules" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="rules" style={{ ...K.h2, margin: 0 }}>The rules</h2>
          <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            {RULES.map((r) => <li key={r.id} style={K.body}><strong style={K.strong}>{r.title}.</strong> {r.text}</li>)}
          </ol>
        </section>

        <section aria-labelledby="house" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="house" style={{ ...K.h2, margin: 0 }}>House rules we check in review</h2>
          <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
            {HOUSE_RULES.map((r) => <li key={r} style={K.body}>{r}</li>)}
          </ul>
        </section>

        <section aria-labelledby="how" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="how" style={{ ...K.h2, margin: 0 }}>How it works</h2>
          <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
            {STEPS.map((s) => <li key={s} style={K.body}>{s}</li>)}
          </ol>
        </section>

        <section id="propose" aria-labelledby="propose-h" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="propose-h" style={{ ...K.h2, margin: 0 }}>Propose a piece</h2>
          {state === "sent"
            ? <p role="status" style={K.body}>Thank you. We reply to every proposal within ten working days.</p>
            : (
              <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input type="hidden" name="_subject" value="Contributor proposal" />
                <input type="hidden" name="topic" value="Contributor proposal" />
                <div><label htmlFor="p-name" style={label}>Your name</label>
                  <input id="p-name" name="name" required maxLength={80} autoComplete="name" style={field} /></div>
                <div><label htmlFor="p-email" style={label}>Your email</label>
                  <input id="p-email" name="email" type="email" required autoComplete="email" style={field} /></div>
                <div><label htmlFor="p-role" style={label}>Your role</label>
                  <input id="p-role" name="role" required maxLength={80} autoComplete="organization-title" style={field} /></div>
                <div><label htmlFor="p-org" style={label}>Your organisation</label>
                  <input id="p-org" name="organisation" required maxLength={80} autoComplete="organization" style={field} /></div>
                <div><label htmlFor="p-tie" style={label}>Any commercial tie to a vendor or product you may name</label>
                  <input id="p-tie" name="vendor_tie" required maxLength={200} placeholder="For example: employed by, partner of, paid adviser to. Write none if none." style={field} /></div>
                <div><label htmlFor="p-title" style={label}>Working title</label>
                  <input id="p-title" name="working_title" required maxLength={140} style={field} /></div>
                <div><label htmlFor="p-idea" style={label}>The idea, who it is for and what it draws on</label>
                  <textarea id="p-idea" name="proposal" required rows={5} maxLength={3000} style={{ ...field, resize: "vertical" }} /></div>
                <div><label htmlFor="p-link" style={label}>A link to a draft or earlier writing (optional)</label>
                  <input id="p-link" name="draft_url" type="url" pattern="https://.+" placeholder="https://" style={field} /></div>
                <label style={check}><input type="checkbox" name="confirms_original" value="yes" required style={{ marginTop: 4 }} />
                  <span>The piece will be my own work, and every quotation will be credited with a link.</span></label>
                <label style={check}><input type="checkbox" name="accepts_rules" value="yes" required style={{ marginTop: 4 }} />
                  <span>I have read the rules above, including the licence and the disclosure of any vendor tie.</span></label>
                <p style={K.small}>We use these details only to answer your proposal and, if it is published, to credit you. See the <a href="/privacy" style={{ color: ACCENT }}>Privacy Policy</a>.</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <Button type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending" : "Send the proposal"}</Button>
                  {state === "failed" && <span role="alert" style={K.small}>The proposal did not send. Please try again.</span>}
                </div>
              </form>
            )}
        </section>
      </div>
    </div>
  );
}
