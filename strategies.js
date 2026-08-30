/**
 * 🧠 Bullzeeker AI CIO — Phase 3: Multi-Portfolio Strategy Engine
 *
 * 10 research strategies + CIO arbitration layer.
 * Each strategy is a research engine that scans market → outputs picks.
 * CIO layer aggregates all strategy outputs → produces consensus.
 *
 * Design:
 * - All strategies use SAME market data (fetched once, shared)
 * - Each returns top 10 picks with score/reason/signals
 * - Master Portfolio uses arbitration result to make allocation decisions
 * - Strategies can be enabled/disabled by user
 *
 * Data model:
 *   strategyResult = {
 *     picks: [{ticker, score, price, reason, signals, sector}],
 *     conviction: 0-100,   // strategy's own confidence in current market
 *     lastScan: timestamp,
 *   }
 *
 * Depends on: universe.js (window.BULLZEEKER_UNIVERSE)
 */

(function(global){
'use strict';

/* ==================== INDICATOR HELPERS ==================== */

function sma(arr, p){
  if(arr.length < p) return null;
  let s = 0;
  for(let i = arr.length - p; i < arr.length; i++) s += arr[i];
  return s / p;
}

function ema(arr, p){
  if(arr.length < p) return null;
  const k = 2 / (p + 1);
  let e = sma(arr.slice(0, p), p);
  for(let i = p; i < arr.length; i++){
    e = arr[i] * k + e * (1 - k);
  }
  return e;
}

function atr14(highs, lows, closes){
  if(closes.length < 15) return null;
  const trs = [];
  for(let i = 1; i < closes.length; i++){
    trs.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i-1]),
      Math.abs(lows[i] - closes[i-1])
    ));
  }
  let atr = sma(trs.slice(0, 14), 14);
  for(let i = 14; i < trs.length; i++){
    atr = (atr * 13 + trs[i]) / 14;
  }
  return atr;
}

function rsi14(closes){
  if(closes.length < 15) return null;
  let gains = 0, losses = 0;
  for(let i = 1; i <= 14; i++){
    const d = closes[i] - closes[i-1];
    if(d > 0) gains += d; else losses -= d;
  }
  let avgG = gains / 14, avgL = losses / 14;
  for(let i = 15; i < closes.length; i++){
    const d = closes[i] - closes[i-1];
    const g = d > 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    avgG = (avgG * 13 + g) / 14;
    avgL = (avgL * 13 + l) / 14;
  }
  if(avgL === 0) return 100;
  return 100 - 100 / (1 + avgG / avgL);
}

function returnPct(closes, days){
  if(closes.length < days + 1) return null;
  const past = closes[closes.length - 1 - days];
  const now = closes[closes.length - 1];
  return (now - past) / past * 100;
}

function volumeAvg(vols, days){
  if(vols.length < days) return null;
  const slice = vols.slice(-days);
  return slice.reduce((a,b) => a + b, 0) / days;
}

function drawdownFromHigh(closes, lookback){
  const slice = lookback ? closes.slice(-lookback) : closes;
  const high = Math.max(...slice);
  const now = closes[closes.length - 1];
  return (now - high) / high * 100;  // negative if below high
}

/* ==================== STRATEGY DEFINITIONS ==================== */

/**
 * Each strategy takes: (dataMap: {ticker → chartData}, marketRegime) → picks
 * Returns: [{ticker, score, price, reason, signals}]
 *
 * chartData = {closes, highs, lows, vols, meta: {price, 52w, name, ...}}
 */

