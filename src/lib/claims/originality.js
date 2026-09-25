/* Originality ledger (TB, S23: if the content is not our own, we source it; never plagiarize). One record per converted
 * page: the date its prose was checked against the web, how, and every verbatim match found with its resolution,
 * "rewritten" in our own words or "quoted" with credit and a link. claims.test.mjs requires a record per page. */
const METHOD = "Every prose string extracted (668 segments across HealthcareVertical.jsx, HCSubVerticalData.js and the Healthcare card in Industries.jsx). 62 distinctive sentences searched as exact phrases (full sentence or an 8 to 12 word run); 24 candidate pages fetched and compared with all 668 segments for shared runs of 8 and of 6 words. Seven candidate pages refused the fetch and were checked by exact-phrase search only. Result: no shared run of 8 words; one 6 word run, a generic list. Sentences written during the research pass that day are our own wording of cited findings.";

const TEL_METHOD = "Every prose string extracted (776 segments across TelecomVertical.jsx and TelecomSubVerticalData.js, plus the Telecommunications card in Industries.jsx). 33 distinctive sentences searched as exact phrases (full sentence or an 8 to 12 word run) before the search budget ran out; 20 more are queued. Candidate results compared for shared runs of 8 words. ACSI, J.D. Power and fcc.gov refused the fetch. Result: no shared run of 8 words; one common trade saying rewritten. Sentences written during the research pass are our own wording of cited findings.";

const TRV_METHOD = "Every prose string extracted (735 segments across TravelVertical.jsx, TravelSubVerticalData.js and the Travel card in Industries.jsx). 20 distinctive sentences searched as exact phrases (the session's search budget ran out before 40); 24 candidate pages fetched, 21 compared with all 735 segments for shared runs of 8 and of 6 words; 3 refused the fetch. Result: no shared run of 8 words; three 6 word runs, all generic. The one attributed external finding (Delta, 30 to 40% fewer disruption calls) had no primary source and was retired. Sentences written during the research pass are our own wording of cited regulations.";

const EDU_METHOD = "Every prose string extracted (788 segments in EducationSubVerticalData.js, the string literals of EducationVertical.jsx, and the Education card in Industries.jsx). 32 distinctive sentences searched as exact phrases (full sentence or an 8 to 12 word run) before the session search budget ran out; 23 candidate pages (education contact center vendors and BPOs, admissions and melt articles, Slate, Mongoose, EAB, NICE, Salesforce, Ivy.ai, FERPA chatbot guides) fetched and compared with every segment for shared runs of 8 and of 6 words; Anthology Ocelot, Talkdesk, Five9 and Genesys education pages returned 404 and ServiceNow refused. Result: no shared run of 8 words outside one generic list of departments (Voiso); one 6 word run, a generic phrase. Sentences written during the research pass that day are our own wording of cited findings.";

const FS_METHOD = "Every prose string extracted (807 segments across FinancialServicesVertical.jsx, FSSubVerticalData.js and the Financial Services card in Industries.jsx). Exact-phrase web search was unavailable in this session (search budget spent; engines refused scripted queries), so 61 pages the text most plausibly draws on were fetched and compared with all 807 segments for shared runs of 8, 7, 6 and 5 words: 50 vendor pages named in the blurbs and the 11 cited sources. 13 vendor pages refused the fetch and were not compared. Result: no shared run of 6 words; 5 word runs are generic phrases. 42 sentences are queued for exact-phrase search. Sentences written during the research pass that day are our own wording of cited findings.";

const INS_METHOD = "Every prose string extracted (615 segments across InsuranceVertical.jsx, InsuranceSubVerticalData.js and the Insurance card in Industries.jsx). 42 distinctive sentences searched as exact phrases (full sentence or an 8 to 12 word run); 24 candidate pages fetched and compared with all 615 segments for shared runs of 8 and of 6 words. jdpower.com refused the fetch and was checked by exact-phrase search only. Result: no shared run of 8 words; two 6 word runs, a study title and the certificate sentence recorded on the sub-page file. Sentences written during the research pass that day are our own wording of cited findings.";

const UTL_METHOD = "No exact-phrase web search was possible: the session's search budget was spent and other engines ignored quotes or refused. Instead 73 pages were requested (every vendor named on the page at its own product or utilities page, each cited source, regulators and program pages, one utility communications trade article); 47 returned and 26 refused or were missing; with 4 source pages saved earlier, 51 pages were compared by script against every prose segment of the page and the hub card for shared runs of 6, 7 and 8 words. Result: no shared run of 8 words; the one 7 word run is the cited wording of 49 CFR 192.615. Uncited paraphrases of specific external findings were rewritten. 53 queued phrases (scratchpad utl main_phr.txt and sv_phr.txt) remain for a later exact-phrase search.";

const GOV_METHOD = "Every prose string extracted (782 segments across GovernmentVertical.jsx, GovernmentSubVerticalData.js and the Government card in Industries.jsx). No exact-phrase web search was possible: the session's search budget was spent before this pass, and scraped search engines failed a positive control. Instead 55 pages were fetched and compared by script for shared runs of 8, 7 and 6 words: the product or public-sector pages of Genesys, NICE, Verint, Qualtrics, Medallia, Amazon Connect, Amazon Lex, Google Contact Center AI, Salesforce, Pega, Appian, Granicus (two pages), Login.gov, Cognigy, LivePerson, Sprinklr, Five9, Content Guru (two pages), SeeClickFix, Cityworks, Cartegraph, Tyler Technologies (three pages), Accela, Esri, Journal Technologies, Intrado (two pages), RapidSOS, Carbyne, Mark43, Merative Curam and NICE Public Safety; the government CX pages of FedRAMP, performance.gov, digital.gov, section508.gov, 211, the 988 Lifeline and the National Center for State Courts; and the sources read in full for the research pass (ACSI Federal Government Study 2025, NENA-STA-020.1-2020, MACPAC's Medicaid unwinding brief, three SQM Group pages, 28 CFR 35.200, 36 CFR 1194). Pages refused or unreachable: Cisco, ID.me, Ada, LexisNexis Risk, 8x8, Zetron, Hexagon, Motorola Solutions, Adobe, ServiceNow, nena.org, fcc.gov, lep.gov, and the NICE and Qualtrics public-sector pages (their home pages were compared instead). Result: no shared run of 8 or 7 words; one 6 word run, a proper name (OMB Circular A-11 Section 280). Sentences written during the research pass are our own wording of cited findings. Queued for a later exact-phrase search: 17 distinctive runs from the pre-existing prose (failure modes, layer pitfalls, the hub card).";

