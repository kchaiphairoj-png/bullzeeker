# 🎯 Bullzeeker Pro — Members Web App

> Daily US stock scanner สำหรับสมาชิก · Login → ดูผล scan รายวัน · PWA (install as app)
> **แยกจากระบบ email alerts ของ [stock-scanner/](../stock-scanner)** — ใช้ scanner เดียวกัน output คนละแบบ

---

## 📁 โครงสร้าง

```
scanner-app/
├── index.html              ← Login page (password gate)
├── dashboard.html          ← Main view ของวัน
├── history.html            ← ดู scan ย้อนหลัง
├── manifest.json           ← PWA config
├── sw.js                   ← Service worker (offline cache)
├── assets/
│   ├── auth.js             ← SHA-256 password check
│   └── app.js              ← Dashboard logic
├── data/                   ← Scanner output (อัพโดย GitHub Actions)
│   ├── latest.json         ← สแกนล่าสุด
│   └── history/
│       ├── 2026-06-07.json
│       └── index.json      ← list of dates
└── .github/workflows/
    └── daily-scan.yml      ← cron 04:30 น. ทุกวัน
```

---

## 🚀 Quick Start (Local)

### 1. รัน scanner ครั้งแรกเพื่อมีข้อมูล
```powershell
cd ..\stock-scanner
python scan_json.py --universe nasdaq100 --strategies all
# → จะสร้าง ..\scanner-app\data\latest.json + history\
```

### 2. เปิด local server
```powershell
cd scanner-app
python -m http.server 8000
# เปิดเบราว์เซอร์ → http://localhost:8000
```

### 3. Login ครั้งแรก
รหัสเริ่มต้น = **`bullzeeker2026`**
(เปลี่ยนรหัสก่อน deploy — ดู section ถัดไป)

---

## 🔐 เปลี่ยนรหัสสมาชิก

ไฟล์ที่แก้ = [`assets/auth.js`](assets/auth.js)

### วิธีหา hash ของรหัสใหม่

**ทางง่าย — Browser console:**
```javascript
// เปิด console (F12) ในหน้าใดก็ได้ของ app
await Auth.hash("รหัสใหม่ของคุณ");
// → "a1b2c3..."  คัดลอกค่านี้
```

**ทางที่ 2 — PowerShell:**
```powershell
$pw = "รหัสใหม่ของคุณ"
$sha = [System.Security.Cryptography.SHA256]::Create()
$hash = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($pw))
($hash | ForEach-Object { $_.ToString("x2") }) -join ""
```

### แทนที่ใน auth.js
```javascript
const PASSWORD_HASH = "<paste hash ใหม่ตรงนี้>";
```

⚠️ **ใช้รหัสที่เดายาก** (เพราะนี่คือ "security by obscurity")
แนะนำเปลี่ยนทุกเดือนเพื่อจำกัด leak

---

## 🌐 Deploy ขึ้น GitHub Pages (ฟรี)

