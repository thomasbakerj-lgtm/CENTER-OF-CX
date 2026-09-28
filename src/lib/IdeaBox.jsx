// src/lib/IdeaBox.jsx
//
// A short form on the pages still being built (Research and its studies, contributor perspectives) so a reader can tell
// us what to build or study next (TB, 28 Sep: "landing pages should enable an opp for the user to contribute ideas").
// One required field, the idea; role and email are optional. It posts to the same inbox as the contact, correction and
// contributor forms (Formspree, named in the Privacy Policy). Nothing is published from it. Tokens only.
import { useState, useId } from "react";
import { HOUSE, RADIUS, TOUCH, FONT_SANS, alpha, LINE } from "./tokens.js";

export const IDEA_ENDPOINT = "https://formspree.io/f/xvzvdnry";

/* Who is writing, in the reader's words. Optional; it tells us which part of the audience an idea comes from. */
export const IDEA_ROLES = ["New to CX or contact centers", "Operations or workforce management", "Leadership", "Strategy or transformation",
  "IT, platforms or architecture", "Security, risk or compliance", "Consultant or advisor", "Vendor or partner", "Other"];

const firm = alpha(HOUSE.mist, LINE.firm);
const field = { width: "100%", boxSizing: "border-box", minHeight: TOUCH, padding: "10px 12px", fontFamily: FONT_SANS, fontSize: 16, color: HOUSE.mist,
  background: HOUSE.ink, border: `1px solid ${firm}`, borderRadius: RADIUS.field };
const label = { display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: HOUSE.mist };
const small = { margin: 0, fontSize: 13, lineHeight: "20px", color: HOUSE.muted };

/** `where` names the page in the email subject; `title` and `prompt` say what kind of idea the page is asking for. */
export function IdeaBox({ where, title = "What should we build or study next?", prompt, id = "ideas" }) {
  const uid = useId();
  const [state, setState] = useState("idle");
  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("sending");
    try {
      const res = await fetch(IDEA_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      setState(res.ok ? "sent" : "failed");
      if (res.ok) form.reset();
    } catch { setState("failed"); }
  };
  return (
    <section id={id} aria-labelledby={`${uid}-h`} style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, borderRadius: RADIUS.card, background: HOUSE.navy, border: `1px solid ${HOUSE.electric}`, fontFamily: FONT_SANS }}>
      <h2 id={`${uid}-h`} style={{ margin: 0, fontSize: 20, lineHeight: "28px", fontWeight: 600, color: HOUSE.mist }}>{title}</h2>
      {prompt && <p style={{ margin: 0, fontSize: 15, lineHeight: "24px", color: HOUSE.body }}>{prompt}</p>}
      {state === "sent"
        ? <p role="status" style={{ margin: 0, fontSize: 15, lineHeight: "24px", color: HOUSE.body }}><strong style={{ color: HOUSE.mist }}>Thank you.</strong> Every idea is read. If you left an email, we may write back with a question.</p>
        : (
          <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="_subject" value={`Idea for The Center of CX: ${where}`} />
            <input type="hidden" name="idea_page" value={where} />
            <div>
              <label htmlFor={`${uid}-idea`} style={label}>Your idea</label>
              <textarea id={`${uid}-idea`} name="idea" required minLength={10} maxLength={2000} rows={4} placeholder="A question you want answered, a study you would join, a tool you wish existed" style={{ ...field, minHeight: 110, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 12 }}>
              <div>
                <label htmlFor={`${uid}-role`} style={label}>Your role (optional)</label>
                <select id={`${uid}-role`} name="role" defaultValue="" style={field}>
                  <option value="">Choose one</option>
                  {IDEA_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${uid}-email`} style={label}>Email, if you want a reply (optional)</label>
                <input id={`${uid}-email`} name="email" type="email" autoComplete="email" style={field} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <button type="submit" disabled={state === "sending"} style={{ minHeight: TOUCH, padding: "0 22px", borderRadius: RADIUS.field, border: "none", background: HOUSE.action, color: HOUSE.paper, fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, cursor: state === "sending" ? "wait" : "pointer" }}>
                {state === "sending" ? "Sending" : "Send the idea"}
              </button>
              <p style={small}>Ideas are never published with your name. See the <a href="/privacy" style={{ color: HOUSE.sky2 }}>Privacy Policy</a>.</p>
            </div>
            {state === "failed" && <p role="alert" style={{ ...small, color: HOUSE.mist }}>That did not go through. Please try again.</p>}
          </form>
        )}
    </section>
  );
}