const MFG_METHOD = "55 distinctive 8 to 12 word runs (main page and hub card 7, sub-pages 48) searched as exact quoted phrases on DuckDuckGo through headless Chromium (WebSearch budget spent; Bing from the sandbox returned unrelated results). Positive control passed: 4 of 4 known published phrases were found by the same route (an SQM KPI sentence twice, a 49 CFR 573.6 sentence, a Warranty Week sentence). 54 of 55 phrases returned no result; 1 did not load after two tries. Every prose segment of both files (629) was also compared by script for shared 8, 7 and 6 word runs against the cited sources as fetched (eCFR 49 CFR 573.6, 577.7; 16 CFR 314.4, 700.10, 1115.14; 21 CFR 7.3; 47 USC 227; 21 USC 350f, 379aa-1; Warranty Week report; two SQM pages): no 8 or 7 word run; one 6 word statutory phrase, now quoted and cited. Two uncited paraphrases of external findings retired.";

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
  "InsuranceVertical.jsx": {
    checked: "2026-09-25",
    method: INS_METHOD,
    matches: [
      { text: "Claims cycle time drives satisfaction more than claims outcome ... is the primary driver of claims dissatisfaction.", near: "J.D. Power U.S. Property Claims Satisfaction Study findings on time to settle (publisher page refused the fetch)", kind: "uncited claim close to a published finding", resolution: "rewritten" },
    ],
  },
  "InsuranceSubVerticalData.js": {
    checked: "2026-09-25",
    method: INS_METHOD,
    matches: [
      { text: "Certificate of insurance requests are the highest-volume, lowest-complexity interaction in commercial lines", near: "https://ustechautomations.com/resources/blog/certificate-of-insurance-automation-60-second-issuance", kind: "close paraphrase of a superlative (6 word shared run)", resolution: "rewritten" },
      { text: "Life insurers lose policyholders not through dissatisfaction but through disengagement.", near: "https://www.insurancebusinessmag.com/us/news/life-insurance/why-life-insurers-are-losing-clients-they-already-won-590123.aspx", kind: "close paraphrase of a specific external finding (Capgemini and LIMRA)", resolution: "rewritten" },
      { text: "Cyber breach response has a golden hour: the first 60 minutes after a breach is detected determine whether containment succeeds or the attack spreads.", near: "https://www.mprunderwriting.com/the-golden-hour-in-cyber-incident-response/", kind: "uncited trade claim with a specific figure", resolution: "rewritten" },
    ],
  },
  "UtilitiesVertical.jsx": { checked: "2026-09-25", method: UTL_METHOD, matches: [
      { text: "Customers spend only 8 minutes per year interacting with their utility", near: "a widely repeated consulting finding on minutes per year of utility interaction, uncited", kind: "paraphrase of a specific external finding", resolution: "rewritten" },
      { text: "22% of utility customers can't pay their full bill", near: "J.D. Power Utilities Outlook 2026 finding, uncited in the text and not re-readable", kind: "paraphrase of a specific external finding", resolution: "rewritten" },
    ] },
  "UtilitiesSubVerticalData.js": { checked: "2026-09-25", method: UTL_METHOD, matches: [
      { text: "satisfaction is 210 points higher (on 1,000-point scale) when customers receive 5+ outage communications", near: "J.D. Power electric utility residential study finding, uncited and not re-readable", kind: "paraphrase of a specific external finding", resolution: "rewritten" },
      { text: "PHMSA requires gas utilities to respond to gas odor reports within 60 minutes", near: "misstatement of 49 CFR 192.615, which sets no minute limit", kind: "paraphrase of a specific external finding", resolution: "rewritten" },
    ] },
  "GovernmentVertical.jsx": { checked: "2026-09-25", method: GOV_METHOD, matches: [] },
  "GovernmentSubVerticalData.js": { checked: "2026-09-25", method: GOV_METHOD, matches: [] },
  "ManufacturingVertical.jsx": {
    checked: "2026-09-25",
    method: MFG_METHOD,
    matches: [
      { text: "will never buy from that brand again, and will tell 10 people", near: "the widely repeated TARP word-of-mouth finding that an unhappy customer tells about 10 people, uncited on the page", kind: "paraphrase", resolution: "rewritten" },
    ],
  },
  "ManufacturingSubVerticalData.js": {
    checked: "2026-09-25",
    method: MFG_METHOD,
    matches: [
      { text: "A study by Lead Response Management found that responding to an internet lead within 5 minutes is 100x more effective than waiting 30 minutes", near: "Oldroyd and InsideSales.com Lead Response Management Study (2007), which measured contact and qualification odds", kind: "paraphrase", resolution: "rewritten" },
      { text: "a reasonable probability of serious adverse health consequences or death", near: "21 U.S.C. 350f(a)(2) definition of reportable food", kind: "shared run (6 words, statutory term)", resolution: "quoted", url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title21-section350f&num=0&edition=prelim" },
    ],
  },
};
