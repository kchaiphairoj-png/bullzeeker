/**
 * Bullzeeker Pro — Main app logic
 * อ่าน JSON จาก ./data/ แล้ว render ทุก section
 */
const App = (function() {

  // Strategy colors + icons
  const STRATEGY_META = {
    near_52w_high: { color: "blue", icon: "📈", label: "Near 52W High" },
    fresh_breakout: { color: "purple", icon: "🚀", label: "Fresh Breakout" },
    minervini_tt: { color: "green", icon: "🎯", label: "Minervini TT" },
    canslim: { color: "orange", icon: "💎", label: "CAN SLIM" },
  };

  function formatNumber(n, opts = {}) {
    if (n == null || isNaN(n)) return "—";
    const { decimals = 1, prefix = "", suffix = "", sign = false } = opts;
    const formatted = Number(n).toFixed(decimals);
    const signStr = sign && n > 0 ? "+" : "";
    return `${prefix}${signStr}${formatted}${suffix}`;
  }

  function rsColor(rs) {
    if (rs >= 90) return "text-green-700 bg-green-100";
    if (rs >= 80) return "text-green-600 bg-green-50";
    if (rs >= 70) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  }

  function renderRegimeBanner(regime) {
    const el = document.getElementById("regime-banner");
    const isUp = regime.uptrend;
    const info = regime.info || {};
    const conditions = info.conditions || {};

    const condList = Object.entries(conditions).map(([k, v]) =>
      `<li class="flex items-center gap-1.5">
         <span>${v ? "✅" : "❌"}</span>
         <span class="text-xs">${k}</span>
       </li>`
    ).join("");

    el.innerHTML = `
      <div class="${isUp ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-2xl p-5">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-2xl">${isUp ? '🟢' : '🔴'}</span>
              <h3 class="text-lg font-bold ${isUp ? 'text-green-900' : 'text-red-900'}">
                Market Regime: ${isUp ? 'UPTREND ✓' : 'DOWNTREND / SIDEWAYS ✗'}
              </h3>
            </div>
            <p class="text-sm ${isUp ? 'text-green-800' : 'text-red-800'}">
              SPY $${formatNumber(info.spy_close, {decimals: 2})} ·
              SMA50 $${formatNumber(info.spy_sma50, {decimals: 2})} ·
              SMA200 $${formatNumber(info.spy_sma200, {decimals: 2})}
            </p>
          </div>
          <ul class="grid grid-cols-1 gap-1 ${isUp ? 'text-green-800' : 'text-red-800'}">${condList}</ul>
        </div>
        ${!isUp ? '<p class="mt-3 text-sm font-semibold text-red-900">⚠️ ตลาด downtrend → CAN SLIM \'M\' ไม่ผ่าน · ระมัดระวังการเข้าเทรดใหม่</p>' : ''}
      </div>`;
  }

  function renderHighConviction(items) {
    const section = document.getElementById("high-conviction-section");
    const list = document.getElementById("high-conviction-list");

    if (!items || items.length === 0) {
      section.classList.add("hidden");
      return;
    }
    section.classList.remove("hidden");

    list.innerHTML = items.map(item => {
      const passedBoth = item.strategies.includes('minervini_tt') && item.strategies.includes('canslim');
      const trophy = passedBoth ? '🏆' : '⭐';
      return `
        <a href="https://finance.yahoo.com/quote/${item.ticker}" target="_blank" rel="noopener"
           class="block bg-white rounded-xl p-4 border-2 border-amber-300 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer no-underline">
          <div class="flex items-baseline justify-between mb-1">
            <span class="font-bold text-gray-900 text-xl">${item.ticker}</span>
            <span class="text-xl">${trophy}</span>
          </div>
          <div class="flex items-center gap-1 text-xs">
            ${item.strategies.map(s => {
              const m = STRATEGY_META[s] || { icon: '•', label: s };
              return `<span class="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-semibold" title="${m.label}">${m.icon} ${m.label.split(' ')[0]}</span>`;
            }).join('')}
          </div>
        </a>`;
    }).join("");
  }

  function renderTickerCard(ticker, metrics, strategyKey) {
    const m = metrics;
    const rsClass = rsColor(m.rs_rating);

    // Build metric badges based on strategy
    let badges = "";
    if (strategyKey === "minervini_tt") {
      badges = `
        <div class="text-xs ${rsClass} px-2 py-1 rounded font-semibold">RS ${m.rs_rating}</div>
        <div class="text-xs text-gray-600 px-2 py-1 rounded bg-gray-100">${m.passed}/8 ✓</div>
        <div class="text-xs text-gray-600 px-2 py-1 rounded bg-gray-100">52WH ${formatNumber(m.pct_from_52wh, {decimals: 1, suffix: '%', sign: true})}</div>
      `;
    } else if (strategyKey === "canslim") {
      const epsq = m.eps_qoq != null ? formatNumber(m.eps_qoq, {decimals: 0, suffix: '%', sign: true}) : '—';
      const epsa = m.eps_annual != null ? formatNumber(m.eps_annual, {decimals: 0, suffix: '%', sign: true}) : '—';
      const rev = m.rev_growth != null ? formatNumber(m.rev_growth, {decimals: 0, suffix: '%', sign: true}) : '—';
      badges = `
        <div class="text-xs ${rsClass} px-2 py-1 rounded font-semibold">RS ${m.rs_rating}</div>
        <div class="text-xs text-gray-600 px-2 py-1 rounded bg-gray-100">${m.passed}/7</div>
        <div class="text-xs text-green-700 px-2 py-1 rounded bg-green-50" title="EPS QoQ">EPS Q ${epsq}</div>
        <div class="text-xs text-green-700 px-2 py-1 rounded bg-green-50" title="EPS Annual">EPS A ${epsa}</div>
        <div class="text-xs text-blue-700 px-2 py-1 rounded bg-blue-50" title="Revenue growth">Rev ${rev}</div>
      `;
    } else if (strategyKey === "fresh_breakout") {
      badges = `
        <div class="text-xs text-purple-700 px-2 py-1 rounded bg-purple-50">Pivot $${formatNumber(m.pivot, {decimals: 2})}</div>
        <div class="text-xs text-gray-600 px-2 py-1 rounded bg-gray-100">+${formatNumber(m.pct_from_pivot, {decimals: 2, suffix: '%'})}</div>
        <div class="text-xs text-gray-600 px-2 py-1 rounded bg-gray-100">Vol ${formatNumber(m.vol_ratio, {decimals: 1, suffix: '×'})}</div>
      `;
    } else { // near_52w_high
      badges = `
        <div class="text-xs text-blue-700 px-2 py-1 rounded bg-blue-50">${formatNumber(m.pct_from_high52, {decimals: 2, suffix: '%', sign: true})} from 52WH</div>
        <div class="text-xs text-gray-600 px-2 py-1 rounded bg-gray-100">+${formatNumber(m.pct_above_sma200, {decimals: 1, suffix: '%'})} vs SMA200</div>
        <div class="text-xs text-gray-600 px-2 py-1 rounded bg-gray-100">Vol ${formatNumber(m.vol_ratio, {decimals: 2, suffix: '×'})}</div>
      `;
    }

    return `
      <div class="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-400 transition-colors">
        <div class="flex items-baseline justify-between mb-2">
          <div class="flex items-baseline gap-2">
            <h4 class="font-bold text-lg text-gray-900">${ticker}</h4>
            <a href="https://finance.yahoo.com/quote/${ticker}" target="_blank" rel="noopener" class="text-xs text-blue-600 hover:underline">Yahoo →</a>
            <a href="https://www.tradingview.com/chart/?symbol=${ticker}" target="_blank" rel="noopener" class="text-xs text-blue-600 hover:underline">TV →</a>
          </div>
          <span class="text-lg font-semibold text-gray-700">$${formatNumber(m.close, {decimals: 2})}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">${badges}</div>
      </div>`;
  }

  function renderStrategy(result) {
    const meta = STRATEGY_META[result.key] || { icon: "•", color: "gray", label: result.label };
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-900",
      purple: "bg-purple-50 border-purple-200 text-purple-900",
      green: "bg-green-50 border-green-200 text-green-900",
      orange: "bg-orange-50 border-orange-200 text-orange-900",
    };
    const headerClass = colors[meta.color] || colors.green;

    const cards = result.buys.length > 0
      ? result.buys.map(b => renderTickerCard(b.ticker, b.metrics, result.key)).join("")
      : `<div class="bg-white rounded-xl p-6 border border-gray-200 text-center text-gray-400">
           ไม่พบหุ้นเข้าเงื่อนไขวันนี้
         </div>`;

    return `
      <section class="strategy-card bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <header class="${headerClass} border-b px-5 py-3">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-xl">${meta.icon}</span>
              <h3 class="font-bold text-lg">${result.label}</h3>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="bg-green-600 text-white px-2 py-1 rounded font-semibold">BUY ${result.counts.buy}</span>
              <span class="bg-yellow-500 text-white px-2 py-1 rounded">HOLD ${result.counts.hold}</span>
              <span class="bg-red-400 text-white px-2 py-1 rounded">SELL ${result.counts.sell}</span>
            </div>
          </div>
          <p class="text-xs mt-1 opacity-80"><em>${result.description}</em></p>
        </header>
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">${cards}</div>
      </section>`;
  }

  async function loadDashboard() {
    const loadingEl = document.getElementById("loading");
    const errorEl = document.getElementById("error");
    const contentEl = document.getElementById("content");

    try {
      // ?_=timestamp กัน cache
      const resp = await fetch(`./data/latest.json?_=${Date.now()}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      // populate metadata
      document.getElementById("scan-date").textContent =
        `Last scan: ${data.date}`;
      document.getElementById("stat-buys").textContent = data.stats.total_buy_signals;
      document.getElementById("stat-hc").textContent = data.high_conviction.length;
      document.getElementById("stat-unique").textContent = data.stats.unique_tickers;
      document.getElementById("stat-universe").textContent =
        `${data.universe.name}\n(${data.universe.size})`;
      document.getElementById("footer-updated").textContent =
        new Date(data.generated_at).toLocaleString("th-TH");

      // sections
      renderRegimeBanner(data.market_regime);
      renderHighConviction(data.high_conviction);

      const strategiesHTML = data.strategies.map(renderStrategy).join("");
      document.getElementById("strategies-container").innerHTML = strategiesHTML;

      loadingEl.classList.add("hidden");
      contentEl.classList.remove("hidden");
    } catch (err) {
      console.error("Failed to load:", err);
      loadingEl.classList.add("hidden");
      errorEl.classList.remove("hidden");
      document.getElementById("error-detail").textContent =
        `${err.message} — ตรวจว่ามีไฟล์ data/latest.json และ scanner รันแล้ว`;
    }
  }

  async function loadHistory() {
    try {
      const idxResp = await fetch(`./data/history/index.json?_=${Date.now()}`);
      if (!idxResp.ok) throw new Error("No history index");
      const idx = await idxResp.json();
      return idx.dates || [];
    } catch (e) {
      return [];
    }
  }

  async function loadHistoryDate(date) {
    const resp = await fetch(`./data/history/${date}.json?_=${Date.now()}`);
    if (!resp.ok) throw new Error(`No data for ${date}`);
    return await resp.json();
  }

  function showTickerDetail(ticker) {
    // Quick action: เปิด Yahoo Finance ใน tab ใหม่
    window.open(`https://finance.yahoo.com/quote/${ticker}`, "_blank");
  }

  return { loadDashboard, loadHistory, loadHistoryDate, showTickerDetail };
})();
