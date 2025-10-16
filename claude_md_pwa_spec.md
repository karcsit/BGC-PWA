# Board Game Cafe - PWA Projekt Specifikáció

## 📋 Projekt Áttekintés

**Cél:** Progresszív Web Alkalmazás (PWA) fejlesztése a Board Game Cafe budapesti társasjátékos kávézó számára, amely integrálja a Drupal 11 backend-et.

**Kávézó adatok:**
- Név: **Board Game Cafe**
- Cím: **Üllői út 46, Budapest 1084**
- Játékok száma: **1500 játék** (már feltöltve a Drupal-ba)
- Weboldal: https://dr11.webgraf.hu/web (production)
- Lokális fejlesztés: https://boardgame-cafe.ddev.site (DDEV)

**Tech Stack:**
- Frontend: React 18 + Vite
- Styling: Tailwind CSS
- Backend: Drupal 11 (REST/JSON:API)
- Fejlesztés: DDEV (Docker)
- AI integráció: Claude API (Anthropic)

## 🎯 Funkcionális Követelmények

### 1. Játékkatalógus
- **1500 társasjáték** böngészése (már feltöltve a Drupal-ba)
- Keresés és szűrés (név, típus, kategória, játékosszám, nehézség)
- Szűrés kategória szerint (jatek_kategoria):
  - akcio--ugyessegi
  - alkudozas
  - allat
  - arab
  - bloff
  - civilizacio
  - egyszeru
  - elektronika
  - epites--terjeszkedes
  - fantasy
  - felfedezo
  - felnott
  - felvilagosodas-kora
  - ... (további kategóriák a Drupal-ban)
- Szűrés típus szerint (17 típus kategória elérhető):
  - Angol nyelvű játékok
  - Gyors játékok
  - Partijátékok
  - Kihívások
  - Játékok 2 játékosnak
  - Családi játékok
  - Összetett családi játékok
  - Társasjátékok tapasztalt játékosoknak
  - Kártyajátékok
  - Kockajátékok
  - Logikai és ügyességi játékok
  - Szó- és betűjátékok
  - Spiel des Jahres
  - Kennerspiel des Jahres
  - Gyerekjátékok
  - Játékok felnőtteknek (18+)
  - Retro játékok
- Játék részletes adatai (név, játékosszám, időtartam, nehézség, leírás, kép)
- Elérhetőség státusz (elérhető / kölcsönben)
- Valós idejű szinkronizáció a Drupal-lal

### 2. Asztalfoglalás
- Dátum, időpont, létszám választása
- Különleges kérések megadása
- Foglalási visszaigazolás
- +10 hűségpont automatikus jóváírás

### 3. Események
- Események listázása (Catan Bajnokság, kezdő estek, turné-k)
- Jelentkezés eseményekre
- Szabad helyek megjelenítése
- Esemény részletek (dátum, idő, helyszín)
- +25 hűségpont részvételért

### 4. Hűségprogram
- Pontgyűjtés rendszer (minden 100 Ft = 1 pont)
- Jutalmak:
  - 100 pont: Ingyenes kávé
  - 250 pont: 500 Ft kedvezmény
  - 500 pont: Ingyenes asztalbérlés
  - 1000 pont: VIP esemény meghívás
- Ponttörténet naplózása
- Progress bar a következő jutalomig
- QR kód beolvasás pontgyűjtéshez

### 5. Menü
- Étel és ital kínálat böngészése
- Kategóriák (Kávék, Ételek, Desszertek)
- Árak megjelenítése
- Allergiainformációk
- Online rendelés (opcionális)

### 6. AI Chat Asszisztens (Claude)
- Játékszabályok magyarázata
- Játékajánló (játékosszám, nehézség, időtartam alapján)
- Interaktív segítség
- Kontextus-érzékeny válaszok

## 🗂️ Drupal Backend Struktúra

### Content Types

