/* Originality ledger (TB, S23: if the content is not our own, we source it; never plagiarize). One record per converted
 * page: the date its prose was checked against the web, how, and every verbatim match found with its resolution,
 * "rewritten" in our own words or "quoted" with credit and a link. claims.test.mjs requires a record per page. */
const METHOD = "Every prose string extracted (668 segments across HealthcareVertical.jsx, HCSubVerticalData.js and the Healthcare card in Industries.jsx). 62 distinctive sentences searched as exact phrases (full sentence or an 8 to 12 word run); 24 candidate pages fetched and compared with all 668 segments for shared runs of 8 and of 6 words. Seven candidate pages refused the fetch and were checked by exact-phrase search only. Result: no shared run of 8 words; one 6 word run, a generic list. Sentences written during the research pass that day are our own wording of cited findings.";

const TEL_METHOD = "Every prose string extracted (776 segments across TelecomVertical.jsx and TelecomSubVerticalData.js, plus the Telecommunications card in Industries.jsx). 33 distinctive sentences searched as exact phrases (full sentence or an 8 to 12 word run) before the search budget ran out; 20 more are queued. Candidate results compared for shared runs of 8 words. ACSI, J.D. Power and fcc.gov refused the fetch. Result: no shared run of 8 words; one common trade saying rewritten. Sentences written during the research pass are our own wording of cited findings.";

const TRV_METHOD = "Every prose string extracted (735 segments across TravelVertical.jsx, TravelSubVerticalData.js and the Travel card in Industries.jsx). 20 distinctive sentences searched as exact phrases (the session's search budget ran out before 40); 24 candidate pages fetched, 21 compared with all 735 segments for shared runs of 8 and of 6 words; 3 refused the fetch. Result: no shared run of 8 words; three 6 word runs, all generic. The one attributed external finding (Delta, 30 to 40% fewer disruption calls) had no primary source and was retired. Sentences written during the research pass are our own wording of cited regulations.";

const EDU_METHOD = "Every prose string extracted (788 segments in EducationSubVerticalData.js, the string literals of EducationVertical.jsx, and the Education card in Industries.jsx). 32 distinctive sentences searched as exact phrases (full sentence or an 8 to 12 word run) before the session search budget ran out; 23 candidate pages (education contact center vendors and BPOs, admissions and melt articles, Slate, Mongoose, EAB, NICE, Salesforce, Ivy.ai, FERPA chatbot guides) fetched and compared with every segment for shared runs of 8 and of 6 words; Anthology Ocelot, Talkdesk, Five9 and Genesys education pages returned 404 and ServiceNow refused. Result: no shared run of 8 words outside one generic list of departments (Voiso); one 6 word run, a generic phrase. Sentences written during the research pass that day are our own wording of cited findings.";

const FS_METHOD = "Every prose string extracted (807 segments across FinancialServicesVertical.jsx, FSSubVerticalData.js and the Financial Services card in Industries.jsx). Exact-phrase web search was unavailable in this session (search budget spent; engines refused scripted queries), so 61 pages the text most plausibly draws on were fetched and compared with all 807 segments for shared runs of 8, 7, 6 and 5 words: 50 vendor pages named in the blurbs and the 11 cited sources. 13 vendor pages refused the fetch and were not compared. Result: no shared run of 6 words; 5 word runs are generic phrases. 42 sentences are queued for exact-phrase search. Sentences written during the research pass that day are our own wording of cited findings.";

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
  "TelecomVertical.jsx": { checked: "2026-09-25", method: TEL_METHOD, matches: [] },
  "TelecomSubVerticalData.js": {
    checked: "2026-09-25",
    method: TEL_METHOD,
    matches: [
      { text: "A stale CMDB is worse than no CMDB.", near: "https://virima.com/blog/must-have-cmdb-capabilities-for-itsm-success", kind: "common trade saying", resolution: "rewritten" },
    ],
  },
  "TravelVertical.jsx": { checked: "2026-09-25", method: TRV_METHOD, matches: [] },
  "TravelSubVerticalData.js": {
    checked: "2026-09-25",
    method: TRV_METHOD,
    matches: [
      { text: "Delta's implementation of this capability reduced IROP call volume by 30-40%.", near: "no primary Delta source found; circulates in trade coverage", kind: "unsourced attribution of an external finding", resolution: "rewritten" },
    ],
  },
  "EducationVertical.jsx": { checked: "2026-09-25", method: EDU_METHOD, matches: [
    { text: "With 72% of students who don't re-enroll citing customer service as the reason", near: "https://files.eric.ed.gov/fulltext/ED593366.pdf", kind: "uncited figure from a consultant's claim", resolution: "rewritten" },
  ] },
  "EducationSubVerticalData.js": {
    checked: "2026-09-25",
    method: EDU_METHOD,
    matches: [
      { text: "Inquiries contacted within 5 minutes convert 100x better", near: "InsideSales.com and MIT Lead Response Management Study (sales leads, not education; seen quoted, not fetched)", kind: "uncited figure close to a published finding", resolution: "rewritten" },
    ],
  },
  "FinancialServicesVertical.jsx": { checked: "2026-09-25", method: FS_METHOD, matches: [] },
  "FSSubVerticalData.js": { checked: "2026-09-25", method: FS_METHOD, matches: [] },
};
