# Player Finder Notifications Module

## Áttekintés

Ez a Drupal modul automatikus email értesítéseket és emlékeztetőket biztosít a Player Finder (Játékostárs Kereső) hirdetésekhez.

## Funkciók

### 1. **Automatikus Emlékeztető Emailek** (24 órával az esemény előtt)
- Minden résztvevőnek (hirdetés tulajdonosa + jelentkezők)
- Esemény adatai: időpont, helyszín, játék, résztvevők listája
- Kapcsolat információ és leírás

### 2. **Új Hirdetés Értesítések**
- Automatikus email minden regisztrált felhasználónak
- Felhasználók ki/be kapcsolhatják a beállításokban

### 3. **Manuális Meghívók Küldése**
- A hirdetés tulajdonosa kiválaszthat felhasználókat
- REST API endpoint a frontend számára

### 4. **Új Jelentkező Értesítés**
- A hirdetés tulajdonosa emailt kap új jelentkezésről
- Ki/be kapcsolható

### 5. **Automatikus Státusz Frissítés**
- Lejárt események automatikusan "expired" státuszra állnak
- Cron job futtatja

## Telepítés

### Követelmények

- Drupal 10 vagy 11
- PHP 7.4+
- Működő SMTP email konfiguráció
- Cron job beállítása

### Telepítési Lépések

#### 1. Modul Feltöltése

```bash
# SSH-n keresztül
cd /path/to/drupal/web/modules/custom
mkdir -p player_finder_notifications
# Majd töltsd fel a modul fájljait ide
```

Vagy FTP-n keresztül töltsd fel a `player_finder_notifications` mappát a `web/modules/custom/` könyvtárba.

#### 2. Modul Engedélyezése

```bash
drush en player_finder_notifications -y
```

Vagy a Drupal admin felületen:
1. Menj a **Extend** (/admin/modules) oldalra
2. Keresd meg a "Board Game Cafe" csoportban a "Player Finder Notifications" modult
3. Pipáld be és kattints a "Install" gombra

#### 3. Cache Ürítése

```bash
drush cr
```

Vagy admin felületen: **Configuration** → **Performance** → **Clear all caches**

## Konfiguráció

### 1. SMTP Email Beállítás Ellenőrzése

Győződj meg róla, hogy az SMTP email küldés be van állítva:

**Configuration** → **System** → **Basic site settings**
- Site e-mail address: beállítva

**SMTP Authentication Support module** (ha telepítve van)
- Konfiguráld az SMTP szervert

### 2. Cron Job Beállítása

A modul cron-t használ az emlékeztetők küldésére és a státusz frissítésre.

#### Opció A: Drupal Beépített Cron (Egyszerű, de nem megbízható)

**Configuration** → **System** → **Cron**
- Állítsd be, hogy óránként fusson

#### Opció B: Server Cron Job (Ajánlott)

Szerkeszd a crontab-ot:
```bash
crontab -e
```

Add hozzá ezt a sort (óránként fut):
```
0 * * * * cd /path/to/drupal && /usr/bin/php vendor/drush/drush/drush cron
```

Vagy `wget`/`curl` használatával:
```
0 * * * * wget -O - -q https://jatsszokosan.hu/cron/YOUR_CRON_KEY
```

A cron key megtalálható: **Configuration** → **System** → **Cron**

### 3. Felhasználói Értesítési Beállítások

Minden felhasználó be tudja állítani a saját értesítési preferenciáit:

**User Account Edit** (/user/{uid}/edit)

Három opció érhető el:
- **Új hirdetések értesítése**: Email új Player Finder hirdetésekről
- **Saját események emlékeztetője**: 24 órás emlékeztető a saját/jelentkezett eseményekről
- **Új jelentkezések értesítése**: Email amikor valaki jelentkezik a saját hirdetésre

Alapértelmezetten mind be van kapcsolva.

## Használat

### Frontend Integráció (React PWA)

#### 1. Meghívók Küldése

A hirdetés tulajdonosa meghívókat küldhet felhasználóknak.

**Endpoint:**
```
POST /api/player-finder/{node_id}/send-invitations
```

**Request Body:**
```json
{
  "user_ids": [123, 456, 789]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitations sent successfully",
  "results": {
    "success": 3,
    "failed": 0
  }
}
```

**Példa kód (React):**
```javascript
// src/services/emailService.js
export async function sendInvitations(postId, userIds, csrfToken) {
  const response = await fetch(
    `/api/player-finder/${postId}/send-invitations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ user_ids: userIds }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

#### 2. Értesítési Beállítások Kezelése

**Lekérés:**
```
GET /jsonapi/user/user/{user_uuid}?include=field_notify_new_posts,field_notify_my_events,field_notify_applications
```

**Frissítés:**
```
PATCH /jsonapi/user/user/{user_uuid}
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "user--user",
    "id": "{user_uuid}",
    "attributes": {
      "field_notify_new_posts": true,
      "field_notify_my_events": true,
      "field_notify_applications": false
    }
  }
}
```

## Email Template-ek

A modul 4 féle emailt küld:

### 1. Emlékeztető Email (`event_reminder`)
- **Mikor**: 24 órával az esemény előtt (cron)
- **Kinek**: Hirdetés tulajdonosa + összes jelentkező
- **Tartalom**: Esemény adatok, résztvevők listája, kapcsolat info