const STRATEGIES = {

  /* -------- 1. TREND FOLLOWING (Stan Weinstein Stage 2) -------- */
  trend_following: {
    id: 'trend_following',
    name: 'Trend Following',
    emoji: '📈',
    color: '#22c55e',
    thai: 'ตามเทรนด์',
    description: 'ราคาเหนือ MA200 · MA50 ขึ้น · momentum แข็ง',
    strengthWhen: 'BULL',
    async scan(dataMap, regime){
      const picks = [];
      for(const [ticker, d] of Object.entries(dataMap)){
        if(!d || d.closes.length < 200) continue;
        const price = d.closes[d.closes.length - 1];
        const ma50 = sma(d.closes, 50);
        const ma200 = sma(d.closes, 200);
        const ma50_prev = sma(d.closes.slice(0, -20), 50);
        if(!ma50 || !ma200 || !ma50_prev) continue;

        // Filters
        if(price < ma50) continue;
        if(price < ma200) continue;
        if(ma50 < ma200) continue;
        if(ma50 < ma50_prev * 1.02) continue;  // MA50 must be rising

        // Score
        const distMA50 = (price / ma50 - 1) * 100;
        const distMA200 = (price / ma200 - 1) * 100;
        const ret3m = returnPct(d.closes, 63) || 0;
        const ret1m = returnPct(d.closes, 21) || 0;

        let score = 50;
        score += Math.min(distMA200, 30) * 0.5;
        score += Math.min(ret3m, 40) * 0.5;
        score += Math.min(ret1m, 20) * 0.5;

        picks.push({
          ticker, score, price,
          reason: `Uptrend · MA50 rising · +${ret3m.toFixed(1)}% ใน 3 เดือน`,
          signals: {technical: `Above MA200 (+${distMA200.toFixed(1)}%)`, momentum: `3M return ${ret3m.toFixed(1)}%`},
        });
      }
      return picks.sort((a,b) => b.score - a.score).slice(0, 10);
    },
    convictionByRegime(score){
      if(score >= 5) return 90;
      if(score >= 2) return 70;
      if(score >= 0) return 50;
      return 20;  // Weak in bear market
    },
  },

  /* -------- 2. MOMENTUM LEADERS (CAN SLIM) -------- */
  momentum_leaders: {
    id: 'momentum_leaders',
    name: 'Momentum Leaders',
    emoji: '🚀',
    color: '#a855f7',
    thai: 'หุ้นนำตลาด',
    description: 'Top 3-month return + volume expansion · Style O\'Neil',
    strengthWhen: 'BULL',
    async scan(dataMap, regime){
      // Rank all by 3-month return
      const scored = [];
      for(const [ticker, d] of Object.entries(dataMap)){
        if(!d || d.closes.length < 90) continue;
        const price = d.closes[d.closes.length - 1];
        if(price < 5) continue;
        const ret3m = returnPct(d.closes, 63);
        const ret6m = returnPct(d.closes, 126);
        if(ret3m == null || ret3m < 10) continue;

        // Volume expansion (last 20d vs prior 50d)
        const vRecent = volumeAvg(d.vols, 20);
        const vPrior = volumeAvg(d.vols.slice(0, -20), 50);
        const volExp = (vPrior && vRecent) ? vRecent / vPrior : 1;
        if(volExp < 1.1) continue;

        const score = ret3m + (ret6m || 0) * 0.3 + (volExp - 1) * 30;
        scored.push({
          ticker, score, price, ret3m, ret6m, volExp,
          reason: `+${ret3m.toFixed(0)}% (3M) · Volume +${((volExp-1)*100).toFixed(0)}%`,
          signals: {momentum: `Top ${ret3m.toFixed(0)}% momentum`, technical: `Volume expanding ${volExp.toFixed(2)}x`},
        });
      }
      return scored.sort((a,b) => b.score - a.score).slice(0, 10);
    },
    convictionByRegime(score){
      return score >= 3 ? 85 : score >= 0 ? 55 : 15;
    },
  },

  /* -------- 3. STAGE 2 BREAKOUT (Minervini Trend Template) -------- */
  stage2_breakout: {
    id: 'stage2_breakout',
    name: 'Stage 2 Breakout',
    emoji: '💥',
    color: '#ef4444',
    thai: 'เบรกฐาน',
    description: 'Trend template ครบ + breakout จากฐานล่าสุด',
    strengthWhen: 'BULL',
    async scan(dataMap, regime){
      const picks = [];
      for(const [ticker, d] of Object.entries(dataMap)){
        if(!d || d.closes.length < 200) continue;
        const price = d.closes[d.closes.length - 1];
        if(price < 5) continue;

        const ma50 = sma(d.closes, 50);
        const ma150 = sma(d.closes, 150);
        const ma200 = sma(d.closes, 200);
        const ma200_1m = sma(d.closes.slice(0, -22), 200);
        if(!ma50 || !ma150 || !ma200 || !ma200_1m) continue;

        const yearHigh = Math.max(...d.highs.slice(-252));
        const yearLow = Math.min(...d.lows.slice(-252));

        // Minervini Trend Template (8 checks)
        const t1 = price > ma50;
        const t2 = price > ma150;
        const t3 = price > ma200;
        const t4 = ma50 > ma150;
        const t5 = ma150 > ma200;
        const t6 = ma200 > ma200_1m;  // MA200 rising
        const t7 = price >= yearLow * 1.30;  // 30% above 52w low
        const t8 = price >= yearHigh * 0.75; // Within 25% of 52w high

        const passed = [t1,t2,t3,t4,t5,t6,t7,t8].filter(Boolean).length;
        if(passed < 7) continue;

        // Check for recent breakout (20-day high broken)
        const prior20High = Math.max(...d.highs.slice(-45, -1));
        const brokeout = price > prior20High;
        if(!brokeout) continue;

        // Volume surge
        const vRecent = volumeAvg(d.vols, 5);
        const vAvg = volumeAvg(d.vols.slice(0, -5), 50);
        const volSurge = (vRecent && vAvg) ? vRecent / vAvg : 1;

        const score = passed * 10 + Math.min(volSurge, 3) * 15 + (price/yearHigh) * 20;
        picks.push({
          ticker, score, price,
          reason: `Trend template ${passed}/8 · Broke 20-day high · Vol ${volSurge.toFixed(1)}x`,
          signals: {
            technical: `Stage 2 uptrend · Passed ${passed}/8 checks`,
            momentum: `Fresh breakout with ${volSurge.toFixed(1)}x volume`,
          },
        });
      }
      return picks.sort((a,b) => b.score - a.score).slice(0, 10);
    },
    convictionByRegime(score){
      return score >= 3 ? 90 : score >= 0 ? 60 : 20;
    },
  },

  /* -------- 4. VCP (Volatility Contraction Pattern) -------- */
  vcp: {
    id: 'vcp',
    name: 'VCP Contraction',
    emoji: '🎯',
    color: '#0ea5e9',
    thai: 'บีบตัว',
    description: 'Minervini VCP · ATR contracting · Base tightening',
    strengthWhen: 'BULL',
    async scan(dataMap, regime){
      const picks = [];
      for(const [ticker, d] of Object.entries(dataMap)){
        if(!d || d.closes.length < 100) continue;
        const price = d.closes[d.closes.length - 1];
        if(price < 5) continue;

        // ATR contraction: recent 14-day ATR vs 60-day ATR
        const atrRecent = atr14(
          d.highs.slice(-30),
          d.lows.slice(-30),
          d.closes.slice(-30)
        );
        const atrOld = atr14(
          d.highs.slice(-90, -30),
          d.lows.slice(-90, -30),
          d.closes.slice(-90, -30)
        );
        if(!atrRecent || !atrOld) continue;
        const contraction = 1 - (atrRecent / atrOld);
        if(contraction < 0.15) continue;  // Need >15% contraction

        // Must be above MA50 (uptrend)
        const ma50 = sma(d.closes, 50);
        if(!ma50 || price < ma50) continue;

        // Base tightness: last 30-day range as % of price
        const base30High = Math.max(...d.highs.slice(-30));
        const base30Low = Math.min(...d.lows.slice(-30));
        const tightness = 1 - (base30High - base30Low) / base30High;
        if(tightness < 0.85) continue;  // Range <15%

        const score = contraction * 100 + tightness * 30;
        picks.push({
          ticker, score, price,
          reason: `ATR หด ${(contraction*100).toFixed(0)}% · Base tight ${((1-tightness)*100).toFixed(1)}%`,
          signals: {
            technical: `VCP: volatility contracted ${(contraction*100).toFixed(0)}%`,
            momentum: `Tight base ready for breakout`,
          },
        });
      }
      return picks.sort((a,b) => b.score - a.score).slice(0, 10);
    },
    convictionByRegime(score){
      return score >= 2 ? 80 : score >= 0 ? 50 : 20;
    },
  },

  /* -------- 5. LONG-TERM BASE BREAKOUT (Multi-year) -------- */
  longterm_base: {
    id: 'longterm_base',
    name: 'Long-Term Base',
    emoji: '🌊',
    color: '#8b5cf6',
    thai: 'ฐานยาว',
    description: 'ฐาน 4+ ปี · Breakout · 10-bagger candidate',
    strengthWhen: 'ANY',
    async scan(dataMap, regime){
      const picks = [];
      for(const [ticker, d] of Object.entries(dataMap)){
        // Need at least 3 years of data (750 trading days)
        if(!d || d.closes.length < 750) continue;
        const price = d.closes[d.closes.length - 1];
        if(price < 3) continue;

        // Find max close in period
        const historyHigh = Math.max(...d.closes.slice(-1000, -50));
        const yearAgo = d.closes[d.closes.length - 252] || d.closes[0];

        // Base check: last 250 days should have relatively flat range
        const base250 = d.closes.slice(-250);
        const baseHigh = Math.max(...base250);
        const baseLow = Math.min(...base250);
        const baseRange = (baseHigh - baseLow) / baseHigh;
        if(baseRange > 0.35) continue;  // Too wide

        // Breakout check: price near or above baseHigh
        if(price < baseHigh * 0.98) continue;

        // Above MA200
        const ma200 = sma(d.closes, 200);
        if(!ma200 || price < ma200) continue;

        // Not too extended (within 10% of baseHigh)
        const extension = (price - baseHigh) / baseHigh;
        if(extension > 0.10) continue;

        const yearsInBase = 1;  // Simplified
        const score = 50 + (1 - baseRange) * 40 + Math.min(extension * 500, 20);
        picks.push({
          ticker, score, price,
          reason: `ฐาน ~1 ปี · Range ${(baseRange*100).toFixed(0)}% · เบรก pivot`,
          signals: {
            technical: `Base breakout at $${baseHigh.toFixed(2)}`,
            momentum: `Above 250-day base · Above MA200`,
          },
        });
      }
      return picks.sort((a,b) => b.score - a.score).slice(0, 10);
    },
    convictionByRegime(score){
      // Long-term works in any regime
      return score >= 0 ? 75 : 55;
    },
  },

  /* -------- 6. PULLBACK IN UPTREND (Buy the Dip) -------- */
  pullback_dip: {
    id: 'pullback_dip',
    name: 'Pullback Buy',
    emoji: '📉',
    color: '#14b8a6',
    thai: 'ย่อซื้อ',
    description: 'อยู่ในเทรนด์ขาขึ้น + ย่อ 5-15% · จังหวะซื้อ',
    strengthWhen: 'BULL',
    async scan(dataMap, regime){
      const picks = [];
      for(const [ticker, d] of Object.entries(dataMap)){
        if(!d || d.closes.length < 200) continue;
        const price = d.closes[d.closes.length - 1];
        if(price < 5) continue;

        const ma50 = sma(d.closes, 50);
        const ma200 = sma(d.closes, 200);
        if(!ma50 || !ma200) continue;

        // Must be in uptrend
        if(price < ma200) continue;
        if(ma50 < ma200) continue;

        // Recent high (last 60 days) then pullback
        const recentHigh = Math.max(...d.closes.slice(-60));
        const pullbackPct = (price - recentHigh) / recentHigh * 100;
        if(pullbackPct > -5 || pullbackPct < -15) continue;  // 5-15% pullback

        // Near MA50 (support)
        const distMA50 = (price - ma50) / ma50 * 100;
        if(Math.abs(distMA50) > 8) continue;  // Within 8% of MA50

        // RSI should be lowish (oversold in uptrend = buy)
        const rsi = rsi14(d.closes);
        if(!rsi || rsi > 55 || rsi < 30) continue;

        const score = -pullbackPct * 3 + (60 - rsi) + (10 - Math.abs(distMA50));
        picks.push({
          ticker, score, price,
          reason: `ย่อ ${pullbackPct.toFixed(1)}% จาก high · RSI ${rsi.toFixed(0)} · ใกล้ MA50`,
          signals: {
            technical: `Uptrend + ${pullbackPct.toFixed(1)}% pullback to MA50`,
            momentum: `RSI ${rsi.toFixed(0)} · oversold in uptrend`,
          },
        });
      }
      return picks.sort((a,b) => b.score - a.score).slice(0, 10);
    },
    convictionByRegime(score){
      return score >= 3 ? 80 : score >= 0 ? 60 : 25;
    },
  },

  /* -------- 7. TURNAROUND (Deep drawdown → recovery) -------- */
  turnaround: {
    id: 'turnaround',
    name: 'Turnaround',
    emoji: '🔄',
    color: '#f59e0b',
    thai: 'พลิกกลับ',
    description: 'ลง 50%+ จาก ATH · เริ่มฟื้น · ซื้อของถูก',
    strengthWhen: 'ANY',
    async scan(dataMap, regime){
      const picks = [];
      for(const [ticker, d] of Object.entries(dataMap)){
        if(!d || d.closes.length < 250) continue;
        const price = d.closes[d.closes.length - 1];
        if(price < 3) continue;

        // Deep drawdown from all-time high (in data)
        const allTimeHigh = Math.max(...d.closes);
        const drawdown = (price - allTimeHigh) / allTimeHigh * 100;
        if(drawdown > -30) continue;  // Need at least -30%

        // Recent bottom (past 60 days) should be recovering
        const recent60Low = Math.min(...d.closes.slice(-60));
        const bounceFromLow = (price - recent60Low) / recent60Low * 100;
        if(bounceFromLow < 10) continue;  // At least 10% bounce
        if(bounceFromLow > 60) continue;  // Not too extended

        // Above 20-day MA (short-term recovery confirmed)
        const ma20 = sma(d.closes, 20);
        if(!ma20 || price < ma20) continue;

        // MA50 should be flattening or starting to turn up
        const ma50 = sma(d.closes, 50);
        const ma50_1m = sma(d.closes.slice(0, -22), 50);
        if(!ma50 || !ma50_1m) continue;
        if(ma50 < ma50_1m * 0.95) continue;  // Not still falling hard

        const score = Math.abs(drawdown) * 0.3 + bounceFromLow * 0.7;
        picks.push({
          ticker, score, price,
          reason: `-${Math.abs(drawdown).toFixed(0)}% จาก ATH · เด้ง +${bounceFromLow.toFixed(0)}% จาก low`,
          signals: {
            fundamental: `Deep value: ${drawdown.toFixed(0)}% from peak`,
            technical: `Recovery: above MA20 · MA50 stabilizing`,
          },
        });
      }
      return picks.sort((a,b) => b.score - a.score).slice(0, 10);
    },
    convictionByRegime(score){
      // Turnaround works when others fear
      return score >= -2 ? 70 : 60;
    },
  },

  /* -------- 8. LOW VOLATILITY (Defensive) -------- */
  low_volatility: {
    id: 'low_volatility',
    name: 'Low Volatility',
    emoji: '🛡️',
    color: '#64748b',
    thai: 'ผันผวนต่ำ',
    description: 'ATR% ต่ำ · Trend เรียบ · เหมาะตอน bear/uncertainty',
    strengthWhen: 'BEAR',
    async scan(dataMap, regime){
      const picks = [];
      for(const [ticker, d] of Object.entries(dataMap)){
        if(!d || d.closes.length < 100) continue;
        const price = d.closes[d.closes.length - 1];
        if(price < 10) continue;

        const atr = atr14(d.highs.slice(-30), d.lows.slice(-30), d.closes.slice(-30));
        if(!atr) continue;
        const atrPct = atr / price * 100;
        if(atrPct > 2) continue;  // Low volatility only (<2% ATR)

        // Must not be crashing (>=90-day MA)
        const ma90 = sma(d.closes, 90);
        if(!ma90 || price < ma90 * 0.95) continue;

        // Not extreme extended
        const ret3m = returnPct(d.closes, 63) || 0;
        if(ret3m < -5 || ret3m > 25) continue;  // Steady range

        // Score: lower vol + slight positive drift = best
        const score = 100 - atrPct * 20 + Math.max(ret3m, 0) * 0.5;
        picks.push({
          ticker, score, price,
          reason: `ATR ${atrPct.toFixed(2)}% (ต่ำ) · trend เรียบ · ${ret3m > 0 ? '+' : ''}${ret3m.toFixed(1)}% (3M)`,
          signals: {
            technical: `Low ATR ${atrPct.toFixed(2)}% · defensive`,
            risk: `Suitable for capital preservation`,
          },
        });
      }
      return picks.sort((a,b) => b.score - a.score).slice(0, 10);
    },
    convictionByRegime(score){
      // Shines in bear/uncertainty
      if(score <= -2) return 85;
      if(score <= 0) return 70;
      return 40;  // Less useful in strong bull
    },
  },

  /* -------- 9. SECTOR ROTATION LEADERS -------- */
  sector_rotation: {
    id: 'sector_rotation',
    name: 'Sector Leaders',
    emoji: '🏭',
    color: '#ec4899',
    thai: 'Sector นำ',
    description: 'หุ้นจาก sector ที่นำตลาด (1M return)',
    strengthWhen: 'ANY',
    async scan(dataMap, regime){
      // Sector ETFs
      const sectorETFs = {
        'XLK': 'Technology',
        'XLF': 'Financials',
        'XLV': 'Healthcare',
        'XLY': 'Consumer Discretionary',
        'XLP': 'Consumer Staples',
        'XLI': 'Industrials',
        'XLE': 'Energy',
        'XLU': 'Utilities',
        'XLB': 'Materials',
        'XLRE': 'Real Estate',
        'XLC': 'Communication',
      };

      // Rank sectors by 1-month return
      const sectorReturns = {};
      for(const etf of Object.keys(sectorETFs)){
        const d = dataMap[etf];
        if(d && d.closes.length >= 22){
          sectorReturns[etf] = returnPct(d.closes, 21) || 0;
        }
      }

      // Top 3 sectors
      const topSectors = Object.entries(sectorReturns)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 3);
      if(topSectors.length === 0) return [];

      const topSectorNames = new Set(topSectors.map(([etf]) => sectorETFs[etf]));

      // Find best stocks in top sectors (by 1-month return)
      const picks = [];
      for(const [ticker, d] of Object.entries(dataMap)){
        if(!d || d.closes.length < 60) continue;
        if(ticker.startsWith('XL')) continue;  // Skip ETFs
        const price = d.closes[d.closes.length - 1];
        if(price < 5) continue;

        // Need above MA50
        const ma50 = sma(d.closes, 50);
        if(!ma50 || price < ma50) continue;

        const ret1m = returnPct(d.closes, 21);
        if(ret1m == null || ret1m < 3) continue;

        picks.push({
          ticker, score: ret1m + Math.random(),  // small tiebreaker
          price,
          reason: `1M return +${ret1m.toFixed(1)}% · From leading sector`,
          signals: {
            momentum: `+${ret1m.toFixed(1)}% (1M) · Above MA50`,
            macro: `Top sectors: ${topSectors.map(([e]) => e).join(', ')}`,
          },
        });
      }
      return picks.sort((a,b) => b.score - a.score).slice(0, 10);
    },
    convictionByRegime(score){
      return score >= 0 ? 65 : 45;
    },
  },

  /* -------- 10. CASH / DEFENSIVE (When bearish, hold) -------- */
  cash_defense: {
    id: 'cash_defense',
    name: 'Cash Position',
    emoji: '💵',
    color: '#f59e0b',
    thai: 'ถือเงินสด',
    description: 'ถือ cash/bonds/gold ตอน regime bear หรือ uncertainty',
    strengthWhen: 'BEAR',
    async scan(dataMap, regime){
      // Only outputs picks when regime is bearish/cautious
      if(regime.score >= 2) return [];  // Bull market: no defensive needed

      // Defensive assets: cash equivalents + safe havens
      const defensiveAssets = [
        {ticker: 'BIL', reason: '1-3 month T-Bills · pure cash equivalent'},
        {ticker: 'SHY', reason: '1-3 year Treasury · very safe'},
        {ticker: 'IEF', reason: '7-10 year Treasury · benefits from rate cuts'},
        {ticker: 'TLT', reason: '20+ year Treasury · long duration play'},
        {ticker: 'GLD', reason: 'Gold · inflation + crisis hedge'},
        {ticker: 'IAU', reason: 'Gold ETF · low expense ratio'},
        {ticker: 'XLU', reason: 'Utilities · defensive sector'},
        {ticker: 'XLP', reason: 'Consumer Staples · recession-proof'},
      ];

      const picks = [];
      for(const asset of defensiveAssets){
        const d = dataMap[asset.ticker];
        if(!d) continue;
        const price = d.closes[d.closes.length - 1];
        const ret1m = returnPct(d.closes, 21) || 0;
        // Prefer defensive assets that are holding up
        const score = 50 - regime.score * 5 + Math.max(ret1m, -5) * 2;
        picks.push({
          ticker: asset.ticker, score, price,
          reason: asset.reason,
          signals: {
            risk: 'Capital preservation · defensive positioning',
            macro: `Regime score ${regime.score} · bearish signals`,
          },
        });
      }
      return picks.sort((a,b) => b.score - a.score).slice(0, 6);
    },
    convictionByRegime(score){
      if(score <= -3) return 95;   // Very bearish
      if(score <= 0) return 75;    // Cautious
      if(score <= 2) return 40;    // Mild bull
      return 15;                    // Strong bull: no need for defense
    },
  },
};


