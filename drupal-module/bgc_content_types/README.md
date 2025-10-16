# Board Game Cafe Content Types Module

## Leírás

Ez a Drupal module automatikusan létrehozza a Board Game Cafe PWA-hoz szükséges content type-okat:

1. **Game Log** (`game_log`) - Játéknapló
2. **Player Finder** (`player_finder`) - Játékostárs hirdetések
3. **Player Finder Application** (`player_finder_application`) - Jelentkezések

## Telepítés

### 1. Module feltöltése

Töltsd fel a `bgc_content_types` mappát a Drupal szerverre:

```
/path/to/drupal/web/modules/custom/bgc_content_types/
```

**Fájlstruktúra:**
```
web/modules/custom/bgc_content_types/
├── bgc_content_types.info.yml
├── bgc_content_types.install
└── README.md
```

### 2. Module engedélyezése

**Drush-sal (ajánlott):**
```bash
drush en bgc_content_types -y
```

**Vagy admin felületen:**
1. Menj a: `/admin/modules`
2. Keresd: "Board Game Cafe Content Types"
3. Pipáld be
4. Install

### 3. Automatikus létrehozás

A module telepítésekor **automatikusan létrejön**:

✅ 3 content type (Game Log, Player Finder, Player Finder Application)
✅ Összes mező minden content type-hoz
✅ Field storage és field config
✅ Megfelelő beállítások (required, min/max, default values)

## Létrehozott Content Type-ok

### Game Log (`game_log`)

**Mezők:**
- `field_game` - Játék referencia (required)
- `field_date` - Dátum és időpont (required)
- `field_duration` - Időtartam percben (required, 1-600)
- `field_player_count` - Játékosok száma (required, 1-20)
- `field_players` - Játékosok nevei (unlimited)
- `field_winner` - Nyertes neve
- `field_scores` - Pontszámok JSON formátumban
- `field_notes` - Megjegyzések
- `field_photos` - Fényképek (max 5)
- `field_location` - Helyszín (cafe/home/other)
- `field_rating` - Értékelés (1-5)

### Player Finder (`player_finder`)

**Mezők:**
- `field_game` - Játék (opcionális)
- `field_game_type` - Játék típus taxonomy
- `field_event_type` - Egyszeri / Rendszeres (required)
- `field_event_date` - Dátum (ha egyszeri)
- `field_recurring_schedule` - Időpont szöveg (ha rendszeres)
- `field_current_players` - Jelenlegi létszám (required)
- `field_needed_players` - Céllétszám (required)
- `field_location` - Helyszín (required)
- `field_description` - Leírás
- `field_experience_level` - Tapasztalati szint
- `field_contact` - Kapcsolattartás
- `field_status` - Státusz (active/full/expired, default: active)

### Player Finder Application (`player_finder_application`)

**Mezők:**
- `field_finder_post` - Hirdetés referencia (required)
- `field_message` - Üzenet
- `field_status` - Státusz (pending/accepted/rejected, default: pending)

## JSON:API Endpoint-ok

A module telepítése után azonnal elérhetőek a JSON:API endpoint-ok:

```
GET    /jsonapi/node/game_log
POST   /jsonapi/node/game_log
GET    /jsonapi/node/player_finder
POST   /jsonapi/node/player_finder
GET    /jsonapi/node/player_finder_application
POST   /jsonapi/node/player_finder_application
```

## Jogosultságok beállítása

A module NEM állítja be automatikusan a jogosultságokat! Ezeket kézzel kell:

**Administration → People → Permissions**

### Game Log jogok:
- **Authenticated user:**
  - ✓ Create new Game Log content
  - ✓ Edit own Game Log content
  - ✓ Delete own Game Log content
  - ✓ View published Game Log content

### Player Finder jogok:
- **Authenticated user:**
  - ✓ Create new Player Finder content
  - ✓ Edit own Player Finder content
  - ✓ Delete own Player Finder content
  - ✓ View published Player Finder content
- **Anonymous user:**
  - ✓ View published Player Finder content (hogy láthassák a hirdetéseket)

### Player Finder Application jogok:
- **Authenticated user:**
  - ✓ Create new Player Finder Application content
  - ✓ View own Player Finder Application content
  - ✓ Edit own Player Finder Application content

## Ellenőrzés

### 1. Content type-ok ellenőrzése:

Menj a: **Structure → Content types**

Látnod kell:
- Game Log
- Player Finder
- Player Finder Application

### 2. JSON:API teszt:

```bash
# Game Log lista
curl "https://dr11.webgraf.hu/web/jsonapi/node/game_log"

# Player Finder lista
curl "https://dr11.webgraf.hu/web/jsonapi/node/player_finder"
```

### 3. Teszt content létrehozása:

Menj a: **Content → Add content → Game Log**

Töltsd ki az űrlapot, és mentsd el.

## Eltávolítás

Ha törölni szeretnéd a module-t:

```bash
drush pmu bgc_content_types -y
```

**Figyelem:** Az eltávolítás **NEM törli** a content type-okat automatikusan. Ha törölni szeretnéd:

1. Structure → Content types
2. Töröld egyesével: Game Log, Player Finder, Player Finder Application

## Hibakeresés

**Hiba:** "The module bgc_content_types does not exist."
- Ellenőrizd a fájl elérési utat: `/modules/custom/bgc_content_types/`
- Cache rebuild: `drush cr`

**Hiba:** Field már létezik
- A module ellenőrzi, hogy a field létezik-e már, tehát biztonságos többször is futtatni

**Hiba:** Taxonomy vocabulary nem létezik
- Ellenőrizd, hogy létezik-e a `jatek_tipusok_polcrendszerben` vocabulary
- Ha nem, akkor hozd létre, vagy módosítsd a module-t

## Támogatás

Ha probléma van:
1. Nézd meg a Drupal log-okat: `/admin/reports/dblog`
2. Ellenőrizd a file permissions-öket
3. Cache rebuild: `drush cr`

---

**Verzió:** 1.0
**Drupal:** 10.x, 11.x
**Projekt:** Board Game Cafe PWA