#### Game (Társasjáték) - **1500 játék már feltöltve**
```yaml
machine_name: game
fields:
  - title (Text) - Játék neve
  - field_a_jatek_kepe (Image) - Kép
  - field_minimalis_jatekosszam (Integer) - Min játékosszám
  - field_maximalis_jatekosszam (Integer) - Max játékosszám
  - field_elerheto (Boolean) - Elérhető-e
  - field_jatekido_perc (Integer) - Játékidő percben
  - field_polckod (Text) - Polckód (belső használatra)
  - field_kiadas_eve (Integer) - Kiadás éve
  - field_azonosito (Integer) - BoardGameGeek ID
  - field_eredeti_nev (Text) - Eredeti név
  - field_a_jatek_neve (Text) - Alternatív név
  - field_nyelvfuggoseg (Integer) - Nyelvfüggőség (1-5)
  - field_leiras (Text Long) - Leírás
  - field_jatek_kategoria (Term Reference) - Kategória (lásd jatek_kategoria szótár)
  - field_tipus (Term Reference) - Típus (jatek_tipusok_polcrendszerben)
  - field_osszetettseg (Term Reference) - Összetettség/nehézség

# FONTOS: 1500 játék már be van töltve ezekkel a mezőkkel!
```

#### Booking (Foglalás)
```yaml
machine_name: booking
fields:
  - field_user (Entity Reference: User)
  - field_booking_date (Date)
  - field_booking_time (List: Text) - 10:00, 12:00, 14:00...
  - field_guests_count (Integer)
  - field_status (List) - pending, confirmed, cancelled
  - field_special_request (Text Long)
  - field_loyalty_points_earned (Integer)
```

#### Event (Esemény)
```yaml
machine_name: event
fields:
  - title
  - field_event_date (Date)
  - field_event_time (Text)
  - field_max_participants (Integer)
  - field_registrations (Entity Reference: User, multiple)
  - field_loyalty_points_reward (Integer)
  - field_event_image (Image)
  - body (Leírás)
```

#### Loyalty Transaction (Hűségpont tranzakció)
```yaml
machine_name: loyalty_transaction
fields:
  - field_user (Entity Reference: User)
  - field_points (Integer)
  - field_action_type (List) - booking, event, purchase, reward
  - field_description (Text)
  - created (Timestamp)
```

#### Menu Item (Menü elem)
```yaml
machine_name: menu_item
fields:
  - title
  - field_category (Term Reference: menu_category)
  - field_price (Decimal)
  - field_image (Image)
  - field_description (Text)
  - field_allergens (Text)
```

### Taxonomy Vocabularies

#### Játék típus (jatek_tipusok_polcrendszerben)
```yaml
machine_name: jatek_tipusok_polcrendszerben
terms:
  - angol-nyelvu-jatekok
  - gyors-jatekok
  - partijatekok
  - kihivasok
  - jatekok-2-jatekosnak
  - csaladi-jatekok
  - osszetett-csaladi-jatekok
  - tarsasjatekok-tapasztalt-jatekosoknak
  - kartyajatekok
  - kockajatekok
  - logikai-es-ugyessegi-jatekok
  - szo-es-betujatekok
  - spiel-des-jahres
  - kennerspiel-des-jahres
  - gyerekjatekok
  - jatekok-felnotteknek-18-plusz
  - retro-jatekok
```

#### Játék kategória (jatek_kategoria)
```yaml
machine_name: jatek_kategoria
terms:
  - akcio--ugyessegi
  - alkudozas
  - allat
  - arab
  - bloff
  - civilizacio
  - egyszeru
  - elektronika
  - epites--terjeszkedes
  - fantasy
  - felfedezo
  - felnott
  - felvilagosodas-kora
  # ... (további kategóriák)
# FONTOS: Teljes lista elérhető a Drupal taxonomy-ban
```

#### Összetettség (jatek_osszetettseg)
```yaml
machine_name: jatek_osszetettseg
terms: [Könnyű, Közép, Nehéz]
```

#### Menü kategória (menu_category)
```yaml
machine_name: menu_category
terms: [Kávék, Teák, Üdítők, Ételek, Desszertek]
```

### User Fields (bővítés)

```yaml
field_loyalty_points (Integer) - Aktuális hűségpontok
field_total_earned (Integer) - Összesen szerzett pontok
field_loyalty_level (List) - Bronze, Silver, Gold, Platinum
field_phone (Telephone)
field_newsletter (Boolean)
```

