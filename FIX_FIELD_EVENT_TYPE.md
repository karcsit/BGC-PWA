# field_event_type Mező Beállítása

## Probléma

```
field_event_type.0: The value you selected is not a valid choice.
```

Próbált érték: `"playtest"`, `"casual"`, `"tournament"`, `"learning"` - egyik sem működött.

Ez azt jelenti, hogy a Drupal backend oldalán **más machine name-ek** vannak beállítva erre a mezőre, vagy **nincs alapértelmezett érték** megadva.

## Megoldás 1: Nézd meg a megengedett értékeket (Ajánlott)

### 1. lépés: Drupal admin bejelentkezés

Menj ide: `https://jatsszokosan.hu/user/login`

### 2. lépés: Mező szerkesztése

1. **Structure → Content types** (`/admin/structure/types`)
2. Kattints a **"Player Finder"** sorban a **"Manage fields"** gombra
3. Keresd meg a **"field_event_type"** sort
4. Kattints az **"Edit"** gombra

### 3. lépés: Ellenőrizd az "Allowed values" listát

A mező beállításainál látni fogod az **"Allowed values"** (Megengedett értékek) részt.

**Példa formátum:**
```
casual|Kötetlen játék
tournament|Verseny
learning|Tanulás
```

A bal oldali rész a **machine name** (pl. `casual`), a jobb oldali pedig a **label** (amit a felhasználó lát).

### 4. lépés: Másold ki az értékeket

Írd le ide a machine name-eket (bal oszlop):

```
- _________________
- _________________
- _________________
- _________________
```

### 5. lépés: Módosítsd a kódot

Küld el nekem az értékeket, és frissítem a kódban az űrlap select opcióit.

## Megoldás 2: Tedd opcionálissá a mezőt

Ha a `field_event_type` mező **nem kötelező** az alkalmazásodban:

### 1. lépés: Mező szerkesztése

Ugyanúgy, mint a Megoldás 1-ben, menj el a mező szerkesztő oldalra.

### 2. lépés: "Required field" kikapcsolása

1. Görgess le a **"Required field"** checkboxig
2. **Vedd ki a pipát** (uncheck)
3. Kattints a **"Save settings"** gombra

### 3. lépés: Cache ürítés

```bash
drush cr
```

Vagy: **Configuration → Development → Performance → Clear all caches**

## Megoldás 3: Alapértelmezett érték beállítása

Ha van egy általánosan használt érték (pl. "casual"):

### 1. lépés: Mező szerkesztése

Menj el a mező szerkesztő oldalra (lásd Megoldás 1).

### 2. lépés: Alapértelmezett érték

1. Keresd meg a **"Default value"** részt
2. Válaszd ki az alapértelmezett értéket (pl. az első opciót a listából)
3. Mentsd el

### 3. lépés: Cache ürítés

```bash
drush cr
```

## Teszt

Miután elvégezted a fenti lépések egyikét:

1. Ürítsd a böngésző cache-t (Ctrl+F5 vagy Cmd+Shift+R)
2. Jelentkezz be újra a PWA-ba
3. Próbálj meg új játékostárs hirdetést létrehozni

## Ha továbbra sem működik

Küldd el:
1. A screenshot-ot az "Allowed values" mezőről
2. A screenshot-ot a mező beállításairól ("Required field" checkbox)
3. A teljes console log-ot a hibáról

## Gyors Fix - Ideiglenesen

Ha azonnal működnie kell, és nem akarsz a Drupal adminnal foglalkozni:

### Opció: Töröld a mezőt

Ha ez a mező nem kritikus:

1. **Structure → Content types → Player Finder → Manage fields**
2. Keresd meg: `field_event_type`
3. **Delete** gomb

**FIGYELEM:** Ez törli az összes meglévő adatot ebből a mezőből!

## Mi történik most?

A kód jelenleg **nem küldi el** a `field_event_type` mezőt. Ez két hibát okozhat:

1. ✅ **Ha a mező opcionális** → A hirdetés létrejön
2. ❌ **Ha a mező kötelező** → Továbbra is 422 hibát kapsz, de most a hibaüzenet: "field_event_type: This value should not be null."

Próbáld meg létrehozni a hirdetést. Ha működik, akkor a mező opcionális volt. Ha nem, akkor a fenti megoldások valamelyikét kell alkalmaznod.
