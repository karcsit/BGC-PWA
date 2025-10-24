# Player Finder Notifications - Telepítési Útmutató

## Gyors Telepítés

### 1. Modul Feltöltése

**SSH használatával:**
```bash
cd /path/to/drupal/web/modules/custom
mkdir -p player_finder_notifications
# Töltsd fel ide a modul fájljait
```

**FTP használatával:**
- Töltsd fel a `player_finder_notifications` mappát a `web/modules/custom/` könyvtárba

### 2. Modul Engedélyezése

**Drush-sal (ajánlott):**
```bash
drush en player_finder_notifications -y
drush cr
```

**Admin felületen:**
1. Menj az **Extend** (/admin/modules) oldalra
2. Keresd meg: "Player Finder Notifications" (Board Game Cafe csoportban)
3. Pipáld be → Install

### 3. Ellenőrzés

Ellenőrizd, hogy a mezők létrejöttek:

**Player Finder nodes:**
- Van-e `field_reminder_sent` mező?
  - Admin → Structure → Content types → Player Finder → Manage fields

**User entity:**
- Van-e 3 új értesítési mező?
  - Admin → Configuration → People → Account settings → Manage fields

## SMTP Konfiguráció

### Ellenőrizd, hogy működik-e az email küldés:

```bash
drush ev "mail('your@email.com', 'Test', 'Test message');"
```

Ha nem működik, telepítsd és konfiguráld az SMTP modult:

```bash
composer require drupal/smtp
drush en smtp -y
```

Konfiguráció: **/admin/config/system/smtp**

## Cron Beállítás

###Opció A: Drupal Beépített Cron

**/admin/config/system/cron**
- Állítsd be: Every hour

### Opció B: Server Cron (Ajánlott)

```bash
crontab -e
```

Adj hozzá egy sort:
```
0 * * * * cd /var/www/html && /usr/bin/php vendor/drush/drush/drush cron
```

Vagy cron key használatával:
```
0 * * * * wget -O - -q https://jatsszokosan.hu/cron/YOUR_CRON_KEY >/dev/null 2>&1
```

## Teszt Email Küldés

### 1. Emlékeztető Teszt

1. Hozz létre egy Player Finder hirdetést **holnapi időpontra**
2. Adj hozzá legalább 1 jelentkezést
3. Futtasd a cron-t:
   ```bash
   drush cron
   ```
4. Ellenőrizd az emaileket

### 2. Új Hirdetés Értesítés Teszt

1. Győződj meg róla, hogy van legalább 1 user akinek be van kapcsolva a `field_notify_new_posts`
2. Hozz létre egy új Player Finder hirdetést és publikáld
3. Ellenőrizd az emaileket

## Hibaelhárítás

### Nem jött email

1. Ellenőrizd a log-okat:
   ```bash
   drush watchdog:show --type=player_finder_notifications
   ```

2. Ellenőrizd az SMTP konfigurációt

3. Ellenőrizd a spam mappát

### Cron nem fut

1. Teszteld manuálisan:
   ```bash
   drush cron -v
   ```

2. Ellenőrizd a cron beállítást: **/admin/config/system/cron**

### Mezők nem jöttek létre

1. Töröld és telepítsd újra a modult:
   ```bash
   drush pmu player_finder_notifications -y
   drush en player_finder_notifications -y
   drush cr
   ```

## További Segítség

Lásd a [README.md](README.md) fájlt részletes dokumentációért.

## Modulok Elhelyezése a Szervereden

```
web/
├── modules/
│   └── custom/
│       └── player_finder_notifications/
│           ├── src/
│           │   ├── Service/
│           │   │   ├── EmailService.php
│           │   │   └── ReminderService.php
│           │   └── Plugin/
│           │       └── rest/
│           │           └── resource/
│           │               └── SendInvitationResource.php
│           ├── player_finder_notifications.info.yml
│           ├── player_finder_notifications.module
│           ├── player_finder_notifications.install
│           ├── player_finder_notifications.services.yml
│           ├── player_finder_notifications.routing.yml
│           ├── README.md
│           └── INSTALL.md
```

## Ellenőrző Lista

- [ ] Modul feltöltve a szerverre
- [ ] Modul engedélyezve
- [ ] Cache ürítve
- [ ] `field_reminder_sent` mező létezik a player_finder-en
- [ ] Értesítési mezők léteznek a user entitáson
- [ ] SMTP email működik
- [ ] Cron be van állítva (óránként fut)
- [ ] Teszt email elküldve és megérkezett

## Kész!

Ha minden ellenőrző pont ✅, akkor a modul működik!
