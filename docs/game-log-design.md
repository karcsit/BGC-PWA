# Játéknapló és Játékostárs-kereső Rendszer - Részletes Terv

## 1. Áttekintés

### Fő Funkciók:
1. **Játéknapló (Game Log)** - Játékesemények rögzítése és statisztikák
2. **Játékostárs-kereső (Player Finder)** - Játékostársak keresése és alkalmak hirdetése
3. **Felhasználókezelés** - Drupal alapú autentikáció
4. **Profil és Statisztikák** - Személyes játéktörténet és elemzések

### Üzleti előnyök:
- Növeli a kávézó látogatottságát (közösség építés)
- Segít magányos játékosoknak társakat találni
- Adatokat szolgáltat népszerű játékokról
- Visszatérő vendégek (gamification)

---

## 2. Drupal Backend Struktúra

### 2.1. Content Types

#### A) `game_log` (Játéknapló bejegyzés)
**Mezők:**
- `title` (Text) - Auto-generált: "[Játék neve] - [Dátum]"
- `field_game` (Entity Reference) - Kapcsolat a `tarsasjatek` node-hoz
- `field_date` (Datetime) - Játék dátuma és kezdési időpontja
- `field_duration` (Integer) - Időtartam percben
- `field_player_count` (Integer) - Játékosok száma
- `field_players` (Text, Multiple) - Játékosok nevei/nicknevei
- `field_winner` (Text) - Nyertes neve
- `field_scores` (Text, Long) - JSON formátumú pontszámok: `{"Gábor": 45, "Anna": 38}`
- `field_notes` (Text, Long) - Megjegyzések, élmények
- `field_photos` (Image, Multiple) - Fényképek a játékról
- `field_location` (Text) - "Board Game Cafe" vagy "Otthon"
- `field_rating` (Integer) - Értékelés 1-5 csillag (mennyire tetszett)
- `uid` (User Reference) - Ki rögzítette (auto)
- `created` (Timestamp) - Létrehozás időpontja (auto)

**API Endpoint:** `/jsonapi/node/game_log`

**Jogosultságok:**
- Authenticated users: Create, Read own, Update own, Delete own
- Anonymous: No access

---

#### B) `player_finder` (Játékostárs hirdetés)
**Mezők:**
- `title` (Text) - Auto-generált: "Társakat keresek: [Játék neve]"
- `field_game` (Entity Reference) - Kapcsolat a `tarsasjatek` node-hoz (opcionális)
- `field_game_type` (Entity Reference) - Játék típus taxonomy (ha nincs konkrét játék)
- `field_event_type` (List/Select) - "Konkrét alkalom" vagy "Rendszeres időpont"
- `field_event_date` (Datetime) - Konkrét dátum és időpont (ha konkrét alkalom)
- `field_recurring_schedule` (Text) - "Péntek esténként 18:00" (ha rendszeres)
- `field_current_players` (Integer) - Hányan vannak már
- `field_needed_players` (Integer) - Összesen hányan szeretnének lenni
- `field_location` (Text) - "Board Game Cafe" vagy "Egyéb"
- `field_description` (Text, Long) - Leírás, elvárások
- `field_experience_level` (List) - "Kezdő", "Haladó", "Mindegy"
- `field_contact` (Text) - Kapcsolattartás módja (email, telefon, vagy csak app-on belül)
- `field_status` (List) - "Aktív", "Betelt", "Lejárt"
- `uid` (User Reference) - Hirdető (auto)
- `created` (Timestamp)

**API Endpoint:** `/jsonapi/node/player_finder`

**Jogosultságok:**
- Authenticated users: Create, Read all, Update own, Delete own
- Anonymous: Read all (hogy látogassák a kávézót)

---

#### C) `player_finder_application` (Jelentkezés hirdetésre)
**Mezők:**
- `title` (Text) - Auto-generált
- `field_finder_post` (Entity Reference) - Melyik hirdetésre
- `field_message` (Text) - Üzenet a hirdetőnek
- `field_status` (List) - "Pending", "Accepted", "Rejected"
- `uid` (User Reference) - Ki jelentkezett
- `created` (Timestamp)

**API Endpoint:** `/jsonapi/node/player_finder_application`

---

### 2.2. User Profile Extensions

**Egyéni mezők a user entity-hez:**
- `field_nickname` (Text) - Játékos becenév
- `field_favorite_games` (Entity Reference, Multiple) - Kedvenc játékok
- `field_avatar` (Image) - Profilkép
- `field_bio` (Text, Long) - Rövid bemutatkozás
- `field_experience_level` (List) - "Kezdő", "Közepes", "Haladó"
- `field_available_times` (Text) - Mikor szokott játszani

