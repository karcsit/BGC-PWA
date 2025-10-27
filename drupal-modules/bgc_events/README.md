# BGC Events Module

Board Game Cafe esemény regisztrációs rendszer várólistás funkcióval.

## Telepítés

1. Másold a `bgc_events` mappát a Drupal telepítésed `modules/custom/` mappájába:
   ```bash
   cp -r bgc_events /path/to/drupal/modules/custom/
   ```

2. Engedélyezd a modult:
   ```bash
   drush en bgc_events -y
   ```

   Vagy a Drupal admin felületen: **Extend** → keress rá "BGC Events" → pipáld be → **Install**

## Content Type létrehozása

A modul működéséhez létre kell hoznod az **Esemény (esemeny)** content type-ot a következő mezőkkel:

### 1. Content Type létrehozása

**Structure** → **Content types** → **Add content type**

- **Name**: Esemény
- **Machine name**: `esemeny`
- **Description**: Események és programok a Board Game Cafe-ban

### 2. Mezők hozzáadása

**Manage fields** gombra kattintva add hozzá az alábbi mezőket:

#### field_event_date (Dátum és időpont)
- **Field type**: Date
- **Label**: Dátum és időpont
- **Machine name**: `field_event_date`
- **Required**: Yes

#### field_location (Helyszín)
- **Field type**: Text (plain)
- **Label**: Helyszín
- **Machine name**: `field_location`
- **Default value**: Board Game Cafe, Üllői út 46, Budapest 1084

#### field_max_participants (Maximum létszám)
- **Field type**: Number (integer)
- **Label**: Maximum létszám
- **Machine name**: `field_max_participants`
- **Required**: Yes
- **Default value**: 20
- **Minimum**: 1

#### field_participants (Résztvevők)
- **Field type**: Entity reference
- **Label**: Résztvevők
- **Machine name**: `field_participants`
- **Reference type**: User
- **Allowed number of values**: Unlimited
- **Required**: No

#### field_waitlist (Várólista)
- **Field type**: Entity reference
- **Label**: Várólista
- **Machine name**: `field_waitlist`
- **Reference type**: User
- **Allowed number of values**: Unlimited
- **Required**: No

#### field_event_type (Esemény típusa)
- **Field type**: List (text)
- **Label**: Esemény típusa
- **Machine name**: `field_event_type`
- **Allowed values**:
  ```
  verseny|Verseny
  workshop|Workshop
  tarsasjatek_este|Társasjáték este
  bemutato|Bemutató
  turne|Turné
  egyeb|Egyéb
  ```

#### field_event_image (Esemény kép)
- **Field type**: Image
- **Label**: Esemény kép
- **Machine name**: `field_event_image`
- **Required**: No

### 3. JSON:API engedélyezése

**Configuration** → **Web services** → **JSON:API**

Győződj meg róla, hogy a JSON:API modul engedélyezve van, és az `esemeny` content type elérhető.

### 4. Permissions beállítása

**People** → **Permissions**

Authenticated users számára:
- ✓ View published content
- ✓ Access GET on Esemény resource (JSON:API)

## API Endpoints

A modul három REST endpointot biztosít:

### 1. Regisztráció eseményre
```http
POST /api/event/{node_id}/register
Headers:
  X-CSRF-Token: {token}
  Content-Type: application/json
```

**Válasz sikeres regisztráció esetén:**
```json
{
  "status": "registered",
  "message": "Sikeresen regisztráltál az eseményre!",
  "participant_count": 15,
  "max_participants": 20
}
```

**Válasz ha megtelt (várólistára kerülés):**
```json
{
  "status": "waitlisted",
  "message": "Az esemény megtelt. Felkerültél a várólistára.",
  "waitlist_position": 3
}
```

### 2. Lejelentkezés eseményről
```http
POST /api/event/{node_id}/unregister
Headers:
  X-CSRF-Token: {token}
  Content-Type: application/json
```

**Válasz:**
```json
{
  "status": "unregistered",
  "message": "Sikeresen lejelentkeztél az eseményről."
}
```

### 3. Regisztrációs státusz lekérése
```http
GET /api/event/{node_id}/status
```

**Válasz:**
```json
{
  "is_registered": true,
  "is_waitlisted": false,
  "waitlist_position": null,
  "participant_count": 15,
  "waitlist_count": 3,
  "max_participants": 20,
  "spots_available": 5
}
```

## Működés

1. **Regisztráció**: Amikor egy felhasználó regisztrál egy eseményre:
   - Ha van hely → hozzáadódik a résztvevőkhöz
   - Ha nincs hely → várólistára kerül

2. **Lejelentkezés**:
   - Ha résztvevő volt → lekerül a listáról, és a várólista első embere automatikusan résztvevővé válik
   - Ha várólistás volt → egyszerűen lekerül a várólistáról

3. **Automatikus promóció**: Amikor valaki lejelentkezik, a rendszer automatikusan előlépteti a várólista első személyét.

## Tesztelés

1. Hozz létre egy eseményt a Drupal adminon keresztül
2. Állítsd be a maximum létszámot (pl. 2 fő)
3. Jelentkezz be a PWA-ban különböző userek-kel
4. Próbáld ki a regisztrációt, várólistát, lejelentkezést

## Hibaelhárítás

### "Not an event node" hiba
- Ellenőrizd, hogy a node machine name tényleg `esemeny`

### CSRF token hiba
- A PWA-nak le kell kérnie a CSRF tokent a `/session/token` endpointról

### Permission denied
- Ellenőrizd a jogosultságokat a Drupal adminon

## Fejlesztési lehetőségek

- Email értesítés amikor valaki várólistáról résztvevővé válik
- Admin felület a résztvevők kezelésére
- Esemény lemondás funkció
- QR kód generálás a résztvevőknek
