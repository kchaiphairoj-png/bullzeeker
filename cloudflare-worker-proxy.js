/**
 * 🐂 Bullzeeker — Cloudflare Worker Proxy v3
 *
 * High-performance proxy with:
 * - Edge caching (per-endpoint TTL)
 * - Batch endpoint: ?urls=URL1|URL2|... fetches up to 25 URLs in parallel at the edge
 *   → one round-trip instead of N, plus parallel upstream fan-out
 * - Allowlisted hosts: Yahoo Finance, FMP (key injected from env), Stooq (free history fallback)
 * - FMP API key injected from env.FMP_KEY secret (never exposed to frontend)
 * - Strong browser cache (public, immutable within TTL) + X-Bullzeeker-Cache HIT/MISS
 * - CORS * for easy consumption
 *
 * Deploy: Workers & Pages → create → paste → deploy. Set FMP_KEY secret in Variables.
 * Free tier: 100,000 requests/day (batch counts as 1 request to Worker).
 */

// === Configuration ===
const ALLOWED_HOSTS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'financialmodelingprep.com',    // FMP — key injected
  'stooq.com',                    // Free CSV history fallback
];

// Cache TTL (seconds)
const CACHE_TTL = {
  quote: 60,            // 1 min for live quotes
  chart: 300,           // 5 min for chart history
  quoteSummary: 3600,   // 1h for fundamentals
  fmp: 43200,           // 12h for FMP (save 250/day quota)
  stooq: 600,           // 10 min for stooq CSV
  default: 60,
};

const BATCH_MAX = 25;   // max URLs per batch call
const FETCH_TIMEOUT_MS = 8000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // === CORS preflight ===
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // === Health check (only when no ?url=/?urls= params) ===
    if ((url.pathname === '/' || url.pathname === '/health') &&
        !url.searchParams.has('url') && !url.searchParams.has('urls')) {
      return jsonResponse({
        service: 'Bullzeeker Proxy',
        version: 'v3',
        status: 'OK',
        usage: {
          single: '?url=<encoded-target-url>',
          batch:  '?urls=<URL1>|<URL2>|...  (up to ' + BATCH_MAX + ' urls, | separated, each URL-encoded)',
        },
        example_yahoo: '?url=https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=5d&interval=1d',
        example_batch: '?urls=' + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=1d&interval=5m') + '|' + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/MSFT?range=1d&interval=5m'),
        example_fmp:   '?url=https://financialmodelingprep.com/stable/profile?symbol=AAPL',
        example_stooq: '?url=https://stooq.com/q/d/l/?s=aapl.us&i=d',
        fmp_key_configured: Boolean(env.FMP_KEY),
        allowed_hosts: ALLOWED_HOSTS,
        cache_ttl_seconds: CACHE_TTL,
      }, 200);
    }

    // === BATCH mode ===
    if (url.searchParams.has('urls')) {
      return handleBatch(url.searchParams.get('urls'), request, env, ctx);
    }

    // === Single mode ===
    const target = url.searchParams.get('url');
    if (!target) {
      return jsonResponse({ error: 'Missing ?url= or ?urls= parameter' }, 400);
    }

    return handleSingle(target, request, env, ctx);
  },
};