### 2. Új Hirdetés Értesítés (`new_post`)
- **Mikor**: Új Player Finder hirdetés publikálása
- **Kinek**: Minden user akinek be van kapcsolva a `field_notify_new_posts`
- **Tartalom**: Hirdetés címe, időpont, játék, létszám

### 3. Meghívó (`invitation`)
- **Mikor**: Manuális meghívó küldés (REST API)
- **Kinek**: Kiválasztott felhasználók
- **Tartalom**: Meghívó üzenet, esemény adatok

### 4. Új Jelentkezés Értesítés (`new_application`)
- **Mikor**: Valaki jelentkezik egy hirdetésre
- **Kinek**: Hirdetés tulajdonosa (ha be van kapcsolva `field_notify_applications`)
- **Tartalom**: Jelentkező neve, frissített létszám

## Adatbázis Mezők

### Node: player_finder

#### `field_reminder_sent` (boolean)
- **Címke**: "Reminder Email Sent"
- **Leírás**: El lett-e küldve a 24 órás emlékeztető?
- **Alapértelmezett**: FALSE
- **Kezelés**: Automatikus (cron állítja TRUE-ra)
- **Megjelenítés**: Rejtett (nem látható a formban/nézetben)

### User: user

#### `field_notify_new_posts` (boolean)
- **Címke**: "Notify about new Player Finder posts"
- **Alapértelmezett**: TRUE
- **Megjelenítés**: User edit form

#### `field_notify_my_events` (boolean)
- **Címke**: "Notify about my events"
- **Alapértelmezett**: TRUE
- **Megjelenítés**: User edit form

#### `field_notify_applications` (boolean)
- **Címke**: "Notify about applications"
- **Alapértelmezett**: TRUE
- **Megjelenítés**: User edit form

## Szolgáltatások (Services)

### EmailService
- `sendEventReminder($node, $participants)` - Emlékeztető küldés
- `sendNewPostNotifications($node)` - Új hirdetés értesítés
- `sendInvitations($node, $user_ids)` - Meghívók küldése
- `sendApplicationNotification($node, $applicant)` - Jelentkezés értesítés

### ReminderService
- `sendUpcomingEventReminders()` - 24h-s emlékeztetők keresése és küldése
- `updateExpiredEventStatus()` - Lejárt események státusz frissítése
- `getEventParticipants($node)` - Résztvevők lekérése (owner + applicants)

## Hibaelhárítás

### Nem mennek ki az emailek

1. **Ellenőrizd az SMTP konfigurációt**
   ```bash
   drush ev "mail('test@example.com', 'Test', 'Test message', 'From: noreply@jatsszokosan.hu');"
   ```

2. **Ellenőrizd a log-okat**
   - **Reports** → **Recent log messages** (/admin/reports/dblog)
   - Szűrj a "player_finder_notifications" típusra

3. **Ellenőrizd a cron futást**
   - **Reports** → **Status report** → Last cron run
   - Futtasd manuálisan: `drush cron`

### Emlékeztetők nem mennek ki

1. **Ellenőrizd, hogy a cron fut-e óránként**
   ```bash
   drush core:cron
   ```

2. **Ellenőrizd a `field_reminder_sent` mezőt**
   - Ha TRUE, akkor már el lett küldve
   - Állítsd FALSE-ra teszt céljából

3. **Ellenőrizd az esemény időpontját**
   - Az eseménynek 23-25 óra között kell lennie a jövőben

### Új hirdetés értesítések nem mennek

1. **Ellenőrizd a felhasználói beállításokat**
   - User edit → `field_notify_new_posts` be van-e pipálva

2. **Ellenőrizd, hogy a hirdetés publikált-e**
   - `status = 1`

3. **Ellenőrizd a hook futását**
   ```bash
   drush watchdog:show --type=player_finder_notifications
   ```

## Tesztelés

### Emlékeztető Email Teszt

1. Hozz létre egy Player Finder hirdetést holnapi időpontra
2. Adj hozzá 1-2 jelentkezést
3. Futtasd a cron-t manuálisan:
   ```bash
   drush cron
   ```
4. Ellenőrizd az emaileket (inbox + spam mappa)

### Meghívó Küldés Teszt

1. Hozz létre egy Player Finder hirdetést
2. Küldj POST requestet:
   ```bash
   curl -X POST https://jatsszokosan.hu/api/player-finder/123/send-invitations \
     -H "Content-Type: application/json" \
     -H "X-CSRF-Token: YOUR_TOKEN" \
     -d '{"user_ids": [5, 6, 7]}'
   ```
3. Ellenőrizd az email beérkezését

## Frissítés

Ha frissíted a modult:

1. Cseréld le a fájlokat
2. Futtasd az update-eket:
   ```bash
   drush updb -y
   drush cr
   ```

## Support

Kérdések vagy problémák esetén:
- Email: support@jatsszokosan.hu
- GitHub Issues: (ha van repo)

## Licenc

Proprietary - Board Game Cafe Project

## Verzió

**1.0.0** (2025-10-22)

## Changelog

### 1.0.0 (2025-10-22)
- Initial release
- Automated event reminders (24h before)
- New post notifications
- Manual invitations via REST API
- Application notifications
- Automatic expired event status updates
- User notification preferences