**API Endpoint:** `/jsonapi/user/user`

---

### 2.3. Views & Filters (Drupal REST API)

#### Nézetek, amiket létre kell hozni:
1. **My Game Logs** - Saját játéknapló bejegyzések
2. **Game Log by Game** - Egy adott játék összes naplóbejegyzése
3. **Active Player Finder Posts** - Aktív játékostárs hirdetések
4. **My Player Finder Posts** - Saját hirdetések
5. **Applications for My Posts** - Saját hirdetéseimre jelentkezők

---

## 3. Frontend Komponensek & Oldalak

### 3.1. Navigáció (Új menüpontok)

```
Főoldal
├── Játékok 🎲 (meglévő)
├── Menü 🍽️ (meglévő)
├── Játéknapló 📖 (új)
│   ├── Új bejegyzés
│   ├── Saját naplók
│   └── Statisztikák
├── Játékostársak 👥 (új)
│   ├── Aktív hirdetések
│   ├── Új hirdetés
│   └── Saját hirdetések
├── Profil 👤 (új)
│   ├── Beállítások
│   ├── Statisztikák
│   └── Kedvencek
└── Bejelentkezés 🔐 (új)
```

---

### 3.2. Komponensek Listája

#### Autentikáció komponensek:
1. **LoginPage.jsx** - Bejelentkezés
2. **RegisterPage.jsx** - Regisztráció
3. **ProfilePage.jsx** - Profil szerkesztése
4. **AuthContext.jsx** - React Context az auth állapothoz

#### Játéknapló komponensek:
5. **GameLogPage.jsx** - Játéknaplók listája
6. **GameLogForm.jsx** - Új napló bejegyzés létrehozása
7. **GameLogDetail.jsx** - Egy bejegyzés részletei
8. **GameLogCard.jsx** - Napló kártya (lista nézethez)
9. **GameLogStats.jsx** - Statisztikák és grafikonok

#### Játékostárs-kereső komponensek:
10. **PlayerFinderPage.jsx** - Hirdetések listája
11. **PlayerFinderForm.jsx** - Új hirdetés létrehozása
12. **PlayerFinderCard.jsx** - Hirdetés kártya
13. **PlayerFinderDetail.jsx** - Hirdetés részletei + jelentkezés
14. **ApplicationList.jsx** - Saját hirdetéseimre jelentkezők

#### Közös komponensek:
15. **GameSelector.jsx** - Játék választó (autocomplete)
16. **UserAvatar.jsx** - Felhasználó avatar
17. **StatCard.jsx** - Statisztika kártya
18. **ProtectedRoute.jsx** - Csak bejelentkezett usereknek

---

### 3.3. Oldal Struktúra Részletesen

#### A) GameLogPage (Játéknaplók)

**URL:** `/game-log`

**Tartalom:**
- Tab navigáció: "Összes" | "Saját" | "Statisztikák"
- Szűrők: játék, dátum, játékosszám
- Lista: GameLogCard komponensek
- FAB gomb: "Új bejegyzés" (lebegő gomb jobb alul)

**GameLogCard tartalma:**
```
┌────────────────────────────────────┐
│ [Játék képe]  Catan                │
│               2025.01.15 18:30     │
│               ⏱ 90 perc            │
│               👥 4 játékos         │
│               🏆 Gábor nyert       │
│               ⭐⭐⭐⭐⭐ 5/5         │
│               "Szoros játék volt!" │
└────────────────────────────────────┘
```

---

#### B) GameLogForm (Új napló bejegyzés)

**URL:** `/game-log/new`

**Form mezők:**
1. **Játék kiválasztása** - Autocomplete (keresés a meglévő játékok között)
2. **Dátum és időpont** - Datetime picker
3. **Időtartam** - Slider vagy number input (15-300 perc)
4. **Játékosok száma** - Number input
5. **Játékosok nevei** - Dynamic list (hozzáadás/törlés gomb)
6. **Nyertes** - Select (a játékosok közül)
7. **Pontszámok** (opcionális) - Dynamic lista: név + pontszám
8. **Helyszín** - Radio: "Board Game Cafe" | "Otthon" | "Egyéb"
9. **Értékelés** - 1-5 csillag
10. **Jegyzet** - Textarea
11. **Fényképek** - File upload (max 3-5 kép)

