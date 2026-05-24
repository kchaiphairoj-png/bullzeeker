/**
 * Bullzeeker — Cloudflare Worker CORS Proxy
 *
 * Deploy at: https://workers.cloudflare.com
 *
 * วิธีใช้:
 * 1. ไปที่ https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. ตั้งชื่อ worker เช่น "bullzeeker-proxy"
 * 3. Copy โค้ดทั้งหมดในไฟล์นี้ไปวางใน Worker
 * 4. กด Save and Deploy
 * 5. จะได้ URL เช่น https://bullzeeker-proxy.YOUR-USERNAME.workers.dev
 * 6. เปลี่ยน PROXIES ใน HTML ทุกไฟล์ให้ใช้ URL นี้:
 *
 *    เปลี่ยนจาก:
 *    const PROXIES = [
 *      url => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
 *      ...
 *    ];
 *
 *    เป็น:
 *    const PROXIES = [
 *      url => 'https://bullzeeker-proxy.YOUR-USERNAME.workers.dev/?url=' + encodeURIComponent(url),
 *    ];
 *
 * Free tier: 100,000 requests/วัน (เพียงพอสำหรับผู้ใช้ ~500 คน/วัน)
 */

// อนุญาตเฉพาะ domain ของเราเอง (กันคนอื่นมาใช้ proxy ฟรี)
const ALLOWED_ORIGINS = [
  'https://bullzeeker.com',
  'https://www.bullzeeker.com',
  'https://bullzeeker.vercel.app',  // Vercel preview URL
  // เพิ่ม localhost สำหรับ test ในเครื่อง
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'null', // file:// protocol (เปิด HTML ตรง ๆ)
];

// อนุญาตเฉพาะ Yahoo Finance API
const ALLOWED_HOSTS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
];

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || 'null';
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(origin),
      });
    }

    // Get target URL from ?url= query
    const target = url.searchParams.get('url');
    if (!target) {
      return jsonResponse({ error: 'Missing ?url= parameter' }, 400, origin);
    }

    // Validate target host
    let targetURL;
    try {
      targetURL = new URL(target);
    } catch (e) {
      return jsonResponse({ error: 'Invalid URL' }, 400, origin);
    }

    if (!ALLOWED_HOSTS.includes(targetURL.hostname)) {
      return jsonResponse(
        { error: 'Host not allowed', host: targetURL.hostname },
        403,
        origin
      );
    }

    // Validate origin (optional - comment out if you want public proxy)
    // if (!ALLOWED_ORIGINS.includes(origin)) {
    //   return jsonResponse({ error: 'Origin not allowed' }, 403, origin);
    // }

    // Fetch from Yahoo
    try {
      const response = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Bullzeeker/1.0)',
          'Accept': 'application/json',
        },
        // Cloudflare cache for 60 seconds (reduce Yahoo load)
        cf: { cacheTtl: 60, cacheEverything: true },
      });

      const body = await response.text();

      return new Response(body, {
        status: response.status,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      });
    } catch (e) {
      return jsonResponse({ error: 'Fetch failed', message: e.message }, 502, origin);
    }
  },
};

function corsHeaders(origin) {
  // อนุญาตทุก origin (เพราะเป็น static site กระจาย CDN)
  // ถ้าต้องการเข้มงวด ให้เช็คใน ALLOWED_ORIGINS
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });
}