## 🔌 API Végpontok

### JSON:API (Drupal core)

```
GET /jsonapi/node/game
GET /jsonapi/node/game/{uuid}
GET /jsonapi/node/event
GET /jsonapi/node/menu_item
GET /jsonapi/taxonomy_term/jatek_kategoria
GET /jsonapi/user/user/{uuid}
```

### Custom REST Endpoints (Drupal modul: bgc_api)

```
POST /api/booking/create
  Body: { booking_date, booking_time, guests_count, special_request }
  Response: { success, booking_id, loyalty_points_earned }

GET /api/loyalty/{user_id}
  Response: { current_points, total_earned, rewards[], next_reward }

POST /api/loyalty/add
  Body: { user_id, points, action_type }
  Response: { success, new_balance, points_added }

POST /api/chat/ask
  Body: { question, game_name? }
  Response: { response, timestamp }
```

## 📱 PWA Projekt Struktúra

```
pwa/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── GameList.jsx
│   │   ├── GameCard.jsx
│   │   ├── GameDetails.jsx
│   │   ├── BookingForm.jsx
│   │   ├── EventList.jsx
│   │   ├── LoyaltyDashboard.jsx
│   │   ├── MenuBrowser.jsx
│   │   └── ChatBot.jsx
│   ├── services/
│   │   ├── drupalApi.js
│   │   ├── claudeApi.js
│   │   └── auth.js
│   ├── hooks/
│   │   ├── useGames.js
│   │   ├── useLoyalty.js
│   │   └── useAuth.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Design System

### Színpaletta

```css
/* Primer színek */
--primary-purple: #9333ea (purple-600)
--primary-indigo: #4f46e5 (indigo-700)

/* Státusz színek */
--success: #16a34a (green-600)
--error: #dc2626 (red-600)
--warning: #eab308 (yellow-500)

/* Neutral színek */
--gray-50: #f9fafb
--gray-800: #1f2937
```

### Komponens Stílusok

- **Border radius:** 0.75rem (rounded-xl) - 1.5rem (rounded-3xl)
- **Shadows:** shadow-md, shadow-lg, shadow-xl
- **Transitions:** transition-shadow, transition-colors
- **Typography:** Tailwind default font stack
- **Spacing:** 4px increment (p-4, p-6, mb-4, mt-6)

## 🔐 Authentikáció

### JWT Token alapú auth

```javascript
// Login
POST /jwt/token
Body: { username, password }
Response: { token, refresh_token, expires }

// Authenticated kérés
Headers: {
  'Authorization': 'Bearer {token}'
}
```

## 📊 Adatáramlás

```
PWA (React)
    ↓ fetch API
JSON:API / REST
    ↓
Drupal 11 Backend
    ↓
MySQL Database
```

## 🔄 Fejlesztési Workflow

### Lokális fejlesztés (DDEV)

```bash
# Drupal indítása
ddev start
# URL: https://boardgame-cafe.ddev.site

# PWA dev szerver
cd pwa
npm run dev
# URL: http://localhost:5173

# Adatbázis
# - 1500 játék már feltöltve
# - Mezők mind kitöltve
# - Típusok hozzárendelve (jatek_tipusok_polcrendszerben)
```

### Production környezet

```
Drupal Backend: https://dr11.webgraf.hu/web
PWA Frontend: https://dr11.webgraf.hu/pwa (később)
```

### Production build

```bash
cd pwa
npm run build