**UX:**
- Auto-save to LocalStorage (ha offline)
- "Mentés" gomb → POST `/jsonapi/node/game_log`
- Siker után: redirect to GameLogPage

---

#### C) GameLogStats (Statisztikák)

**Megjelenített adatok:**

1. **Összefoglaló kártyák:**
   - Összes játszott játék
   - Összes játékidő (órában)
   - Legtöbbet játszott játék
   - Nyerési arány (ha követik)

2. **Grafikonok:**
   - Havi aktivitás (bar chart)
   - Top 10 játék (pie chart)
   - Játékidő trend (line chart)

3. **Listák:**
   - Legtöbbet játszott társak
   - Leghosszabb játék
   - Leggyorsabb játék

**Library:** Chart.js vagy Recharts

---

#### D) PlayerFinderPage (Játékostárs hirdetések)

**URL:** `/player-finder`

**Tab navigáció:**
- "Aktív hirdetések"
- "Saját hirdetéseim"
- "Jelentkezéseim"

**Szűrők:**
- Játék/játéktípus
- Dátum tartomány
- Helyszín
- Tapasztalati szint

**PlayerFinderCard:**
```
┌────────────────────────────────────┐
│ [Avatar] Gábor keresi:             │
│          Catan - 4 fő              │
│                                     │
│ 📅 2025.01.20 (Péntek) 18:00      │
│ 📍 Board Game Cafe                │
│ 👥 2/4 játékos                     │
│ 🎯 Haladó szint                    │
│                                     │
│ "Keresünk még 2 játékost..."      │
│                                     │
│ [Jelentkezem] gomb                 │
└────────────────────────────────────┘
```

---

#### E) PlayerFinderForm (Új hirdetés)

**Form mezők:**

**1. lépés: Mi legyen a játék?**
- Radio: "Konkrét játék" vagy "Játéktípus"
- Ha konkrét: GameSelector autocomplete
- Ha típus: Dropdown (Partijátékok, Családi, stb.)

**2. lépés: Mikor?**
- Radio: "Egyszeri alkalom" vagy "Rendszeres időpont"
- Ha egyszeri: Datetime picker
- Ha rendszeres: Text input (pl. "Minden péntek 18:00")

**3. lépés: Részletek**
- Hányan vagytok már? (number)
- Hányan szeretnétek lenni összesen? (number)
- Helyszín (radio)
- Tapasztalati szint elvárás (dropdown)
- Leírás (textarea)
- Kapcsolattartás (text - email/telefon opcionális)

**Mentés:** POST `/jsonapi/node/player_finder`

---

#### F) PlayerFinderDetail (Hirdetés részletei)

**URL:** `/player-finder/:id`

**Tartalom:**
- Hirdetés teljes adatai
- Hirdető profilja (nickname, avatar, bio)
- Ha saját hirdetés:
  - "Szerkesztés" gomb
  - Jelentkezők listája (ApplicationList komponens)
  - "Hirdetés lezárása" gomb
- Ha más hirdetése:
  - "Jelentkezem" gomb → Modal:
    - Üzenet textarea
    - "Küldés" → POST `/jsonapi/node/player_finder_application`

---

### 3.4. ProfilePage (Profil)

**URL:** `/profile`

**Tartalom:**
- Profilkép + szerkesztés
- Nickname
- Bio
- Kedvenc játékok (chips, szerkeszthető)
- Személyes statisztikák:
  - Játszott játékok száma
  - Összes játékidő
  - Létrehozott hirdetések
  - Találkozások száma

---

## 4. Drupal Authentication Integration

### 4.1. Auth Flow

**Bejelentkezés:**
1. User ad meg username/password
2. POST `/user/login?_format=json`
   ```json
   {
     "name": "gabor",
     "pass": "password123"
   }
   ```
3. Drupal válasz:
   ```json
   {
     "current_user": { "uid": "5", "name": "gabor" },
     "csrf_token": "abc123...",
     "logout_token": "def456..."
   }
   ```
4. Token tárolása: `localStorage.setItem('auth_token', csrf_token)`
5. Minden API kéréshez header: `X-CSRF-Token: abc123...`

**Regisztráció:**
1. POST `/user/register?_format=json`
   ```json
   {
     "name": [{"value": "gabor"}],
     "mail": [{"value": "gabor@example.com"}],
     "pass": [{"value": "password123"}]
   }
   ```
2. Auto-login vagy "Ellenőrizd az email-t" üzenet

