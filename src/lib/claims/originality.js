/* Originality ledger (TB, S23: if the content is not our own, we source it; never plagiarize). One record per converted
 * page: the date its prose was checked against the web, how, and every verbatim match found with its resolution,
 * "rewritten" in our own words or "quoted" with credit and a link. claims.test.mjs requires a record per page. */
const METHOD = "Every prose string extracted (668 segments across HealthcareVertical.jsx, HCSubVerticalData.js and the Healthcare card in Industries.jsx). 62 distinctive sentences searched as exact phrases (full sentence or an 8 to 12 word run); 24 candidate pages fetched and compared with all 668 segments for shared runs of 8 and of 6 words. Seven candidate pages refused the fetch and were checked by exact-phrase search only. Result: no shared run of 8 words; one 6 word run, a generic list. Sentences written during the research pass that day are our own wording of cited findings.";

export const ORIGINALITY = {
  "HealthcareVertical.jsx": { checked: "2026-09-25", method: METHOD, matches: [] },
  "HCSubVerticalData.js": {
    checked: "2026-09-25",
    method: METHOD,
    matches: [
      { text: "Authorization management is the most operationally critical workflow in home health.", near: "https://carevoyant.com/home-health-blog/home-care-authorization-management-revenue-loss", kind: "close paraphrase of a superlative", resolution: "rewritten" },
      { text: "Without a CRM, agents toggle between 4-6 systems per call.", near: "Salesforce finding of five or six systems (seen quoted, not fetched)", kind: "uncited figure close to a published finding", resolution: "rewritten" },
      { text: "Referral leakage is the silent revenue killer for provider groups.", near: "common trade phrasing", kind: "cliche", resolution: "rewritten" },
    ],
  },
  "RetailVertical.jsx": { checked: "2026-09-25", method: "Every prose string extracted (main page and Industries.jsx retail card); 14 of 44 exact-phrase web searches drawn from this file (hero, sub-vertical cards, failure modes, stack intro, BPO lists, vendor blurbs); 20 close candidate pages fetched and compared by script at 8 and 6 words (emarsys.com and aftership.com blocked, 403). No shared run of 8 or more words and no close paraphrase of a specific external finding. Unsourced figures and superlatives rewritten in the same pass.", matches: [] },
  "RetailSubVerticalData.js": { checked: "2026-09-25", method: "Every prose string extracted (686 segments across both files); 30 of 44 exact-phrase web searches drawn from this file (pitfalls, vendor blurbs, intros); 20 close candidate pages (vendor sites for Loop, Signifyd, Gladly, Gorgias, Ordergroove, Appriss, Cegid, Manhattan, Tulip, Kustomer, plus luxury, subscription, marketplace and identity articles) compared by script at 8 and 6 words. No shared run of 8 or more words. Closest idea: a clienteling blog's 'AI in the advisor's earpiece' against our 'agent's ear' line; a common metaphor with no shared wording, kept.", matches: [] },
};
