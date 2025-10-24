# Drupal Oldal Helyreállítási Útmutató

**Dátum:** 2025. október 24.
**Projekt:** jatsszokosan.hu - Board Game Cafe PWA

## Mi történt?

A Drupal oldal összeomlott egy sikertelen config import művelet miatt. A `core.extension` config törlődött, ami az összes modul konfigurációját elvesztette.

## Helyreállítási Lépések

### 1. Adatbázis Visszaállítása

Importáld be a korábbi működő adatbázis backup-ot.

**PhpMyAdmin-on keresztül:**
1. Menj a PhpMyAdmin-ba
2. Válaszd ki a Drupal adatbázist
3. Import → Válaszd ki a backup SQL fájlt
4. Kattints a "Go" gombra

**Vagy SSH-n keresztül:**
```bash
mysql -u [username] -p [database_name] < backup.sql
```

---

### 2. Drupal Cache Törlése

```bash
cd /home/trkijf/public_html/jatsszokosan.hu

# Töröld a cache könyvtárakat
rm -rf web/sites/default/files/php/twig/*
rm -rf web/sites/default/files/php/storage/*

# Drush cache rebuild
drush cr
```

---

### 3. Új Drupal Modulok Újratelepítése

Az alábbi új modulokat kell újratelepíteni a visszaállított adatbázison:

#### A) Player Finder Notification Module

**Fájl helye (GitHub):**
```
drupal-module/player_finder_notifications.zip
```

**Telepítés:**

1. **Töltsd le a modult GitHub-ról:**
   - Menj ide: https://github.com/karcsit/BGC-PWA
   - `drupal-module/player_finder_notifications.zip`

2. **Csomagold ki lokálisan**

3. **Töltsd fel FTP-n/SSH-n:**
   ```
   /home/trkijf/public_html/jatsszokosan.hu/web/modules/custom/player_finder_notifications/
   ```

4. **SSH parancsok:**
   ```bash
   cd /home/trkijf/public_html/jatsszokosan.hu

   # Fájljogosultságok
   chmod -R 755 web/modules/custom/player_finder_notifications/

   # Modul engedélyezése
   drush pm:enable player_finder_notifications -y

   # Cache törlés
   drush cr
   ```

5. **Ellenőrzés:**
   ```bash
   drush pm:list --type=module --status=enabled | grep player_finder
   ```

**Mit csinál ez a modul?**
- ✅ Email értesítések Player Finder hirdetésekhez
- ✅ 24 órás emlékeztetők automatikusan (cron)
- ✅ Új hirdetés értesítő emailek
- ✅ Meghívó küldés funkció
- ✅ Jelentkezés értesítők

**Szükséges mezők (automatikusan létrejönnek):**
- `field_reminder_sent` - Player Finder node-okon
- `field_notify_new_posts` - User entity-n
- `field_notify_my_events` - User entity-n
- `field_notify_applications` - User entity-n

---

### 4. Tartalomtípusok Ellenőrzése

Az alábbi tartalomtípusokat ellenőrizd, hogy léteznek-e:

#### Player Finder (Machine name: `player_finder`)

**Mezők:**
- `title` - Cím (Text)
- `field_game` - Játék (Entity reference → node/tarsasjatek)
- `field_game_type` - Játék típus (Entity reference → taxonomy/jatek_tipusok)
- `field_event_date` - Esemény dátuma (Date)
- `field_location` - Helyszín (List/Text)
- `field_max_players` - Max játékosok (Number)
- `field_description` - Leírás (Text long)
- `field_status` - Státusz (List: active, completed, cancelled, expired)
- `field_reminder_sent` - Emlékeztető elküldve (Boolean) - ÚJ!

**Jogosultságok:**
- Authenticated users: create, edit own, delete own

#### Player Finder Application (Machine name: `player_finder_application`)

**Mezők:**
- `title` - Cím (Text)
- `field_finder_post` - Hirdetés (Entity reference → node/player_finder)
- `field_message` - Üzenet (Text long)
- `field_application_status` - Státusz (List: pending, accepted, rejected)

