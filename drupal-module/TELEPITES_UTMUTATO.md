# Player Finder Notifications Modul - Telepítési Útmutató

## 📦 Modul Fájlok Áttekintése

A modul 10 fájlból áll:

```
player_finder_notifications/
├── README.md                            # Részletes dokumentáció
├── INSTALL.md                           # Gyors telepítési útmutató
├── player_finder_notifications.info.yml        # Modul információk
├── player_finder_notifications.module           # Hook implementációk + Email template-ek
├── player_finder_notifications.install          # Mező létrehozás telepítéskor
├── player_finder_notifications.services.yml     # Service-ek definíciója
├── player_finder_notifications.routing.yml      # Route-ok (admin beállítások)
└── src/
    ├── Service/
    │   ├── EmailService.php             # Email küldés logika
    │   └── ReminderService.php          # Cron logika (emlékeztetők, státusz)
    └── Plugin/
        └── rest/
            └── resource/
                └── SendInvitationResource.php   # REST endpoint meghívókhoz
```

## 🚀 Telepítési Lépések

### 1. Modul Feltöltése a Szerverre

Két lehetőség:

#### A) SSH/FTP Feltöltés

1. **Töltsd le** a `player_finder_notifications.zip` fájlt innen:
   - [C:\Users\Admin\BGC-PWA\drupal-module\player_finder_notifications.zip](file:///C:/Users/Admin/BGC-PWA/drupal-module/player_finder_notifications.zip)

2. **Csatlakozz SSH-n vagy FTP-n** a szerverhez

3. **Navigálj** a Drupal custom modulok könyvtárába:
   ```bash
   cd /var/www/html/web/modules/custom
   # VAGY az általad használt útvonal
   ```

4. **Csomagold ki** a zip fájlt:
   ```bash
   unzip player_finder_notifications.zip
   ```

   Vagy FTP használatával töltsd fel a kicsomagolt `player_finder_notifications` mappát.

#### B) Git Repository (ha van)

```bash
cd /var/www/html/web/modules/custom
git clone [repository_url] player_finder_notifications
```

### 2. Fájlstruktúra Ellenőrzése

Győződj meg róla, hogy a fájlok jó helyen vannak:

```bash
ls -la /var/www/html/web/modules/custom/player_finder_notifications/
```

Látni kell:
- `player_finder_notifications.info.yml`
- `player_finder_notifications.module`
- `src/` mappát

### 3. Modul Engedélyezése

#### Drush használatával (Ajánlott):

```bash
cd /var/www/html
drush en player_finder_notifications -y
drush cr
```

#### Admin felületen:

1. Menj a **Extend** (/admin/modules) oldalra
2. Keresd meg a "Board Game Cafe" szekció alatt: **Player Finder Notifications**
3. Pipáld be
4. Kattints az **Install** gombra

### 4. Telepítés Ellenőrzése

#### Mezők Ellenőrzése

**Player Finder Content Type:**
1. Menj ide: **Structure** → **Content types** → **Player Finder** → **Manage fields**
2. Ellenőrizd: van-e `field_reminder_sent` mező
   - Ha nincs, a modul nem települt rendesen

**User Fields:**
1. Menj ide: **Configuration** → **People** → **Account settings** → **Manage fields**
2. Ellenőrizd: van-e 3 új mező:
   - `field_notify_new_posts`
   - `field_notify_my_events`
   - `field_notify_applications`

#### Service-ek Ellenőrzése

```bash
drush ev "echo \Drupal::hasService('player_finder_notifications.email_service') ? 'OK' : 'FAIL';"
```

Válasz: `OK`

### 5. SMTP Email Konfiguráció

#### Ellenőrizd, hogy működik-e az email küldés:

```bash
drush ev "mail('your@email.com', 'Test Subject', 'Test message from Drupal', 'From: noreply@jatsszokosan.hu');"
```

Ellenőrizd az email beérkezését (inbox + spam mappa).

#### Ha nem működik - SMTP Modul Telepítése

```bash
composer require drupal/smtp
drush en smtp -y
drush cr
```

Konfiguráció: **/admin/config/system/smtp**

Beállítások (példa Gmail-hez):
- SMTP server: `smtp.gmail.com`
- SMTP port: `587`
- Use encrypted protocol: `TLS`
- Username: `your@gmail.com`
- Password: `your-app-password`

### 6. Cron Job Beállítása

A modul **óránként** futó cron job-ra van szüksége az emlékeztetőkhöz és státusz frissítéshez.

#### Opció A: Drupal Beépített Cron

1. Menj ide: **/admin/config/system/cron**
2. Állítsd be: **Every 1 hour**
3. Mentsd el

**Megjegyzés:** Ez kevésbé megbízható, mert csak akkor fut, ha valaki látogatja az oldalt.

#### Opció B: Server Cron (Ajánlott)

Szerkeszd a server crontab-ot:

```bash
crontab -e
```

Adj hozzá egy sort (óránként fut):

```bash
0 * * * * cd /var/www/html && /usr/bin/php vendor/drush/drush/drush cron >/dev/null 2>&1
```

**VAGY** cron key használatával (nem kell shell hozzáférés):

```bash
0 * * * * wget -O - -q https://jatsszokosan.hu/cron/YOUR_CRON_KEY >/dev/null 2>&1
```

A cron key megtalálható: **/admin/config/system/cron**

#### Cron Teszt

```bash
drush cron -v
```

Ellenőrizd a kimenetet, hogy futott-e hiba nélkül.

## ✅ Funkcionális Tesztek

### 1. Teszt: Emlékeztető Email (24h előtt)

**Lépések:**

1. **Hozz létre egy Player Finder hirdetést** holnapi időpontra:
   - Időpont: holnap 18:00
   - Játék: Bármilyen
   - Publikus: Igen

2. **Adj hozzá 1-2 jelentkezést** (player_finder_application node)

3. **Futtasd a cron-t manuálisan:**
   ```bash
   drush cron
   ```

4. **Ellenőrizd az emaileket:**
   - A hirdetés tulajdonosa kapott emailt?
   - A jelentkezők kaptak emailt?
   - Email tartalom helyes? (résztvevők listája, időpont, stb.)

5. **Ellenőrizd a `field_reminder_sent` mezőt:**
   - A node-on TRUE-ra állítódott?

**Várható Email:**
```
Tárgy: Emlékeztető: [Hirdetés címe] - Holnap találkozunk!

Tartalom:
- Szia [Név]!
- Ez egy emlékeztető a holnapi játékos találkozóról
- Időpont, Helyszín, Játék
- Résztvevők listája
- Kapcsolat info
```

### 2. Teszt: Új Hirdetés Értesítés

**Lépések:**

1. **Ellenőrizd**, hogy van legalább 1 user akinek be van kapcsolva a `field_notify_new_posts`
   - Menj a user edit oldalra és ellenőrizd a pipát

2. **Hozz létre egy új Player Finder hirdetést** és publikáld

3. **Ellenőrizd az emaileket:**
   - Minden felhasználó (kivéve a creator) kapott emailt?

**Várható Email:**
```
Tárgy: Új játékostárs hirdetés: [Hirdetés címe]

Tartalom:
- Szia [Név]!
- Új játékostárs hirdetés jelent meg
- Időpont, Játék, Létszám
- Link a hirdetéshez
```

### 3. Teszt: Manuális Meghívó Küldés (REST API)

**Lépések:**

1. **Szerezz CSRF tokent:**
   ```bash
   curl https://jatsszokosan.hu/session/token
   ```

2. **Küldj POST requestet:**
   ```bash
   curl -X POST https://jatsszokosan.hu/api/player-finder/[NODE_ID]/send-invitations \
     -H "Content-Type: application/json" \
     -H "X-CSRF-Token: YOUR_TOKEN" \
     -H "Cookie: YOUR_SESSION_COOKIE" \
     -d '{"user_ids": [5, 6, 7]}'
   ```

3. **Ellenőrizd a választ:**
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

4. **Ellenőrizd az emaileket** a meghívott felhasználóknál

### 4. Teszt: Új Jelentkezés Értesítés

**Lépések:**

1. **Hozz létre egy Player Finder hirdetést**

2. **Győződj meg róla**, hogy a tulajdonosnál be van kapcsolva a `field_notify_applications`

3. **Adj hozzá egy új jelentkezést** (player_finder_application)

4. **Ellenőrizd az emailt** a hirdetés tulajdonosánál

**Várható Email:**
```
Tárgy: Új jelentkező a hirdetésedre: [Hirdetés címe]

Tartalom:
- [Jelentkező neve] jelentkezett
- Jelenlegi létszám: X / Y fő
```

### 5. Teszt: Automatikus Státusz Frissítés

**Lépések:**

1. **Hozz létre egy Player Finder hirdetést** **tegnapi időpontra**
   - field_status: `active`

2. **Futtasd a cron-t:**
   ```bash
   drush cron
   ```

3. **Ellenőrizd**, hogy a `field_status` átállítódott `expired`-re

## 🐛 Hibaelhárítás

### Probléma: Emailek nem mennek ki

**Ellenőrzések:**

1. **SMTP konfiguráció:**
   ```bash
   drush ev "mail('test@example.com', 'Test', 'Test message');"
   ```

2. **Log-ok:**
   ```bash
   drush watchdog:show --type=player_finder_notifications
   ```

   Vagy admin felületen: **Reports** → **Recent log messages**

3. **Spam mappa** ellenőrzése

4. **Email service működik-e:**
   ```bash
   drush ev "echo \Drupal::service('player_finder_notifications.email_service') ? 'OK' : 'FAIL';"
   ```

### Probléma: Cron nem fut

1. **Teszteld manuálisan:**
   ```bash
   drush cron -v
   ```

2. **Ellenőrizd a cron beállítást:**
   - **/admin/config/system/cron**
   - Last run időpont friss-e?

3. **Ellenőrizd a server crontab-ot:**
   ```bash
   crontab -l
   ```

### Probléma: Mezők nem jöttek létre

1. **Töröld és telepítsd újra:**
   ```bash
   drush pmu player_finder_notifications -y
   drush en player_finder_notifications -y
   drush cr
   ```

2. **Ellenőrizd a fájl jogosultságokat:**
   ```bash
   ls -la /var/www/html/web/modules/custom/player_finder_notifications/
   ```

3. **Ellenőrizd a Drupal log-okat:**
   ```bash
   drush watchdog:show
   ```

### Probléma: REST endpoint nem működik

1. **Ellenőrizd a REST modul:**
   ```bash
   drush pm:list | grep rest
   ```

2. **Ellenőrizd a routing-ot:**
   ```bash
   drush route:info player_finder_send_invitation
   ```

3. **Cache ürítés:**
   ```bash
   drush cr
   ```

## 📊 Monitoring és Karbantartás

### Log Monitoring

Hetente ellenőrizd a log-okat:

```bash
drush watchdog:show --type=player_finder_notifications --severity=Error
```

### Email Statisztikák

Ellenőrizd, hogy mennyien kapnak értesítéseket:

```bash
# Felhasználók akiknek be van kapcsolva az értesítés
drush sqlq "SELECT COUNT(*) FROM user__field_notify_new_posts WHERE field_notify_new_posts_value = 1;"
```

### Cron History

```bash
drush core:cron:history
```

## 📝 Összefoglalás - Checklist

- [ ] Modul feltöltve a `/web/modules/custom/player_finder_notifications/` mappába
- [ ] Modul engedélyezve (`drush en player_finder_notifications -y`)
- [ ] Cache ürítve (`drush cr`)
- [ ] `field_reminder_sent` mező létrejött a player_finder-en
- [ ] 3 értesítési mező létrejött a user entitáson
- [ ] SMTP email működik (teszt email elküldve)
- [ ] Cron be van állítva (óránként fut)
- [ ] Teszt emlékeztető email sikeresen elküldve
- [ ] Teszt új hirdetés értesítés sikeresen elküldve
- [ ] REST endpoint működik (meghívó küldés)
- [ ] Log-okban nincs hiba

## 🎉 Kész!

Ha minden checklist pont ✅, akkor a modul teljesen működőképes!

## 📞 Támogatás

Kérdések vagy problémák esetén:
- Lásd a [README.md](player_finder_notifications/README.md) fájlt részletes dokumentációért
- Ellenőrizd a log-okat: `drush watchdog:show --type=player_finder_notifications`

---

**Verzió:** 1.0.0
**Utolsó frissítés:** 2025-10-23
