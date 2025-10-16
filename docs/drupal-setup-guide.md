# Drupal Backend Beállítási Útmutató
## Board Game Cafe - Játéknapló & Játékostárs-kereső

---

## 1. Content Type: `game_log` (Játéknapló)

### Létrehozás:
1. **Structure → Content types → Add content type**
2. **Name:** Game Log
3. **Machine name:** `game_log`
4. **Description:** Játékesemények rögzítése
5. **Save**

### Mezők hozzáadása:

#### A) `field_game` - Játék referencia
- **Field type:** Reference → Content
- **Label:** Játék
- **Machine name:** `field_game`
- **Reference type:** Content
- **Content type:** Társasjáték (`tarsasjatek`)
- **Required:** Yes
- **Number of values:** 1

#### B) `field_date` - Dátum
- **Field type:** Date
- **Label:** Dátum és időpont
- **Machine name:** `field_date`
- **Date type:** Date and time
- **Required:** Yes

#### C) `field_duration` - Időtartam
- **Field type:** Number (integer)
- **Label:** Időtartam (perc)
- **Machine name:** `field_duration`
- **Min:** 1
- **Max:** 600
- **Required:** Yes

#### D) `field_player_count` - Játékosszám
- **Field type:** Number (integer)
- **Label:** Játékosok száma
- **Machine name:** `field_player_count`
- **Min:** 1
- **Max:** 20
- **Required:** Yes

#### E) `field_players` - Játékosok nevei
- **Field type:** Text (plain)
- **Label:** Játékosok
- **Machine name:** `field_players`
- **Number of values:** Unlimited
- **Required:** No

#### F) `field_winner` - Nyertes
- **Field type:** Text (plain)
- **Label:** Nyertes neve
- **Machine name:** `field_winner`
- **Required:** No

#### G) `field_scores` - Pontszámok
- **Field type:** Text (plain, long)
- **Label:** Pontszámok (JSON)
- **Machine name:** `field_scores`
- **Required:** No
- **Help text:** JSON formátum: {"Név": 45, "Másik": 38}

#### H) `field_notes` - Jegyzet
- **Field type:** Text (plain, long)
- **Label:** Megjegyzések
- **Machine name:** `field_notes`
- **Required:** No

#### I) `field_photos` - Fényképek
- **Field type:** Image
- **Label:** Fényképek
- **Machine name:** `field_photos`
- **Number of values:** 5
- **Required:** No

#### J) `field_location` - Helyszín
- **Field type:** List (text)
- **Label:** Helyszín
- **Machine name:** `field_location`
- **Allowed values:**
  - `cafe|Board Game Cafe`
  - `home|Otthon`
  - `other|Egyéb`
- **Required:** No

#### K) `field_rating` - Értékelés
- **Field type:** Number (integer)
- **Label:** Értékelés (1-5 csillag)
- **Machine name:** `field_rating`
- **Min:** 1
- **Max:** 5
- **Required:** No

### Jogosultságok beállítása:
- **Permissions → Game Log**
  - **Authenticated user:**
    - ✓ Create new Game Log content
    - ✓ Edit own Game Log content
    - ✓ Delete own Game Log content
    - ✓ View published Game Log content

### JSON:API engedélyezése:
- **Configuration → Web services → JSON:API**
- Ellenőrizd, hogy a `game_log` content type elérhető

---

## 2. Content Type: `player_finder` (Játékostárs hirdetés)

### Létrehozás:
1. **Structure → Content types → Add content type**
2. **Name:** Player Finder
3. **Machine name:** `player_finder`
4. **Description:** Játékostárs keresési hirdetések
5. **Save**

### Mezők hozzáadása:

#### A) `field_game` - Játék (opcionális)
- **Field type:** Reference → Content
- **Label:** Játék (opcionális)
- **Machine name:** `field_game`
- **Reference type:** Content
- **Content type:** Társasjáték
- **Required:** No
- **Help text:** Konkrét játék, amivel játszanál

#### B) `field_game_type` - Játék típus (opcionális)
- **Field type:** Reference → Taxonomy term
- **Label:** Játék típus
- **Machine name:** `field_game_type`
- **Vocabulary:** `jatek_tipusok_polcrendszerben`
- **Required:** No
- **Help text:** Ha nincs konkrét játék

#### C) `field_event_type` - Esemény típusa
- **Field type:** List (text)
- **Label:** Esemény típusa
- **Machine name:** `field_event_type`
- **Allowed values:**
  - `once|Egyszeri alkalom`
  - `recurring|Rendszeres időpont`
- **Required:** Yes

#### D) `field_event_date` - Dátum (ha egyszeri)
- **Field type:** Date
- **Label:** Dátum és időpont
- **Machine name:** `field_event_date`
- **Required:** No
- **Depends on:** field_event_type = "once"

#### E) `field_recurring_schedule` - Rendszeres időpont
- **Field type:** Text (plain)
- **Label:** Rendszeres időpont
- **Machine name:** `field_recurring_schedule`
- **Required:** No
- **Help text:** Pl. "Péntek esténként 18:00"

#### F) `field_current_players` - Jelenlegi létszám
- **Field type:** Number (integer)
- **Label:** Hányan vagytok már?
- **Machine name:** `field_current_players`
- **Min:** 1
- **Required:** Yes

