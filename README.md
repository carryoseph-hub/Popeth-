# Stockline — Electronics & Appliances Inventory

ይህ የ`inventory-system` artifact ኮድ ወደ ትክክለኛ፣ ራሱን ችሎ ማንኛውም ቦታ ላይ ማስቀመጥ (deploy) ወደሚቻል React ፕሮጀክት ተቀይሯል። ውሂብ የሚቀመጠው በ **Firebase Firestore** (ነጻ Spark plan) ነው — ሁሉም ተጠቃሚዎች አንድ አይነት ውሂብ ያያሉ፣ እንደ artifact-ው ሁኔታ።

---

## 1. Firebase ማዘጋጀት (አንድ ጊዜ ብቻ)

1. https://console.firebase.google.com ይሂዱ → **Add project** → ስም ይስጡ (ለምሳሌ `stockline`) → free **Spark plan** ይምረጡ።
2. ፕሮጀክቱ ውስጥ ግራ በኩል **Build → Firestore Database** → **Create database** → «Start in production mode» ይምረጡ (ከታች rule ትጨምራላችሁ) → ለናንተ ቅርብ የሆነ region ይምረጡ።
3. **Project settings (⚙️) → General → Your apps** → **`</>`  (Web)** የሚለውን ተጫኑ → ስም ስጡ → «Register app».
4. የሚታየውን `firebaseConfig` እሴቶች ቅዱ (apiKey, authDomain, projectId, ወዘተ) — እነዚህ ከታች ደረጃ 3 ላይ ያስፈልጋሉ።
5. **Firestore → Rules** ገፅ ላይ ይሂዱ እና ይሄንን ይለጥፉ (ይሄ ማንኛውም ሰው የ`stockline_data` collection ብቻ እንዲያነብ/እንዲጽፍ ይፈቅዳል)፦

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stockline_data/{document} {
      allow read, write: if true;
    }
  }
}
```

> ማስታወሻ፦ ይሄ rule ክፍት ነው (ማንም ማየት/መቀየር ይችላል) — ልክ እንደ artifact-ው «shared» ውሂብ ማለት ነው። ወደፊት login ጨምረው መገደብ ከፈለጉ ንገሩኝ፣ Firebase Authentication እንጨምራለን።

---

## 2. በኮምፒውተርዎ ላይ ማስኬድ

```bash
npm install
cp .env.example .env
# .env ን ይክፈቱ እና ደረጃ 1.4 ላይ የቀዱትን የFirebase config እሴቶች ይሙሉ
npm run dev
```

ከዚያ የሚታየውን link (ብዙ ጊዜ `http://localhost:5173`) በ browser ይክፈቱ።

---

## 3. ማስቀመጥ (Deploy) — ነጻ እና አስተማማኝ ሆስት

**Cloudflare Pages** ይመከራል (ያልተገደበ bandwidth፣ ፈጣን)፣ ግን Netlify ወይም Vercel እንዲሁ ይሰራሉ።

### ደረጃዎች (Cloudflare Pages)
1. ይህን ፕሮጀክት ወደ GitHub repository ይግፉት (push)።
2. https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → repository-ውን ይምረጡ።
3. Build settings፦
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Environment variables** ላይ ደረጃ 1.4 ላይ የቀዱትን 6ቱን `VITE_FIREBASE_...` እሴቶች አንድ በአንድ ይጨምሩ (ተመሳሳይ ስም፣ ተመሳሳይ እሴት)።
5. **Save and Deploy** ይጫኑ — ከጥቂት ደቂቃዎች በኋላ የ `https://your-project.pages.dev` ሊንክ ያገኛሉ።

Netlify ወይም Vercel ከመረጡ ደረጃው ተመሳሳይ ነው፦ Build command `npm run build`፣ output folder `dist`፣ እና እነዛኑ environment variables መጨመር ብቻ ነው የሚለያየው።

---

## ፋይሎች ማብራሪያ

- `src/App.jsx` — ሙሉ የመተግበሪያው ኮድ (Dashboard, Items, Stock, Purchases, Sales, Reports, Users/Permissions)
- `src/storage.js` — Firestore ላይ ውሂብ የሚያነብ/የሚጽፍ ትንሽ helper (የ artifact-ውን `window.storage` API ተክቷል)
- `.env.example` — የ Firebase config እሴቶች የሚቀመጡበት template

## ችግር ካጋጠመ

- **"Missing or insufficient permissions" grror** → የ Firestore Rules በትክክል አለመቀመጡ ነው፣ ደረጃ 1.5ን ይመልከቱ።
- **ውሂብ አይቀመጥም/አይታይም** → `.env` ውስጥ ያሉት እሴቶች ትክክለኛ መሆናቸውን ያረጋግጡ፣ dev server ን እንደገና ያስጀምሩ (`npm run dev`)።
