// src/lib/DemoRequest.jsx
//
// "See it in action": the reader asks for a demo with a vendor, built around their own scenarios (TB, 29 Sep 2026: "a cool
// CTA I can leverage"). One button opens a short form; it posts to the same inbox as the contact and introduction
// requests (Formspree, named in the Privacy Policy). Only the email is required. The reader chooses whether their answers
// from the tool travel with the request, and the form says exactly what those answers are. An introduction never moves a
// vendor: nothing here reads or changes a list, an order, a score or a finding. Tokens only.
import { useState, useId } from "react";
import { Assent } from "./Assent.jsx";
import { HOUSE, RADIUS, TOUCH, FONT_SANS, alpha, LINE } from "./tokens.js";
import { K } from "./frameKit.jsx";
import { Button } from "./ui.jsx";
import { trackVendor } from "./track.js";

export const DEMO_ENDPOINT = "https://formspree.io/f/xvzvdnry";

const firm = alpha(HOUSE.mist, LINE.firm);
const field = { width: "100%", boxSizing: "border-box", minHeight: TOUCH, padding: "10px 12px", fontFamily: FONT_SANS, fontSize: 16, color: HOUSE.mist,
  background: HOUSE.ink, border: `1px solid ${firm}`, borderRadius: RADIUS.field };
const label = { display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: HOUSE.mist };

/**
 * `vendor` is { name, slug } for the vendor the demo is with; `from` is the tool id; `context` is a list of
 * [label, value] pairs the reader may choose to send (their answers in the tool, never anything computed about them).
 */
export function DemoRequest({ vendor, from, context = [] }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("idle");
  const [share, setShare] = useState(true);
  const shown = context.filter(([, v]) => v);

  const start = () => { setOpen(true); trackVendor.action(vendor.slug || null, "intro", "tool"); };
  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("sending");
    const body = new FormData(form);
    if (share) for (const [k, v] of shown) body.append(`context_${k.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`, String(v));
    try {
      const res = await fetch(DEMO_ENDPOINT, { method: "POST", body, headers: { Accept: "application/json" } });
      setState(res.ok ? "sent" : "failed");
      if (res.ok) trackVendor.introSent(vendor.slug || null);
    } catch { setState("failed"); }
  };

  return (
    <section aria-labelledby={`${uid}-h`} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10, border: `1px solid ${HOUSE.electric}` }}>
      <div style={K.kicker}>See it in action</div>
      <h2 id={`${uid}-h`} style={{ ...K.h2, fontSize: 20, lineHeight: "28px", margin: 0 }}>Get a demo with {vendor.name}, built around your scenarios</h2>
      <p style={K.body}>
        Tell us what you need to see and we arrange a demo with {vendor.name} that walks through your own situations, in place of the standard pitch. We set it up with you before the vendor calls, so the hour goes on the questions that decide your choice.
      </p>
      {state === "sent" ? (
        <p role="status" style={{ ...K.body, marginTop: 4 }}><strong style={K.strong}>Request sent.</strong> We reply to agree the scenarios with you before we contact {vendor.name}. Nothing is shared with the vendor until you confirm.</p>
      ) : !open ? (
        <div><Button onClick={start} icon="next">Request a demo with {vendor.name}</Button></div>
      ) : (
        <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          <input type="hidden" name="_subject" value={`Demo request: ${vendor.name}`} />
          <input type="hidden" name="topic" value="Vendor demo" />
          <input type="hidden" name="intro_vendor" value={vendor.name} />
          {vendor.slug && <input type="hidden" name="intro_profile" value={vendor.slug} />}
          <input type="hidden" name="intro_from" value={from} />
          <div style={K.grid(220)}>
            <div>
              <label htmlFor={`${uid}-email`} style={label}>Work email</label>
              <input id={`${uid}-email`} name="email" type="email" required autoComplete="email" style={field} />
            </div>
            <div>
              <label htmlFor={`${uid}-name`} style={label}>Name (optional)</label>
              <input id={`${uid}-name`} name="name" autoComplete="name" style={field} />
            </div>
            <div>
              <label htmlFor={`${uid}-co`} style={label}>Company (optional)</label>
              <input id={`${uid}-co`} name="company" autoComplete="organization" style={field} />
            </div>
          </div>
          <div>
            <label htmlFor={`${uid}-msg`} style={label}>What should the demo show? (optional)</label>
            <textarea id={`${uid}-msg`} name="message" rows={3} maxLength={2000} placeholder="The two or three situations that would decide it for you" style={{ ...field, minHeight: 90, resize: "vertical" }} />
          </div>
          {shown.length > 0 && (
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", minHeight: TOUCH, cursor: "pointer" }}>
              <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
              <span style={K.small}>Include my answers from this tool so the demo starts from them: {shown.map(([k, v]) => `${k}: ${v}`).join("; ")}.</span>
            </label>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button type="submit" disabled={state === "sending"} style={{ minHeight: TOUCH, padding: "0 22px", borderRadius: RADIUS.field, border: "none", background: HOUSE.action, color: HOUSE.paper, fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, cursor: state === "sending" ? "wait" : "pointer" }}>
              {state === "sending" ? "Sending" : "Send the request"}
            </button>
            <p style={K.small}>Used only to arrange this demo. See the <a href="/privacy" style={{ color: HOUSE.sky2 }}>Privacy Policy</a>.</p>
          </div>
          <Assent />
          {state === "failed" && <p role="alert" style={{ ...K.small, color: HOUSE.mist }}>That did not go through. Please try again, or write to us from the contact page.</p>}
        </form>
      )}
      <p style={K.small}>Asking for a demo never changes a list, an order or a finding on this site.</p>
    </section>
  );
}
