# 🐂 Bullzeeker

> **ตามล่าหุ้นขาขึ้นในตลาด US · เพื่อเทรดเดอร์ไทย**
> เว็บคัดหุ้นอเมริกาสำหรับคนไทยที่ครบเครื่องที่สุด
> เครื่องมือฟรีระดับมืออาชีพ · ออกแบบโดยคนเทรดจริง · 100% ภาษาไทย

[![Made with HTML5](https://img.shields.io/badge/HTML5-Static-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-success.svg)](#)

## ✨ คุณสมบัติ

### 🎯 Daily Screener
คัดกรองหุ้น 200+ ตัวด้วยเงื่อนไขเชิงเทคนิค พร้อม top gainers/losers/most active

### 🚀 Breakout Scanner
ค้นหาหุ้นเบรกแนวต้านหลังสะสมพลัง สไตล์ Mark Minervini · VCP · Stage 2 พร้อมกราฟ annotate

### 💎 Quality Stocks Screener
กรองหุ้นด้วย 9 เงื่อนไข — Price, Mcap, AvgVol, EMA50/200, 1M Return, ATR, ROE, Net Margin, RSI

### 🛠️ เครื่องมือเทรดเดอร์ไทย (8 calculators)
- 📐 Position Size Calculator (เงินบาท)
- 💱 USD ↔ THB Converter
- ⚡ ATR-Based Stop Loss
- 🎯 Risk-Reward Calculator
- 📋 ภาษีหุ้น US Calculator
- 🏦 เปรียบเทียบโบรกเกอร์ไทย
- 📈 Compound Growth Calculator
- 💸 Total Fee Calculator

### 📊 Macro Dashboard
VIX gauge, Sector heatmap, Indices, Fed rate, Yield curve, ปฏิทินเศรษฐกิจในเวลาไทย

### 📚 ศูนย์เรียนรู้
13 บทเรียน · 90+ ศัพท์เทรด · Roadmap 12 เดือน · Cheat Sheets · FAQ

## 🚀 Quick Start

### เปิดในเครื่อง
```bash
# Option 1: เปิดไฟล์ตรง ๆ
double-click index.html

# Option 2: Local server (แนะนำ - หลีกเลี่ยงปัญหา CORS บางตัว)
npx serve .
# หรือ
python -m http.server 8000
```

### Deploy ขึ้นเว็บ
ดู [DEPLOY.md](./DEPLOY.md) สำหรับคู่มือทีละขั้นตอน

## 📁 โครงสร้างไฟล์

```
trading-us/
├── index.html              # 🏠 หน้าหลัก (Hub)
├── screener.html           # 🎯 Daily Screener
├── breakout.html           # 🚀 Breakout Scanner
├── quality.html            # 💎 Quality Stocks (9 criteria)
├── tools.html              # 🛠️ เครื่องมือคำนวณ 8 ตัว
├── macro.html              # 📊 Macro Dashboard
├── learn.html              # 📚 ศูนย์เรียนรู้
├── 404.html                # หน้า 404
├── sitemap.xml             # SEO sitemap
├── robots.txt              # SEO robots
├── vercel.json             # Vercel deployment config
├── cloudflare-worker-proxy.js  # Optional: Custom CORS proxy
├── DEPLOY.md               # คู่มือ Deploy
└── README.md               # ไฟล์นี้
```

## 🧠 อัลกอริทึมที่ใช้

| เครื่องมือ | อ้างอิงจาก |
|----------|---------|
| Breakout Scanner | Mark Minervini's Trend Template, William O'Neil's CAN SLIM, VCP |
| Quality Screener | Combined fundamental + technical (Wilder ATR/RSI) |
| ATR Calculation | J. Welles Wilder's smoothing (TradingView-compatible) |
| RSI Calculation | Wilder's RSI(14) |
| EMA | Standard EMA with SMA seed |

## 🔧 Tech Stack

- **HTML5 + CSS3 + Vanilla JavaScript** (ไม่มี framework!)
- **0 dependencies** — เปิดไฟล์ก็ใช้ได้เลย
- **Yahoo Finance public API** ผ่าน CORS proxies
- **localStorage** สำหรับ cache + watchlist
- **Canvas** สำหรับกราฟ (ไม่ใช้ chart library)
- **Mobile-responsive** ทุกหน้า

## 📊 ข้อจำกัด

- ราคาดีเลย์ ~15 นาที (Yahoo public API)
- ROE/Margins อัพเดทรายไตรมาส
- ETFs ไม่มี fundamental data
- ต้องอินเทอร์เน็ตเสมอ (ไม่มี offline mode)

## ⚠️ Disclaimer

เว็บไซต์นี้จัดทำเพื่อการศึกษาเท่านั้น **ไม่ใช่คำแนะนำการลงทุน** —
การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลก่อนตัดสินใจลงทุน

## 📜 License

MIT License — Free to use, modify, and distribute

## 💬 ติดต่อ & ข้อเสนอแนะ

ถ้าพบ bug หรือมีข้อเสนอแนะ เปิด Issue ใน GitHub repo ได้เลย

---

Made with ❤️ for Thai traders · 🇹🇭
