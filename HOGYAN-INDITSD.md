# 🚀 Board Game Cafe PWA - Indítási Útmutató

## ✅ A PWA szerver jelenleg FUT!

**URL:** http://localhost:5173

## 📋 Összefoglaló

### Backend (Drupal 11)
- **URL:** https://dr11.webgraf.hu/web
- **JSON:API végpont:** https://dr11.webgraf.hu/web/jsonapi/node/tarsasjatek
- **Status:** ✅ Működik (200 OK)
- **Content Type:** `tarsasjatek` (nem `game`!)

### Frontend (React PWA)
- **Dev szerver:** http://localhost:5173
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Status:** ✅ Fut

## 🔧 Parancsok

### PWA szerver indítása
```bash
cd pwa
npm run dev
```

### PWA szerver leállítása
Nyomj `Ctrl+C`-t a terminálban, ahol fut.

### API tesztelés
```bash
node test-api.js
```

## 📱 Használat

1. **Nyisd meg a böngészőt:** http://localhost:5173
2. **Navigálj a Játékok oldalra** (már az alapértelmezett oldal)
3. **Várd meg, amíg betöltődnek a játékok** a Drupal-ból

## 🔗 API Kapcsolat

A PWA közvetlenül kapcsolódik a production Drupal szerverhez:
- Nincs szükség DDEV-re
- Nincs szükség lokális Drupal-ra
- A PWA a `https://dr11.webgraf.hu/web` URL-t használja

## 🎮 Elérhető funkciók

### ✅ Kész
- Játéklista megjelenítés
- Keresés játéknévre
- Responsive design
- Navigáció

### 🔄 Fejlesztés alatt
- Szűrők (kategória, típus, játékosszám)
- Játék részletek modal
- Asztalfoglalás
- Hűségprogram
- Események
- Menü

## 🐛 Hibaelhárítás

### A szerver nem indul
```bash
cd pwa
npm install
npm run dev
```

### CORS hiba
Az API közvetlenül használja a production szervert, ami már be van állítva CORS támogatással.

### A játékok nem töltődnek be
1. Ellenőrizd, hogy fut-e a Drupal: https://dr11.webgraf.hu/web/jatekok2
2. Nyisd meg a böngésző fejlesztői konzolt (F12)
3. Nézd meg a Network tabban az API hívásokat

## 📊 API Példák

### Összes játék lekérése (limit: 50)
```
GET https://dr11.webgraf.hu/web/jsonapi/node/tarsasjatek?page[limit]=50
```

### Egy játék részletei
```
GET https://dr11.webgraf.hu/web/jsonapi/node/tarsasjatek/{uuid}
```

### Játék kategóriák
```
GET https://dr11.webgraf.hu/web/jsonapi/taxonomy_term/jatek_kategoria
```

### Játék típusok
```
GET https://dr11.webgraf.hu/web/jsonapi/taxonomy_term/jatek_tipusok_polcrendszerben
```

## 💡 Következő lépések

1. Nyisd meg http://localhost:5173 a böngészőben
2. Teszteld a játéklista betöltését
3. Próbáld ki a keresést
4. Ha minden működik, folytathatjuk a fejlesztést:
   - Szűrők hozzáadása
   - Képek megjelenítése
   - Játék részletek modal
   - További funkciók

---

**Készítette:** Claude Code
**Dátum:** 2025. október 15.
