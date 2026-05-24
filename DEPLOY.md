# 🚀 คู่มือ Deploy Bullzeeker ขึ้นเว็บจริง

## 📋 ภาพรวม

เว็บนี้เป็น **Static Site** (HTML/CSS/JS ล้วน) — Deploy ง่ายและฟรี
- ✅ ไม่ต้องมี server / database
- ✅ ทำงาน 100% ใน browser
- ✅ ใช้ Yahoo Finance public API ผ่าน CORS proxies
- ✅ Mobile-responsive · SEO-ready

---

## 🎯 ขั้นตอนทั้งหมด (สรุปสั้น ๆ)

```
1. เลือกชื่อ Domain        →  ~10 นาที
2. จด Domain               →  ~15 นาที + รออนุมัติ
3. Upload โค้ดไป GitHub    →  ~10 นาที
4. Deploy บน Vercel        →  ~5 นาที (auto!)
5. เชื่อม Domain เข้า Vercel →  ~15 นาที + รอ DNS
─────────────────────────────────
รวม ~1 ชั่วโมง · ค่าใช้จ่าย $10-15/ปี
```

---

## 1️⃣ เลือกชื่อ Domain

### 💡 ไอเดียที่แนะนำ
- `bullzeeker.com` ⭐ (แนะนำ — ตรงกับแบรนด์)
- `bullzeeker.trade` (สั้น แต่ .trade แพงกว่า ~$25-40/ปี)
- `usstockthai.com`
- `thaitrader.us` (ฟัง cool)
- `traderth.com`
- `usinvestor.in.th` (.in.th ต้องเป็นนิติบุคคลไทย)
- `hoonus.com` (หุ้น US แบบฮิป ๆ)
- `stockus.co.th` (ทางการ — ต้องนิติบุคคล)

### 🔍 เช็คชื่อว่าว่างไหม
ไปที่ https://www.namecheap.com → พิมพ์ชื่อในช่อง search

**Tips การตั้งชื่อ:**
- สั้น จำง่าย (< 15 ตัวอักษร)
- พิมพ์ง่าย ไม่ต้องสะกดยาก
- .com ดีสุด · .co ทางเลือกที่ดีเสมอ
- หลีกเลี่ยง dash (-) หรือเลข

### 💰 ราคา Domain
| Extension | ราคา/ปี | หมายเหตุ |
|-----------|---------|----------|
| **.com** | $10-12 | มาตรฐาน · แนะนำ |
| .net | $11-13 | สำรอง .com |
| .co | $25-30 | สั้นและคูล |
| .io | $35-45 | tech feel |
| .trade | $30-40 | สื่อความหมาย |
| .us | $8-10 | ตรงกับ US theme |
| .xyz | $1-2 | ถูกแต่ดู spammy |

---

## 2️⃣ จด Domain — ที่ไหนดี?

### 🥇 Cloudflare Registrar (แนะนำที่สุด)
**URL:** https://dash.cloudflare.com → Domain Registration

**ข้อดี:**
- ✅ ราคา **ต้นทุนสุทธิ** (.com = $9.77/ปี) — ถูกที่สุดในโลก
- ✅ ไม่มี hidden fee, ไม่มี markup
- ✅ ฟรี WHOIS Privacy
- ✅ DNS เร็วที่สุดในโลก
- ⚠️ ต้องสมัคร Cloudflare account ก่อน (ฟรี)
- ⚠️ จ่ายด้วยบัตรเครดิต/PayPal เท่านั้น

### 🥈 Namecheap (ดีสำหรับคนไทย)
**URL:** https://www.namecheap.com

**ข้อดี:**
- ✅ ราคาดี (.com ~$11/ปี ปีแรก, $14-15 ปีต่อไป)
- ✅ UI ดี ใช้ง่าย ภาษาอังกฤษ
- ✅ ฟรี WHOIS Privacy
- ✅ รับบัตรเครดิต, PayPal
- ✅ Support 24/7

### 🥉 Z.com (GMO ไทย)
**URL:** https://www.z.com.th

