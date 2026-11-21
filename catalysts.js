/**
 * Bullzeeker 100x Penny Stock Candidates
 * ---------------------------------------
 * Curated database of small-cap US stocks with pending catalysts.
 * This IS the admin interface — to add/update a candidate:
 *   1. Edit this file
 *   2. Commit + push to GitHub → Vercel auto-deploys
 *
 * Each entry contains the data needed by penny-scoring.js to compute
 * the 100x score. Prices and short interest can be refreshed live by
 * the scanner; other fields (cash, burn, catalyst) are static and
 * should be reviewed quarterly via SEC filings.
 *
 * Fields:
 *  - ticker (string) — US exchange ticker (NASDAQ/NYSE/NYSE American)
 *  - name (string) — company name
 *  - catalyst (string) — description of the catalyst
 *  - catalyst_date (YYYY-MM-DD) — scheduled date (ISO)
 *  - date_is_estimate (bool) — true if the date is approximate
 *  - source_url (string) — SEC filing or IR announcement
 *  - market_cap_m (number|null) — market cap in $M (null = compute live from price × shares)
 *  - shares_outstanding_m (number|null) — shares outstanding in millions
 *  - float_m (number|null) — public float in millions
 *  - short_interest_pct (number|null) — short % of float
 *  - days_to_cover (number|null) — days-to-cover ratio
 *  - cash_m (number|null) — cash + ST investments in $M (from latest 10-Q)
 *  - quarterly_burn_m (number|null) — avg quarterly operating cash burn in $M (last 2-4 quarters)
 *                                     Use negative for cash outflow. null + self_funding=true means positive OCF.
 *  - self_funding (bool) — true if operating cash flow is positive (passes runway criterion automatically)
 *  - risks: object of flags:
 *      dilution: false|'low'|'med'|'high' — shares up >25% YoY, active ATM, recent offering
 *      delisting: bool — Nasdaq/NYSE min bid price deficiency notice
 *      going_concern: bool — going concern warning in latest 10-Q/K
 *      reverse_split_12m: bool — reverse split within last 12 months
 *  - as_of (YYYY-MM-DD) — when fundamentals were last reviewed
 */

(function(global){
'use strict';

const CANDIDATES = [
  {
    ticker: 'INO',
    name: 'Inovio Pharmaceuticals',
    catalyst: 'product launch VOCERYQ (INO-3107) for RRP',
    catalyst_date: '2027-03-31',
    date_is_estimate: true,
    source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=INO',
    market_cap_m: null,
    shares_outstanding_m: null,
    float_m: null,
    short_interest_pct: null,
    days_to_cover: null,
    cash_m: null,
    quarterly_burn_m: null,
    self_funding: false,
    risks: {dilution: null, delisting: false, going_concern: false, reverse_split_12m: false},
    as_of: '2026-11-21',
    notes: 'First FDA-approved immunotherapy for recurrent respiratory papillomatosis. Commercial launch Q1 2027.',
  },
  {
    ticker: 'AQST',
    name: 'Aquestive Therapeutics',
    catalyst: 'PDUFA Anaphylm (epinephrine oral film) for anaphylaxis',
    catalyst_date: '2027-03-16',
    date_is_estimate: false,
    source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AQST',
    market_cap_m: null,
    shares_outstanding_m: null,
    float_m: null,
    short_interest_pct: null,
    days_to_cover: null,
    cash_m: null,
    quarterly_burn_m: null,
    self_funding: false,
    risks: {dilution: null, delisting: false, going_concern: false, reverse_split_12m: false},
    as_of: '2026-11-21',
    notes: 'First needle-free epinephrine. PDUFA 2027-03-16. Potential EpiPen disruption.',
  },
  {
    ticker: 'APMD',
    name: 'Apnimed',
    catalyst: 'PDUFA AD109 (oxnimbi) for obstructive sleep apnea',
    catalyst_date: '2027-02-28',
    date_is_estimate: true,
    source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=APMD',
    market_cap_m: null,
    shares_outstanding_m: null,
    float_m: null,
    short_interest_pct: null,
    days_to_cover: null,
    cash_m: null,
    quarterly_burn_m: null,
    self_funding: false,
    risks: {dilution: null, delisting: false, going_concern: false, reverse_split_12m: false},
    as_of: '2026-11-21',
    notes: 'Oral drug for OSA. Potential multi-billion market disruption vs CPAP.',
  },
  {
    ticker: 'CGEM',
    name: 'Cullinan Therapeutics',
    catalyst: 'PDUFA zipalertinib (NSCLC EGFR exon 20)',
    catalyst_date: '2027-02-27',
    date_is_estimate: false,
    source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=CGEM',
    market_cap_m: null,
    shares_outstanding_m: null,
    float_m: null,
    short_interest_pct: null,
    days_to_cover: null,
    cash_m: null,
    quarterly_burn_m: null,
    self_funding: false,
    risks: {dilution: null, delisting: false, going_concern: false, reverse_split_12m: false},
    as_of: '2026-11-21',
    notes: 'Partnered with Taiho. NSCLC EGFR exon 20 insertion. BTD granted.',
  },
  {
    ticker: 'NUVB',
    name: 'Nuvation Bio',
    catalyst: 'sNDA IBTROZI (taletrectinib)',
    catalyst_date: '2027-01-04',
    date_is_estimate: false,
    source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=NUVB',
    market_cap_m: null,
    shares_outstanding_m: null,
    float_m: null,
    short_interest_pct: null,
    days_to_cover: null,
    cash_m: null,
    quarterly_burn_m: null,
    self_funding: false,
    risks: {dilution: null, delisting: false, going_concern: false, reverse_split_12m: false},
    as_of: '2026-11-21',
    notes: 'ROS1+ NSCLC. Expanded indication / label expansion filing.',
  },
];

global.BULLZEEKER_100X = CANDIDATES;
console.log(`🚀 Bullzeeker 100x Candidates loaded: ${CANDIDATES.length} tickers`);

})(typeof window !== 'undefined' ? window : globalThis);
