# 🚀 Deploy ขึ้น Vercel — ทำตามนี้ทีละขั้น

> **สถานะ:** Git repo init + commit แล้ว · พร้อม push
> **เวลา:** ~15-30 นาที (ขั้นตอนแมนนวลทั้งหมด)
> **ค่าใช้จ่าย:** $0 (Free tier)

---

## ✅ Checklist ก่อนเริ่ม

ต้องมี:
- [ ] GitHub account (free) — https://github.com/signup
- [ ] Vercel account (free) — https://vercel.com/signup (ใช้ "Continue with GitHub")
- [ ] โดเมน `bullzeeker.com` (ถ้ามีอยู่แล้ว → จะเชื่อมตอนท้าย)

---

## 🐙 Step 1: สร้าง GitHub repo + push

### 1.1 สร้าง repo ใหม่บน GitHub
1. ไปที่ https://github.com/new
2. **Repository name:** `bullzeeker`
3. ✅ **Public** (จำเป็นสำหรับ Vercel free)
4. ❌ **อย่า** ติ๊ก "Add a README" / .gitignore / license (มีในเครื่องแล้ว)
5. กด **Create repository**

### 1.2 Push code ขึ้น (copy command นี้ — แก้ USERNAME)
GitHub จะแสดงหน้าว่าง พร้อมคำสั่ง — เปิด PowerShell แล้ว run:

```powershell
cd C:\Users\COJ\Desktop\claude-test\trading-us
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/bullzeeker.git
git push -u origin main
```

> ⚠️ ครั้งแรก GitHub จะให้ login ผ่าน browser หรือใส่ Personal Access Token

✅ **เช็ค:** Refresh หน้า GitHub repo → ต้องเห็นไฟล์ทั้งหมด

---

## ▲ Step 2: Deploy บน Vercel

### 2.1 Import project
1. ไปที่ https://vercel.com/new
2. คลิก **"Import Git Repository"**
3. หา `bullzeeker` → คลิก **Import**

### 2.2 Configure (ปล่อยเดิมทั้งหมด)
- **Framework Preset:** Other
- **Root Directory:** `./` ← ปล่อยเดิม
- **Build Command:** (ว่าง)
- **Output Directory:** (ว่าง)
- **Install Command:** (ว่าง)

### 2.3 กด **Deploy**
รอ ~30 วินาที → ✅ **Live!**

URL ชั่วคราว: `https://bullzeeker.vercel.app`

ลองเข้า `https://bullzeeker.vercel.app/pro/` → ใส่รหัส **`bullzeeker2026`** → เช็คทำงานครบ

---

## 🌐 Step 3: เชื่อม bullzeeker.com (ถ้ามีโดเมน)

### 3.1 ใน Vercel
1. เข้า project → **Settings** → **Domains**
2. ใส่ `bullzeeker.com` → **Add**
3. Vercel จะแสดง DNS records ที่ต้องตั้ง

### 3.2 ตั้ง DNS (ที่ registrar เช่น Cloudflare / Namecheap)

**Root domain (`bullzeeker.com`):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**WWW subdomain (`www.bullzeeker.com`):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

> 💡 **ถ้าใช้ Cloudflare:** ปิด orange cloud (proxy) → DNS only (grey)

### 3.3 รอ DNS propagate (5-30 นาที)
- เช็คที่ https://dnschecker.org
- SSL certificate ออกอัตโนมัติเมื่อ DNS พร้อม

---

## ⚙️ Step 4: เปิด GitHub Actions (สำหรับ daily scan)

### 4.1 Enable write permissions
1. ไปที่ repo → **Settings** → **Actions** → **General**
2. ลง่ลงไปที่ **"Workflow permissions"**
3. เลือก ✅ **"Read and write permissions"**
4. กด **Save**

### 4.2 รัน workflow ครั้งแรก (manual test)
1. ไปที่ tab **Actions** ของ repo
2. ซ้ายมือเลือก **"Daily Stock Scan (Bullzeeker Pro)"**
3. ขวามือกด **"Run workflow"** → ใช้ค่า default → **Run**
4. รอ ~5-10 นาที (S&P 500 + fundamentals)
5. ✅ ดู commit ใหม่ที่เพิ่งเด้งใน repo: `scan: daily update 2026-XX-XX`

