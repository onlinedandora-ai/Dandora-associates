# 🚀 Dandora Associates - Full-Stack Platform & Mobile App

**Dandora.online Associate Partner Ecosystem**  
పూర్తి ఫీచర్లతో కూడిన వెబ్ పోర్టల్, ఆండ్రాయిడ్/మొబైల్ యాప్ (Capacitor PWA), రిలేషనల్ డేటాబేస్ (SQLite REST API), మరియు GSAP యానిమేషన్స్ కలిగిన పూర్తి ప్లాట్‌ఫారమ్.

---

## 🌟 ఫీచర్లు (Key Features)

1. **రిలేషనల్ డేటాబేస్ (SQLite Engine)**:
   - Node.js v22 బిల్ట్-ఇన్ SQLite (`node:sqlite`) తో డేటాబేస్ ఫైల్ `./data/dandora.sqlite` లో నిల్వ చేయబడుతుంది.
   - 12 కోర్ టేబుల్స్: `roles`, `admin_users`, `skills`, `users_associate`, `profiles`, `kyc_payout`, `leads`, `lead_history`, `commission_ledger`, `payouts`, `broadcasts`, `training_modules`.
   - ఆటో-సీడింగ్ (హైదరాబాద్ డెమో అసోసియేట్స్ మరియు లీడ్స్‌తో ఆటోమేటిక్‌గా డేటా లోడ్ అవుతుంది).

2. **GSAP యానిమేషన్స్ (Smooth UI & Mobile Motion)**:
   - GreenSock (GSAP 3) ఇంటిగ్రేషన్ (`animations.js`).
   - డైనమిక్ కౌంటర్లు (కమిషన్ మరియు పేఅవుట్ నంబర్స్ స్మూత్ కౌంట్-అప్ యానిమేషన్స్).
   - మొబైల్ స్క్రీన్ల మధ్య స్మూత్ ట్రాన్సిషన్లు మరియు లీడ్ సబ్‌మిట్ చేసినప్పుడు సక్సెస్ యానిమేషన్లు.
   - కార్డులు మరియు బ్యాడ్జ్‌లపై ఇంటరాక్టివ్ 3D టిల్ట్ & గ్లో ఎఫెక్ట్స్.

3. **మొబైల్ యాప్ (Capacitor & PWA)**:
   - `./mobile` ఫోల్డర్‌లో నేటివ్ మొబైల్ యాప్ ఇంటర్‌ఫేస్.
   - క్విక్ లీడ్ లాగింగ్ (ఫోటో అటాచ్‌మెంట్, జియో-లొకేషన్ ట్యాగింగ్, ఆఫ్‌లైన్ సింక్ క్యూ).
   - Capacitor 6 ఆండ్రాయిడ్ బిల్డ్ సపోర్ట్ (`npx cap sync`, `npx cap open android`).
   - సర్వీస్ వర్కర్ (`sw.js`) మరియు ఆఫ్‌లైన్ క్యాచింగ్.

4. **ఎక్స్‌ప్రెస్ బ్యాకెండ్ సర్వర్ (`server.js`)**:
   - పోర్ట్ 8080 పై రన్ అవుతుంది.
   - అన్ని REST API ఎండ్‌పాయింట్స్ (`/api/health`, `/api/leads`, `/api/associates`, `/api/stats`, `/api/auth/login`).
   - డెస్క్‌టాప్ వెబ్ పోర్టల్, అడ్మిన్ కన్సోల్ మరియు మొబైల్ యాప్‌లను నేరుగా సర్వ్ చేస్తుంది.

---

## 🛠️ రన్ చేయడం ఎలా? (Quick Start Commands)

### 1. డెవలప్‌మెంట్ సర్వర్ రన్ చేయండి:
```bash
npm run dev
```
లేదా:
```bash
npm start
```
సర్వర్ ప్రారంభమైన తర్వాత ఈ క్రింది లింక్‌లు బ్రౌజర్‌లో అందుబాటులో ఉంటాయి:
- 🌐 **మార్కెటింగ్ పోర్టల్**: [http://localhost:8080](http://localhost:8080)
- 📱 **మొబైల్ యాప్**: [http://localhost:8080/mobile/](http://localhost:8080/mobile/)
- 💼 **పార్టనర్ పోర్టల్**: [http://localhost:8080/portal.html](http://localhost:8080/portal.html)
- 👑 **అడ్మిన్ కన్సోల్**: [http://localhost:8080/admin.html](http://localhost:8080/admin.html)
- 🗄️ **డేటాబేస్ API హెల్త్ చెక్**: [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

### 2. డేటాబేస్ రీ-సీడ్ (Re-seed Database):
డేటాబేస్‌ను తాజా డెమో డేటాతో మళ్ళీ రీసెట్ చేయాలనుకుంటే:
```bash
npm run db:seed
```

---

### 3. మొబైల్ యాప్ కెపాసిటర్ సింక్ (Capacitor Mobile Sync):
ఆండ్రాయిడ్ యాప్ లేదా APK బిల్డ్ కోసం:
```bash
# ఫ్రంటెండ్ ఫైళ్లను ఆండ్రాయిడ్ ప్రాజెక్ట్‌కి సింక్ చేయండి
npm run cap:sync

# ఆండ్రాయిడ్ స్టూడియోలో ఓపెన్ చేయండి
npm run cap:android
```

---

## 📁 ప్రాజెక్ట్ నిర్మాణం (Directory Structure)

```text
Dandora Associates/
├── .env                  # Environment configurations (PORT, DB path)
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules (node_modules, logs, secrets)
├── package.json          # Dependencies, scripts & metadata
├── server.js             # Express REST API & Web Server
├── animations.js         # GSAP animation timelines & UI effects
├── api.js                # Frontend API client with offline fallback
├── db.js                 # Browser relational store
├── index.html            # Public marketing portal
├── portal.html           # Associate partner dashboard
├── admin.html            # Operations CRM & admin dashboard
├── register.html         # Associate 4-step onboarding flow
├── data/
│   └── dandora.sqlite    # SQLite relational database
├── server/
│   ├── db.js             # Node.js SQLite connector
│   ├── schema.sql        # Database table definitions & indices
│   └── seed.js           # Hyderabad demo data seeder
└── mobile/
    ├── index.html        # Native smartphone app UI
    ├── mobile.css        # Mobile viewport styling
    ├── mobile.js         # Mobile controller with GSAP transitions & API sync
    ├── manifest.json     # PWA manifest
    ├── sw.js             # Offline Service Worker
    └── assets/
        └── icon.svg      # App icon
```
