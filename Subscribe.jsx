// Subscribe.jsx
//
// The newsletter sign-up: one field. It asked for first name, last name, company and email, all required, with nothing
// said about what arrives or how often; a first visitor had to hand over four facts to learn what the site publishes.
// Now it says what an email carries, how often at most, and how to stop, and asks only for the address. Posts to the
// same Formspree form as before (named in the Privacy Policy). Tokens only; the header sits in the flow.
import { useState } from "react";
import { HOUSE, RADIUS, TOUCH } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";

/* What a subscriber receives: the value of each email, and the kinds of page the site already publishes that feed it. */
export const WHAT_ARRIVES = [
  ["Key takeaways", "a few points you can act on or bring to your next meeting, each with its source."],
  ["Ideas to test", "a question worth asking about your own operation, with the diagnostic that answers it from your numbers."],
  ["Market Watch", "launches, deals, outages and rule changes worth knowing, each labelled by the source it rests on."],
  ["Vendor research", "new and corrected findings on the platforms we research."],
  ["Method changes", "when a diagnostic's formulas or sourced constants change, and what moved."],
];

/* How often. TB (28 Sep): a planned rhythm that can move with the news. */
export const FREQUENCY = "About once a week. When more is worth your time, such as a rule change or a major launch, we may send an extra one; in a quiet week we skip it.";

const field = { width: "100%", boxSizing: "border-box", minHeight: TOUCH, padding: "10px 12px", fontFamily: FONT, fontSize: 16, color: HOUSE.mist,
  background: HOUSE.navy, border: `1px solid ${K.firm}`, borderRadius: RADIUS.field };

export default function Subscribe() {
  const [state, setState] = useState("idle");
  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("sending");
    try {
      const res = await fetch("https://formspree.io/f/xnjolywk", { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      setState(res.ok ? "sent" : "failed");
    } catch { setState("failed"); }
  };

  return (
    <div style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <Crumbs items={[["Home", "/"], ["Subscribe"]]} share={false} />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 72px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: HOUSE.sky2 }}>Subscribe</span>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12, color: HOUSE.mist }}>Ideas and takeaways for contact center decisions.</h1>
          <p style={{ ...K.body, fontSize: 17, lineHeight: "28px" }}>Each email picks out what changed in contact center technology and operations, what it means for the people who buy and run it, and where on the site to test it against your own numbers.</p>
          <p style={K.body}><strong style={K.strong}>How often:</strong> {FREQUENCY} Reply to any email to stop, or ask us on the contact page.</p>
        </header>

        <section aria-labelledby="arrives" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="arrives" style={{ ...K.h2, margin: 0 }}>What an email carries</h2>
          <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
            {WHAT_ARRIVES.map(([t, d]) => <li key={t} style={K.body}><strong style={K.strong}>{t}</strong>, {d}</li>)}
          </ul>
        </section>

        {state === "sent" ? (
          <p role="status" style={{ ...K.panel, ...K.body }}>
            <strong style={K.strong}>You are subscribed.</strong> The next email goes out when there is something worth sending. Meanwhile, <a href="/how-to-choose" style={{ color: HOUSE.sky2, fontWeight: 600 }}>the diagnostics</a> are free to use now.
          </p>
        ) : (
          <form onSubmit={submit} noValidate style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="_subject" value="New Newsletter Subscriber: Center of CX" />
            <label htmlFor="sub-email" style={{ ...K.small, fontWeight: 600, color: HOUSE.mist }}>Email address</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input id="sub-email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" style={{ ...field, flex: "1 1 240px", width: "auto" }} />
              <button type="submit" disabled={state === "sending"} style={{ minHeight: TOUCH, padding: "0 24px", borderRadius: RADIUS.field, border: "none", background: HOUSE.action, color: HOUSE.paper, fontFamily: FONT, fontSize: 15, fontWeight: 600, cursor: state === "sending" ? "wait" : "pointer" }}>
                {state === "sending" ? "Subscribing" : "Subscribe"}
              </button>
            </div>
            {state === "failed" && <p role="alert" style={{ ...K.small, color: HOUSE.mist }}>That did not go through. Check the address and try again.</p>}
            <p style={K.small}>Your address is used only to send these emails. See the <a href="/privacy" style={{ color: HOUSE.sky2 }}>Privacy Policy</a>.</p>
          </form>
        )}
      </div>
    </div>
  );
}