**ข้อดี:**
- ✅ บริการภาษาไทย
- ✅ จ่ายผ่าน mobile banking ไทย / ทรูมันนี่ / พร้อมเพย์
- ❌ ราคาแพงกว่า (~฿700-900/ปี ปกติ)

### 💳 แนะนำ:
- **มีบัตรเครดิต / PayPal** → **Cloudflare Registrar** (ถูกที่สุด)
- **อยากจ่ายเงินบาทผ่านธนาคารไทย** → **Z.com**
- **บาลานซ์ความง่าย+ราคา** → **Namecheap**

---

## 3️⃣ Upload โค้ดไป GitHub

### Step 1: สร้าง GitHub Account
1. ไปที่ https://github.com → Sign up (ฟรี)
2. ยืนยันอีเมล

### Step 2: สร้าง Repository
1. กด `+` (มุมขวาบน) → `New repository`
2. ตั้งชื่อ: `bullzeeker` (หรืออะไรก็ได้)
3. เลือก **Public** (จำเป็นสำหรับ Vercel free tier)
4. กด **Create repository**

### Step 3: อัพโหลดไฟล์
**วิธีง่ายสุด** — drag & drop:
1. ในหน้า repo ใหม่ กด **"uploading an existing file"**
2. ลากไฟล์ทั้งหมดใน `trading-us/` ไปวาง
3. กด **Commit changes**

**หรือใช้ Git command line** (ถ้าคุ้น):
```bash
cd C:\Users\COJ\Desktop\claude-test\trading-us
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bullzeeker.git
git push -u origin main
```

---

## 4️⃣ Deploy บน Vercel

### Step 1: สร้าง Vercel Account
1. ไปที่ https://vercel.com → **Sign Up**
2. เลือก **"Continue with GitHub"** (เชื่อมกับ GitHub)

### Step 2: Import Project
1. กด **"Add New..."** → **"Project"**
2. เลือก repo `bullzeeker` จากลิสต์
3. กด **"Import"**

### Step 3: Configure (ไม่ต้องแก้อะไร!)
- Framework Preset: **Other** (auto-detect)
- Root Directory: `./` (ปล่อยเดิม)
- Build Command: ปล่อยว่าง
- Output Directory: ปล่อยว่าง

**กด "Deploy"** — รอ ~30 วินาที

### ✅ เสร็จ!
เว็บจะออนไลน์ที่ URL:
```
https://bullzeeker.vercel.app
```
ใช้ได้ทันที! แต่ยังไม่ใช่ domain ที่จดไว้

---

## 5️⃣ เชื่อม Domain เข้า Vercel

### Step 1: Add Domain ใน Vercel
1. เข้า Project ที่ deploy แล้ว
2. ไปที่ **Settings** → **Domains**
3. พิมพ์ domain ที่จด เช่น `bullzeeker.com`
4. กด **Add**

Vercel จะแสดง DNS records ที่ต้องตั้งค่า — เช่น:

**สำหรับ `bullzeeker.com` (root domain):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**สำหรับ `www.bullzeeker.com`:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 2: ไปตั้งค่า DNS ที่ Registrar
**ถ้าจดที่ Cloudflare:**
1. เข้า Cloudflare Dashboard → คลิก domain
2. ไปที่ tab **DNS** → Records
3. เพิ่ม records ตามที่ Vercel บอก
4. **ปิด proxy (orange cloud)** ให้เป็น DNS only (grey)

**ถ้าจดที่ Namecheap:**
1. Login → Domain List → **Manage**
2. ไปที่ tab **Advanced DNS**
3. เพิ่ม A record และ CNAME record ตามค่าจาก Vercel
4. Save

**ถ้าจดที่ Z.com:**
1. Login → My Domain → จัดการ DNS
2. เพิ่ม records ตามที่ Vercel ให้มา

### Step 3: รอ DNS propagate
- ปกติ 5-30 นาที (บางครั้งถึง 24 ชั่วโมง)
- เช็คสถานะ: https://dnschecker.org
- เมื่อพร้อม Vercel จะออก SSL certificate อัตโนมัติ (ฟรี!)

### ✅ พร้อมใช้งาน
```
https://bullzeeker.com  ← Domain จริง 🎉
https://www.bullzeeker.com
```

---