# dist/ mappa feltöltése szerverre
```

## 🧪 Tesztelendő Funkciók

- [ ] Játékok listázása
- [ ] Játék keresés
- [ ] Szűrés kategória szerint
- [ ] Szűrés játékosszám szerint
- [ ] Játék részletek modal
- [ ] Asztalfoglalás form
- [ ] Foglalás visszaigazolás
- [ ] Hűségpontok megjelenítése
- [ ] Pontok gyűjtése foglalásért
- [ ] Jutalmak listája
- [ ] Esemény regisztráció
- [ ] Menü böngészés
- [ ] AI chat (Claude)
- [ ] Offline működés (service worker)
- [ ] PWA telepítés
- [ ] Push értesítések

## 🚀 Következő Fejlesztési Lépések

### Fázis 1: MVP (2-3 hét)
- ✅ Játékkatalógus
- ✅ Keresés és szűrés
- 🔄 Asztalfoglalás
- 🔄 Hűségprogram alapok

### Fázis 2: Core Features (3-4 hét)
- Események modul
- Menü böngészés
- Felhasználói fiók
- QR kód scanner

### Fázis 3: Advanced (4-6 hét)
- AI Chat (Claude API)
- Push értesítések
- Offline mode
- Advanced analytics

### Fázis 4: Polish (2-3 hét)
- Performance optimalizálás
- SEO
- Accessibility
- Testing

## 📝 Kódolási Konvenciók

### React komponensek
- Functional components + Hooks
- Named exports komponensekhez
- PropTypes vagy TypeScript (later)
- Külön fájl komponensenként

### Naming conventions
- Components: PascalCase (GameList.jsx)
- Functions: camelCase (fetchGames)
- Constants: UPPER_SNAKE_CASE
- CSS classes: kebab-case vagy Tailwind utilities

### Error handling
```javascript
try {
  const data = await fetchGames();
  // ...
} catch (error) {
  console.error('Error:', error);
  setError(error.message);
}
```

### API calls
- Minden API hívás külön service fájlban
- Loading states kezelése
- Error states kezelése
- Try-catch minden async függvénynél

## 🐛 Ismert Problémák és Megoldások

### CORS hiba (lokális fejlesztés)

**Problem:** 
```
Access to fetch blocked by CORS policy
```

**Solution:**
```yaml
# web/sites/default/services.yml
parameters:
  cors.config:
    enabled: true
    allowedOrigins:
      - 'http://localhost:5173'
```

### WebAssembly memória hiba (production build)

**Problem:**
```
Out of memory: Cannot allocate Wasm memory
```

**Solution:**
```bash
# Tailwind CDN használata
<script src="https://cdn.tailwindcss.com"></script>

# vagy
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## 🔗 Hasznos Linkek

- Drupal JSON:API: https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Vite: https://vitejs.dev
- DDEV: https://ddev.readthedocs.io
- Claude API: https://docs.anthropic.com

## 📞 Kapcsolat és Információk

**Kávézó neve:** Board Game Cafe  
**Helyszín:** Üllői út 46, Budapest 1084  
**Játékok száma:** 1500 játék (feltöltve)  
**Weboldal (production):** https://dr11.webgraf.hu/web  
**Lokális fejlesztés:** https://boardgame-cafe.ddev.site  
**Nyitvatartás:** Kedd-Vasárnap, 17:00-23:00  
**Belépő:** 1.250 Ft/fő/3 óra (felnőtt), 625 Ft (14 év alatt)

---

## 🎯 Quick Start parancsok Claude Code számára

```bash
# Projekt beállítása (lokális DDEV környezet)
cd ~/Projects/boardgame-cafe
ddev start
cd pwa
npm install
npm run dev

# Drupal URL-ek
# Lokális: https://boardgame-cafe.ddev.site
# Production: https://dr11.webgraf.hu/web

# PWA URL
# http://localhost:5173

# Új komponens létrehozása
# Fájl: src/components/ComponentName.jsx

# API hívás példa (1500 játék elérhető!)
# GET https://boardgame-cafe.ddev.site/jsonapi/node/game?page[limit]=50

# Játék típusok lekérése (17 típus)
# GET https://boardgame-cafe.ddev.site/jsonapi/taxonomy_term/jatek_tipusok_polcrendszerben

# Játék kategóriák lekérése (akcio--ugyessegi, alkudozas, stb.)
# GET https://boardgame-cafe.ddev.site/jsonapi/taxonomy_term/jatek_kategoria

# Tailwind utility használat
# className="bg-purple-600 text-white px-4 py-2 rounded-xl"

# Build production
npm run build
```

---

**Verzió:** 1.0  
**Utolsó frissítés:** 2025. október 10.  
**Készítette:** Claude (Anthropic)