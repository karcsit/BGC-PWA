# 403 Forbidden Hiba Javítása - Player Finder

## Probléma

Amikor új játékostárs hirdetést próbálsz létrehozni, a következő hibát kapod:

```
POST https://jatsszokosan.hu/jsonapi/node/player_finder 403 (Forbidden)
```

Ez azt jelenti, hogy a **bejelentkezett felhasználónak nincs jogosultsága** Player Finder content létrehozására a Drupal backend oldalán.

## Megoldás

### 1. lépés: Ellenőrizd, hogy a `player_finder` content type létezik-e

1. Jelentkezz be a Drupal admin felületre: `https://jatsszokosan.hu/user/login`
2. Menj ide: **Structure → Content types** (`/admin/structure/types`)
3. Keresd meg a **"Player Finder"** content type-ot

**Ha NINCS ilyen content type:**
- Létre kell hozni! Vagy importálni kell egy config-ból

**Ha VAN ilyen content type:**
- Folytasd a 2. lépéssel

### 2. lépés: Add meg a jogosultságot

**Opció A: Permissions oldalon**

1. Menj ide: **People → Permissions** (`/admin/people/permissions`)
2. Használd a böngésző keresőjét (Ctrl+F vagy Cmd+F)
3. Keresd meg: "player_finder" vagy "Player Finder"
4. Találd meg ezt a sort: **"Create new Player Finder content"**
5. Pipáld be az **"Authenticated user"** oszlopban
6. Görgess le és kattints a **"Save permissions"** gombra

**Opció B: Content type specifikus permissions**

1. Menj ide: **Structure → Content types** (`/admin/structure/types`)
2. Kattints a **"Player Finder"** sorban a **"Permissions"** gombra
3. Pipáld be: **"Authenticated user: Create new content"**
4. Mentsd el

### 3. lépés: Cache ürítés

Miután beállítottad a jogosultságokat:

```bash
drush cr
```

Vagy admin felületen:
**Configuration → Development → Performance → Clear all caches**

### 4. lépés: Tesztelés

1. Menj vissza a PWA-ba: `https://jatsszokosan.hu`
2. Jelentkezz be (ha még nem vagy bejelentkezve)
3. Próbálj meg létrehozni egy új játékostárs hirdetést

## Milyen jogosultságok kellenek?

Minimum szükséges jogosultságok az **Authenticated user** szerepkörhöz:

- ✅ **Player Finder: Create new content** - Új hirdetés létrehozása
- ✅ **Player Finder: Edit own content** - Saját hirdetés szerkesztése
- ✅ **Player Finder: Delete own content** - Saját hirdetés törlése (opcionális)
- ✅ **Player Finder Application: Create new content** - Jelentkezés hirdetésre

## Hibaelhárítás

### Még mindig 403-at kapok

1. **Ellenőrizd, hogy be vagy-e jelentkezve:**
   - Nézd meg a console-ban: "✅ CSRF token refreshed"
   - Ha ez megjelenik, akkor a bejelentkezés működik

2. **Ellenőrizd a permissions cache-t:**
   ```bash
   drush cr
   ```

3. **Ellenőrizd a user szerepkört:**
   - **People → Edit user** - nézd meg, hogy az "Authenticated user" szerepkör van-e hozzárendelve

4. **Ellenőrizd a content type machine nevét:**
   - **Structure → Content types → Player Finder → Edit**
   - Machine name field: legyen **`player_finder`** (kis betűvel, underscore-ral)

### Ha a content type nem létezik

Akkor létre kell hozni a következő mezőkkel:

**Kötelező mezők:**
- `title` (String) - Cím
- `field_event_date` (Date) - Időpont
- `field_location` (List - text) - Helyszín (cafe, home, other)
- `field_needed_players` (Integer) - Kívánt létszám
- `field_current_players` (Integer) - Jelenlegi létszám
- `field_status` (List - text) - Státusz (active, full, expired)

**Opcionális mezők:**
- `field_event_type` (List - text) - Esemény típusa
- `field_contact` (String) - Kapcsolat
- `field_description` (Text - long) - Leírás
- `field_experience_level` (List - text) - Tapasztalati szint (beginner, intermediate, advanced, any)
- `field_game` (Entity reference → tarsasjatek) - Játék
- `field_game_type` (Entity reference → jatek_tipusok_polcrendszerben) - Játék típus

## Eredmény

Ha minden jól ment:
✅ Új játékostárs hirdetést tudsz létrehozni
✅ Nincs 403-as hiba
✅ A hirdetés megjelenik a listában

## Kapcsolat

Ha továbbra is problémád van, küldd el:
- A teljes console log-ot (F12 → Console)
- A Drupal watchdog log-ot: `drush watchdog:show --type=jsonapi`
