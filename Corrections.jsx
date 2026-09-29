// Corrections.jsx
//
// The published vendor correction policy (decision D2, TB 27 Sep 2026) and the form to report an error. A report goes
// to the same inbox as every other request (Formspree, already an allowed host); nothing is published from it. The
// vendor a profile link names is read after first paint, so the prerendered page and the hydrated page match. Tokens
// only.
import { useState, useEffect } from "react";
import { Assent } from "./src/lib/Assent.jsx";
import { HOUSE, PILLARS, RADIUS, TOUCH } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { Button } from "./src/lib/ui.jsx";
import { POLICY, readCorrection } from "./src/lib/research/corrections.js";

const ACCENT = PILLARS.vendors.onDark;
const field = { width: "100%", boxSizing: "border-box", minHeight: TOUCH, padding: "10px 12px", fontFamily: FONT, fontSize: 15, color: HOUSE.mist,
  background: HOUSE.navy, border: `1px solid ${K.firm}`, borderRadius: RADIUS.field };
const label = { ...K.small, fontWeight: 600, color: HOUSE.mist, display: "block", marginBottom: 6 };
const CSS = `.cx-cor p,.cx-cor li{overflow-wrap:anywhere}`;

export default function Corrections() {
  const [vendor, setVendor] = useState(null);
  const [state, setState] = useState("idle");
  useEffect(() => { try { setVendor(readCorrection(window.location.search)); } catch { setVendor(null); } }, []);

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
    <div className="cx-cor" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Crumbs items={[["Vendor Intelligence", "/vendors"], ["Corrections"]]} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Vendor Intelligence</span>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12, color: HOUSE.mist }}>How corrections work</h1>
          <p style={K.body}>Vendor research will sometimes be wrong or go out of date. This is how anyone, including a vendor, can have it checked, and how a change reaches the page.</p>
        </header>

        <section aria-labelledby="policy" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="policy" style={{ ...K.h2, margin: 0 }}>The policy</h2>
          <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            {POLICY.map((p) => <li key={p.id} style={K.body}><strong style={K.strong}>{p.title}.</strong> {p.text}</li>)}
          </ol>
        </section>

        <section id="report" aria-labelledby="report-h" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="report-h" style={{ ...K.h2, margin: 0 }}>{vendor ? `Report an error about ${vendor.name}` : "Report an error"}</h2>
          {state === "sent"
            ? <p role="status" style={K.body}>Thank you. We acknowledge every report within five working days.</p>
            : (
              <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input type="hidden" name="_subject" value={vendor ? `Research correction: ${vendor.name}` : "Research correction"} />
                <input type="hidden" name="topic" value="Research correction" />
                {vendor && <input type="hidden" name="correction_profile" value={vendor.slug} />}
                {!vendor && (
                  <div><label htmlFor="c-vendor" style={label}>Which vendor?</label>
                    <input id="c-vendor" name="correction_vendor" required maxLength={80} style={field} /></div>
                )}
                <div><label htmlFor="c-statement" style={label}>The statement you believe is wrong</label>
                  <textarea id="c-statement" name="statement" required rows={3} maxLength={2000} style={{ ...field, resize: "vertical" }} /></div>
                <div><label htmlFor="c-why" style={label}>What the source shows instead</label>
                  <textarea id="c-why" name="correction" required rows={3} maxLength={2000} style={{ ...field, resize: "vertical" }} /></div>
                <div><label htmlFor="c-source" style={label}>A public link to that source</label>
                  <input id="c-source" name="source_url" type="url" required pattern="https://.+" placeholder="https://" style={field} />
                  <p style={{ ...K.small, marginTop: 4 }}>Only public, citable evidence can change a finding.</p></div>
                <div><label htmlFor="c-email" style={label}>Your email, for our answer</label>
                  <input id="c-email" name="email" type="email" required style={field} /></div>
                <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
                  <legend style={label}>Do you work for or represent this vendor?</legend>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {["Yes", "No"].map((x) => (
                      <label key={x} style={{ ...K.body, display: "inline-flex", alignItems: "center", gap: 8, minHeight: TOUCH }}>
                        <input type="radio" name="represents_vendor" value={x} required /> {x}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <Button type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending" : "Send the report"}</Button>
                  {state === "failed" && <span role="alert" style={K.small}>The report did not send. Please try again.</span>}
                </div>
                <Assent />
              </form>
            )}
        </section>
      </div>
    </div>
  );
}
