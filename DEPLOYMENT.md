# Deployment útmutató - BGC PWA

## Telepítés a Drupal szerverre

### 1. Fájlok feltöltése

A `pwa-deploy.zip` fájl tartalmát kell feltölteni a szerverre.

**Feltöltési helyszín:**
```
/home/trkijf/public_html/dr11/web/pwa/
```

**Lépések:**

1. **FTP/SFTP kapcsolódás**
   - Host: `webgraf.hu` vagy szerverIP
   - User: `trkijf` (vagy saját)
   - Protokoll: SFTP vagy FTP

2. **Mappa létrehozása**
   ```bash
   cd /home/trkijf/public_html/dr11/web/
   mkdir pwa
   cd pwa
   ```

3. **Fájlok feltöltése**
   - Csomagold ki a `pwa-deploy.zip`-et lokálisan
   - Töltsd fel az összes fájlt a `/web/pwa/` mappába:
     - `index.html`
     - `assets/` mappa (CSS és JS fájlok)
     - `manifest.json`

4. **Jogosultságok ellenőrzése**
   ```bash
   chmod 755 /home/trkijf/public_html/dr11/web/pwa
   chmod 644 /home/trkijf/public_html/dr11/web/pwa/*
   chmod 755 /home/trkijf/public_html/dr11/web/pwa/assets
   chmod 644 /home/trkijf/public_html/dr11/web/pwa/assets/*
   ```

### 2. Elérési út

**Élő demo URL:**
```
https://dr11.webgraf.hu/web/pwa/
```

### 3. .htaccess konfiguráció (opcionális)

Ha SPA routing problémák lennének, hozz létre egy `.htaccess` fájlt a `pwa/` mappában:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /web/pwa/

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Enable CORS for API requests
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-CSRF-Token"
</IfModule>
```

### 4. Drupal CORS beállítások (ha szükséges)

Ha a PWA és a Drupal API között CORS problémák lennének (nem valószínű, mert ugyanazon a domain-en vannak):

**services.yml frissítése:**
```yaml
cors.config:
  enabled: true
  allowedOrigins:
    - 'https://dr11.webgraf.hu'
  allowedMethods:
    - GET
    - POST
    - PUT
    - DELETE
    - PATCH
    - OPTIONS
  allowedHeaders:
    - 'x-csrf-token'
    - 'authorization'
    - 'content-type'
  exposedHeaders: false
  maxAge: 1000
  supportsCredentials: true
```

### 5. Tesztelés

1. **Nyisd meg böngészőben:**
   ```
   https://dr11.webgraf.hu/web/pwa/
   ```

2. **Tesztelendő funkciók:**
   - ✅ Főoldal betöltődik
   - ✅ Játéklista megjelenik
   - ✅ Szűrés és keresés működik
   - ✅ Menü navigáció
   - ✅ Bejelentkezés (Drupal user)
   - ✅ Játéknapló létrehozás
   - ✅ Játéknapló lista
   - ✅ Profil oldal

3. **DevTools console ellenőrzése:**
   - Nincsenek CORS hibák
   - API kérések sikeresek (200 OK)
   - Nincsenek 404-es asset hibák

### 6. Mobilon tesztelés

```
https://dr11.webgraf.hu/web/pwa/
```

Nyisd meg telefonon is és ellenőrizd:
- Reszponzív megjelenés
- Touch navigáció
- PWA install prompt (ha van)

### 7. Frissítés a jövőben

Ha kódot változtatsz:

```bash
# Lokálisan:
cd pwa
npm run build

# Új pwa-deploy.zip létrehozása
cd ..
powershell Compress-Archive -Path pwa\dist\* -DestinationPath pwa-deploy.zip -Force

# Töltsd fel a fájlokat a szerverre (felülírva a régit)
```

---

## Quick Deploy Script (SSH hozzáféréssel)

Ha van SSH hozzáférésed:

```bash
# Lokális gépen
cd /e/AI/CLAUDE/BGC-PWA/pwa
npm run build
cd ..
tar -czf pwa-deploy.tar.gz -C pwa/dist .

# SCP feltöltés
scp pwa-deploy.tar.gz trkijf@webgraf.hu:/home/trkijf/

# SSH-n keresztül
ssh trkijf@webgraf.hu
cd /home/trkijf/public_html/dr11/web/
mkdir -p pwa
cd pwa
tar -xzf ~/pwa-deploy.tar.gz
rm ~/pwa-deploy.tar.gz
chmod 755 .
chmod 644 *
chmod 755 assets
chmod 644 assets/*
```

---

## Troubleshooting

### Probléma: Fehér oldal jelenik meg
- **Megoldás**: Ellenőrizd a DevTools Console-t. Valószínűleg 404-es asset hibák.
- **Ok**: `base: '/pwa/'` nincs beállítva a vite.config.js-ben
- **Fix**: Rebuild `npm run build` az új config-gal

### Probléma: API hívások nem működnek
- **Megoldás**: Ellenőrizd a Network tab-ot
- **Ok**: CORS vagy relatív URL probléma
- **Fix**: Győződj meg róla, hogy a Drupal és PWA ugyanarról a domain-ről fut

### Probléma: Bejelentkezés után logout
- **Megoldás**: Session cookie probléma
- **Ok**: Cookie domain vagy path konfiguráció
- **Fix**: Ellenőrizd a cookie beállításokat a Drupal-ban

---

## Support

Ha bármilyen probléma merül fel:
1. Nézd meg a browser DevTools Console-t
2. Ellenőrizd a Network tab-ot
3. Nézd meg a Drupal logs-ot: `/admin/reports/dblog`

**Élő demo URL (telepítés után):**
👉 https://dr11.webgraf.hu/web/pwa/
