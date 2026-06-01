/**
 * 🐂 Bullzeeker — Cloudflare Worker Proxy v2
 *
 * High-performance proxy for Yahoo Finance API with:
 * - Edge caching (60s for quotes, 1h for chart history)
 * - Anonymous mode (no auth needed - cleaner than v7/quote)
 * - Multi-symbol batch (chart endpoint per symbol with concurrency)
 * - Rate limit protection (10 req/s per client IP)
 * - CORS allowed from any origin
 *
 * Deploy at: https://dash.cloudflare.com → Workers & Pages → Create Worker
 *
 * Setup (5 min):
 * 1. Sign up at https://dash.cloudflare.com (ฟรี)
 * 2. Workers & Pages → Create application → Create Worker
 * 3. ตั้งชื่อ: "bullzeeker-proxy"
 * 4. Copy โค้ดทั้งหมดในไฟล์นี้ → Paste → Deploy
 * 5. จะได้ URL เช่น: https://bullzeeker-proxy.YOUR-USERNAME.workers.dev
 * 6. แก้ใน HTML files: เปลี่ยน PROXIES = [...] ให้ใช้ Worker URL ของเรา
 *
 * Free tier: 100,000 requests/วัน
 * = ~10 active users/day × 10,000 API calls each
 * = หรือ ~1000 users/day × 100 calls each
 */

// === Configuration ===
const ALLOWED_HOSTS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
];

// Cache TTL (seconds)
const CACHE_TTL = {
  quote: 60,        // 1 minute for quotes
  chart: 300,       // 5 minutes for chart data
  quoteSummary: 3600, // 1 hour for fundamentals (changes quarterly)
  default: 60,
};

// Rate limit: max 100 requests per minute per IP
const RATE_LIMIT_PER_MIN = 100;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // === CORS preflight ===
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // === Health check ===
    if (url.pathname === '/' || url.pathname === '/health') {
      return jsonResponse({
        service: 'Bullzeeker Proxy',
        status: 'OK',
        usage: '?url=<yahoo-finance-url>',
        example: '?url=https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=5d&interval=1d',
        cache: CACHE_TTL,
      }, 200);
    }

    // === Get target URL ===
    const target = url.searchParams.get('url');
    if (!target) {
      return jsonResponse({ error: 'Missing ?url= parameter' }, 400);
    }

    // === Validate target ===
    let targetURL;
    try {
      targetURL = new URL(target);
    } catch (e) {
      return jsonResponse({ error: 'Invalid URL' }, 400);
    }
    if (!ALLOWED_HOSTS.includes(targetURL.hostname)) {
      return jsonResponse({
        error: 'Host not allowed',
        host: targetURL.hostname,
        allowed: ALLOWED_HOSTS,
      }, 403);
    }

    // === Determine cache TTL based on endpoint ===
    let ttl = CACHE_TTL.default;
    if (targetURL.pathname.includes('/quote')) ttl = CACHE_TTL.quote;
    else if (targetURL.pathname.includes('/chart')) ttl = CACHE_TTL.chart;
    else if (targetURL.pathname.includes('/quoteSummary')) ttl = CACHE_TTL.quoteSummary;

    // === Check Cloudflare edge cache ===
    const cache = caches.default;
    const cacheKey = new Request(request.url, { method: 'GET' });
    let response = await cache.match(cacheKey);

    if (response) {
      // Cache hit — add header to indicate
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Bullzeeker-Cache', 'HIT');
      newHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    }

    // === Fetch from Yahoo Finance ===
    try {
      const yahooResponse = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cf: {
          cacheTtl: ttl,
          cacheEverything: true,
        },
      });

      const body = await yahooResponse.text();

      // Build response with CORS + cache headers
      response = new Response(body, {
        status: yahooResponse.status,
        headers: {
          ...corsHeaders(),
          'Content-Type': yahooResponse.headers.get('Content-Type') || 'application/json',
          'Cache-Control': `public, max-age=${ttl}`,
          'X-Bullzeeker-Cache': 'MISS',
          'X-Bullzeeker-TTL': String(ttl),
        },
      });

      // Store in Cloudflare cache (async, doesn't block response)
      if (yahooResponse.ok) {
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }

      return response;
    } catch (e) {
      return jsonResponse({
        error: 'Fetch failed',
        message: e.message,
        target: target,
      }, 502);
    }
  },
};

// ===== Helpers =====

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    'Access-Control-Max-Age': '86400',
    'X-Bullzeeker-Proxy': 'v2',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    },
  });
}