### Step 1: Push code ขึ้น GitHub repo
```powershell
cd C:\Users\COJ\Desktop\claude-test
git init
git add scanner-app stock-scanner
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: เปิด GitHub Pages
1. Repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / folder: `/scanner-app`
4. Save → รอ ~1 นาที
5. URL จะเป็น: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### Step 3: เปิด GitHub Actions
1. Repo → **Settings** → **Actions** → **General**
2. **Workflow permissions** → ✅ **Read and write permissions** (สำคัญ! ถ้าไม่ติ๊ก commit จะ fail)
3. Save

### Step 4: รัน workflow ครั้งแรก
- Repo → **Actions** tab
- เลือก **Daily Stock Scan** → **Run workflow** → Run
- รอ ~3-5 นาที → JSON ใหม่จะ commit ขึ้น repo อัตโนมัติ

จากนั้นจะรันเองทุกวัน 04:30 (ไทย) ตามที่ตั้ง cron ใน [`.github/workflows/daily-scan.yml`](.github/workflows/daily-scan.yml)

---

## 🌍 Custom Domain (ตัวเลือก)

ถ้ามี domain อยู่แล้ว เช่น `scanner.yourdomain.com`:

1. ใน DNS provider (Cloudflare) สร้าง **CNAME** record:
   ```
   scanner   →   YOUR_USERNAME.github.io
   ```
2. ใน GitHub Pages settings → **Custom domain** ใส่ `scanner.yourdomain.com`
3. ✅ ติ๊ก **Enforce HTTPS** หลัง DNS propagate

---

## 📱 Install เป็น App บนมือถือ (PWA)

### iOS (Safari)
1. เปิด URL ใน Safari
2. แตะปุ่ม Share (สี่เหลี่ยมมีลูกศรขึ้น)
3. **Add to Home Screen** → ตั้งชื่อ → Add
4. ✅ icon ขึ้นที่หน้าจอเหมือน app

### Android (Chrome)
1. เปิด URL ใน Chrome
2. แตะเมนู 3 จุด → **Install app** หรือ **Add to home screen**
3. ✅ icon ขึ้นใน app drawer

### Desktop (Chrome/Edge)
1. ดูที่ address bar ขวาสุด → ไอคอน install (⊕)
2. คลิก → Install
3. ✅ ใช้เหมือนโปรแกรมแยก

---

## 🛠️ Troubleshooting

| ปัญหา | สาเหตุ | วิธีแก้ |
|------|--------|--------|
| "❌ ไม่สามารถโหลดข้อมูล" | data/latest.json ไม่มี | รัน `python scan_json.py` ก่อน หรือรอ GitHub Actions รันเสร็จ |
| Workflow fails: `Permission denied` | Actions permissions ไม่เปิด | Settings → Actions → "Read and write permissions" |
| Login ใส่รหัสถูกแล้วยัง login ไม่ได้ | sessionStorage ตัน | clear cache, hard refresh (Ctrl+Shift+R) |
| PWA install ไม่ขึ้น | ใช้ HTTP (ไม่ใช่ HTTPS) | PWA ต้องการ HTTPS ใช้งานจริงเสมอ |
| Service worker เก่าค้าง | cache | dev tools → Application → Service Workers → Unregister |
| iOS Add to Home ไม่เห็น | ไม่ใช่ Safari | iOS อนุญาตเฉพาะ Safari install PWA |
| Cron ไม่รันตามเวลา | GitHub Actions delay | cron ใน GH Actions เลื่อนได้ 5-15 นาที (normal) |

---

## 📊 รัน scan แบบ manual

ถ้าอยาก scan เพิ่มเติมระหว่างวัน:

```powershell
cd stock-scanner

# Scan Nasdaq 100 (เร็ว ~30 วินาที)
python scan_json.py --universe nasdaq100 --strategies all

# Scan ทั้ง S&P 500 (~2 นาที)
python scan_json.py --universe sp500 --strategies all

# Scan เฉพาะ strategies ที่ต้องการ
python scan_json.py --universe nasdaq100 --strategies minervini_tt,canslim
```

JSON จะอัพไป `scanner-app/data/` อัตโนมัติ → refresh เบราว์เซอร์ → เห็นผลใหม่

---

## 🔒 Security Notes

**ความปลอดภัยระดับ "for friends" (Level 1):**
- ✅ Password hash (SHA-256) — ไม่เห็นรหัสตรงๆ ใน source
- ✅ Auth token expire 7 วัน — บังคับ login ใหม่
- ✅ ทุกหน้า require auth ผ่าน `Auth.requireAuth()`
- ❌ **ไม่ใช่ secure จริง** — คนที่เก่งดูได้
- ❌ ไม่มีระบบ "ใครเข้าตอนไหน" (no audit log)
- ❌ Password hash อยู่ใน JS (อ่านได้ในทุก browser)

**ถ้าต้องการ secure จริง → ขยับขึ้น Level 2 (backend + JWT)**

---

## 🆙 ทิศต่อไป (เมื่อพร้อม)

### Level 2 upgrade — มี backend
- FastAPI backend + SQLite database
- แต่ละ user มี account แยก (email + password)
- Audit log: ใครเข้ามาตอนไหน
- Personal watchlist + alerts
- Hosting: Railway / Render ~$5/เดือน

### Level 3 — Full SaaS
- Stripe / PromptPay subscription
- Free trial → paid plan
- Admin dashboard
- License commercial data API (Polygon/IEX)

อยากต่อยอด — บอกได้ครับ ผมช่วยขยายเป็น Level 2/3 ได้

---

## ⚠️ Disclaimer

ข้อมูลนี้สำหรับการศึกษาเท่านั้น **ไม่ใช่คำแนะนำการลงทุน**
ผลตอบแทนในอดีตไม่ใช่หลักประกันผลตอบแทนในอนาคต
ผู้ใช้งานต้องตัดสินใจลงทุนด้วยดุลพินิจของตนเอง
ใช้ stop loss เสมอ จำกัด risk per trade ≤ 2% ของเงินทุน