หลังจากนี้ workflow จะรันเอง **ทุกอังคาร-เสาร์ 04:30 น.** (ไทย)

---

## 🔐 Step 5: เปลี่ยนรหัสก่อนประกาศ

### 5.1 หา hash ของรหัสใหม่
เปิด console ใน browser (F12) ที่หน้าใดก็ได้ของ /pro:
```javascript
await Auth.hash("รหัสใหม่ของคุณ")
// → คัดลอกค่าที่ออกมา เช่น "a3f7..."
```

หรือใน PowerShell:
```powershell
$pw = "รหัสใหม่ของคุณ"
$sha = [System.Security.Cryptography.SHA256]::Create()
$hash = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($pw))
($hash | ForEach-Object { $_.ToString("x2") }) -join ""
```

### 5.2 อัพเดต auth.js + push
แก้ไฟล์ `pro/assets/auth.js` บรรทัด:
```javascript
const PASSWORD_HASH = "<paste hash ใหม่>";
```

แล้ว:
```powershell
git add pro/assets/auth.js
git commit -m "Change Pro Beta password"
git push
```

Vercel จะ auto-redeploy ใน ~30 วินาที

---

## 📣 Step 6: ประกาศ Phase 0 Beta

### Template โพสต์ใน Line / FB

```
🏆 Bullzeeker Pro Beta เปิดทดลองฟรีแล้ว!

📊 Screen หุ้น US daily ด้วยกลยุทธ์ของ 2 master:
   • Mark Minervini Trend Template (8 ข้อ)
   • William O'Neil CAN SLIM
   • S&P 500 ครบ 500 ตัว

⭐ "Master Picks" — หุ้นที่ผ่านทั้ง 2 = highest conviction
🟢 Market Regime indicator (SPY trend)
📱 ใช้บนมือถือได้ install เป็น app

🔥 ฟรี! ทดลองได้ที่: bullzeeker.com/pro
🔐 รหัส: ติดต่อ inbox 

#หุ้นUS #Minervini #CANSLIM #Bullzeeker
```

> ⚠️ **อย่าโพสต์รหัสในที่สาธารณะ** — DM/inbox เท่านั้น
> ทุก 1-2 เดือนเปลี่ยนรหัสใหม่ + อัพเดต Vercel

---

## 🎯 Success metrics — ติดตามอะไรบ้าง

| Metric | เครื่องมือ | เป้า 30 วัน |
|--------|---------|------------|
| Visitors /pro | Vercel Analytics (built-in) | 100+ |
| Login successes | (manual count จาก console.log ถ้าใส่) | 50+ |
| Daily active users | Cloudflare Web Analytics | 10+ |
| Inquiries เรื่อง pay | Inbox/Line | 5+ |

---

## 🆘 Troubleshooting

| ปัญหา | สาเหตุ | วิธีแก้ |
|------|--------|--------|
| `git push` ถาม credentials | ครั้งแรก | ใช้ Personal Access Token แทน password — Settings → Developer settings → PATs |
| Vercel build fail | ผิดที่ vercel.json | ตรวจว่า vercel.json valid JSON |
| `/pro/` 404 | path case | ตรวจว่าใช้ `pro/` ไม่ใช่ `Pro/` |
| GitHub Actions fail "permission denied" | write perms ไม่เปิด | Settings → Actions → Read and write permissions |
| Workflow รันแต่ไม่ commit | data ไม่เปลี่ยน | normal ในวันหยุด US (Sat-Mon) |
| Domain ไม่ขึ้น | DNS ยังไม่ propagate | รอ 30 นาที — 24 ชม. |

---

🎉 **ทำเสร็จ = bullzeeker.com/pro live + auto-scan ทุกวัน!**

ติดขัดตรงไหน inbox มาเลย — จะช่วย step-by-step
