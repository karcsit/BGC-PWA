# Player Finder Notifications - Gyors Telepítési Útmutató

## 1. Feltöltés (5 perc)

### FTP/SSH módszer:

**Csomagold ki a ZIP-et lokálisan**, majd töltsd fel:

```
Forrás: player_finder_notifications/ könyvtár
Cél:    /home/trkijf/public_html/jatsszokosan.hu/web/modules/custom/
```

Vagy SSH-n:
```bash
cd /home/trkijf/public_html/jatsszokosan.hu/web/modules/custom/
unzip player_finder_notifications.zip
chmod -R 755 player_finder_notifications/
```

---

## 2. Telepítés (2 perc)

```bash
cd /home/trkijf/public_html/jatsszokosan.hu

# Modul engedélyezése
drush pm:enable player_finder_notifications -y

# Cache törlés
drush cr
```

---

## 3. Ellenőrzés (1 perc)

```bash
# Modul engedélyezve?
drush pm:list | grep player_finder

# Mezők létrejöttek?
drush field:list node player_finder | grep reminder
drush field:list user user | grep notify
```

**Vagy admin UI-on:**
- Structure → Content types → Player Finder → Manage fields
- Látnod kell: `field_reminder_sent`

---

## 4. Email Teszt (1 perc)

```bash
drush ev 'mail("karcsibaldr@gmail.com", "Teszt", "Ez egy teszt email.");'
```

Ellenőrizd a karcsibaldr@gmail.com postafiókot!

---

## 5. Funkcionális Teszt (3 perc)

### A) Új hirdetés értesítő:

1. Menj: https://jatsszokosan.hu/node/add/player_finder
2. Hozz létre egy teszt hirdetést
3. Ellenőrizd: `karcsibaldr@gmail.com` kapott-e emailt?

### B) 24h emlékeztető:

```bash
# Hozz létre egy holnapi eseményt, majd futtasd:
drush cron

# Ellenőrizd a logot:
drush watchdog:show --type=player_finder_notifications --count=10
```

---

## Hibaelhárítás

### Hiba: "Class EmailService not found"

**Megoldás:**
```bash
drush cr
```

### Hiba: "Field field_reminder_sent does not exist"

**Megoldás:**
```bash
# Modul újratelepítése
drush pm:uninstall player_finder_notifications -y
drush pm:enable player_finder_notifications -y
drush cr
```

### Email nem érkezik meg

**Ellenőrzés:**
```bash
# SMTP beállítások
drush config:get smtp.settings

# Drupal mail log
drush watchdog:show --type=mail --count=20

# Modul specifikus log
drush watchdog:show --type=player_finder_notifications --count=20
```

---

## Cron Beállítás (Automatikus Emlékeztetőkhöz)

### Drupal automated cron (egyszerűbb):

Admin → Configuration → System → Cron
- Interval: **Every hour**

### Szerver cron (jobb teljesítmény):

```bash
crontab -e

# Add this:
0 * * * * cd /home/trkijf/public_html/jatsszokosan.hu && drush cron
```

---

## Email Típusok

| Email típus | Trigger | Címzettek |
|-------------|---------|-----------|
| **Emlékeztető** | Cron (24h előtt) | Létrehozó + jelentkezők |
| **Új hirdetés** | Node létrehozás | field_notify_new_posts = TRUE userek |
| **Meghívó** | Manuális (REST API) | Kiválasztott userek |
| **Új jelentkezés** | Application létrehozás | Hirdetés tulajdonosa |

---

## REST API Használat (Meghívók)

**Endpoint:**
```
POST /api/player-finder/{node_id}/send-invitations
```

**Headers:**
```
Content-Type: application/json
X-CSRF-Token: {token}
```

**Body:**
```json
{
  "user_ids": [3, 5, 7]
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "success": 3,
    "failed": 0
  }
}
```

---

## Fájlstruktúra Ellenőrzés

```
player_finder_notifications/
├── player_finder_notifications.info.yml
├── player_finder_notifications.module
├── player_finder_notifications.install
├── player_finder_notifications.services.yml
├── player_finder_notifications.routing.yml
├── src/
│   ├── Service/
│   │   ├── EmailService.php          ← FONTOS!
│   │   └── ReminderService.php       ← FONTOS!
│   └── Plugin/
│       └── rest/
│           └── resource/
│               └── SendInvitationResource.php
├── README.md
└── INSTALL.md
```

**Ha hiányzik valamelyik fájl**, töröld a modult és töltsd fel újra!

---

## Gyors Parancsok

```bash
# Modul újratelepítése (ha valami elromlott)
drush pm:uninstall player_finder_notifications -y && \
drush pm:enable player_finder_notifications -y && \
drush cr

# Cron futtatása manuálisan
drush cron

# Legutóbbi emailek megtekintése
drush watchdog:show --type=mail --count=10

# Modul log megtekintése
drush watchdog:show --type=player_finder_notifications --count=20

# Cache törlés (ha valami nem működik)
drush cr

# Teljes status check
drush status && \
drush pm:list | grep player_finder && \
drush field:list node player_finder | grep reminder
```

---

**Összesített idő:** ~12 perc
**Nehézség:** Közepes
**Előfeltétel:** SMTP beállítva, Drupal 10/11

**Segítség:** Ha bármi probléma van, nézd meg a teljes dokumentációt: `README.md`