---

### 5. PWA Újratelepítése (Opcionális)

Ha a PWA fájlok is sérültek, használd az új buildet:

**Fájl helye (lokális):**
```
C:\Users\Admin\BGC-PWA\pwa\dist\
```

**Build újra (ha szükséges):**
```bash
cd C:\Users\Admin\BGC-PWA\pwa
npm run build
```

**Feltöltés:**
```
Forrás: C:\Users\Admin\BGC-PWA\pwa\dist\*
Cél: /home/trkijf/public_html/jatsszokosan.hu/web/pwa/
```

**Új PWA funkciók:**
- ✅ CSRF token automatikus frissítés
- ✅ Player Finder szerkesztés funkció
- ✅ Játék típus választási lehetőség (alternatíva konkrét játékhoz)

---

### 6. SMTP Email Teszt

Miután minden újratelepült:

```bash
cd /home/trkijf/public_html/jatsszokosan.hu

drush ev 'mail("karcsibaldr@gmail.com", "Teszt email", "Ez egy teszt email a helyreállítás után.");'
```

Ha az email megérkezik, akkor az SMTP működik.

---

### 7. Cron Beállítás

Ellenőrizd, hogy a cron megfelelően be van-e állítva:

**Drupal automated cron:**
- Admin → Configuration → System → Cron
- Interval: Minden órában

**Vagy szerver-szintű cron:**
```bash
crontab -e

# Add this line:
0 * * * * cd /home/trkijf/public_html/jatsszokosan.hu && drush cron
```

---

## Ellenőrző Lista - Helyreállítás Után

- [ ] Adatbázis visszaállítva backup-ból
- [ ] Drupal frontend működik: https://jatsszokosan.hu
- [ ] Drupal admin elérhető: https://jatsszokosan.hu/user/login
- [ ] Player Finder tartalomtípus létezik
- [ ] Player Finder Application tartalomtípus létezik
- [ ] `player_finder_notifications` modul telepítve és engedélyezve
- [ ] Email mezők létrejöttek (field_notify_*)
- [ ] SMTP email teszt sikeres
- [ ] PWA működik: https://jatsszokosan.hu/pwa/
- [ ] Player Finder lista betöltődik a PWA-ban
- [ ] Új hirdetés létrehozható a PWA-ból
- [ ] Email értesítés megérkezik új hirdetés létrehozásakor
- [ ] Cron job beállítva

---

## Hasznos SSH Parancsok

```bash
# Drupal állapot ellenőrzése
drush status

# Modulok listája
drush pm:list --type=module --status=enabled

# Cache törlés
drush cr

# Config exportálás (mentéshez)
drush cex -y

# Cron futtatása manuálisan
drush cron

# Watchdog log ellenőrzése
drush watchdog:show --type=player_finder_notifications --count=50

# Field lista ellenőrzése
drush field:list node player_finder
drush field:list user user

# Email teszt
drush ev 'mail("karcsibaldr@gmail.com", "Test", "Test email");'
```

---

## Kapcsolat & Támogatás

- **GitHub repo:** https://github.com/karcsit/BGC-PWA
- **Commit hash:** 99ccb62 (legutóbbi)
- **Email:** karcsibaldr@gmail.com

---

## Mit NE Csinálj Soha Többé

❌ **NE futtasd:** `drush config:import` hacsak nem vagy 100%-ig biztos benne
❌ **NE töröld:** `DELETE FROM config WHERE name = 'core.extension'`
❌ **NE töröld:** Teljes config táblákat backup nélkül

✅ **MINDIG:** Készíts teljes adatbázis backup-ot változtatások előtt
✅ **MINDIG:** Használj `drush config:export` mentéshez, nem import-ot
✅ **MINDIG:** Teszteld először staging környezetben

---

**Készítette:** Claude Code Assistant
**Utolsó frissítés:** 2025. október 24.
