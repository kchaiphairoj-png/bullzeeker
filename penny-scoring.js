/**
 * Bullzeeker 100x Penny Stock Screener — Pure Scoring Module
 * ----------------------------------------------------------
 * Pure functions only. No DOM, no network, no side effects.
 * Each criterion returns:
 *   {pass: true | false | null, value: number|null, reason: string}
 *   where pass=null means missing data ("?"), scores 0 but shown as "?"
 *
 * Total score = sum of pass===true across all 5 criteria (0-5).
 *
 * Testable via penny-tests.html
 */
(function(global){
'use strict';

/* ---------- INDIVIDUAL CRITERIA ---------- */

/**
 * Criterion 1: Market cap pass (<= max_market_cap_m, default $300M)
 */
function checkMarketCap(candidate, livePrice, settings){
  const maxCapM = settings?.max_market_cap_m ?? 300;
  // Prefer curated market_cap_m if set; else compute from price × shares
  let capM = candidate.market_cap_m;
  if(capM == null && livePrice != null && candidate.shares_outstanding_m != null){
    capM = livePrice * candidate.shares_outstanding_m;
  }
  if(capM == null) return {pass: null, value: null, reason: 'market cap unknown'};
  return {
    pass: capM <= maxCapM,
    value: capM,
    reason: capM <= maxCapM ? `$${capM.toFixed(0)}M ≤ $${maxCapM}M` : `$${capM.toFixed(0)}M > $${maxCapM}M`,
  };
}

/**
 * Criterion 2: Cash runway pass (>= min_runway_months, default 12)
 * runway_months = cash_m / avg monthly burn
 * monthly_burn = quarterly_burn_m / 3 (burn stored as positive number = outflow)
 * If self_funding (positive OCF), passes automatically.
 */
function checkRunway(candidate, settings){
  const minMonths = settings?.min_runway_months ?? 12;
  if(candidate.self_funding === true){
    return {pass: true, value: Infinity, reason: 'self-funding (positive OCF)', self_funding: true};
  }
  const cash = candidate.cash_m;
  const burnQ = candidate.quarterly_burn_m;
  if(cash == null || burnQ == null) return {pass: null, value: null, reason: 'cash or burn unknown'};
  if(burnQ <= 0) return {pass: true, value: Infinity, reason: 'burn ≤ 0 (self-funding)', self_funding: true};
  const monthlyBurn = burnQ / 3;
  const months = cash / monthlyBurn;
  return {
    pass: months >= minMonths,
    value: months,
    reason: months >= minMonths ? `${months.toFixed(1)} months ≥ ${minMonths}` : `${months.toFixed(1)} months < ${minMonths}`,
  };
}

/**
 * Criterion 3: Catalyst within window (default 365 days from today)
 * Uses candidate.catalyst_date (YYYY-MM-DD) and 'today' or settings.today.
 */
function checkCatalyst(candidate, settings, today){
  const windowDays = settings?.catalyst_window_days ?? 365;
  if(!candidate.catalyst_date) return {pass: null, value: null, reason: 'no catalyst'};
  const todayDate = today instanceof Date ? today : new Date(today || Date.now());
  const catDate = new Date(candidate.catalyst_date + 'T00:00:00Z');
  const diffDays = Math.round((catDate - todayDate) / (1000 * 60 * 60 * 24));
  if(diffDays < 0) return {pass: false, value: diffDays, reason: `catalyst ${-diffDays}d ago (past)`};
  return {
    pass: diffDays <= windowDays,
    value: diffDays,
    reason: diffDays <= windowDays ? `in ${diffDays}d ≤ ${windowDays}d` : `in ${diffDays}d > ${windowDays}d`,
  };
}

/**
 * Criterion 4: Short squeeze potential
 * short_interest_pct >= 20 OR days_to_cover >= 7
 */
function checkShortSqueeze(candidate, settings){
  const minShortPct = settings?.min_short_pct ?? 20;
  const minDTC = settings?.min_days_to_cover ?? 7;
  const sp = candidate.short_interest_pct;
  const dtc = candidate.days_to_cover;
  if(sp == null && dtc == null) return {pass: null, value: null, reason: 'short data unknown'};
  const spPass = sp != null && sp >= minShortPct;
  const dtcPass = dtc != null && dtc >= minDTC;
  const pass = spPass || dtcPass;
  const bits = [];
  if(sp != null) bits.push(`SI ${sp.toFixed(1)}%`);
  if(dtc != null) bits.push(`DTC ${dtc.toFixed(1)}`);
  return {
    pass,
    value: {short_interest_pct: sp, days_to_cover: dtc},
    reason: bits.join(' · ') + (pass ? ' (pass)' : ` (<${minShortPct}% & <${minDTC}d)`),
  };
}

/**
 * Criterion 5: Low float (<= max_float_m, default 30M)
 */
function checkFloat(candidate, settings){
  const maxFloatM = settings?.max_float_m ?? 30;
  const floatM = candidate.float_m;
  if(floatM == null) return {pass: null, value: null, reason: 'float unknown'};
  return {
    pass: floatM <= maxFloatM,
    value: floatM,
    reason: floatM <= maxFloatM ? `${floatM.toFixed(1)}M ≤ ${maxFloatM}M` : `${floatM.toFixed(1)}M > ${maxFloatM}M`,
  };
}

/* ---------- RISK FLAGS (badges only, do not change score) ---------- */
function computeRiskFlags(candidate){
  const r = candidate.risks || {};
  const flags = [];
  if(r.dilution === 'high') flags.push({code:'dilution', label:'⚠️ Dilution risk (high)', sev:'high'});
  else if(r.dilution === 'med') flags.push({code:'dilution', label:'⚠️ Dilution risk', sev:'med'});
  else if(r.dilution === 'low') flags.push({code:'dilution', label:'Dilution risk (low)', sev:'low'});
  if(r.delisting === true) flags.push({code:'delisting', label:'🚫 Delisting notice', sev:'high'});
  if(r.going_concern === true) flags.push({code:'going_concern', label:'🔴 Going concern', sev:'high'});
  if(r.reverse_split_12m === true) flags.push({code:'reverse_split', label:'🔄 Reverse split (12mo)', sev:'med'});
  return flags;
}

/* ---------- COMPOSITE SCORE ---------- */
function scoreCandidate(candidate, livePrice, settings, today){
  const c1 = checkMarketCap(candidate, livePrice, settings);
  const c2 = checkRunway(candidate, settings);
  const c3 = checkCatalyst(candidate, settings, today);
  const c4 = checkShortSqueeze(candidate, settings);
  const c5 = checkFloat(candidate, settings);
  const criteria = {
    market_cap: c1,
    runway: c2,
    catalyst: c3,
    short_squeeze: c4,
    low_float: c5,
  };
  // Score = count of pass===true (null/false = 0)
  const score = Object.values(criteria).filter(c => c.pass === true).length;
  const risks = computeRiskFlags(candidate);
  return {
    ticker: candidate.ticker,
    name: candidate.name,
    score,
    maxScore: 5,
    criteria,
    risks,
    livePrice,
    candidate,
  };
}

/* ---------- EXPORTS ---------- */
const api = {
  checkMarketCap,
  checkRunway,
  checkCatalyst,
  checkShortSqueeze,
  checkFloat,
  computeRiskFlags,
  scoreCandidate,
};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
global.BULLZEEKER_100X_SCORING = api;

})(typeof window !== 'undefined' ? window : globalThis);