## 🔧 Production Checklist (ก่อน launch จริง)

### ⚠️ เรื่อง CORS Proxy
ปัจจุบันเว็บใช้ public CORS proxies (allorigins.win, corsproxy.io) — **ฟรีแต่ไม่เสถียร 100%**

**สำหรับ MVP launch — ใช้ได้เลย** (เพราะมี 3 proxy fallback)

**ถ้าจะใช้งานจริงจัง / มีผู้ใช้เยอะ** → ตั้ง Cloudflare Worker proxy เอง:
1. ดูไฟล์ `cloudflare-worker-proxy.js` ในโฟลเดอร์
2. Deploy ที่ Cloudflare Workers (ฟรี 100,000 requests/วัน)
3. เปลี่ยน proxy URL ในโค้ดทุกหน้าให้ชี้มาที่ worker ของเรา

### 🔍 SEO
- ✅ มี `robots.txt` แล้ว
- ✅ มี `sitemap.xml` แล้ว
- ✅ Meta description ครบทุกหน้า
- ⏳ ส่ง sitemap ไป Google Search Console: https://search.google.com/search-console
- ⏳ ส่ง sitemap ไป Bing Webmaster: https://www.bing.com/webmasters

### 📊 Analytics (Optional)
เพิ่ม Google Analytics หรือ Cloudflare Web Analytics (ฟรี):
```html
<!-- ใส่ก่อน </head> ในทุกหน้า -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
  data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

### 🛡️ Security Headers (Optional)
สร้างไฟล์ `vercel.json` (มีให้แล้ว) — มี security headers แล้ว

### 📱 Open Graph (สำหรับ share LINE/Facebook)
เพิ่มใน `<head>` ของ index.html:
```html
<meta property="og:title" content="Bullzeeker" />
<meta property="og:description" content="เว็บคัดหุ้นอเมริกาสำหรับคนไทย" />
<meta property="og:image" content="https://YOURDOMAIN.com/og-image.png" />
<meta property="og:url" content="https://YOURDOMAIN.com" />
<meta name="twitter:card" content="summary_large_image" />
```

---

## 💰 ค่าใช้จ่ายรวม

| รายการ | ราคา | หมายเหตุ |
|--------|------|----------|
| Domain .com | $10-12/ปี | จ่ายปีละครั้ง |
| Vercel Hosting | ฟรี | Free tier: 100GB bandwidth/เดือน |
| Cloudflare Worker (optional) | ฟรี | 100k req/วัน |
| GitHub | ฟรี | Public repo |
| SSL Certificate | ฟรี | Vercel ให้อัตโนมัติ |
| **รวมต่อปี** | **~$10-15** | **(~฿350-550)** |

---

## 🚨 Troubleshooting

### "Domain ไม่ propagate"
- รอ 30-60 นาที
- ใช้ https://dnschecker.org เช็ค
- ลอง flush DNS: `ipconfig /flushdns` (Windows)

### "ข้อมูลหุ้นไม่โหลด"
- CORS proxy บางตัวอาจ down — รอสักครู่
- Open DevTools (F12) ดู Console error
- ลองเปลี่ยน proxy ใน code

### "Vercel build failed"
- Static site ไม่ต้อง build — เลือก Framework = "Other"
- ตรวจสอบว่าไม่มี `package.json` ที่ระบุ build command ผิด

### "404 บนบางหน้า"
- ตรวจสอบว่าไฟล์ทั้ง 7 หน้าอยู่ใน root: index.html, screener.html, breakout.html, quality.html, tools.html, macro.html, learn.html
- มีไฟล์ `vercel.json` แล้ว → จัดการ routing ให้

---

## 📞 ติดต่อช่วยเหลือ

ถ้าติดขัดขั้นตอนไหน บอกได้เลยครับ จะช่วย step-by-step!

ขั้นตอนที่คนมักติด:
1. Git push ครั้งแรก
2. ตั้งค่า DNS ที่ registrar
3. รอ SSL propagate

---

🎉 **ขอให้ launch สำเร็จครับ! Bullzeeker พร้อมรับผู้ใช้คนไทยทั่วประเทศ** 🇹🇭