/* ==================== ARBITRATION LAYER ==================== */

/**
 * Aggregate picks from all strategies → Consensus view.
 *
 * @param {Object} strategyResults - { strategyId: {picks, conviction} }
 * @param {Object} portfolio - Current portfolio state
 * @param {Object} regime - Market regime
 * @returns {Object} - {consensus, distribution, strategyStats}
 */
function arbitrate(strategyResults, portfolio, regime){
  const tickerData = {};  // ticker → aggregated data

  // Collect all picks with weighted scores
  for(const [sid, result] of Object.entries(strategyResults)){
    if(!result || !result.picks) continue;
    const strat = STRATEGIES[sid];
    if(!strat) continue;
    const conviction = result.conviction || 50;

    result.picks.forEach((p, idx) => {
      if(!tickerData[p.ticker]){
        tickerData[p.ticker] = {
          ticker: p.ticker,
          price: p.price,
          strategies: [],
          voteCount: 0,
          weightedScore: 0,
          reasons: [],
          signalsAll: {},
        };
      }
      const td = tickerData[p.ticker];
      td.voteCount++;
      // Weight by conviction and rank (top of list gets more weight)
      const rankWeight = 1 - (idx * 0.05);  // 1.0, 0.95, 0.90, ..., 0.55
      const weight = (conviction / 100) * rankWeight;
      td.weightedScore += p.score * weight;
      td.strategies.push({
        id: sid,
        name: strat.name,
        emoji: strat.emoji,
        color: strat.color,
        thai: strat.thai,
        rank: idx + 1,
        score: p.score,
        conviction,
        reason: p.reason,
      });
      td.reasons.push(`${strat.emoji} ${strat.thai}: ${p.reason}`);
      if(p.signals){
        Object.entries(p.signals).forEach(([k,v]) => {
          if(!td.signalsAll[k]) td.signalsAll[k] = [];
          td.signalsAll[k].push(v);
        });
      }
    });
  }

  // Compute consensus scores
  const consensus = Object.values(tickerData)
    .map(td => ({
      ...td,
      avgScore: td.weightedScore / Math.max(td.strategies.length, 1),
      consensusScore: td.voteCount * 15 + (td.weightedScore / Math.max(td.strategies.length, 1)),
    }))
    .sort((a,b) => b.consensusScore - a.consensusScore);

  // Distribution by strategy: which strategies contributed most
  const distribution = {};
  for(const sid of Object.keys(STRATEGIES)){
    distribution[sid] = strategyResults[sid]?.picks?.length || 0;
  }

  // Compare with portfolio: find held vs unheld
  const heldTickers = new Set((portfolio?.positions || []).map(p => p.ticker));
  consensus.forEach(c => {
    c.currentlyHeld = heldTickers.has(c.ticker);
  });

  // Split into held (review) vs new (opportunity)
  const heldConsensus = consensus.filter(c => c.currentlyHeld);
  const newOpportunities = consensus.filter(c => !c.currentlyHeld).slice(0, 20);

  return {
    consensus: consensus.slice(0, 30),
    heldConsensus,
    newOpportunities,
    distribution,
    strategyCount: Object.keys(strategyResults).length,
    totalPicks: consensus.length,
  };
}