// ===== Single-URL handler =====
async function handleSingle(target, request, env, ctx) {
  let targetURL;
  try {
    targetURL = new URL(target);
  } catch (e) {
    return jsonResponse({ error: 'Invalid URL', target }, 400);
  }

  if (!ALLOWED_HOSTS.includes(targetURL.hostname)) {
    return jsonResponse({
      error: 'Host not allowed',
      host: targetURL.hostname,
      allowed: ALLOWED_HOSTS,
    }, 403);
  }

  // Inject FMP API key
  const isFmp = targetURL.hostname === 'financialmodelingprep.com';
  if (isFmp) {
    if (!env.FMP_KEY) {
      return jsonResponse({ error: 'FMP_KEY not configured' }, 500);
    }
    targetURL.searchParams.set('apikey', env.FMP_KEY);
  }

  const ttl = ttlFor(targetURL);

  // Check Cloudflare edge cache
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    const h = new Headers(cached.headers);
    h.set('X-Bullzeeker-Cache', 'HIT');
    h.set('Access-Control-Allow-Origin', '*');
    return new Response(cached.body, { status: cached.status, headers: h });
  }

  // Fetch upstream
  try {
    const upstream = await fetchWithTimeout(targetURL.toString(), ttl);
    const body = await upstream.text();
    const contentType = isStooq(targetURL)
      ? 'text/csv'
      : (upstream.headers.get('Content-Type') || 'application/json');
    const resp = new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${ttl}`,
        'X-Bullzeeker-Cache': 'MISS',
        'X-Bullzeeker-TTL': String(ttl),
      },
    });
    if (upstream.ok) {
      ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    }
    return resp;
  } catch (e) {
    return jsonResponse({ error: 'Fetch failed', message: e.message, target }, 502);
  }
}

// ===== Batch handler =====
async function handleBatch(urlsParam, request, env, ctx) {
  const parts = urlsParam.split('|').map(s => s.trim()).filter(Boolean);
  if (!parts.length) return jsonResponse({ error: 'Empty urls list' }, 400);
  if (parts.length > BATCH_MAX) {
    return jsonResponse({ error: 'Too many urls', max: BATCH_MAX, got: parts.length }, 400);
  }

  const results = await Promise.all(parts.map(async (p) => {
    let targetURL;
    try {
      targetURL = new URL(p);
    } catch (e) {
      return { url: p, status: 400, error: 'Invalid URL' };
    }
    if (!ALLOWED_HOSTS.includes(targetURL.hostname)) {
      return { url: p, status: 403, error: 'Host not allowed' };
    }
    const isFmp = targetURL.hostname === 'financialmodelingprep.com';
    if (isFmp) {
      if (!env.FMP_KEY) return { url: p, status: 500, error: 'FMP_KEY not configured' };
      targetURL.searchParams.set('apikey', env.FMP_KEY);
    }
    const ttl = ttlFor(targetURL);

    // Per-URL edge cache lookup (shared with single-mode cache keys)
    const cache = caches.default;
    const cacheKey = new Request('https://cache.bullzeeker/' + encodeURIComponent(targetURL.toString()));
    const cachedResp = await cache.match(cacheKey);
    if (cachedResp) {
      const body = await cachedResp.text();
      return { url: p, status: cachedResp.status, cache: 'HIT', body: safeJson(body) };
    }

    try {
      const upstream = await fetchWithTimeout(targetURL.toString(), ttl);
      const body = await upstream.text();
      if (upstream.ok) {
        const toCache = new Response(body, {
          status: upstream.status,
          headers: { 'Cache-Control': `public, max-age=${ttl}` },
        });
        ctx.waitUntil(cache.put(cacheKey, toCache));
      }
      return { url: p, status: upstream.status, cache: 'MISS', body: safeJson(body) };
    } catch (e) {
      return { url: p, status: 502, error: e.message };
    }
  }));

  return new Response(JSON.stringify({ count: results.length, results }), {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store', // batch wrapper is request-specific
      'X-Bullzeeker-Cache': 'BATCH',
    },
  });
}

// ===== Helpers =====

function ttlFor(targetURL) {
  if (targetURL.hostname === 'financialmodelingprep.com') return CACHE_TTL.fmp;
  if (targetURL.hostname === 'stooq.com') return CACHE_TTL.stooq;
  const p = targetURL.pathname;
  if (p.includes('/quote')) return CACHE_TTL.quote;
  if (p.includes('/chart')) return CACHE_TTL.chart;
  if (p.includes('/quoteSummary')) return CACHE_TTL.quoteSummary;
  return CACHE_TTL.default;
}

function isStooq(u) {
  return u.hostname === 'stooq.com';
}

async function fetchWithTimeout(url, ttl) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/csv, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cf: { cacheTtl: ttl, cacheEverything: true },
    });
  } finally {
    clearTimeout(t);
  }
}

function safeJson(text) {
  // Pass raw text through; client parses. For CSV this keeps the string.
  // Try to parse JSON so the batch result is compact and typed; fall back to string.
  if (!text) return null;
  const first = text.trimStart()[0];
  if (first === '{' || first === '[') {
    try { return JSON.parse(text); } catch { /* fall through */ }
  }
  return text;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    'Access-Control-Max-Age': '86400',
    'X-Bullzeeker-Proxy': 'v3',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