**Session ellenőrzés:**
- GET `/user/login_status?_format=json` → `1` (logged in) vagy `0`

---

### 4.2. AuthContext & AuthService

**authService.js:**
```javascript
const API_BASE = '/web'

export const authService = {
  async login(username, password) {
    const response = await fetch(`${API_BASE}/user/login?_format=json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, pass: password })
    })
    const data = await response.json()
    localStorage.setItem('csrf_token', data.csrf_token)
    localStorage.setItem('logout_token', data.logout_token)
    localStorage.setItem('user', JSON.stringify(data.current_user))
    return data.current_user
  },

  async register(username, email, password) {
    const response = await fetch(`${API_BASE}/user/register?_format=json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: [{ value: username }],
        mail: [{ value: email }],
        pass: [{ value: password }]
      })
    })
    return await response.json()
  },

  async logout() {
    const logoutToken = localStorage.getItem('logout_token')
    await fetch(`${API_BASE}/user/logout?_format=json&token=${logoutToken}`, {
      method: 'POST'
    })
    localStorage.clear()
  },

  async checkLoginStatus() {
    const response = await fetch(`${API_BASE}/user/login_status?_format=json`)
    const status = await response.json()
    return status === 1
  },

  getAuthHeaders() {
    const token = localStorage.getItem('csrf_token')
    return token ? { 'X-CSRF-Token': token } : {}
  },

  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}
```

**AuthContext.jsx:**
```javascript
import React, { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const isLoggedIn = await authService.checkLoginStatus()
      if (isLoggedIn) {
        setUser(authService.getCurrentUser())
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (username, password) => {
    const user = await authService.login(username, password)
    setUser(user)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

---

## 5. PWA Offline Funkciók

### 5.1. Offline Game Log Creation

**Strategy:**
1. User létrehoz game log bejegyzést
2. Ha **offline**: localStorage-be mentés + "pending_sync" flag
3. Ha **online**: azonnal POST Drupal-ba
4. Background sync: amikor online, pending bejegyzések felküldése

**IndexedDB struktúra:**
```javascript
{
  id: 'temp-123',
  type: 'game_log',
  data: { /* game log adatok */ },
  status: 'pending_sync',
  created_at: '2025-01-15T18:00:00Z'
}
```

**Service Worker Background Sync:**
```javascript
// sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-logs') {
    event.waitUntil(syncPendingGameLogs())
  }
})