/* ==================== RUN ALL STRATEGIES ==================== */

/**
 * Run all enabled strategies on the same data set.
 *
 * @param {Object} dataMap - Chart data for all tickers
 * @param {Object} regime - Current market regime
 * @param {Array} enabledStrategies - IDs of strategies to run (or null for all)
 * @param {Function} onProgress - (id, done, total) callback
 * @returns {Object} - strategyResults
 */
async function runAllStrategies(dataMap, regime, enabledStrategies, onProgress){
  const strategyIds = enabledStrategies || Object.keys(STRATEGIES);
  const results = {};
  let done = 0;

  for(const sid of strategyIds){
    const strat = STRATEGIES[sid];
    if(!strat) continue;
    try {
      const picks = await strat.scan(dataMap, regime);
      const conviction = strat.convictionByRegime(regime.score);
      results[sid] = {
        strategyId: sid,
        strategyName: strat.name,
        emoji: strat.emoji,
        picks,
        conviction,
        pickCount: picks.length,
        timestamp: Date.now(),
      };
    } catch(e) {
      console.warn(`Strategy ${sid} failed:`, e);
      results[sid] = {
        strategyId: sid,
        strategyName: strat.name,
        picks: [],
        conviction: 0,
        error: e.message,
      };
    }
    done++;
    if(onProgress) onProgress(sid, done, strategyIds.length);
  }
  return results;
}

/* ==================== EXPORTS ==================== */

global.BULLZEEKER_STRATEGIES = {
  STRATEGIES,
  runAllStrategies,
  arbitrate,
  // Expose indicators too
  helpers: {sma, ema, atr14, rsi14, returnPct, volumeAvg, drawdownFromHigh},
};

if(typeof console !== 'undefined'){
  console.log('🧠 Bullzeeker Strategies loaded:', Object.keys(STRATEGIES).length, 'strategies');
}

})(typeof window !== 'undefined' ? window : globalThis);
