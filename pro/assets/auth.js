/**
 * Simple password gate using SHA-256 hash
 *
 * วิธีตั้งรหัสใหม่:
 *   1. เปิด console ของ browser
 *   2. รัน: await Auth.hash("YOUR_NEW_PASSWORD")
 *   3. คัดลอกค่า hash → แทนที่ค่า PASSWORD_HASH ด้านล่าง
 *
 * ⚠️ นี่คือ "security by obscurity" — เหมาะกับเพื่อน/ชุมชน 20-100 คน
 *    ห้ามใช้กับข้อมูล sensitive จริง ๆ
 */
const Auth = (function() {
  // SHA-256 hash ของรหัสเริ่มต้น = "bullzeeker2026"
  // แก้รหัสจริงก่อน deploy
  const PASSWORD_HASH = "8e6167af055fe615426f13ad2bb590ad4b52943d2a9a4f39f265aa129a2072d7";

  const STORAGE_KEY = "bz_auth_token";
  // Auth token หมดอายุใน 7 วัน
  const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  async function hash(text) {
    const buf = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function login(password, remember) {
    const h = await hash(password);
    if (h !== PASSWORD_HASH) return false;

    const token = {
      authenticated_at: Date.now(),
      expires_at: Date.now() + TOKEN_TTL_MS,
    };
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(token));
    return true;
  }

  function isAuthenticated() {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      const token = JSON.parse(raw);
      if (Date.now() > token.expires_at) {
        logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = "./index.html";
    }
  }

  return { hash, login, logout, isAuthenticated, requireAuth };
})();