async function syncPendingGameLogs() {
  // Összes pending bejegyzés feltöltése
}
```

---

### 5.2. Offline Game Catalog

**Cache Strategy:**
- Játékok listája + képek: Cache First
- User adatok: Network First
- API POST/PATCH/DELETE: Network Only

---

### 5.3. Push Notifications

**Use cases:**
1. "Új játékostárs jelentkezett a hirdetésedre!"
2. "Már 3 hete nem játszottál, nézz be a Board Game Cafe-ba!"
3. "Új hirdetés a kedvenc játékoddal: Catan"

**Setup:**
- Drupal Push Notification module
- Web Push API (service worker)

---

## 6. Adatbázis JSON:API Példák

### 6.1. Game Log létrehozása

**POST** `/jsonapi/node/game_log`

**Headers:**
```
Content-Type: application/vnd.api+json
X-CSRF-Token: abc123...
```

**Body:**
```json
{
  "data": {
    "type": "node--game_log",
    "attributes": {
      "title": "Catan - 2025.01.15",
      "field_date": "2025-01-15T18:00:00",
      "field_duration": 90,
      "field_player_count": 4,
      "field_players": ["Gábor", "Anna", "Péter", "Kata"],
      "field_winner": "Gábor",
      "field_scores": "{\"Gábor\": 10, \"Anna\": 8, \"Péter\": 7, \"Kata\": 6}",
      "field_notes": "Nagyon szoros játék volt!",
      "field_location": "Board Game Cafe",
      "field_rating": 5
    },
    "relationships": {
      "field_game": {
        "data": {
          "type": "node--tarsasjatek",
          "id": "abc-123-def-456"
        }
      }
    }
  }
}
```

---

### 6.2. Player Finder hirdetés lekérdezése

**GET** `/jsonapi/node/player_finder?filter[field_status]=Aktív&include=field_game,uid&sort=-created`

**Response:** Összes aktív hirdetés, kapcsolt játékkal és userrel

---

## 7. UI/UX Tervezés

### 7.1. Design rendszer

**Színek (meglévő bővítése):**
- Primary: Purple (#7c3aed) - megtartva
- Success: Green (#10b981) - sikeres akciók
- Warning: Yellow (#f59e0b) - pending státusz
- Danger: Red (#ef4444) - törlés, elutasítás
- Info: Blue (#3b82f6) - információk

**Ikonok:**
- 📖 Játéknapló
- 👥 Játékostárs-kereső
- 🏆 Nyertes
- ⏱ Időtartam
- 📍 Helyszín
- 🎯 Tapasztalati szint

---

### 7.2. Mobile-first Design

**GameLogCard animáció:**
- Swipe right: "Szerkesztés"
- Swipe left: "Törlés"
- Pull to refresh: Lista frissítése

**FAB (Floating Action Button):**
- Jobb alsó sarok
- "+" ikon
- Lebegő animáció
- Kattintásra: új bejegyzés/hirdetés

---

## 8. Fejlesztési Ütemterv

### Fázis 1: Auth & Profil (1-2 hét)
- [ ] Drupal user mezők hozzáadása
- [ ] AuthService & AuthContext
- [ ] LoginPage, RegisterPage komponensek
- [ ] ProfilePage komponens
- [ ] ProtectedRoute komponens

### Fázis 2: Játéknapló (2-3 hét)
- [ ] Drupal `game_log` content type
- [ ] GameLogPage, GameLogForm, GameLogCard
- [ ] GameLogDetail komponens
- [ ] Offline mentés LocalStorage-ba
- [ ] Sync mechanizmus

### Fázis 3: Statisztikák (1 hét)
- [ ] GameLogStats komponens
- [ ] Grafikonok (Chart.js integráció)
- [ ] Aggregált lekérdezések (Drupal Views)

### Fázis 4: Játékostárs-kereső (2-3 hét)
- [ ] Drupal `player_finder` & `player_finder_application`
- [ ] PlayerFinderPage, PlayerFinderForm
- [ ] PlayerFinderCard, PlayerFinderDetail
- [ ] Jelentkezés funkció
- [ ] Értesítések (email vagy push)

### Fázis 5: PWA Fejlesztések (1 hét)
- [ ] Service Worker background sync
- [ ] Push notifications setup
- [ ] Offline-first stratégia finomhangolása

### Fázis 6: Tesztelés & Polish (1 hét)
- [ ] End-to-end tesztelés
- [ ] Mobil UX finomítás
- [ ] Performance optimalizálás
- [ ] Bug fixing

**Összesen: ~8-11 hét**

---

## 9. Kockázatok & Megoldások

### Kockázat 1: Drupal auth komplexitás
**Megoldás:** Először egyszerű username/password, később OAuth/Social login

### Kockázat 2: Offline sync konfliktusok
**Megoldás:** Timestamp based conflict resolution, user eldönti melyiket tartja

### Kockázat 3: Spam hirdetések
**Megoldás:**
- Rate limiting (max 3 hirdetés/user)
- Admin moderáció lehetősége
- Report funkció

### Kockázat 4: GDPR adatvédelem
**Megoldás:**
- Privacy policy
- User törölheti saját adatait
- Opcionális névhasználat (nickname)

---

## 10. Következő lépések

1. **Döntés:** Egyetértesz a tervvel? Van módosítási javaslat?
2. **Drupal konfiguráció:** Hozzáférsz a Drupal admin panelhez? (content type-ok létrehozása)
3. **Kezdés:** Melyik fázissal kezdjük? (Javaslat: Fázis 1 - Auth)

---

## Függelék: API Endpoints Összefoglalás

| Funkció | Method | Endpoint |
|---------|--------|----------|
| Login | POST | `/user/login?_format=json` |
| Register | POST | `/user/register?_format=json` |
| Logout | POST | `/user/logout?_format=json` |
| Get User | GET | `/jsonapi/user/user/{uuid}` |
| Create Game Log | POST | `/jsonapi/node/game_log` |
| Get My Game Logs | GET | `/jsonapi/node/game_log?filter[uid.id]={user_id}` |
| Create Finder Post | POST | `/jsonapi/node/player_finder` |
| Get Active Posts | GET | `/jsonapi/node/player_finder?filter[field_status]=Aktív` |
| Create Application | POST | `/jsonapi/node/player_finder_application` |

---

**Dokumentum verzió:** 1.0
**Létrehozva:** 2025-01-16
**Szerző:** Claude AI
**Project:** Board Game Cafe PWA
