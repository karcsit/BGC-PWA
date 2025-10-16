# Board Game Cafe API Module - Telepítési útmutató

## Mi ez a module?

Ez egy **biztonságos custom Drupal module**, ami REST API endpoint-okat biztosít a PWA autentikációhoz **ANÉLKÜL**, hogy admin jogokat kellene adni anonymous usereknek.

## Endpoint-ok

| Endpoint | Method | Leírás | Auth szükséges |
|----------|--------|--------|----------------|
| `/api/register` | POST | Új felhasználó regisztrációja | ❌ Nem |
| `/api/login` | POST | Bejelentkezés | ❌ Nem |
| `/api/logout` | POST | Kijelentkezés | ✅ Igen |
| `/api/current-user` | GET | Aktuális user adatok | ❌ Nem |

## Telepítési lépések

### 1. Module másolása a Drupal szerverre

Töltsd fel a `bgc_api` mappát a Drupal szerverre:

```bash
# SSH-val vagy FTP-vel:
/path/to/drupal/web/modules/custom/bgc_api/
```

**Fájlstruktúra:**
```
web/modules/custom/bgc_api/
├── bgc_api.info.yml
├── bgc_api.routing.yml
└── src/
    └── Controller/
        ├── AuthController.php
        └── RegistrationController.php
```

### 2. Module engedélyezése

**Drush-sal (ajánlott):**
```bash
drush en bgc_api -y
drush cr
```

**Vagy a Drupal admin felületen:**
1. Menj a: `/admin/modules`
2. Keresd meg: "Board Game Cafe API"
3. Pipáld be
4. Kattints: "Install"
5. Cache clear: Configuration → Performance → Clear all caches

### 3. Regisztráció engedélyezése

**Configuration → People → Account settings**
(`/admin/config/people/accounts`)

- "Who can register accounts?" → **"Visitors"**
- Save configuration

### 4. CORS beállítása (ha még nincs)

Szerkeszd: `sites/default/services.yml`

```yaml
parameters:
  cors.config:
    enabled: true
    allowedOrigins:
      - '*'  # Vagy specifikus: 'http://localhost:5173'
    allowedMethods:
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE
      - OPTIONS
    allowedHeaders:
      - '*'
    exposedHeaders: false
    maxAge: 3600
    supportsCredentials: true
```

**Cache rebuild:**
```bash
drush cr
```

### 5. Tesztelés

**Regisztráció teszt:**
```bash
curl -X POST "https://dr11.webgraf.hu/web/api/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser123","email":"test@example.com","password":"testpass123"}'
```

**Várt válasz:**
```json
{
  "success": true,
  "message": "Sikeres regisztráció",
  "user": {
    "uid": "42",
    "name": "testuser123",
    "email": "test@example.com"
  }
}
```

**Login teszt:**
```bash
curl -X POST "https://dr11.webgraf.hu/web/api/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"testuser123","password":"testpass123"}'
```

**Várt válasz:**
```json
{
  "success": true,
  "current_user": {
    "uid": "42",
    "name": "testuser123",
    "email": "test@example.com"
  },
  "csrf_token": "...",
  "logout_token": "..."
}
```

## Biztonság

✅ **Mit csinál ez a module?**
- Ellenőrzi, hogy a regisztráció engedélyezett-e a Drupal beállításokban
- Validálja az input adatokat (email, username uniqueness)
- Használja a Drupal core user entity validációt
- Password hashing a Drupal core service-szel
- CSRF tokenek használata session biztonsághoz

❌ **Mit NEM csinál?**
- Nem ad admin jogokat anonymous usereknek
- Nem bypass-olja a Drupal permission rendszert
- Nem tárol jelszavakat plain text-ben

## Hibakeresés

**404 Not Found az `/api/*` endpoint-okon:**
- Cache rebuild: `drush cr`
- Ellenőrizd a routing file-t
- Nézd meg a Drupal log-okat: Reports → Recent log messages

**403 Forbidden regisztrációnál:**
- Ellenőrizd: Configuration → People → Account settings
- "Who can register accounts?" → Visitors

**CORS error:**
- Ellenőrizd a `services.yml` fájlt
- Cache rebuild után
- Browser DevTools Network tab → nézd a Response headers-t

## Troubleshooting

**Hiba:** "Call to undefined function user_load_by_name()"
**Megoldás:** Drupal 11-ben deprecated. Cseréld ki:
```php
$user_storage = \Drupal::entityTypeManager()->getStorage('user');
$users = $user_storage->loadByProperties(['name' => $username]);
$user = reset($users);
```

**Hiba:** "Session not started"
**Megoldás:** Ellenőrizd a `credentials: 'include'` flag-et a fetch hívásokban

## Support

Ha probléma van:
1. Nézd meg a Drupal log-okat: `/admin/reports/dblog`
2. Engedélyezd a Drupal debug mode-ot: `sites/default/services.yml` → `debug: true`
3. Nézd a browser console-t és Network tab-ot

---

**Verzió:** 1.0
**Drupal:** 10.x, 11.x
**Készítette:** Claude AI
**Projekt:** Board Game Cafe PWA
