# Board Game Cafe PWA

Progressive Web App a Board Game Cafe társasjáték kávézó számára, Drupal 11 backend-del.

## Funkciók

### Megvalósított funkciók
- ✅ **Játéklista** - Összes társasjáték böngészése, keresése, szűrése
- ✅ **Menü** - Kategóriák szerinti navigáció
- ✅ **Bejelentkezés** - Drupal authentikáció integráció
- ✅ **Regisztráció** - Drupal regisztrációs oldalra irányítás
- ✅ **Profil oldal** - Felhasználói adatok megjelenítése
- ✅ **Játéknapló** - Játékesemények rögzítése és megtekintése
  - Játék választás autocomplete-tel
  - Játékosok, pontszámok, győztes rögzítése
  - Helyszín, időtartam, értékelés
  - Jegyzetek
  - Saját és összes bejegyzés szűrése
  - Alapvető statisztikák

### Tervezett funkciók
- 🔲 **Player Finder** - Játékostárs keresés
- 🔲 **Push értesítések** - Játékrendezvények és hírek
- 🔲 **Offline mód** - Működés internet nélkül
- 🔲 **Haladó statisztikák** - Grafikonok, top listák

## Technológiai stack

### Frontend
- **React 18** - UI keretrendszer
- **Vite** - Build tool és dev server
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **PWA** - Progressive Web App funkciók

### Backend
- **Drupal 11** - Headless CMS
- **JSON:API** - RESTful API endpoint-ok
- **Custom Drupal module** - Content type automatikus létrehozás

## Projekt struktúra

```
BGC-PWA/
├── pwa/                          # React PWA alkalmazás
│   ├── src/
│   │   ├── components/           # React komponensek
│   │   ├── context/              # React Context (AuthContext)
│   │   ├── data/                 # Mock adatok és utility függvények
│   │   ├── pages/                # Oldal komponensek
│   │   │   ├── HomePage.jsx
│   │   │   ├── GameListPage.jsx
│   │   │   ├── GameDetailPage.jsx
│   │   │   ├── MenuPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── GameLogPage.jsx
│   │   │   └── GameLogFormPage.jsx
│   │   ├── services/             # API szolgáltatások
│   │   │   ├── authService.js
│   │   │   └── gameLogService.js
│   │   ├── App.jsx               # Fő alkalmazás komponens
│   │   └── main.jsx              # Entry point
│   ├── public/                   # Statikus fájlok
│   ├── package.json
│   └── vite.config.js            # Vite konfiguráció (proxy!)
│
└── drupal-module/                # Drupal custom module
    └── bgc_content_types/        # Content type létrehozó modul
        ├── bgc_content_types.info.yml
        └── bgc_content_types.install
```

## Telepítés és indítás

### Előfeltételek
- Node.js 18+ és npm
- Drupal 11 backend futtatása (https://dr11.webgraf.hu/web)
- Git

### 1. Repository klónozása

```bash
git clone https://github.com/YOUR_USERNAME/BGC-PWA.git
cd BGC-PWA
```

### 2. Függőségek telepítése

```bash
cd pwa
npm install
```

### 3. Drupal modul telepítése

1. Másold a `drupal-module/bgc_content_types` mappát a Drupal `modules/custom/` könyvtárába
2. Telepítsd a modult: `drush en bgc_content_types` vagy admin felületen
3. A modul automatikusan létrehozza a content type-okat

### 4. Drupal permissions beállítása

**Admin → People → Permissions**

**Game Log** content type számára (Authenticated user):
- ✅ Create new content
- ✅ Edit own content
- ✅ Delete own content
- ✅ View revisions

**Tarsasjatek** content type számára (Anonymous + Authenticated user):
- ✅ View published content

### 5. Dev server indítása

```bash
cd pwa
npm run dev
```

Böngésző: `http://localhost:5173`

Mobilon (ugyanazon a hálózaton): `http://YOUR_IP:5173`

## API konfiguráció

A Vite proxy automatikusan átirányítja az API kéréseket a Drupal backend-re:

**vite.config.js:**
```javascript
proxy: {
  '/jsonapi': {
    target: 'https://dr11.webgraf.hu/web',
    changeOrigin: true,
    cookieDomainRewrite: 'localhost',
    cookiePathRewrite: '/',
  },
  '/user': {
    target: 'https://dr11.webgraf.hu/web',
    changeOrigin: true,
    cookieDomainRewrite: 'localhost',
    cookiePathRewrite: '/',
  }
}
```

## Használat

### Bejelentkezés
1. Kattints a **Bejelentkezés** gombra
2. Add meg a Drupal felhasználóneved és jelszavad
3. A session cookie automatikusan tárolódik

### Új felhasználó regisztrálása
1. Kattints a **Regisztráció** gombra
2. Az oldal átirányít a Drupal regisztrációs oldalra
3. Töltsd ki a regisztrációs űrlapot
4. Ezután visszatérhetsz a PWA-ba és bejelentkezhetsz

### Játéknapló bejegyzés létrehozása
1. Jelentkezz be
2. Menj a **Játéknapló** oldalra
3. Kattints a **+** gombra a jobb alsó sarokban
4. Válassz játékot (autocomplete)
5. Add meg a játékosokat, pontszámokat, stb.
6. Kattints **Mentés**

## Fejlesztési jegyzetek

### Authentication flow
- Drupal session cookie + CSRF token
- localStorage használata a session persistálásához
- `credentials: 'include'` minden API kérésnél
- Vite proxy `cookieDomainRewrite` a localhost-ra

### JSON:API használat
- GET kérések: `Accept: application/vnd.api+json`
- POST/PATCH: `Content-Type: application/vnd.api+json` + `X-CSRF-Token`
- `include` paraméter a kapcsolódó entitások lekéréséhez

### Known Issues
- [ ] A játék képek nem jelennek meg a game log listában (JSON:API `included` probléma)
- [ ] Session expiry kezelés tökéletesítése szükséges

## Screenshotek

(TODO: Készíts screenshot-okat és add hozzá!)

## Licensz

MIT

## Készítette

Fejlesztve Claude Code segítségével