#### G) `field_needed_players` - Céllétszám
- **Field type:** Number (integer)
- **Label:** Hányan szeretnétek lenni?
- **Machine name:** `field_needed_players`
- **Min:** 2
- **Required:** Yes

#### H) `field_location` - Helyszín
- **Field type:** List (text)
- **Label:** Helyszín
- **Machine name:** `field_location`
- **Allowed values:**
  - `cafe|Board Game Cafe`
  - `other|Egyéb`
- **Required:** Yes

#### I) `field_description` - Leírás
- **Field type:** Text (plain, long)
- **Label:** Leírás
- **Machine name:** `field_description`
- **Required:** No

#### J) `field_experience_level` - Tapasztalati szint
- **Field type:** List (text)
- **Label:** Elvárás
- **Machine name:** `field_experience_level`
- **Allowed values:**
  - `beginner|Kezdő`
  - `intermediate|Haladó`
  - `any|Mindegy`
- **Required:** No

#### K) `field_contact` - Kapcsolattartás
- **Field type:** Text (plain)
- **Label:** Kapcsolat (opcionális)
- **Machine name:** `field_contact`
- **Required:** No
- **Help text:** Email vagy telefon (opcionális, csak ha app-on kívül is)

#### L) `field_status` - Státusz
- **Field type:** List (text)
- **Label:** Státusz
- **Machine name:** `field_status`
- **Allowed values:**
  - `active|Aktív`
  - `full|Betelt`
  - `expired|Lejárt`
- **Default value:** active
- **Required:** Yes

### Jogosultságok:
- **Authenticated user:**
  - ✓ Create Player Finder
  - ✓ Edit own
  - ✓ Delete own
  - ✓ View all (published)
- **Anonymous user:**
  - ✓ View published (hogy láthassák a hirdetéseket)

---

## 3. Content Type: `player_finder_application` (Jelentkezés)

### Létrehozás:
1. **Structure → Content types → Add content type**
2. **Name:** Player Finder Application
3. **Machine name:** `player_finder_application`
4. **Description:** Jelentkezések játékostárs hirdetésekre
5. **Save**

### Mezők:

#### A) `field_finder_post` - Hirdetés
- **Field type:** Reference → Content
- **Label:** Hirdetés
- **Machine name:** `field_finder_post`
- **Content type:** Player Finder
- **Required:** Yes

#### B) `field_message` - Üzenet
- **Field type:** Text (plain, long)
- **Label:** Üzenet a hirdetőnek
- **Machine name:** `field_message`
- **Required:** No

#### C) `field_status` - Státusz
- **Field type:** List (text)
- **Label:** Státusz
- **Machine name:** `field_status`
- **Allowed values:**
  - `pending|Függőben`
  - `accepted|Elfogadva`
  - `rejected|Elutasítva`
- **Default:** pending
- **Required:** Yes

### Jogosultságok:
- **Authenticated:**
  - ✓ Create
  - ✓ View own
  - ✓ Edit own (csak pending státusznál)

---

## 4. User mezők (opcionális, később)

### Structure → Account settings → Manage fields

#### A) `field_nickname` - Becenév
- **Field type:** Text (plain)
- **Label:** Játékos becenév
- **Machine name:** `field_nickname`

#### B) `field_avatar` - Avatar
- **Field type:** Image
- **Label:** Profilkép

#### C) `field_bio` - Bio
- **Field type:** Text (plain, long)
- **Label:** Bemutatkozás

#### D) `field_favorite_games` - Kedvenc játékok
- **Field type:** Reference → Content
- **Label:** Kedvenc játékok
- **Content type:** Társasjáték
- **Number of values:** Unlimited

#### E) `field_experience_level` - Tapasztalat
- **Field type:** List (text)
- **Allowed values:**
  - `beginner|Kezdő`
  - `intermediate|Közepes`
  - `advanced|Haladó`

---

## 5. Views létrehozása (később, frontendhez)

Később szükség lesz ezekre a View-kra:

1. **My Game Logs** - `/jsonapi/node/game_log?filter[uid.id]={user_id}`
2. **Game Logs by Game** - Filter by field_game
3. **Active Player Finder** - Filter by field_status=active
4. **My Applications** - Filter by uid

De ezeket egyelőre nem kell, a frontend JSON:API-val közvetlenül tudja lekérdezni.

---

## 6. Ellenőrzés

### JSON:API endpoint-ok tesztelése:

**Game Log létrehozása:**
```bash
curl -X POST "https://dr11.webgraf.hu/web/jsonapi/node/game_log" \
  -H "Content-Type: application/vnd.api+json" \
  -H "X-CSRF-Token: YOUR_TOKEN" \
  -d '{
    "data": {
      "type": "node--game_log",
      "attributes": {
        "title": "Teszt játék - 2025.01.16"
      }
    }
  }'
```

**Player Finder lista:**
```bash
curl "https://dr11.webgraf.hu/web/jsonapi/node/player_finder?filter[field_status]=active"
```

---

## Következő lépések

Ha ezek a content type-ok készen vannak:
1. Frontend komponensek implementálása (GameLogForm, PlayerFinderPage)
2. JSON:API integráció
3. Offline mentés (PWA)
4. Statisztikák

---

**Dokumentum:** Drupal Setup Guide
**Verzió:** 1.0
**Projekt:** Board Game Cafe PWA
