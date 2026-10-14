// src/lib/HelpOffer.jsx
//
// One help offer, shown only when a tool's result calls for it (helpOffers.js offerFor). It sits after the tool's own
// work and before the report, carries the fact that triggered it, says what help looks like and what it costs to ask,
// and opens the contact form with its topic chosen. A secondary button: the tool's own next step stays the lead.
// Tokens only through the frame kit and the shared Button.
import { useEffect } from "react";
import { K } from "./frameKit.jsx";
import { Button } from "./ui.jsx";
import { OFFERS, OFFER_IDS, HELP_SHARED, helpHref } from "./helpOffers.js";
import { trackHelp } from "./track.js";

export default function HelpOffer({ id, tool, fact }) {
  const o = OFFER_IDS.includes(id) ? OFFERS[id] : null;
  /* One view event per offer per page view; a result that keeps the same offer as inputs change sends no more. */
  useEffect(() => { if (o) trackHelp.view(tool, id); }, [id, tool]);
  if (!o) return null;
  return (
    <section aria-labelledby={`help-${id}`} data-help-offer={id} style={K.panel}>
      <span style={K.kicker}>If you want help</span>
      <h2 id={`help-${id}`} style={{ ...K.h2, margin: "6px 0 8px" }}>{o.title}</h2>
      {fact && <p style={{ ...K.body, ...K.strong, marginBottom: 6 }}>{fact}</p>}
      <p style={K.body}>{o.body}</p>
      <p style={{ ...K.small, margin: "8px 0 14px" }}>{HELP_SHARED}</p>
      <Button kind="secondary" href={helpHref(id, tool)} onClick={() => trackHelp.click(tool, id)}>Ask for help with this</Button>
    </section>
  );
}
